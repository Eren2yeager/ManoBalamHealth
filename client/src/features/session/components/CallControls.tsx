import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
} from "lucide-react";

interface CallControlsProps {
  isMicOn: boolean;
  isCameraOn: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onEndCall: () => void;
  showVideoControls?: boolean;
}

export function CallControls({
  isMicOn,
  isCameraOn,
  onToggleMic,
  onToggleCamera,
  onEndCall,
  showVideoControls = true,
}: CallControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4 p-6 bg-card/95 backdrop-blur rounded-2xl shadow-lg">
      <Button
        variant={isMicOn ? "secondary" : "destructive"}
        size="icon"
        className="h-14 w-14 rounded-full"
        onClick={onToggleMic}
        aria-label={isMicOn ? "Mute microphone" : "Unmute microphone"}
      >
        {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
      </Button>

      {showVideoControls && (
        <Button
          variant={isCameraOn ? "secondary" : "outline"}
          size="icon"
          className="h-14 w-14 rounded-full"
          onClick={onToggleCamera}
          aria-label={isCameraOn ? "Turn off camera" : "Turn on camera"}
        >
          {isCameraOn ? (
            <Video className="h-6 w-6" />
          ) : (
            <VideoOff className="h-6 w-6" />
          )}
        </Button>
      )}

      <Button
        variant="destructive"
        size="icon"
        className="h-14 w-14 rounded-full"
        onClick={onEndCall}
        aria-label="End call"
      >
        <PhoneOff className="h-6 w-6" />
      </Button>
    </div>
  );
}
