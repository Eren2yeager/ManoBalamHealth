import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CallControls } from "./CallControls";
import { SessionTimer } from "./SessionTimer";
import { useWebRTC } from "../hooks/useWebRTC";
import { LoaderCircle, ShieldCheck, Sparkles, Video } from "lucide-react";
import type { IceServer } from "../types/session.types";

interface VideoCallRoomProps {
  sessionId: string;
  iceServers?: IceServer[];
  elapsedSeconds?: number;
  activeTimingStartedAt?: string;
  purchasedDurationSeconds?: number;
  onEndCall?: () => void;
}

export function VideoCallRoom({
  sessionId,
  iceServers,
  elapsedSeconds,
  activeTimingStartedAt,
  purchasedDurationSeconds,
  onEndCall,
}: VideoCallRoomProps) {
  const {
    localStream,
    remoteStream,
    isMicOn,
    isCameraOn,
    isConnecting,
    isConnected,
    error,
    callStartedAt,
    startCall,
    toggleMic,
    toggleCamera,
    endCall,
  } = useWebRTC({ sessionId, iceServers, type: "video" });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleEndCall = () => {
    endCall();
    onEndCall?.();
  };
  const hasEnteredCall =
    isConnecting || isConnected || Boolean(localStream) || Boolean(remoteStream);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,#2b234f_0%,#151127_55%,#0b0b16_100%)] p-6">
        <div className="max-w-md rounded-[2rem] border border-white/10 bg-white/8 p-8 text-center text-white shadow-2xl backdrop-blur">
          <h2 className="text-2xl font-black">Session error</h2>
          <p className="mt-3 text-sm leading-6 text-white/70">{error}</p>
          <Button onClick={onEndCall} className="mt-6 rounded-xl bg-white text-slate-950 hover:bg-slate-100">
            Leave room
          </Button>
        </div>
      </div>
    );
  }

  if (!hasEnteredCall) {
    return (
      <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,#32275d_0%,#17142f_50%,#0d0d18_100%)] p-6">
        <div className="w-full max-w-lg rounded-[2.25rem] border border-white/10 bg-white/8 p-8 text-center text-white shadow-2xl backdrop-blur-xl">
          <div className="mx-auto grid size-18 place-items-center rounded-[2rem] bg-white/10">
            <Video className="size-8 text-violet-200" />
          </div>
          <h2 className="mt-6 text-3xl font-black tracking-tight">Ready for your secure video session</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/70">
            Start the call when you are ready. Your local camera preview will appear immediately,
            and remote video joins as soon as the other participant connects.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Badge className="rounded-full bg-white/10 px-3 py-1 text-white">
              <ShieldCheck className="mr-1 size-3.5 text-emerald-300" />
              Encrypted media
            </Badge>
            <Badge className="rounded-full bg-white/10 px-3 py-1 text-white">
              <Sparkles className="mr-1 size-3.5 text-amber-300" />
              Live support
            </Badge>
          </div>
          <Button
            onClick={startCall}
            className="mt-8 h-12 rounded-2xl bg-white px-6 font-bold text-slate-950 hover:bg-slate-100"
          >
            <Video className="mr-2 size-4" />
            Start video call
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top,#2d2752_0%,#151127_50%,#09090f_100%)]">
      <div className="flex-1 relative">
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white">
            <div className="text-center">
              <div className="mx-auto mb-4 grid size-16 place-items-center rounded-3xl bg-white/10">
                <LoaderCircle className={`size-7 ${isConnecting ? "animate-spin" : ""}`} />
              </div>
              <p className="text-lg font-semibold">
                {isConnecting ? "Connecting secure session..." : "Waiting for the other participant..."}
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Your camera is ready. Remote video will appear once the connection is established.
              </p>
            </div>
          </div>
        )}

        {localStream && (
          <div className="absolute right-3 top-3 h-28 w-36 overflow-hidden rounded-2xl border border-white/15 bg-slate-900 shadow-2xl sm:right-4 sm:top-4 sm:h-36 sm:w-48">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-xs font-medium text-white">
              You
            </div>
          </div>
        )}

        <div className="absolute left-3 top-3 flex items-center gap-2 sm:left-4 sm:top-4">
          <SessionTimer
            elapsedSeconds={elapsedSeconds}
            activeStartedAt={activeTimingStartedAt ?? callStartedAt}
            purchasedDurationSeconds={purchasedDurationSeconds}
            isActive={isConnected}
          />
          <Badge className="hidden rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-100 sm:inline-flex">
            <ShieldCheck className="mr-1 size-3.5" />
            Secure
          </Badge>
        </div>
      </div>

      <div className="absolute bottom-5 left-0 right-0 flex justify-center px-4">
        <CallControls
          isMicOn={isMicOn}
          isCameraOn={isCameraOn}
          onToggleMic={toggleMic}
          onToggleCamera={toggleCamera}
          onEndCall={handleEndCall}
          showVideoControls={true}
        />
      </div>
    </div>
  );
}
