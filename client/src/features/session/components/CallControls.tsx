import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  ShieldCheck,
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
  const [endDialogOpen, setEndDialogOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2 rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-2 shadow-2xl backdrop-blur-xl">
        <Button
          variant="ghost"
          size="icon-lg"
          className={`rounded-2xl text-white hover:bg-white/10 hover:text-white ${
            isMicOn ? "bg-white/8" : "bg-rose-500/20 text-rose-100"
          }`}
          onClick={onToggleMic}
          aria-label={isMicOn ? "Mute microphone" : "Unmute microphone"}
        >
          {isMicOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}
        </Button>

        {showVideoControls && (
          <Button
            variant="ghost"
            size="icon-lg"
            className={`rounded-2xl text-white hover:bg-white/10 hover:text-white ${
              isCameraOn ? "bg-white/8" : "bg-amber-500/20 text-amber-100"
            }`}
            onClick={onToggleCamera}
            aria-label={isCameraOn ? "Turn off camera" : "Turn on camera"}
          >
            {isCameraOn ? <Video className="size-5" /> : <VideoOff className="size-5" />}
          </Button>
        )}

        <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/75 md:flex">
          <ShieldCheck className="size-4 text-emerald-300" />
          Secure session
        </div>

        <Button
          variant="ghost"
          size="icon-lg"
          className="rounded-2xl bg-rose-500 text-white hover:bg-rose-600 hover:text-white"
          onClick={() => setEndDialogOpen(true)}
          aria-label="End call"
        >
          <PhoneOff className="size-5" />
        </Button>
      </div>

      <Dialog open={endDialogOpen} onOpenChange={setEndDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl border border-slate-200 bg-white p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-xl font-black text-slate-950">
              End this session?
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-slate-500">
              This will close your current call view. You can reconnect if the session
              is still active.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="rounded-b-3xl border-t border-slate-100 bg-slate-50 px-6 py-4">
            <Button variant="outline" onClick={() => setEndDialogOpen(false)}>
              Stay here
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setEndDialogOpen(false);
                onEndCall();
              }}
            >
              End session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
