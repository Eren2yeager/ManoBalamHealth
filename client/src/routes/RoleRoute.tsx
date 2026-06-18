import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "@/stores/userStore";
import type { Role } from "@/types/global.types";

export const RoleRoute = ({ allowed }: { allowed: Role[] }) => {
  const user = useUserStore((s) => s.user);
  if (!user || !allowed.includes(user.role)) return <Navigate to="/home" replace />;
  return <Outlet />;
};
