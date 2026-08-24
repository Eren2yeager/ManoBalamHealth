import { useUserStore } from "@/stores/userStore";
import { useEmergencySocket } from "@/features/emergency/hooks/useEmergencySocket";

function EmergencySocketBinder() {
  useEmergencySocket();
  return null;
}

export function SessionSocketListener() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  return isAuthenticated ? <EmergencySocketBinder /> : null;
}
