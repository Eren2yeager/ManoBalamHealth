import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { getMyPsychologistOnboarding } from "@/features/psychologists/api/psychologist.api";

export function ApprovedPsychologistRoute() {
  const [status, setStatus] = useState<"loading" | "approved" | "restricted">("loading");

  useEffect(() => {
    let active = true;
    void getMyPsychologistOnboarding()
      .then((profile) => {
        if (active) setStatus(profile.onboardingStatus === "approved" ? "approved" : "restricted");
      })
      .catch(() => {
        if (active) setStatus("restricted");
      });
    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return <div className="grid min-h-[60vh] place-items-center"><LoaderCircle className="size-8 animate-spin text-primary" /></div>;
  }
  if (status === "restricted") return <Navigate to="/psychologist/dashboard" replace />;
  return <Outlet />;
}
