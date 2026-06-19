import { useUserStore } from "@/stores/userStore";

/**
 * Convenience wrapper over userStore — provides the current user and
 * auth state without needing to import userStore everywhere.
 */
export const useAuth = () => {
  const user = useUserStore((s) => s.user);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const accessToken = useUserStore((s) => s.accessToken);
  const logout = useUserStore((s) => s.logout);

  return { user, isAuthenticated, accessToken, logout };
};
