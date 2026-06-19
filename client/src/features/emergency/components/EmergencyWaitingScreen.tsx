import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEmergencyStore } from "../store/emergencyStore";
import { useEmergencySocket } from "../hooks/useEmergencySocket";
import { Spinner } from "@/components/feedback/Spinner";
import { AlertCircle, XCircle } from "lucide-react";
import { CrisisResourceList } from "@/features/crisis/components/CrisisResourceList";
import { getCrisisResources } from "@/features/crisis/api/crisis.api";
import { useGeoCountry } from "@/hooks/useGeoCountry";
import type { CrisisResource } from "@/features/crisis/types/crisis.types";

const TIMEOUT_SECONDS = 60;

interface EmergencyWaitingScreenProps {
  onBack?: () => void;
}

export function EmergencyWaitingScreen({ onBack }: EmergencyWaitingScreenProps) {
  const {
    countdownSeconds,
    setCountdownSeconds,
    requestAlreadyTaken,
    requestTimedOut,
    reset,
  } = useEmergencyStore();

  const { cancelRequest } = useEmergencySocket();
  const country = useGeoCountry();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [crisisResources, setCrisisResources] = useState<CrisisResource[]>([]);

  useEffect(() => {
    setCountdownSeconds(TIMEOUT_SECONDS);

    timerRef.current = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          cancelRequest(); // marks timed out, clears isWaiting
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stop timer once matched, taken, or timed out
  useEffect(() => {
    if (requestAlreadyTaken || requestTimedOut) {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [requestAlreadyTaken, requestTimedOut]);

  // Fetch crisis resources as soon as a timeout is detected
  // Plan § 7.7: "patient must never be left on a bare spinner with no fallback path"
  useEffect(() => {
    if (!requestTimedOut) return;
    getCrisisResources(country ?? "").then(setCrisisResources).catch(() => {
      // Non-fatal — list just stays empty
    });
  }, [requestTimedOut, country]);

  if (requestAlreadyTaken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <XCircle className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
            <CardTitle>Request Already Accepted</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Another psychologist has accepted your emergency request.
            </p>
            <Button onClick={reset} className="w-full">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requestTimedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <Card>
            <CardHeader className="text-center">
              <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <CardTitle>No Psychologists Available</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                No psychologists were available within {TIMEOUT_SECONDS} seconds.
                Please try again or contact a crisis helpline.
              </p>
              <Button onClick={reset} className="w-full">
                Try Again
              </Button>
            </CardContent>
          </Card>

          {crisisResources.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-red-700 text-center">
                Crisis Resources
              </h2>
              <CrisisResourceList resources={crisisResources} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4 animate-pulse" />
          <CardTitle>Emergency Request Sent</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-3">
            <p className="text-muted-foreground">
              Notifying available psychologists…
            </p>
            <div className="flex items-center justify-center gap-3">
              <Spinner size="lg" />
              <span className="font-mono text-3xl font-bold text-red-700">
                {String(countdownSeconds).padStart(2, "0")}s
              </span>
            </div>
          </div>

          {onBack && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                if (timerRef.current) clearInterval(timerRef.current);
                reset();
                onBack();
              }}
            >
              Cancel Request
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
