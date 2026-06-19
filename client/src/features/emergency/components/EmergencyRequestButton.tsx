import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { useEmergencySocket } from "../hooks/useEmergencySocket";

interface EmergencyRequestButtonProps {
  className?: string;
}

export function EmergencyRequestButton({ className }: EmergencyRequestButtonProps) {
  const { requestEmergency } = useEmergencySocket();
  const [open, setOpen] = useState(false);
  const [concern, setConcern] = useState("");

  const handleConfirm = () => {
    requestEmergency(concern.trim());
    setConcern("");
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="destructive"
        className={`gap-2 ${className ?? ""}`}
        onClick={() => setOpen(true)}
      >
        <AlertCircle className="h-5 w-5" />
        Emergency
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Request Emergency Session
            </DialogTitle>
            <DialogDescription>
              We'll immediately notify available psychologists. Please briefly
              describe what you're experiencing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emergency-concern">What's happening? (optional)</Label>
              <Textarea
                id="emergency-concern"
                placeholder="Briefly describe your concern..."
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleConfirm}
              >
                Send Emergency Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
