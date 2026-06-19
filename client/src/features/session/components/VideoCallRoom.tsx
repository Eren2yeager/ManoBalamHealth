import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CallControls } from "./CallControls";
import { SessionTimer } from "./SessionTimer";
import { useWebRTC } from "../hooks/useWebRTC";
import { Video } from "lucide-react";
import type { IceServer } from "../types/session.types";

interface VideoCallRoomProps {
  sessionId: string;
  iceServers?: IceServer[];
  onEndCall?: () => void;
}

export function VideoCallRoom({
  sessionId,
  iceServers,
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
          <h2 className="text-2xl font-bold mb-4">Video Call</h2>
          <p className="text-muted-foreground mb-8">
            Connect to start your video session
          </p>
          <Button
            onClick={startCall}
            className="h-16 w-16 rounded-full"
            size="icon"
          >
            <Video className="h-8 w-8" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-muted/30 relative">
      <div className="flex-1 relative">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        <div className="absolute top-4 right-4 w-48 h-36 rounded-xl overflow-hidden border-2 border-background shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
        </div>

        <div className="absolute top-4 left-4">
          <SessionTimer isActive={isConnected} />
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
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
