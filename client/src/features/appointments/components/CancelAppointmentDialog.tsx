import { useEffect, useState } from "react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cancelAppointment } from "../api/appointment.api";
import { ErrorCodes } from "@/types/global.types";

interface CancelAppointmentDialogProps {
  appointmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelled: () => void;
}

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 767px)").matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const handleChange = () => setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isMobile;
};

export const CancelAppointmentDialog = ({
  appointmentId,
  open,
  onOpenChange,
  onCancelled,
}: CancelAppointmentDialogProps) => {
  const isMobile = useIsMobile();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await cancelAppointment(appointmentId, reason.trim() || undefined);
      toast.success("Appointment cancelled");
      setReason("");
      onOpenChange(false);
      onCancelled();
    } catch (error) {
      if (
        isAxiosError(error) &&
        error.response?.data?.code === ErrorCodes.VALIDATION_ERROR
      ) {
        toast.error(error.response.data.message || "This appointment cannot be cancelled");
      } else {
        toast.error("Failed to cancel appointment. Please try again.");
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason("");
      onOpenChange(false);
    }
  };

  const form = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cancel-reason">Reason (optional)</Label>
        <Textarea
          id="cancel-reason"
          placeholder="Let us know why you're cancelling..."
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={3}
        />
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
          Keep appointment
        </Button>
        <Button variant="destructive" onClick={handleConfirm} disabled={isSubmitting}>
          {isSubmitting ? "Cancelling..." : "Cancel appointment"}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Cancel appointment?</SheetTitle>
            <SheetDescription>
              This action cannot be undone. The session slot will be released.
            </SheetDescription>
          </SheetHeader>
          {form}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel appointment?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. The session slot will be released.
          </DialogDescription>
        </DialogHeader>
        {form}
      </DialogContent>
    </Dialog>
  );
};
