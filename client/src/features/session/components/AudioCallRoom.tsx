import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CallControls } from "./CallControls";
import { SessionTimer } from "./SessionTimer";
import { useWebRTC } from "../hooks/useWebRTC";
import { Phone } from "lucide-react";
import type { IceServer } from "../types/session.types";

interface AudioCallRoomProps {
  sessionId: string;
  iceServers?: IceServer[];
  onEndCall?: () => void;
}

export function AudioCallRoom({
  sessionId,
  iceServers,
  onEndCall,
}: AudioCallRoomProps) {
  const {
    remoteStream,
    isMicOn,
    isConnecting,
    isConnected,
    error,
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

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-muted/30">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2 text-destructive">Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={onEndCall}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!isConnected && !isConnecting) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-muted/30">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Audio Call</h2>
          <p className="text-muted-foreground mb-8">
            Connect to start your audio session
          </p>
          <Button
            onClick={startCall}
            className="h-16 w-16 rounded-full"
            size="icon"
          >
            <Phone className="h-8 w-8" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-muted/30">
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center mb-12">
          <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Phone className="h-16 w-16 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Audio Call</h2>
          <SessionTimer isActive={isConnected} />
        </div>

        <audio
          ref={remoteAudioRef}
          autoPlay
          playsInline
          className="hidden"
        />
      </div>

      <div className="pb-12">
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
