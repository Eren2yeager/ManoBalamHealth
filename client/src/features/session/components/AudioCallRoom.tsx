import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CallControls } from "./CallControls";
import { SessionTimer } from "./SessionTimer";
import { useWebRTC } from "../hooks/useWebRTC";
import { LoaderCircle, Phone, ShieldCheck, Waves } from "lucide-react";
import type { IceServer } from "../types/session.types";

interface AudioCallRoomProps {
  sessionId: string;
  iceServers?: IceServer[];
  elapsedSeconds?: number;
  activeTimingStartedAt?: string;
  purchasedDurationSeconds?: number;
  onEndCall?: () => void;
}

export function AudioCallRoom({
  sessionId,
  iceServers,
  elapsedSeconds,
  activeTimingStartedAt,
  purchasedDurationSeconds,
  onEndCall,
}: AudioCallRoomProps) {
  const {
    localStream,
    remoteStream,
    isMicOn,
    isConnecting,
    isConnected,
    error,
    callStartedAt,
    startCall,
    toggleMic,
    endCall,
  } = useWebRTC({ sessionId, iceServers, type: "audio" });

  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (remoteStream && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
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
      <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,#214857_0%,#112631_45%,#0a1015_100%)] p-6">
        <div className="w-full max-w-lg rounded-[2.25rem] border border-white/10 bg-white/8 p-8 text-center text-white shadow-2xl backdrop-blur-xl">
          <div className="mx-auto grid size-18 place-items-center rounded-[2rem] bg-white/10">
            <Phone className="size-8 text-cyan-100" />
          </div>
          <h2 className="mt-6 text-3xl font-black tracking-tight">Ready for your secure audio session</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/70">
            Start the call when you are ready. Audio connects privately, and the timer begins
            as soon as the session is underway.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Badge className="rounded-full bg-white/10 px-3 py-1 text-white">
              <ShieldCheck className="mr-1 size-3.5 text-emerald-300" />
              Encrypted audio
            </Badge>
          </div>
          <Button
            onClick={startCall}
            className="mt-8 h-12 rounded-2xl bg-white px-6 font-bold text-slate-950 hover:bg-slate-100"
          >
            <Phone className="mr-2 size-4" />
            Start audio call
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[radial-gradient(circle_at_top,#214857_0%,#112631_45%,#0a1015_100%)] text-white">
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto mb-5 grid size-32 place-items-center rounded-full border border-white/10 bg-white/8 shadow-2xl">
            {remoteStream ? (
              <Waves className="size-16 text-emerald-200" />
            ) : isConnecting ? (
              <LoaderCircle className="size-16 animate-spin text-cyan-100" />
            ) : (
              <Phone className="size-16 text-cyan-100" />
            )}
          </div>
          <h2 className="text-2xl font-black tracking-tight">Audio session</h2>
          <p className="mb-4 mt-2 text-sm text-white/70">
            {remoteStream
              ? "Connected"
              : isConnecting
                ? "Connecting secure audio..."
                : "Waiting for the other participant..."}
          </p>
          <SessionTimer
            elapsedSeconds={elapsedSeconds}
            activeStartedAt={activeTimingStartedAt ?? callStartedAt}
            purchasedDurationSeconds={purchasedDurationSeconds}
            isActive={isConnected}
          />
          <div className="mt-5 flex justify-center">
            <Badge className="rounded-full bg-white/10 px-3 py-1 text-white">
              <ShieldCheck className="mr-1 size-3.5 text-emerald-300" />
              Secure session
            </Badge>
          </div>
        </div>

        <audio
          ref={remoteAudioRef}
          autoPlay
          playsInline
          className="hidden"
        />
      </div>

      <div className="pb-8">
        <CallControls
          isMicOn={isMicOn}
          isCameraOn={false}
          onToggleMic={toggleMic}
          onToggleCamera={() => {}}
          onEndCall={handleEndCall}
          showVideoControls={false}
        />
      </div>
    </div>
  );
}
