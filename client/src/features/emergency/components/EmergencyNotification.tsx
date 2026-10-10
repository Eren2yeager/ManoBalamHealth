import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle } from "lucide-react";
import { useEmergencyStore } from "../store/emergencyStore";
import { useEmergencySocket } from "../hooks/useEmergencySocket";

const TIMEOUT_SECONDS = 60;

export function EmergencyNotification() {
  const {
    incomingRequest,
    addIgnoredRequestId,
    setIncomingRequest,
  } = useEmergencyStore();

  const { acceptEmergency } = useEmergencySocket();
  const [countdown, setCountdown] = useState(TIMEOUT_SECONDS);

  useEffect(() => {
    if (incomingRequest) {
      const receivedAt = new Date(incomingRequest.receivedAt).getTime();
      const elapsed = Math.floor((Date.now() - receivedAt) / 1000);
      const remaining = Math.max(0, TIMEOUT_SECONDS - elapsed);
      setCountdown(remaining);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            addIgnoredRequestId(incomingRequest.requestId);
            setIncomingRequest(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [incomingRequest, addIgnoredRequestId, setIncomingRequest]);

  if (!incomingRequest) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAccept = () => {
    acceptEmergency(incomingRequest.requestId);
  };

  const handleIgnore = () => {
    addIgnoredRequestId(incomingRequest.requestId);
    setIncomingRequest(null);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm animate-in slide-in-from-bottom-10 fade-in">
      <Card className="border-red-300 bg-red-50 shadow-2xl">
        <CardHeader className="pb-2 flex flex-row items-start gap-3">
          <div className="flex-shrink-0">
            <Avatar className="h-12 w-12 border-2 border-red-300">
              <AvatarImage
                src={incomingRequest.patientAvatarUrl}
                alt={incomingRequest.patientName || "Patient"}
              />
              <AvatarFallback className="bg-red-100 text-red-900">
                {incomingRequest.patientName?.charAt(0).toUpperCase() || "P"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-5 w-5 text-red-600 animate-pulse" />
              <CardTitle className="text-xl text-red-900">
                Emergency Request
              </CardTitle>
            </div>
            <p className="text-red-700 font-medium">
              {incomingRequest.patientName || "Patient"}
            </p>
          </div>
          <div className="text-right">
            <span className="font-mono text-2xl font-bold text-red-900 block">
              {formatTime(countdown)}
            </span>
            <span className="text-xs text-red-700">to accept</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {incomingRequest.concernDescription && (
            <div className="bg-white/60 rounded-lg p-3">
              <p className="text-sm text-red-600 italic">
                "{incomingRequest.concernDescription}"
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleIgnore}
            >
              Ignore
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleAccept}
            >
              Accept
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
