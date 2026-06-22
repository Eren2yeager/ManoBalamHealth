import { useAuth } from "@/hooks/useAuth";
import { usePsychologistPresenceToggle } from "@/features/psychologists/hooks/usePresence";
import { useEmergencyStore } from "@/features/emergency/store/emergencyStore";
import { EmergencyRequestModal } from "@/features/emergency/components/EmergencyRequestModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AlertCircle, Calendar, CheckCircle2, Clock, FileCheck2, Users } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { getMyPsychologistOnboarding } from "../api/psychologist.api";
import type { PsychologistOnboarding } from "../types/psychologist.types";

export const PsychologistDashboard = () => {
  const { user } = useAuth();
  const { toggleOnline } = usePsychologistPresenceToggle();
  const [isOnline, setIsOnline] = useState(false);
  const [onboarding, setOnboarding] = useState<PsychologistOnboarding | null>(null);

  // Incoming emergency requests (psychologist side) — wired from useEmergencySocket
  const incomingRequest = useEmergencyStore((s) => s.incomingRequest);
  const isApproved = onboarding?.onboardingStatus === "approved";

  useEffect(() => {
    let active = true;
    void getMyPsychologistOnboarding()
      .then((profile) => {
        if (active) setOnboarding(profile);
      })
      .catch(() => toast.error("Unable to load verification status."));
    return () => {
      active = false;
    };
  }, []);

  const handleToggleOnline = (online: boolean) => {
    if (!isApproved) {
      toast.error("Admin approval is required before you can go online.");
      return;
    }
    setIsOnline(online);
    toggleOnline(online);
    toast.success(online ? "You're now online and visible to patients" : "You're now offline");
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>

      {onboarding && !isApproved && (
        <Card className={onboarding.onboardingStatus === "rejected" ? "border-rose-200 bg-rose-50" : "border-violet-200 bg-violet-50"}>
          <CardContent className="flex flex-col justify-between gap-5 pt-6 sm:flex-row sm:items-center">
            <div className="flex gap-3">
              {onboarding.onboardingStatus === "under_review" ? <FileCheck2 className="mt-1 size-6 shrink-0 text-primary" /> : <AlertCircle className="mt-1 size-6 shrink-0 text-amber-600" />}
              <div>
                <h2 className="font-black capitalize text-slate-900">{onboarding.onboardingStatus.replaceAll("_", " ")}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {onboarding.onboardingStatus === "under_review"
                    ? "Your application is with the admin team. Availability and patient-facing features unlock after approval."
                    : onboarding.onboardingStatus === "rejected"
                      ? onboarding.rejectionReason ?? "Review the requested changes and resubmit your application."
                      : "Complete your professional profile and upload all required credentials."}
                </p>
              </div>
            </div>
            <Button asChild className="shrink-0 rounded-xl">
              <Link to="/psychologist/onboarding">
                {onboarding.onboardingStatus === "under_review" ? "View application" : "Complete onboarding"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {isApproved && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
          <CheckCircle2 className="size-5" /> Your professional profile is approved and visible to patients.
        </div>
      )}

      {/* Online status toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
          <CardDescription>Control whether patients can see and book you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <Button
              variant={isOnline ? "default" : "outline"}
              onClick={() => handleToggleOnline(true)}
              disabled={!isApproved}
            >
              Go Online
            </Button>
            <Button
              variant={!isOnline ? "default" : "outline"}
              onClick={() => handleToggleOnline(false)}
              disabled={!isApproved}
            >
              Go Offline
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span
                className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}
              />
              {isOnline ? "Patients can see you" : "You're not visible to patients"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6 flex flex-col items-center gap-3 text-center">
            <Calendar className="h-8 w-8 text-primary" />
            <h3 className="font-semibold">My Appointments</h3>
            <p className="text-sm text-muted-foreground">View upcoming and past sessions</p>
            <Button asChild={isApproved} variant="outline" className="w-full mt-2" disabled={!isApproved}>
              {isApproved ? <Link to="/psychologist/appointments">View Appointments</Link> : <span>Approval required</span>}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6 flex flex-col items-center gap-3 text-center">
            <Clock className="h-8 w-8 text-primary" />
            <h3 className="font-semibold">Availability</h3>
            <p className="text-sm text-muted-foreground">Set your weekly schedule and slots</p>
            <Button asChild={isApproved} variant="outline" className="w-full mt-2" disabled={!isApproved}>
              {isApproved ? <Link to="/psychologist/availability">Manage Availability</Link> : <span>Approval required</span>}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6 flex flex-col items-center gap-3 text-center">
            <Users className="h-8 w-8 text-primary" />
            <h3 className="font-semibold">Profile</h3>
            <p className="text-sm text-muted-foreground">Update your profile and credentials</p>
            <Button asChild variant="outline" className="w-full mt-2">
              <Link to="/psychologist/onboarding">Professional Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Emergency request modal — shown when an incoming emergency arrives via socket */}
      {incomingRequest && <EmergencyRequestModal request={incomingRequest} />}
    </div>
  );
};
