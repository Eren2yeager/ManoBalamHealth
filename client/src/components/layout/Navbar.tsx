import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown, HeartHandshake, Menu, Sparkles, X } from "lucide-react";
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
import { BrandLogo } from "@/components/brand/BrandLogo";
import { featuredNavCards, publicNavigation } from "@/features/public-site/constants/publicNavigation";
import type { PublicNavItem } from "@/features/public-site/types/public-site.types";

const roleLinks: Record<Role, Array<{ label: string; to: string }>> = {
  patient: [
    { label: "Home", to: "/home" },
    { label: "Psychologists", to: "/psychologists" },
    { label: "Appointments", to: "/appointments" },
    { label: "Assessments", to: "/assessment" },
  ],
  psychologist: [
    { label: "Dashboard", to: "/psychologist/dashboard" },
    { label: "Onboarding", to: "/psychologist/onboarding" },
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

const publicRoutePrefixes = [
  "/about",
  "/organization",
  "/services",
  "/mental-health-assessment",
  "/events-achievements",
  "/faq",
  "/contact",
];

function isPublicWebsitePath(pathname: string) {
  return (
    pathname === "/" ||
    publicRoutePrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  );
}

function isItemActive(item: PublicNavItem, pathname: string) {
  if (item.to === "/") return pathname === "/" || pathname === "/home";
  if (item.to) return pathname === item.to || pathname.startsWith(`${item.to}/`);
  return item.children?.some((child) => child.to && (pathname === child.to || pathname.startsWith(`${child.to}/`))) ?? false;
}

function DesktopPublicNavigation({
  pathname,
  homeTo = "/",
  openMenu,
  setOpenMenu,
}: {
  pathname: string;
  homeTo?: string;
  openMenu: string | null;
  setOpenMenu: (value: string | null) => void;
}) {
  return (
    <nav aria-label="Main navigation" className="hidden h-full items-center gap-0.5 xl:flex">
      {publicNavigation.map((item) => {
        const active = isItemActive(item, pathname);
        if (!item.children && item.to) {
          return (
            <Link
              key={item.label}
              to={item.to === "/" ? homeTo : item.to}
              className={`relative rounded-xl px-3 py-2 text-[13px] font-bold transition-colors ${active ? "bg-violet-50 text-primary" : "text-slate-600 hover:bg-slate-50 hover:text-primary"}`}
            >
              {item.label}
              {active && <span className="absolute inset-x-3 -bottom-[17px] h-0.5 rounded-full bg-primary" />}
            </Link>
          );
        }
        if (!item.children) return null;

        const open = openMenu === item.label;
        return (
          <div
            key={item.label}
            className="relative h-full"
            onMouseEnter={() => setOpenMenu(item.label)}
            onMouseLeave={() => setOpenMenu(null)}
            onFocus={() => setOpenMenu(item.label)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setOpenMenu(null);
            }}
          >
            <button
              type="button"
              aria-expanded={open}
              className={`flex h-full items-center gap-1 rounded-xl px-3 text-[13px] font-bold transition-colors ${active || open ? "text-primary" : "text-slate-600 hover:text-primary"}`}
              onClick={() => setOpenMenu(open ? null : item.label)}
            >
              {item.label}
              <ChevronDown className={`size-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>
            <div className={`absolute left-1/2 top-[calc(100%-3px)] w-[640px] -translate-x-1/2 pt-4 transition-all duration-200 ${open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"}`}>
              <div className="overflow-hidden rounded-[1.75rem] border border-violet-100 bg-white/98 p-3 shadow-[0_28px_80px_rgba(30,19,67,.18)] backdrop-blur-xl">
                <div className="grid grid-cols-[1.35fr_.65fr] gap-3">
                  <div className="grid gap-1">
                    <div className="px-3 pb-2 pt-1">
                      <p className="text-[10px] font-black uppercase tracking-[.2em] text-violet-500">{item.label}</p>
                    </div>
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      return (
                        <Link
                          key={child.to}
                          to={child.to ?? "/"}
                          onClick={() => setOpenMenu(null)}
                          className="group flex items-start gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-violet-50"
                        >
                          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-50 text-primary transition-colors group-hover:bg-white group-hover:shadow-sm">
                            {ChildIcon ? <ChildIcon className="size-4" /> : <ArrowRight className="size-4" />}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-black text-slate-900 group-hover:text-primary">{child.label}</span>
                            <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">{child.description}</span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-[#17162e] to-violet-950 p-4 text-white">
                    <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-violet-300"><Sparkles className="size-5" /></span>
                    <h3 className="mt-4 text-base font-black">Care that meets you where you are.</h3>
                    <p className="mt-2 text-[11px] leading-5 text-violet-100/70">Explore ManoBalamHealthCare's purpose, people, and pathways to mental-health support.</p>
                    <div className="mt-4 grid gap-2">
                      {featuredNavCards.map((card) => (
                        <Link key={card.to} to={card.to} onClick={() => setOpenMenu(null)} className="rounded-xl border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10">
                          <span className="text-xs font-black">{card.title}</span>
                          <span className="mt-1 block text-[10px] leading-4 text-violet-100/60">{card.text}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

function MobilePublicNavigation({
  close,
  homeTo = "/",
  showLogin = true,
}: {
  close: () => void;
  homeTo?: string;
  showLogin?: boolean;
}) {
  const location = useLocation();
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <nav aria-label="Mobile navigation" className="grid gap-1">
      {publicNavigation.map((item) => {
        const active = isItemActive(item, location.pathname);
        if (!item.children && item.to) {
          const Icon = item.icon;
          return (
            <Link key={item.label} to={item.to === "/" ? homeTo : item.to} onClick={close} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold ${active ? "bg-violet-50 text-primary" : "text-slate-700 hover:bg-slate-50"}`}>
              {Icon && <Icon className="size-4" />}{item.label}
            </Link>
          );
        }
        if (!item.children) return null;
        const open = expanded === item.label;
        const Icon = item.icon;
        return (
          <div key={item.label}>
            <button type="button" onClick={() => setExpanded(open ? null : item.label)} className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-bold ${active ? "text-primary" : "text-slate-700 hover:bg-slate-50"}`}>
              <span className="flex items-center gap-3">{Icon && <Icon className="size-4" />}{item.label}</span>
              <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                <div className="ml-4 grid gap-1 border-l border-violet-100 py-1 pl-3">
                  {item.children.map((child) => (
                    <Link key={child.to} to={child.to ?? "/"} onClick={close} className="rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-violet-50 hover:text-primary">{child.label}</Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {showLogin && (
        <Link to="/login" onClick={close} className="mt-2 rounded-xl border border-violet-100 px-3 py-3 text-center text-sm font-bold text-primary sm:hidden">Log in</Link>
      )}
    </nav>
  );
}

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { detectedCountryCode } = useGeoCountry();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
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
        setCrisisResources(await getCrisisResources(detectedCountryCode ?? ""));
      } catch {
        // The banner contains built-in emergency guidance.
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
      // Local authentication must still be cleared if the server session expired.
    }
    logout();
    navigate("/");
    toast.success("Logged out successfully");
  };

  const homePath = user ? roleHome[user.role] : "/";
  const authenticatedLinks = user ? roleLinks[user.role] : [];
  const isPatient = user?.role === "patient";
  const showPublicNavigation =
    !user ||
    (isPatient &&
      (location.pathname === "/home" || isPublicWebsitePath(location.pathname)));
  const publicHomePath = isPatient ? "/home" : "/";

  return (
    <>
      <header className={`sticky top-0 z-50 border-b transition-all duration-300 ${scrolled || isMobileMenuOpen || location.pathname !== "/" ? "border-slate-200/70 bg-white/96 shadow-[0_8px_35px_rgba(32,22,70,.07)] backdrop-blur-xl" : "border-transparent bg-white/80 backdrop-blur-lg"}`}>
        <div className="mx-auto flex h-19 max-w-[1440px] items-center justify-between gap-4 px-4 md:px-7">
          <BrandLogo to={homePath} />

          {!showPublicNavigation && user ? (
            <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">
              {authenticatedLinks.map((item) => {
                const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
                return <Link key={item.to} to={item.to} className={`relative py-2 text-sm font-semibold transition-colors ${active ? "text-primary" : "text-slate-600 hover:text-primary"}`}>{item.label}<span className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary transition-transform ${active ? "scale-x-100" : "scale-x-0"}`} /></Link>;
              })}
            </nav>
          ) : (
            <DesktopPublicNavigation
              pathname={location.pathname}
              homeTo={publicHomePath}
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
            />
          )}

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={handleCrisisToggle} disabled={isCrisisLoading} aria-label="Open crisis resources"><HeartHandshake /></Button>
                {isPatient && <div className="hidden sm:block"><EmergencyRequestButton /></div>}
                <Link to="/profile" className="hidden items-center gap-2 rounded-xl p-1.5 pr-3 transition-colors hover:bg-violet-50 md:flex">
                  <Avatar className="size-8">{user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}<AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">{user.name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                  <span className="max-w-28 truncate text-sm font-semibold text-slate-700">{user.name}</span>
                </Link>
                <Button variant="outline" className="hidden h-10 rounded-xl px-4 font-semibold md:inline-flex" onClick={handleLogout}>Log out</Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className="hidden h-10 rounded-xl px-4 font-bold sm:inline-flex"><Link to="/login">Log in</Link></Button>
                <Button asChild className="h-10 rounded-xl bg-gradient-to-r from-primary to-violet-600 px-4 font-bold shadow-lg shadow-primary/20 hover:opacity-90"><Link to="/register">Get started</Link></Button>
              </>
            )}
            <Button variant="ghost" size="icon" className={`rounded-xl ${user ? "lg:hidden" : "xl:hidden"}`} aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen((open) => !open)}>{isMobileMenuOpen ? <X /> : <Menu />}</Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className={`border-t border-slate-100 bg-white px-4 py-4 shadow-xl ${user ? "lg:hidden" : "xl:hidden"}`}>
            <div className="mx-auto max-h-[calc(100vh-7rem)] max-w-7xl overflow-y-auto">
              {!showPublicNavigation && user ? (
                <nav aria-label="Mobile navigation" className="grid gap-1">
                  {authenticatedLinks.map((item) => <Link key={item.to} to={item.to} onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-violet-50 hover:text-primary">{item.label}</Link>)}
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-violet-50 hover:text-primary">Profile</Link>
                  {isPatient && <EmergencyRequestButton className="mt-2 w-full justify-center" />}
                  <Button variant="outline" className="mt-2 w-full rounded-xl" onClick={handleLogout}>Log out</Button>
                </nav>
              ) : (
                <MobilePublicNavigation
                  close={() => setIsMobileMenuOpen(false)}
                  homeTo={publicHomePath}
                  showLogin={!user}
                />
              )}
            </div>
          </div>
        )}
      </header>
      {crisisBannerVisible && <div className="sticky top-19 z-40"><CrisisBanner resources={crisisResources} isVisible={crisisBannerVisible} onDismiss={() => setCrisisBannerVisible(false)} /></div>}
    </>
  );
}
