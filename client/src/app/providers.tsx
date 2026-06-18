import { useEffect, useState } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { refreshToken } from "@/features/auth/api/auth.api";
import { getMe } from "@/features/profile/api/profile.api";
import { useUserStore } from "@/stores/userStore";
import { usePresence } from "@/hooks/usePresence";

function PresenceWrapper() {
  usePresence();
  return null;
}

function PresenceInitializer() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  
  // Only render the presence wrapper if user is authenticated
  if (isAuthenticated) {
    return <PresenceWrapper />;
  }
  return null;
}

function AuthInit({ children }: { children: React.ReactNode }) {
  const setAccessToken = useUserStore((s) => s.setAccessToken);
  const setUser = useUserStore((s) => s.setUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const tokenResult = await refreshToken();
        setAccessToken(tokenResult.accessToken);
        const userResult = await getMe();
        setUser(userResult);
      } catch (error) {
        // Silent refresh failed - user is not logged in
        console.log("No active session found");
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, [setAccessToken, setUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthInit>
        <PresenceInitializer />
        {children}
        <Toaster />
      </AuthInit>
    </ThemeProvider>
  );
}
