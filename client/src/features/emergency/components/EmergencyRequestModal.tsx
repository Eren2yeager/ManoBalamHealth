import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useEmergencyStore } from "../store/emergencyStore";
import { useEmergencySocket } from "../hooks/useEmergencySocket";
import type { IncomingEmergencyRequest } from "../types/emergency.types";

interface EmergencyRequestModalProps {
  request: IncomingEmergencyRequest;
}

const TIMEOUT_SECONDS = 60;

export function EmergencyRequestModal({ request }: EmergencyRequestModalProps) {
  const {
    countdownSeconds,
    setCountdownSeconds,
    requestAlreadyTaken,
    requestTimedOut,
    setRequestTimedOut,
    reset,
  } = useEmergencyStore();

  const { acceptEmergency } = useEmergencySocket();

  // Countdown — navigation on accept is handled by "emergency:assigned" in the hook
  useEffect(() => {
    if (requestTimedOut || requestAlreadyTaken) return;

    setCountdownSeconds(TIMEOUT_SECONDS);

    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setRequestTimedOut(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  // re-run only if a new request comes in
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.requestId]);

  if (requestAlreadyTaken) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-xl text-yellow-700 flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Request Already Taken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Another psychologist has already accepted this emergency request.
            </p>
            <Button className="w-full" onClick={reset}>
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requestTimedOut) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-xl text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Request Timed Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              The emergency request expired after {TIMEOUT_SECONDS} seconds.
            </p>
            <Button className="w-full" onClick={reset}>
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-200">
      <Card className="max-w-md w-full border-red-300 bg-red-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl text-red-800 flex items-center gap-2">
            <AlertCircle className="w-8 h-8 animate-pulse" />
            EMERGENCY REQUEST
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-red-700 font-medium mb-1">
              Patient ID: {request.patientId}
            </p>
            {request.concern && (
              <p className="text-sm text-red-600 mb-2 italic">"{request.concern}"</p>
            )}
            <p className="text-sm text-red-600 mb-2">Time remaining to accept:</p>
            <span className="font-mono text-4xl font-bold text-red-900">
              {String(countdownSeconds).padStart(2, "0")}s
            </span>
          </div>

          <Button
            variant="destructive"
            size="lg"
            className="w-full"
            onClick={() => acceptEmergency(request.requestId)}
          >
            Accept Emergency
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
