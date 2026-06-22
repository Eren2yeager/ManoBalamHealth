import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BrainCircuit,
  HeartHandshake,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmergencyRequestButton } from "@/features/emergency/components/EmergencyRequestButton";
import { CrisisBanner } from "@/features/crisis/components/CrisisBanner";
import { getCrisisResources } from "@/features/crisis/api/crisis.api";
import { useGeoCountry } from "@/hooks/useGeoCountry";
import { logout as logoutApi } from "@/features/auth/api/auth.api";
import { toast } from "sonner";
import type { CrisisResource } from "@/features/crisis/types/crisis.types";
import type { Role } from "@/types/global.types";

const publicLinks = [
  { label: "About", href: "/#about" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Services", href: "/#services" },
  { label: "For psychologists", href: "/#for-psychologists" },
];

const roleLinks: Record<Role, Array<{ label: string; to: string }>> = {
  patient: [
    { label: "Home", to: "/home" },
    { label: "Psychologists", to: "/psychologists" },
    { label: "Appointments", to: "/appointments" },
    { label: "Assessments", to: "/assessment" },
  ],
  psychologist: [
    { label: "Dashboard", to: "/psychologist/dashboard" },
    { label: "Appointments", to: "/psychologist/appointments" },
    { label: "Availability", to: "/psychologist/availability" },
  ],
  admin: [
    { label: "Dashboard", to: "/admin/dashboard" },
    { label: "Verifications", to: "/admin/verifications" },
    { label: "Reports", to: "/admin/reports" },
    { label: "Payments", to: "/admin/payments" },
  ],
};

const roleHome: Record<Role, string> = {
  patient: "/home",
  psychologist: "/psychologist/dashboard",
  admin: "/admin/dashboard",
};

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { detectedCountryCode } = useGeoCountry();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [crisisBannerVisible, setCrisisBannerVisible] = useState(false);
  const [crisisResources, setCrisisResources] = useState<CrisisResource[]>([]);
  const [isCrisisLoading, setIsCrisisLoading] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        // The banner still opens with its built-in emergency guidance.
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
      // Clear local authentication even when the server session already expired.
    }
    logout();
    navigate("/");
    toast.success("Logged out successfully");
  };

  const homePath = user ? roleHome[user.role] : "/";
  const authenticatedLinks = user ? roleLinks[user.role] : [];
  const isPatient = user?.role === "patient";

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled || isMobileMenuOpen || location.pathname !== "/"
            ? "border-slate-200/70 bg-white/95 shadow-sm backdrop-blur-xl"
            : "border-transparent bg-white/75 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link
            to={homePath}
            aria-label="ManoBalam home"
            className="group flex items-center gap-2.5"
          >
            <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-primary text-white shadow-lg shadow-primary/20 transition-transform group-hover:-rotate-3 group-hover:scale-105">
              <BrainCircuit className="size-5" />
            </span>
            <span>
              <span className="block text-base font-black tracking-tight text-slate-950">
                ManoBalam
              </span>
              <span className="hidden text-[10px] font-medium text-slate-500 sm:block">
                Strength for your mind
              </span>
            </span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">
            {user
              ? authenticatedLinks.map((item) => {
                  const isActive =
                    location.pathname === item.to ||
                    location.pathname.startsWith(`${item.to}/`);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`relative py-2 text-sm font-semibold transition-colors ${
                        isActive ? "text-primary" : "text-slate-600 hover:text-primary"
                      }`}
                    >
                      {item.label}
                      <span
                        className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary transition-transform ${
                          isActive ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </Link>
                  );
                })
              : publicLinks.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="text-sm font-semibold text-slate-600 transition-colors hover:text-primary"
                  >
                    {item.label}
                  </a>
                ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  onClick={handleCrisisToggle}
                  disabled={isCrisisLoading}
                  aria-label="Open crisis resources"
                  title="Crisis resources"
                >
                  <HeartHandshake />
                </Button>

                {isPatient && (
                  <div className="hidden sm:block">
                    <EmergencyRequestButton />
                  </div>
                )}

                <Link
                  to="/profile"
                  className="hidden items-center gap-2 rounded-xl p-1.5 pr-3 transition-colors hover:bg-violet-50 md:flex"
                >
                  <Avatar className="size-8">
                    {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                    <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-28 truncate text-sm font-semibold text-slate-700">
                    {user.name}
                  </span>
                </Link>

                <Button
                  variant="outline"
                  className="hidden h-10 rounded-xl px-4 font-semibold md:inline-flex"
                  onClick={handleLogout}
                >
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="hidden h-10 rounded-xl px-4 font-semibold sm:inline-flex"
                >
                  <Link to="/login">Log in</Link>
                </Button>
                <Button
                  asChild
                  className="h-10 rounded-xl bg-gradient-to-r from-primary to-violet-600 px-4 font-bold shadow-lg shadow-primary/20 hover:opacity-90"
                >
                  <Link to="/register">Get started</Link>
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl lg:hidden"
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((open) => !open)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden"
          >
            <div className="mx-auto grid max-w-7xl gap-1">
              {user ? (
                <>
                  {authenticatedLinks.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-violet-50 hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-violet-50 hover:text-primary"
                  >
                    Profile
                  </Link>
                  {isPatient && <EmergencyRequestButton className="mt-2 w-full justify-center" />}
                  <Button
                    variant="outline"
                    className="mt-2 w-full rounded-xl"
                    onClick={handleLogout}
                  >
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  {publicLinks.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-violet-50 hover:text-primary"
                    >
                      {item.label}
                    </a>
                  ))}
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-violet-50 hover:text-primary sm:hidden"
                  >
                    Log in
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </header>

      {crisisBannerVisible && (
        <div className="sticky top-18 z-40">
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
