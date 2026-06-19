import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatInViewerTz } from "@/lib/timezone";
import type { PendingPsychologistItem, VerifyPsychologistDto } from "../types/admin.types";

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
          {formatInViewerTz(psychologist.submittedAt, "MMM do, yyyy")}
        </p>

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
            onClick={() =>
              onVerify(psychologist.id, {
                decision: "rejected",
                rejectionReason: "Not specified",
              })
            }
            disabled={isProcessing}
            className="flex-1"
          >
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
