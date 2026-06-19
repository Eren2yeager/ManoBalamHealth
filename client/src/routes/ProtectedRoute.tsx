import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "@/stores/userStore";

export const ProtectedRoute = () => {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
};