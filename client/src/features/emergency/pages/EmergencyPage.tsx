import { useEmergencyStore } from "../store/emergencyStore";
import { EmergencyRequestButton } from "../components/EmergencyRequestButton";
import { EmergencyWaitingScreen } from "../components/EmergencyWaitingScreen";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

export function EmergencyPage() {
  const { isWaiting } = useEmergencyStore();
  const navigate = useNavigate();

  if (isWaiting) {
    return <EmergencyWaitingScreen onBack={() => navigate(-1)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex flex-col items-center gap-3">
          <AlertTriangle className="h-16 w-16 text-destructive" />
          <h1 className="text-3xl font-bold text-destructive">Emergency Support</h1>
          <p className="text-muted-foreground">
            If you are in crisis, request an immediate session with an available
            psychologist. A professional will respond within 60 seconds.
          </p>
        </div>

        <EmergencyRequestButton className="w-full text-lg py-6" />

        <p className="text-xs text-muted-foreground">
          For life-threatening emergencies, please call emergency services (112)
          immediately.
        </p>
      </div>
    </div>
  );
}
