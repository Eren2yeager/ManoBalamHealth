import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatInViewerTz } from "@/lib/timezone";
import type { AdminAppointmentItem } from "../types/admin.types";

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AdminAppointmentItem | null;
  /** paymentId is the ID used to issue the refund via the payments endpoint */
  paymentId: string | null;
  onProcess: (paymentId: string, reason: string) => void;
  isProcessing: boolean;
}

export function RefundModal({
  isOpen,
  onClose,
  appointment,
  paymentId,
  onProcess,
  isProcessing,
}: RefundModalProps) {
  const [reason, setReason] = useState("");

  if (!appointment || !paymentId) return null;

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onProcess(paymentId, reason.trim());
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Process Refund</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>
            <span className="font-semibold">Patient:</span>{" "}
            {appointment.patient.name}
          </p>
          <p>
            <span className="font-semibold">Psychologist:</span>{" "}
            {appointment.psychologist.name}
          </p>
          <p>
            <span className="font-semibold">Scheduled:</span>{" "}
            {formatInViewerTz(appointment.scheduledAt, "MMM do, yyyy hh:mm a")}
          </p>
          <p>
            <span className="font-semibold">Status:</span>{" "}
            <span className="capitalize">{appointment.status.replace(/_/g, " ")}</span>
          </p>

          <div className="space-y-2">
            <Label htmlFor="refund-reason">Reason for refund</Label>
            <Textarea
              id="refund-reason"
              placeholder="Enter refund reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isProcessing || !reason.trim()}
            className="flex-1"
          >
            {isProcessing ? "Processing..." : "Issue Refund"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
