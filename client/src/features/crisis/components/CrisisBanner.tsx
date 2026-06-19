import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CrisisResourceList } from "./CrisisResourceList";
import type { CrisisResource } from "../types/crisis.types";

interface CrisisBannerProps {
  resources: CrisisResource[];
  isVisible?: boolean;
  onDismiss?: () => void;
}

export function CrisisBanner({
  resources,
  isVisible = true,
  onDismiss,
}: CrisisBannerProps) {
  if (!isVisible) return null;

  return (
    <div
      className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-800 text-lg mb-2">
            You Are Not Alone
          </h3>
          <p className="text-red-700 mb-4">
            If you or someone you know is in crisis, please reach out for help.
            These free helplines are available 24/7.
          </p>
          <CrisisResourceList resources={resources} />
          {onDismiss && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={onDismiss}
            >
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
