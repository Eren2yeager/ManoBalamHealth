import { useState, useEffect, useRef, useCallback } from "react";
import { connectSocket } from "@/lib/socket";
import { useUserStore } from "@/stores/userStore";
import type { IceServer } from "../types/session.types";

export type CallState =
  | "lobby" // previewing devices, not joined yet
  | "waiting" // joined, other participant not in the call yet
  | "connecting" // peer present, negotiating / ICE in progress
  | "connected" // media flowing
  | "reconnecting"; // transient network problem, trying to recover

interface UseWebRTCProps {
  sessionId: string;
  iceServers?: IceServer[];
  type?: "video" | "audio";
}

const DATA_SAVER_STORAGE_KEY = "mb:session:data-saver";

// Bandwidth profiles for a 1:1 call. Data saver roughly quarters video usage.
const BITRATE = {
  normal: { video: 450_000, audio: 32_000, scaleDown: 1 },
  saver: { video: 150_000, audio: 24_000, scaleDown: 2 },
};

const AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

const VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  width: { ideal: 640, max: 1280 },
  height: { ideal: 480, max: 720 },
  frameRate: { ideal: 24, max: 30 },
  facingMode: "user",
};

const mediaErrorMessage = (err: unknown): string => {
  if (err instanceof DOMException) {
    if (err.name === "NotAllowedError")
      return "Camera/microphone permission was denied. Allow access in your browser settings, then reload.";
    if (err.name === "NotFoundError")
      return "No camera or microphone was found on this device.";
    if (err.name === "NotReadableError")
      return "Your camera or microphone is already in use by another app.";
  }
  return "Failed to access camera/microphone.";
};

/**
 * WebRTC for a 1:1 session using the "perfect negotiation" pattern
 * (https://developer.mozilla.org/docs/Web/API/WebRTC_API/Perfect_negotiation).
 *
 * Flow — like a real meeting app:
 * 1. Mount → device preview starts (lobby). Nothing is signaled yet.
 * 2. joinCall() (user gesture, satisfies autoplay policies) → "webrtc:join".
 * 3. Peers arrive via "webrtc:room-peers" / "webrtc:peer-joined"; negotiation
 *    runs automatically, glare resolved by politeness (smaller userId).
 * 4. Failures trigger ICE restarts; peer leaving resets to "waiting".
 *
 * Extras: input device switching, screen share (replaceTrack), and a
 * data-saver profile that lowers bitrate/resolution/framerate.
 */
