import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatInViewerTz } from "@/lib/timezone";
import type { PendingPsychologistItem, VerifyPsychologistDto } from "../types/admin.types";
import { useState } from "react";

interface PsychologistVerificationCardProps {
  psychologist: PendingPsychologistItem;
  onVerify: (id: string, payload: VerifyPsychologistDto) => void;
  isProcessing: boolean;
}

export function PsychologistVerificationCard({
  psychologist,
  onVerify,
  isProcessing,
}: PsychologistVerificationCardProps) {
  const [showReject, setShowReject] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{psychologist.name}</CardTitle>
        <Badge variant="secondary">Pending</Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        {psychologist.email && (
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">Email:</span> {psychologist.email}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold">Specializations:</span>{" "}
          {psychologist.specialization.join(", ") || "Not provided"}
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold">Languages:</span>{" "}
          {psychologist.languages.join(", ") || "Not provided"}
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold">Experience:</span>{" "}
          {psychologist.experienceYears} years
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold">Fee:</span>{" "}
          {psychologist.consultationFee.currency} {psychologist.consultationFee.amount}
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          <span className="font-semibold">Bio:</span> {psychologist.bio}
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold">Credentials:</span>{" "}
          {psychologist.credentials.map((c, idx) => (
            <a
              key={idx}
              href={c.docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline mr-2"
            >
              {c.type}
            </a>
          ))}
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold">Submitted at:</span>{" "}
          {psychologist.submittedAt
            ? formatInViewerTz(psychologist.submittedAt, "MMM do, yyyy")
            : "Not submitted"}
        </p>

        {showReject && (
          <label className="grid gap-2 pt-3 text-sm font-semibold">
            Rejection reason
            <textarea
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              rows={3}
              placeholder="Explain exactly what must be corrected before resubmission."
              className="rounded-xl border bg-background p-3 font-normal outline-none focus:border-primary"
            />
          </label>
        )}

        <div className="flex gap-2 pt-4">
          <Button
            onClick={() => onVerify(psychologist.id, { decision: "approved" })}
            disabled={isProcessing}
            className="flex-1"
          >
            Approve
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (!showReject) {
                setShowReject(true);
                return;
              }
              if (rejectionReason.trim()) {
                onVerify(psychologist.id, {
                  decision: "rejected",
                  rejectionReason: rejectionReason.trim(),
                });
              }
            }}
            disabled={isProcessing}
            className="flex-1"
          >
            {showReject ? "Confirm rejection" : "Reject"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
