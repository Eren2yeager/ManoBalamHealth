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
import { LoaderCircle, ShieldAlert } from "lucide-react";

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
  const [confirmed, setConfirmed] = useState(false);

  if (!appointment || !paymentId) return null;

  const handleSubmit = () => {
    if (reason.trim().length < 10 || !confirmed) return;
    onProcess(paymentId, reason.trim());
  };

  const handleClose = () => {
    setReason("");
    setConfirmed(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-slate-950">Review refund action</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-900">
            <p className="flex gap-2 font-bold">
              <ShieldAlert className="mt-0.5 size-4 shrink-0" />
              Refunds are money-moving actions. Confirm the appointment context before continuing.
            </p>
          </div>

          <div className="grid gap-3 rounded-2xl border border-slate-200 p-4 text-sm sm:grid-cols-2">
            <p>
              <span className="block text-xs font-black uppercase tracking-[.12em] text-slate-400">Patient</span>
              <span className="mt-1 block font-bold text-slate-950">{appointment.patient.name}</span>
            </p>
            <p>
              <span className="block text-xs font-black uppercase tracking-[.12em] text-slate-400">Psychologist</span>
              <span className="mt-1 block font-bold text-slate-950">{appointment.psychologist.name}</span>
            </p>
            <p>
              <span className="block text-xs font-black uppercase tracking-[.12em] text-slate-400">Scheduled</span>
              <span className="mt-1 block font-bold text-slate-950">{formatInViewerTz(appointment.scheduledAt, "MMM do, yyyy hh:mm a")}</span>
            </p>
            <p>
              <span className="block text-xs font-black uppercase tracking-[.12em] text-slate-400">Status</span>
              <span className="mt-1 block font-bold capitalize text-slate-950">{appointment.status.replace(/_/g, " ")}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="refund-reason">Reason for refund</Label>
            <Textarea
              id="refund-reason"
              placeholder="Record the operational reason for this refund."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="rounded-xl"
            />
            <p className="text-xs text-slate-500">Minimum 10 characters. This reason is stored with the refund record.</p>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="mt-1 accent-violet-600"
            />
            I confirm this refund is appropriate for the selected appointment and the reason is accurate.
          </label>
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
            disabled={isProcessing || reason.trim().length < 10 || !confirmed}
            className="flex-1 bg-rose-600 hover:bg-rose-700"
          >
            {isProcessing && <LoaderCircle className="mr-2 size-4 animate-spin" />}
            {isProcessing ? "Processing..." : "Issue refund"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
