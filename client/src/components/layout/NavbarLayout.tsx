import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { useUserStore } from "@/stores/userStore";
import { useEmergencySocket } from "@/features/emergency/hooks/useEmergencySocket";
import { EmergencyNotification } from "@/features/emergency/components/EmergencyNotification";

function EmergencySocketListener() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  if (isAuthenticated) {
    useEmergencySocket();
  }
  return null;
}

export function NavbarLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <EmergencySocketListener />
      <EmergencyNotification />
      <Outlet />
    </div>
  );
}
