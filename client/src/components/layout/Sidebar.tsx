import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/userStore";
import {
  Home,
  Calendar,
  User,
  Users,
  ClipboardList,
  PlusCircle,
  FileText,
  BarChart3,
  AlertCircle,
  CircleDollarSign,
  Clock3,
  WalletCards,
  UserRoundCog,
  ReceiptText,
  Inbox,
  HeartHandshake,
  FileClock,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { getAdminAttentionSummary, type AdminAttentionSummary } from "@/features/admin/api/admin.api";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface SidebarNavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  count?: number;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useUserStore();
  const [attention, setAttention] = useState<AdminAttentionSummary | null>(null);

  useEffect(() => {
    if (user?.role !== "admin") {
      const timer = window.setTimeout(() => setAttention(null), 0);
      return () => window.clearTimeout(timer);
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      getAdminAttentionSummary()
        .then((summary) => {
          if (!cancelled) setAttention(summary);
        })
        .catch(() => {
          if (!cancelled) setAttention(null);
        });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [user?.role]);

  if (!user) return null;

  const navItems: SidebarNavItem[] = [
    { path: "/home", label: "Home", icon: Home },
    { path: "/book", label: "Book Session", icon: PlusCircle },
    { path: "/psychologists", label: "Psychologists", icon: Users },
    { path: "/appointments", label: "Appointments", icon: Calendar },
    { path: "/assessment", label: "Assessments", icon: ClipboardList },
    { path: "/crisis", label: "Crisis Support", icon: HeartHandshake },
    { path: "/profile", label: "Profile", icon: User },
  ];

  const psychNavItems: SidebarNavItem[] = [
    { path: "/psychologist/dashboard", label: "Dashboard", icon: BarChart3 },
    { path: "/psychologist/appointments", label: "Appointments", icon: Calendar },
    { path: "/psychologist/availability", label: "Availability", icon: Clock3 },
    { path: "/psychologist/earnings", label: "Payouts", icon: WalletCards },
    { path: "/psychologist/onboarding", label: "Edit Professional Details", icon: ShieldCheck },
    { path: "/profile", label: "Account Profile", icon: User },
  ];

  const adminNavItems: SidebarNavItem[] = [
    { path: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
    { path: "/admin/verifications", label: "Verifications", icon: Users, count: attention?.pendingVerifications },
    { path: "/admin/appointments", label: "Appointments", icon: Calendar },
    { path: "/admin/payments", label: "Payments", icon: ReceiptText, count: attention?.refundReviews },
    { path: "/admin/pricing", label: "Pricing", icon: CircleDollarSign },
    { path: "/admin/payouts", label: "Payouts", icon: WalletCards, count: (attention?.payoutReady ?? 0) + (attention?.payoutBlocked ?? 0) },
    { path: "/admin/users", label: "Users", icon: UserRoundCog },
    { path: "/admin/reports", label: "Reports", icon: FileText },
    { path: "/admin/contact-requests", label: "Support", icon: Inbox, count: attention?.contactNew },
    { path: "/admin/crisis", label: "Crisis", icon: HeartHandshake, count: attention?.crisisAppointments },
    { path: "/admin/audit-logs", label: "Audit Logs", icon: FileClock },
  ];

  const items = user.role === "admin"
    ? adminNavItems
    : user.role === "psychologist"
    ? psychNavItems
    : navItems;

  return (
    <aside
      className={`
        bg-white border-r border-gray-200 w-64 min-h-screen
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 transition-transform duration-200 ease-in-out
        fixed md:static z-40
      `}
    >
      <div className="p-4 border-b border-gray-200">
        <BrandLogo
          to={
            user.role === "admin"
              ? "/admin/dashboard"
              : user.role === "psychologist"
                ? "/psychologist/dashboard"
                : "/home"
          }
        />
        {user.role === "admin" && (
          <p className="mt-2 pl-13 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Admin panel
          </p>
        )}
        {user.role === "psychologist" && (
          <p className="mt-2 pl-13 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Psychologist workspace
          </p>
        )}
        {user.role === "patient" && (
          <p className="mt-2 pl-13 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Patient care space
          </p>
        )}
      </div>
      <nav className="p-4 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
          const badgeCount = typeof item.count === "number" ? item.count : 0;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                transition-colors duration-150
                ${isActive
                  ? "bg-violet-100 text-violet-700 shadow-sm shadow-violet-100"
                  : "text-gray-700 hover:bg-violet-50 hover:text-violet-700"
                }
              `}
              onClick={onClose}
            >
              <Icon className="h-5 w-5" />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {badgeCount > 0 ? (
                <span className="ml-auto rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-black text-white">
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {user.role === "patient" && (
        <div className="absolute bottom-4 left-4 right-4">
          <Link
            to="/emergency"
            className="flex items-center gap-3 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
          >
            <AlertCircle className="h-5 w-5" />
            Emergency
          </Link>
        </div>
      )}
    </aside>
  );
}
