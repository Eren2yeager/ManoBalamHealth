import { HeartPulse, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CrisisResourceList } from "./CrisisResourceList";
import type { CrisisResource, CrisisResourceItem as CrisisCrisisResourceItem } from "../types/crisis.types";
import type { CrisisResourceItem as AssessmentCrisisResourceItem } from "../../assessment/types/assessment.types";

interface CrisisBannerProps {
  resources: (CrisisResource | CrisisCrisisResourceItem | AssessmentCrisisResourceItem)[];
  isVisible?: boolean;
  onDismiss?: () => void;
}

export function CrisisBanner({
  resources,
  isVisible = true,
  onDismiss,
}: CrisisBannerProps) {
  if (!isVisible) return null;

  // Normalize resources to match CrisisResource interface for CrisisResourceList
  const normalizedResources = resources.map((r) => ({
    id: (r as any).id || "unknown",
    name: (r as any).name || (r as any).helplineName || "Crisis Hotline",
    description: (r as any).description || "Available 24/7 for support",
    phone: (r as any).phone || (r as any).phoneNumber || "",
    website: (r as any).website,
  }));

  return (
    <div
      className="bg-gradient-to-r from-rose-50 via-rose-100 to-pink-50 border border-rose-200 rounded-3xl p-6 shadow-sm"
      role="alert"
    >
      <div className="flex items-start gap-4">
        <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg">
          <HeartPulse className="size-7" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black text-rose-900 mb-2">
                You Are Not Alone
              </h3>
              <p className="text-rose-700 leading-relaxed">
                If you or someone you know is in crisis, please reach out for
                help immediately. Below are resources to support you.
              </p>
            </div>
            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDismiss}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-200 rounded-xl"
              >
                <X className="size-5" />
              </Button>
            )}
          </div>

          <div className="mt-6 grid gap-4">
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold rounded-xl px-6 py-2 shadow-md"
              >
                <Link to="/crisis">
                  <ExternalLink className="size-4 mr-2" />
                  View All Crisis Resources
                </Link>
              </Button>
            </div>

            <div className="mt-2">
              {normalizedResources.length > 0 ? (
                <CrisisResourceList resources={normalizedResources} />
              ) : (
                <div className="flex flex-col items-start gap-3">
                  <p className="text-rose-700 text-sm">
                    If you are in immediate danger, call your local emergency
                    services.
                  </p>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold rounded-xl px-6 py-2 shadow-md"
                  >
                    <a
                      href="tel:112"
                      className=""
                    >
                      <HeartPulse className="size-4" />
                      Call Emergency Services (112)
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
