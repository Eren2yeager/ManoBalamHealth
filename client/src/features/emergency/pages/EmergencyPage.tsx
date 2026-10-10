import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Star,
  Languages,
  BriefcaseBusiness,
  ArrowRight,
  XCircle,
} from "lucide-react";
import { useEmergencyStore } from "../store/emergencyStore";
import { useEmergencySocket } from "../hooks/useEmergencySocket";
import { getCrisisResources } from "@/features/crisis/api/crisis.api";
import { CrisisResourceList } from "@/features/crisis/components/CrisisResourceList";
import { useGeoCountry } from "@/hooks/useGeoCountry";
import type { CrisisResource } from "@/features/crisis/types/crisis.types";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function EmergencyPage() {
  const [localConcern, setLocalConcern] = useState("");
  const [crisisResources, setCrisisResources] = useState<CrisisResource[]>([]);
  const { detectedCountryCode } = useGeoCountry();

  const {
    phase,
    countdownSeconds,
    concernDescription,
    matchedPsychologist,
  } = useEmergencyStore();

  const { requestEmergency, cancelRequest, confirmSession } =
    useEmergencySocket();

  useEffect(() => {
    getCrisisResources(detectedCountryCode ?? "").then(setCrisisResources).catch(() => {
      // Non-fatal
    });
  }, [detectedCountryCode]);

  const handleSendRequest = () => {
    requestEmergency(localConcern);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Render different states
  if (phase === "waiting") {
    return (
      <div className="min-h-screen bg-slate-50/50 p-4">
        <div className="mx-auto max-w-md space-y-6 pt-10">
          <Card className="border-emerald-200 bg-emerald-50/80 shadow-xl">
            <CardHeader className="text-center pb-3">
              <AlertCircle className="mx-auto mb-4 size-16 text-emerald-600 animate-pulse" />
              <CardTitle className="text-2xl font-black text-slate-900">
                Finding your emergency support
              </CardTitle>
              <p className="mt-2 text-sm text-slate-600">
                We&apos;re connecting you with an available psychologist now…
              </p>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="flex flex-col items-center gap-2">
                <span className="font-mono text-6xl font-black text-emerald-700">
                  {formatTime(countdownSeconds)}
                </span>
                <p className="text-xs text-slate-500">
                  Remaining until request expires
                </p>
              </div>

              {concernDescription && (
                <div className="rounded-2xl bg-white/80 border border-emerald-100 p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-emerald-800 mb-2">
                    Your concern
                  </p>
                  <p className="text-slate-700">{concernDescription}</p>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full h-12 rounded-xl border-slate-300 text-slate-700 font-bold hover:bg-slate-100"
                onClick={cancelRequest}
              >
                <XCircle className="size-5 mr-2" />
                Cancel Request
              </Button>
            </CardContent>
          </Card>

          {crisisResources.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-center text-lg font-black text-emerald-700">
                Crisis Resources
              </h2>
              <CrisisResourceList resources={crisisResources} />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === "matched_waiting_confirm" && matchedPsychologist) {
    const fee = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: matchedPsychologist.consultationFee.currency || "INR",
      maximumFractionDigits: 0,
    }).format(matchedPsychologist.consultationFee.amount / 100);

    return (
      <div className="min-h-screen bg-slate-50/50 p-4">
        <div className="mx-auto max-w-lg space-y-6 pt-8">
          {/* Success header */}
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 shadow-2xl overflow-hidden">
            <div className="absolute -right-12 -top-12 size-40 rounded-full bg-emerald-500/10 blur-3xl" />
            <CardHeader className="text-center pb-2 relative z-10">
              <CheckCircle2 className="mx-auto mb-4 size-16 text-emerald-600" />
              <CardTitle className="text-3xl font-black text-slate-900">
                Emergency support found!
              </CardTitle>
              <p className="mt-2 text-sm text-slate-600">
                A verified psychologist is ready to help you
              </p>
            </CardHeader>
          </Card>

          {/* Psychologist card */}
          <article className="relative flex flex-col overflow-hidden rounded-[1.75rem] border border-violet-100 bg-white shadow-xl">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-violet-100/75 via-purple-50 to-blue-50 opacity-80" />
            <div className="absolute -right-10 -top-10 size-28 rounded-full bg-primary/8 blur-2xl" />

            <div className="relative flex flex-1 flex-col p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="relative">
                  <Avatar className="size-20 border-4 border-white shadow-xl">
                    {matchedPsychologist.avatarUrl && (
                      <AvatarImage
                        src={matchedPsychologist.avatarUrl}
                        alt={matchedPsychologist.name}
                      />
                    )}
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-blue-500 text-xl font-black text-white">
                      {getInitials(matchedPsychologist.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute bottom-1 right-1 size-5 rounded-full border-[3px] border-white ${
                      matchedPsychologist.isOnline ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                    title={
                      matchedPsychologist.isOnline ? "Online now" : "Currently offline"
                    }
                  />
                </div>

                <span className="flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-black text-amber-700 shadow-sm">
                  <Star className="size-4 fill-current" />
                  {matchedPsychologist.rating.average.toFixed(1)}
                  <span className="font-medium text-amber-600/70">
                    ({matchedPsychologist.rating.count})
                  </span>
                </span>
              </div>

              <div className="mt-6">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-xl font-black tracking-tight text-slate-950">
                    {matchedPsychologist.name}
                  </h3>
                  {matchedPsychologist.isOnline && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-700">
                      Online
                    </span>
                  )}
                </div>
                <p className="mt-1 flex items-center gap-1.5 truncate text-xs font-medium text-slate-500">
                  <Languages className="size-3.5 text-primary" />
                  {matchedPsychologist.languages.length
                    ? matchedPsychologist.languages.slice(0, 3).join(" · ")
                    : "Language details available on profile"}
                </p>
              </div>

              <div className="mt-4 flex min-h-14 flex-wrap content-start gap-1.5">
                {matchedPsychologist.specialization.slice(0, 3).map((specialization) => (
                  <span
                    key={specialization}
                    className="rounded-full bg-violet-50 px-3 py-1 text-[10px] font-bold capitalize text-primary"
                  >
                    {specialization.replaceAll("-", " ")}
                  </span>
                ))}
                {matchedPsychologist.specialization.length > 3 && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">
                    +{matchedPsychologist.specialization.length - 3} more
                  </span>
                )}
              </div>

              <p className="mt-4 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
                {matchedPsychologist.bio ||
                  "View this professional’s profile, approach, consultation details, and available slots."}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    <BriefcaseBusiness className="size-3.5" />
                    Experience
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-800">
                    {matchedPsychologist.experienceYears} years
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    <span className="size-3.5">₹</span>
                    Session fee
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-800">
                    {fee}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-xl border-slate-300 text-slate-700 font-bold hover:bg-slate-100"
                  onClick={cancelRequest}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-violet-600 text-sm font-bold text-white shadow-lg shadow-primary/15 hover:shadow-xl"
                  onClick={confirmSession}
                >
                  Join session
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </div>
          </article>
        </div>
      </div>
    );
  }

  // Default idle state
  return (
    <div className="min-h-screen bg-slate-50/50 p-4">
      <div className="mx-auto max-w-md space-y-6 pt-10">
        <Card className="border-violet-200 bg-gradient-to-br from-violet-50/80 to-white shadow-2xl overflow-hidden">
          <div className="absolute -left-10 -top-10 size-40 rounded-full bg-violet-500/10 blur-3xl" />
          <CardHeader className="text-center pb-4 relative z-10">
            <AlertTriangle className="mx-auto mb-4 size-16 text-destructive" />
            <CardTitle className="text-3xl font-black text-slate-900">
              Emergency Support
            </CardTitle>
            <p className="mt-3 text-sm text-slate-600">
              If you are in crisis, request an immediate session with an available
              psychologist. A professional will respond as quickly as possible.
            </p>
          </CardHeader>
          <CardContent className="space-y-5 relative z-10">
            <div className="space-y-2">
              <Label htmlFor="concern" className="text-sm font-semibold text-slate-700">
                What&apos;s happening? (optional)
              </Label>
              <Textarea
                id="concern"
                placeholder="Briefly describe your concern so the psychologist knows how to help…"
                value={localConcern}
                onChange={(e) => setLocalConcern(e.target.value)}
                rows={5}
                className="rounded-2xl border-slate-200 focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
              />
            </div>

            <Button
              variant="destructive"
              className="w-full h-14 rounded-2xl text-base font-black shadow-lg shadow-destructive/20"
              onClick={handleSendRequest}
            >
              <AlertCircle className="size-5 mr-2" />
              Send Emergency Request
            </Button>
          </CardContent>
        </Card>

        {crisisResources.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-center text-lg font-black text-destructive">
              Crisis Resources
            </h2>
            <CrisisResourceList resources={crisisResources} />
          </div>
        )}

        <p className="text-center text-xs text-slate-500">
          For life-threatening emergencies, please call emergency services (112)
          immediately.
        </p>
      </div>
    </div>
  );
}