export function useWebRTC({ sessionId, iceServers = [], type = "video" }: UseWebRTCProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [dataSaver, setDataSaverState] = useState(
    () => localStorage.getItem(DATA_SAVER_STORAGE_KEY) === "1",
  );
  const [remoteMicOn, setRemoteMicOn] = useState(true);
  const [remoteCameraOn, setRemoteCameraOn] = useState(true);
  const [callState, setCallState] = useState<CallState>("lobby");
  const [error, setError] = useState<string | null>(null);
  const [callStartedAt, setCallStartedAt] = useState<string | undefined>(undefined);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicId, setSelectedMicId] = useState<string>("");
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenTrackRef = useRef<MediaStreamTrack | null>(null);
  const joinedRef = useRef(false);
  const peerIdRef = useRef<string | null>(null);
  const makingOfferRef = useRef(false);
  const ignoreOfferRef = useRef(false);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const callStateRef = useRef<CallState>("lobby");
  const dataSaverRef = useRef(dataSaver);

  const setState = useCallback((next: CallState) => {
    callStateRef.current = next;
    setCallState(next);
  }, []);

  const isPolite = useCallback((peerUserId: string) => {
    const myId = useUserStore.getState().user?.id ?? "";
    return myId < peerUserId;
  }, []);

  // Tell the peer whether our mic/camera are on — disabled tracks still
  // deliver (black) frames, so the receiver needs this to render an avatar.
  const emitMediaState = useCallback(() => {
    if (!joinedRef.current) return;
    connectSocket().emit("webrtc:media-state", {
      sessionId,
      micOn: localStreamRef.current?.getAudioTracks()[0]?.enabled ?? true,
      cameraOn:
        Boolean(screenTrackRef.current) ||
        (localStreamRef.current?.getVideoTracks()[0]?.enabled ?? true),
    });
  }, [sessionId]);

  // ── Devices ──────────────────────────────────────────────────────────────

  const refreshDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setMicrophones(devices.filter((d) => d.kind === "audioinput" && d.deviceId));
      setCameras(devices.filter((d) => d.kind === "videoinput" && d.deviceId));
    } catch {
      /* enumeration unsupported — selectors just stay empty */
    }
  }, []);

  const syncSelectedFromStream = useCallback((stream: MediaStream) => {
    const audioId = stream.getAudioTracks()[0]?.getSettings().deviceId;
    const videoId = stream.getVideoTracks()[0]?.getSettings().deviceId;
    if (audioId) setSelectedMicId(audioId);
    if (videoId) setSelectedCameraId(videoId);
  }, []);

  // ── Media ────────────────────────────────────────────────────────────────

  const ensureLocalStream = useCallback(async (): Promise<MediaStream> => {
    if (localStreamRef.current) return localStreamRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: AUDIO_CONSTRAINTS,
        video: type === "video" ? VIDEO_CONSTRAINTS : false,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsMicOn(stream.getAudioTracks()[0]?.enabled ?? true);
      setIsCameraOn(stream.getVideoTracks()[0]?.enabled ?? true);
      syncSelectedFromStream(stream);
      void refreshDevices(); // labels become available after permission
      return stream;
    } catch (err) {
      setError(mediaErrorMessage(err));
      throw err;
    }
  }, [type, refreshDevices, syncSelectedFromStream]);

  const applyBandwidthProfile = useCallback((pc: RTCPeerConnection | null, saver: boolean) => {
    if (!pc) return;
    const profile = saver ? BITRATE.saver : BITRATE.normal;
    pc.getSenders().forEach((sender) => {
      const kind = sender.track?.kind;
      if (!kind) return;
      const params = sender.getParameters();
      if (!params.encodings?.length) params.encodings = [{}];
      params.encodings[0].maxBitrate = kind === "video" ? profile.video : profile.audio;
      if (kind === "video") {
        params.encodings[0].scaleResolutionDownBy = profile.scaleDown;
      }
      sender.setParameters(params).catch(() => {
        /* unsupported on older browsers — non-fatal */
      });
    });
  }, []);

  const setDataSaver = useCallback(
    (on: boolean) => {
      dataSaverRef.current = on;
      setDataSaverState(on);
      localStorage.setItem(DATA_SAVER_STORAGE_KEY, on ? "1" : "0");
      applyBandwidthProfile(pcRef.current, on);
      const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
      cameraTrack
        ?.applyConstraints({ frameRate: on ? { max: 15 } : { ideal: 24, max: 30 } })
        .catch(() => {});
    },
    [applyBandwidthProfile],
  );

  const switchDevice = useCallback(
    async (kind: "audio" | "video", deviceId: string) => {
      const stream = localStreamRef.current;
      if (!stream) return;
      try {
        const captured = await navigator.mediaDevices.getUserMedia(
          kind === "audio"
            ? { audio: { ...AUDIO_CONSTRAINTS, deviceId: { exact: deviceId } } }
            : { video: { ...VIDEO_CONSTRAINTS, facingMode: undefined, deviceId: { exact: deviceId } } },
        );
        const newTrack =
          kind === "audio" ? captured.getAudioTracks()[0] : captured.getVideoTracks()[0];
        if (!newTrack) return;

        const oldTrack =
          kind === "audio" ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0];
        newTrack.enabled = oldTrack?.enabled ?? true;
        if (oldTrack) {
          stream.removeTrack(oldTrack);
          oldTrack.stop();
        }
        stream.addTrack(newTrack);

        // While screen sharing the video sender carries the screen track —
        // leave it alone; the camera track swap shows up when sharing stops.
        const replacingSender = pcRef.current
          ?.getSenders()
          .find((s) => s.track?.kind === kind);
        if (replacingSender && !(kind === "video" && screenTrackRef.current)) {
          await replacingSender.replaceTrack(newTrack);
        }

        setLocalStream(new MediaStream(stream.getTracks()));
        if (kind === "audio") setSelectedMicId(deviceId);
        else setSelectedCameraId(deviceId);
      } catch {
        /* device switch failed — keep current device */
      }
    },
    [],
  );

  const setMicrophone = useCallback(
    (deviceId: string) => switchDevice("audio", deviceId),
    [switchDevice],
  );
  const setCamera = useCallback(
    (deviceId: string) => switchDevice("video", deviceId),
    [switchDevice],
  );

  // ── Screen share ─────────────────────────────────────────────────────────

  const stopScreenShare = useCallback(async () => {
    const screenTrack = screenTrackRef.current;
    if (!screenTrack) return;
    screenTrackRef.current = null;
    screenTrack.stop();
    setIsScreenSharing(false);

    const cameraTrack = localStreamRef.current?.getVideoTracks()[0] ?? null;
    const sender = pcRef.current?.getSenders().find((s) => s.track?.kind === "video");
    if (sender) {
      await sender.replaceTrack(cameraTrack).catch(() => {});
    }
    emitMediaState();
  }, [emitMediaState]);

  const startScreenShare = useCallback(async () => {
    if (screenTrackRef.current) return;
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { max: 15 } },
        audio: false,
      });
      const track = display.getVideoTracks()[0];
      if (!track) return;

      const sender = pcRef.current?.getSenders().find((s) => s.track?.kind === "video");
      if (!sender) {
        track.stop();
        return;
      }
      await sender.replaceTrack(track);
      screenTrackRef.current = track;
      setIsScreenSharing(true);
      emitMediaState();
      track.onended = () => {
        void stopScreenShare();
      };
    } catch {
      /* user dismissed the picker — not an error */
    }
  }, [stopScreenShare, emitMediaState]);

  const toggleScreenShare = useCallback(() => {
    if (screenTrackRef.current) void stopScreenShare();
    else void startScreenShare();
  }, [startScreenShare, stopScreenShare]);

  // ── Peer connection ──────────────────────────────────────────────────────

  const closePeer = useCallback(() => {
    void stopScreenShare();
    if (pcRef.current) {
      pcRef.current.onnegotiationneeded = null;
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.oniceconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }
    pendingCandidatesRef.current = [];
    makingOfferRef.current = false;
    ignoreOfferRef.current = false;
    setRemoteStream(null);
  }, [stopScreenShare]);

  const createPeer = useCallback(async (): Promise<RTCPeerConnection> => {
    if (pcRef.current) return pcRef.current;

    const stream = await ensureLocalStream();
    const pc = new RTCPeerConnection({
      iceServers:
        iceServers.length > 0
          ? iceServers
          : [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
            ],
    });
    pcRef.current = pc;

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.onnegotiationneeded = async () => {
      try {
        makingOfferRef.current = true;
        await pc.setLocalDescription();
        connectSocket().emit("webrtc:description", {
          sessionId,
          description: pc.localDescription,
        });
      } catch {
        /* pc torn down mid-negotiation — safe to ignore */
      } finally {
        makingOfferRef.current = false;
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        connectSocket().emit("webrtc:ice-candidate", {
          sessionId,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    pc.ontrack = (event) => {
      const stream0 = event.streams[0];
      if (stream0) {
        setRemoteStream(stream0);
      } else {
        setRemoteStream((prev) => {
          const next = prev ?? new MediaStream();
          next.addTrack(event.track);
          return new MediaStream(next.getTracks());
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "failed") {
        pc.restartIce();
      }
    };

    pc.onconnectionstatechange = () => {
      switch (pc.connectionState) {
        case "connecting":
          if (callStateRef.current !== "connected") setState("connecting");
          break;
        case "connected":
          setState("connected");
          setCallStartedAt((prev) => prev ?? new Date().toISOString());
          applyBandwidthProfile(pc, dataSaverRef.current);
          break;
        case "disconnected":
        case "failed":
          if (peerIdRef.current) setState("reconnecting");
          break;
        case "closed":
          break;
      }
    };

    return pc;
  }, [ensureLocalStream, iceServers, sessionId, applyBandwidthProfile, setState]);

  const flushPendingCandidates = useCallback(async (pc: RTCPeerConnection) => {
    const pending = pendingCandidatesRef.current;
    pendingCandidatesRef.current = [];
    for (const candidate of pending) {
      try {
        await pc.addIceCandidate(candidate);
      } catch {
        /* stale candidate — ignore */
      }
    }
  }, []);

  // ── Public API ───────────────────────────────────────────────────────────

  /** Join the call room (must be a user gesture for autoplay policies). */
  const joinCall = useCallback(async () => {
    try {
      await ensureLocalStream();
    } catch {
      return;
    }
    joinedRef.current = true;
    setState("waiting");
    connectSocket().emit("webrtc:join", { sessionId });
  }, [ensureLocalStream, sessionId, setState]);

  const leaveCall = useCallback(() => {
    const socket = connectSocket();
    if (joinedRef.current) {
      socket.emit("webrtc:end-call", { sessionId });
    }
    joinedRef.current = false;
    peerIdRef.current = null;
    closePeer();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    setCallStartedAt(undefined);
    setState("lobby");
  }, [sessionId, closePeer, setState]);

  const toggleMic = useCallback(() => {
    const tracks = localStreamRef.current?.getAudioTracks() ?? [];
    tracks.forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsMicOn(tracks[0]?.enabled ?? true);
    emitMediaState();
  }, [emitMediaState]);

  const toggleCamera = useCallback(() => {
    const tracks = localStreamRef.current?.getVideoTracks() ?? [];
    tracks.forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsCameraOn(tracks[0]?.enabled ?? true);
    emitMediaState();
  }, [emitMediaState]);

  // ── Device preview on mount (lobby) + device hotplug ─────────────────────

  useEffect(() => {
    const timer = setTimeout(() => {
      ensureLocalStream().catch(() => {
        /* error state already set */
      });
    }, 0);

    const onDeviceChange = () => void refreshDevices();
    navigator.mediaDevices?.addEventListener?.("devicechange", onDeviceChange);
    return () => {
      clearTimeout(timer);
      navigator.mediaDevices?.removeEventListener?.("devicechange", onDeviceChange);
    };
  }, [ensureLocalStream, refreshDevices]);

  // ── Signaling listeners ──────────────────────────────────────────────────

  useEffect(() => {
    const socket = connectSocket();

    const rejoin = () => {
      // Socket reconnected: server-side room membership was lost.
      if (joinedRef.current) socket.emit("webrtc:join", { sessionId });
    };
    socket.on("connect", rejoin);

    const onPeerAvailable = async (peerUserId: string) => {
      peerIdRef.current = peerUserId;
      if (callStateRef.current === "waiting") setState("connecting");
      emitMediaState();
      const pc = await createPeer();
      // Our original offer may have been sent into an empty room — nudge a
      // renegotiation unless the connection is already healthy.
      if (pc.connectionState === "new" || pc.connectionState === "failed") {
        pc.restartIce();
      }
    };

    const onRoomPeers = async (data: { sessionId: string; userIds: string[] }) => {
      if (data.sessionId !== sessionId || !joinedRef.current) return;
      if (data.userIds.length > 0) {
        await onPeerAvailable(data.userIds[0]);
      } else {
        peerIdRef.current = null;
        setState("waiting");
      }
    };

    const onPeerJoined = async (data: { sessionId: string; userId: string }) => {
      if (data.sessionId !== sessionId || !joinedRef.current) return;
      await onPeerAvailable(data.userId);
    };

    const onPeerLeft = (data: { sessionId: string; userId: string }) => {
      if (data.sessionId !== sessionId) return;
      if (peerIdRef.current !== data.userId) return;
      peerIdRef.current = null;
      closePeer();
      setRemoteMicOn(true);
      setRemoteCameraOn(true);
      if (joinedRef.current) setState("waiting");
    };

    const onMediaState = (data: {
      micOn: boolean;
      cameraOn: boolean;
      fromUserId: string;
    }) => {
      setRemoteMicOn(data.micOn !== false);
      setRemoteCameraOn(data.cameraOn !== false);
    };

    const onDescription = async (data: {
      description: RTCSessionDescriptionInit;
      fromUserId: string;
    }) => {
      if (!joinedRef.current || !data?.description) return;
      try {
        peerIdRef.current = peerIdRef.current ?? data.fromUserId;
        const pc = await createPeer();
        const description = data.description;

        const offerCollision =
          description.type === "offer" &&
          (makingOfferRef.current || pc.signalingState !== "stable");

        ignoreOfferRef.current = !isPolite(data.fromUserId) && offerCollision;
        if (ignoreOfferRef.current) return;

        await pc.setRemoteDescription(description); // implicit rollback when polite
        await flushPendingCandidates(pc);

        if (description.type === "offer") {
          await pc.setLocalDescription();
          socket.emit("webrtc:description", {
            sessionId,
            description: pc.localDescription,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Call negotiation failed");
      }
    };

    const onIceCandidate = async (data: { candidate: RTCIceCandidateInit }) => {
      if (!data?.candidate) return;
      const pc = pcRef.current;
      if (!pc || !pc.remoteDescription) {
        pendingCandidatesRef.current.push(data.candidate);
        return;
      }
      try {
        await pc.addIceCandidate(data.candidate);
      } catch {
        /* stale/ignored-offer candidates — non-fatal */
      }
    };

    const onCallEnded = () => {
      peerIdRef.current = null;
      closePeer();
      setRemoteMicOn(true);
      setRemoteCameraOn(true);
      if (joinedRef.current) setState("waiting");
    };

    const onSessionEnded = () => {
      joinedRef.current = false;
      peerIdRef.current = null;
      closePeer();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      setLocalStream(null);
      setState("lobby");
    };

    socket.on("webrtc:room-peers", onRoomPeers);
    socket.on("webrtc:peer-joined", onPeerJoined);
    socket.on("webrtc:peer-left", onPeerLeft);
    socket.on("webrtc:description", onDescription);
    socket.on("webrtc:ice-candidate", onIceCandidate);
    socket.on("webrtc:media-state", onMediaState);
    socket.on("webrtc:call-ended", onCallEnded);
    socket.on("session:ended", onSessionEnded);

    return () => {
      socket.off("connect", rejoin);
      socket.off("webrtc:room-peers", onRoomPeers);
      socket.off("webrtc:peer-joined", onPeerJoined);
      socket.off("webrtc:peer-left", onPeerLeft);
      socket.off("webrtc:description", onDescription);
      socket.off("webrtc:ice-candidate", onIceCandidate);
      socket.off("webrtc:media-state", onMediaState);
      socket.off("webrtc:call-ended", onCallEnded);
      socket.off("session:ended", onSessionEnded);

      if (joinedRef.current) {
        socket.emit("webrtc:leave", { sessionId });
        joinedRef.current = false;
      }
      peerIdRef.current = null;
      closePeer();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    };
  }, [sessionId, createPeer, closePeer, flushPendingCandidates, isPolite, setState, emitMediaState]);

  return {
    localStream,
    remoteStream,
    isMicOn,
    isCameraOn,
    isScreenSharing,
    remoteMicOn,
    remoteCameraOn,
    dataSaver,
    callState,
    error,
    callStartedAt,
    microphones,
    cameras,
    selectedMicId,
    selectedCameraId,
    joinCall,
    leaveCall,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    setDataSaver,
    setMicrophone,
    setCamera,
  };
}
