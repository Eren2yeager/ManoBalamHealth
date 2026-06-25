import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X, HeartHandshake } from "lucide-react";
import { EmergencyRequestButton } from "@/features/emergency/components/EmergencyRequestButton";
import { CrisisBanner } from "@/features/crisis/components/CrisisBanner";
import { getCrisisResources } from "@/features/crisis/api/crisis.api";
import { useGeoCountry } from "@/hooks/useGeoCountry";
import { logout as logoutApi } from "@/features/auth/api/auth.api";
import { toast } from "sonner";
import type { CrisisResource } from "@/features/crisis/types/crisis.types";

interface NavbarProps {
  onMenuToggle?: () => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { detectedCountryCode } = useGeoCountry();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Crisis banner state — plan §7.8: persistent help icon always accessible
  const [crisisBannerVisible, setCrisisBannerVisible] = useState(false);
  const [crisisResources, setCrisisResources] = useState<CrisisResource[]>([]);
  const [isCrisisLoading, setIsCrisisLoading] = useState(false);

  const handleCrisisToggle = async () => {
    if (crisisBannerVisible) {
      setCrisisBannerVisible(false);
      return;
    }
    if (crisisResources.length === 0) {
      setIsCrisisLoading(true);
      try {
        const resources = await getCrisisResources(detectedCountryCode ?? "");
        setCrisisResources(resources);
      } catch {
        // Non-fatal — show banner even if resources failed to load
      } finally {
        setIsCrisisLoading(false);
      }
    }
    setCrisisBannerVisible(true);
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // Ignore logout API errors — clear local state regardless
    }
    logout();
    navigate("/");
    toast.success("Logged out successfully");
  };

  const isPatient = user?.role === "patient";

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: hamburger + brand */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                  onMenuToggle?.();
                }}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100 md:hidden"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <Link to={user ? "/home" : "/"} className="text-xl font-bold text-primary">
                ManoBalam
              </Link>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-3">
              {/* Crisis help icon — always visible when authenticated, plan §7.8 */}
              {user && (
                <button
                  type="button"
                  onClick={handleCrisisToggle}
                  disabled={isCrisisLoading}
                  className="p-2 rounded-full text-red-600 hover:bg-red-50 transition-colors"
                  aria-label="Crisis resources"
                  title="Crisis help resources"
                >
                  <HeartHandshake className="h-5 w-5" />
                </button>
              )}

              {/* Emergency button — patients only */}
              {user && isPatient && (
                <div className="hidden sm:block">
                  <EmergencyRequestButton />
                </div>
              )}

              {/* User avatar + logout — desktop */}
              {user && (
                <div className="hidden md:flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              )}

              {/* Login button — unauthenticated */}
              {!user && (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/register">Sign up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && user && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-4 pt-3 pb-4 space-y-2">
              <div className="flex items-center gap-2 py-2">
                <Avatar className="h-8 w-8">
                  {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              {isPatient && (
                <EmergencyRequestButton className="w-full justify-center" />
              )}
              <Button variant="outline" className="w-full" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Crisis banner — renders below navbar, plan §7.8: acknowledgment required to dismiss */}
      {crisisBannerVisible && (
        <div className="sticky top-16 z-40">
          <CrisisBanner
            resources={crisisResources}
            isVisible={crisisBannerVisible}
            onDismiss={() => setCrisisBannerVisible(false)}
          />
        </div>
      )}
    </>
  );
}
