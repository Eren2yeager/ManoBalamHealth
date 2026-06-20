import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "@/stores/userStore";
import type { Role } from "@/types/global.types";

const roleHome: Record<Role, string> = {
  patient: "/home",
  psychologist: "/psychologist/dashboard",
  admin: "/admin/dashboard",
};

export const GuestRoute = () => {
  const user = useUserStore((s) => s.user);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);

  if (isAuthenticated && user) {
    return <Navigate to={roleHome[user.role]} replace />;
  }

  return <Outlet />;
};
