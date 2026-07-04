import { useEffect, useState } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { ManoBalamLoadingScreen } from "@/components/feedback/ManoBalamLoadingScreen";
import { Toaster } from "@/components/ui/sonner";
import { refreshToken } from "@/features/auth/api/auth.api";
import { getMe } from "@/features/profile/api/profile.api";
import { useUserStore } from "@/stores/userStore";
import { usePresence } from "@/features/psychologists/hooks/usePresence";

function PresenceWrapper() {
  usePresence();
  return null;
}

function PresenceInitializer() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const role = useUserStore((state) => state.user?.role);
  
  // Psychologists connect only after approval when they explicitly go online.
  if (isAuthenticated && role !== "psychologist") {
    return <PresenceWrapper />;
  }
  return null;
}

function AuthInit({ children }: { children: React.ReactNode }) {
  const setAccessToken = useUserStore((s) => s.setAccessToken);
  const setUser = useUserStore((s) => s.setUser);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    const splashTimer = window.setTimeout(() => {
      setIsSplashVisible(false);
    }, 3000);

    const initAuth = async () => {
      try {
        const tokenResult = await refreshToken();
        setAccessToken(tokenResult.accessToken);
        const userResult = await getMe();
        setUser(userResult);
      } catch {
        // Silent refresh failed; continue as a guest.
      } finally {
        setIsAuthLoading(false);
      }
    };
    initAuth();

    return () => window.clearTimeout(splashTimer);
  }, [setAccessToken, setUser]);

  if (isAuthLoading || isSplashVisible) {
    return (
      <ManoBalamLoadingScreen
        message="Getting things ready for you..."
        estimatedDurationMs={3000}
      />
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
