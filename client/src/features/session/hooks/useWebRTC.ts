import { useState, useEffect, useRef, useCallback } from "react";
import { connectSocket } from "@/lib/socket";
import type { IceServer } from "../types/session.types";

interface UseWebRTCProps {
  sessionId: string;
  iceServers?: IceServer[];
  type?: "video" | "audio";
}

/**
 * Matches socket event contracts from FRONTEND_PLAN.md § 6.3 exactly.
 *
 * emit   "webrtc:offer"         { sessionId, sdp: RTCSessionDescriptionInit }
 * emit   "webrtc:answer"        { sessionId, sdp: RTCSessionDescriptionInit }
 * emit   "webrtc:ice-candidate" { sessionId, candidate: RTCIceCandidateInit }
 * emit   "webrtc:end-call"      { sessionId }
 *
 * listen "webrtc:offer"         { sdp: RTCSessionDescriptionInit; fromUserId: string }
 * listen "webrtc:answer"        { sdp: RTCSessionDescriptionInit; fromUserId: string }
 * listen "webrtc:ice-candidate" { candidate: RTCIceCandidateInit; fromUserId: string }
 * listen "webrtc:call-ended"    ()
 *
 * CRITICAL (plan § 7.6): cleanup on unmount must:
 *   - close the RTCPeerConnection
 *   - stop all local media tracks
 *   - remove ONLY the listeners attached by this hook (never disconnect the shared socket)
 */
export function useWebRTC({
  sessionId,
  iceServers = [],
  type = "video",
}: UseWebRTCProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // ── Media ────────────────────────────────────────────────────────────────

  const getMedia = useCallback(async (): Promise<MediaStream> => {
    setIsConnecting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === "video",
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to access camera/microphone";
      setError(message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [type]);

  // ── PeerConnection factory ───────────────────────────────────────────────

  const createPeerConnection = useCallback((): RTCPeerConnection => {
    const config: RTCConfiguration = {
      iceServers:
        iceServers.length > 0
          ? iceServers
          : [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
            ],
    };

    const pc = new RTCPeerConnection(config);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        connectSocket().emit("webrtc:ice-candidate", {
          sessionId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setIsConnected(true);
      } else if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed"
      ) {
        setIsConnected(false);
      }
    };

    return pc;
  }, [sessionId, iceServers]);

  // ── Cleanup helpers ──────────────────────────────────────────────────────

  const stopLocalTracks = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
  }, []);

  const closePeerConnection = useCallback(() => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
  }, []);

  // ── Public: start call (caller side) ─────────────────────────────────────

  const startCall = useCallback(async () => {
    try {
      const socket = connectSocket();
      const stream = await getMedia();
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // § 6.3: field name is "sdp", not "offer"
      socket.emit("webrtc:offer", { sessionId, sdp: pc.localDescription });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start call");
    }
  }, [getMedia, createPeerConnection, sessionId]);

  // ── Public: end call ─────────────────────────────────────────────────────

  const endCall = useCallback(() => {
    // § 6.3: notify peer via socket before tearing down
    connectSocket().emit("webrtc:end-call", { sessionId });
    stopLocalTracks();
    closePeerConnection();
    setRemoteStream(null);
    setIsConnected(false);
    setIsMicOn(true);
    setIsCameraOn(true);
    setError(null);
  }, [sessionId, stopLocalTracks, closePeerConnection]);

  // ── Public: media toggles ────────────────────────────────────────────────

  const toggleMic = useCallback(() => {
    const tracks = localStreamRef.current?.getAudioTracks() ?? [];
    tracks.forEach((t) => { t.enabled = !t.enabled; });
    setIsMicOn(tracks[0]?.enabled ?? true);
  }, []);

  const toggleCamera = useCallback(() => {
    const tracks = localStreamRef.current?.getVideoTracks() ?? [];
    tracks.forEach((t) => { t.enabled = !t.enabled; });
    setIsCameraOn(tracks[0]?.enabled ?? true);
  }, []);

  // ── Socket listeners (attached once, cleaned up on unmount) ──────────────

  useEffect(() => {
    const socket = connectSocket();

    // Callee receives offer → create answer
    const onOffer = async (data: {
      sdp: RTCSessionDescriptionInit;
      fromUserId: string;
    }) => {
      try {
        // Set up peer connection if not already done (callee path)
        if (!peerConnectionRef.current) {
          const stream = await getMedia();
          const pc = createPeerConnection();
          peerConnectionRef.current = pc;
          stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        }

        const pc = peerConnectionRef.current!;
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // § 6.3: field name is "sdp", not "answer"
        socket.emit("webrtc:answer", { sessionId, sdp: pc.localDescription });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to handle offer");
      }
    };

    // Caller receives answer
    const onAnswer = async (data: {
      sdp: RTCSessionDescriptionInit;
      fromUserId: string;
    }) => {
      try {
        await peerConnectionRef.current?.setRemoteDescription(
          new RTCSessionDescription(data.sdp)
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to handle answer");
      }
    };

    // Both sides receive ICE candidates
    const onIceCandidate = async (data: {
      candidate: RTCIceCandidateInit;
      fromUserId: string;
    }) => {
      try {
        if (data.candidate) {
          await peerConnectionRef.current?.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
        }
      } catch {
        // Non-fatal — stale candidates can be safely ignored
      }
    };

    // Remote peer ended the call
    const onCallEnded = () => {
      stopLocalTracks();
      closePeerConnection();
      setRemoteStream(null);
      setIsConnected(false);
    };

    socket.on("webrtc:offer", onOffer);
    socket.on("webrtc:answer", onAnswer);
    socket.on("webrtc:ice-candidate", onIceCandidate);
    socket.on("webrtc:call-ended", onCallEnded);

    // CRITICAL cleanup (plan § 7.6): remove only THIS hook's listeners,
    // stop tracks, close pc — never disconnect the shared socket singleton.
    return () => {
      socket.off("webrtc:offer", onOffer);
      socket.off("webrtc:answer", onAnswer);
      socket.off("webrtc:ice-candidate", onIceCandidate);
      socket.off("webrtc:call-ended", onCallEnded);
      stopLocalTracks();
      closePeerConnection();
    };
  }, [sessionId, getMedia, createPeerConnection, stopLocalTracks, closePeerConnection]);

  return {
    localStream,
    remoteStream,
    isMicOn,
    isCameraOn,
    isConnecting,
    isConnected,
    error,
    startCall,
    toggleMic,
    toggleCamera,
    endCall,
  };
}
