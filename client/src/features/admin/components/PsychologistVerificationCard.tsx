import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatInViewerTz } from "@/lib/timezone";
import type { PendingPsychologistItem, VerifyPsychologistDto } from "../types/admin.types";
import { useState } from "react";
import { CheckCircle2, XCircle, FileText, Stethoscope, Users, Calendar } from "lucide-react";

interface PsychologistVerificationCardProps {
  psychologist: PendingPsychologistItem;
  onVerify: (id: string, payload: VerifyPsychologistDto) => void;
  isProcessing: boolean;
}

const formatFee = (fee?: { amount: number; currency: string }) =>
  fee
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: fee.currency || "INR",
        maximumFractionDigits: 0,
      }).format(fee.amount / 100)
    : "—";

const pendingChangeLabels: Record<string, string> = {
  specialization: "Specializations",
  languages: "Languages",
  experienceYears: "Experience (years)",
  consultationFee: "Base fee",
  bio: "Bio",
  licensedCountries: "Licensed countries",
};

function renderChangeValue(key: string, value: unknown): string {
  if (key === "consultationFee") return formatFee(value as { amount: number; currency: string });
  if (Array.isArray(value)) return value.join(", ");
  return String(value ?? "—");
}

export function PsychologistVerificationCard({
  psychologist,
  onVerify,
  isProcessing,
}: PsychologistVerificationCardProps) {
  const [showReject, setShowReject] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // A card can represent a first-time application (under_review) or a
  // change-review request from an already-approved psychologist.
  const isChangeReview =
    psychologist.changeReviewStatus === "pending" &&
    psychologist.onboardingStatus === "approved";
  const pendingEntries = Object.entries(psychologist.pendingChanges ?? {}).filter(
    ([, value]) => value !== undefined && value !== null,
  );

  return (
    <Card className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm transition-all hover:border-violet-100 hover:shadow-xl hover:shadow-primary/8">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white pb-6 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-primary text-2xl font-black text-white shadow-lg">
              {psychologist.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-lg font-black tracking-tight text-slate-950">
                {psychologist.name}
              </CardTitle>
              {psychologist.email && (
                <p className="mt-1 text-sm text-slate-500">{psychologist.email}</p>
              )}
            </div>
          </div>
          <Badge className={`rounded-full px-3 py-1 text-xs font-black ${isChangeReview ? "bg-amber-100 text-amber-700" : "bg-violet-100 text-violet-700"}`}>
            {isChangeReview ? "Profile changes" : "Pending"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6 pb-6 space-y-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <Stethoscope className="size-5 text-primary" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Specializations
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                {psychologist.specialization.join(", ") || "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <Users className="size-5 text-primary" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Experience
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                {psychologist.experienceYears} years
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <Calendar className="size-5 text-primary" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Submitted
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                {psychologist.submittedAt
                  ? formatInViewerTz(psychologist.submittedAt, "MMM do, yyyy")
                  : "Not submitted"}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-black text-slate-900 mb-3">Profile</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1 min-w-[80px]">
                Languages
              </p>
              <p className="text-sm text-slate-600">
                {psychologist.languages.join(", ") || "Not provided"}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1 min-w-[80px]">
                Bio
              </p>
              <p className="text-sm leading-relaxed text-slate-600">
                {psychologist.bio}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1 min-w-[80px]">
                Fee
              </p>
              <p className="text-sm font-semibold text-slate-700">
                {formatFee(psychologist.consultationFee)}
                <span className="ml-1 text-xs font-normal text-slate-400">base, 30-min video</span>
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-black text-slate-900 mb-3">Credentials</h4>
          <div className="flex flex-wrap gap-2">
            {psychologist.credentials.map((c, idx) => (
              <a
                key={idx}
                href={c.docUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-primary hover:border-primary hover:bg-violet-50 transition-colors"
              >
                <FileText className="size-4" />
                {c.type}
              </a>
            ))}
          </div>
        </div>

        {isChangeReview && pendingEntries.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <h4 className="text-sm font-black text-amber-900">Requested changes</h4>
            <p className="mt-1 text-xs text-amber-700">The live profile above keeps serving patients until these changes are approved.</p>
            <div className="mt-3 space-y-2">
              {pendingEntries.map(([key, value]) => (
                <div key={key} className="flex items-start gap-3 text-sm">
                  <p className="min-w-[130px] text-xs font-bold uppercase tracking-wider text-amber-700 mt-0.5">
                    {pendingChangeLabels[key] ?? key}
                  </p>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 line-through">
                      {renderChangeValue(key, (psychologist as unknown as Record<string, unknown>)[key])}
                    </p>
                    <p className="font-semibold text-slate-800">{renderChangeValue(key, value)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showReject && (
          <div className="space-y-3 rounded-2xl border border-rose-100 bg-rose-50 p-4">
            <label className="text-sm font-black text-rose-700">
              Rejection Reason
            </label>
            <textarea
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              rows={3}
              placeholder="Explain exactly what must be corrected before resubmission."
              className="w-full rounded-xl border border-rose-200 bg-white p-3 text-sm text-slate-700 outline-none focus:border-rose-500"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            onClick={() => onVerify(psychologist.id, { decision: "approved" })}
            disabled={isProcessing}
            className="h-11 flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 font-bold shadow-md hover:from-emerald-700 hover:to-green-700"
          >
            <CheckCircle2 className="mr-2 size-4" />
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
            className="h-11 flex-1 rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 font-bold"
          >
            <XCircle className="mr-2 size-4" />
            {showReject ? "Confirm Rejection" : "Reject"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
