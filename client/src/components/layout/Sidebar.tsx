import { useUserStore } from "@/stores/userStore";
import {
  Home,
  Calendar,
  User,
  Users,
  FileText,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useUserStore();

  if (!user) return null;

  const navItems = [
    { path: "/home", label: "Home", icon: Home },
    { path: "/appointments", label: "Appointments", icon: Calendar },
    { path: "/profile", label: "Profile", icon: User },
  ];

  const psychNavItems = [
    ...navItems,
    { path: "/psychologist/dashboard", label: "Dashboard", icon: BarChart3 },
  ];

  const adminNavItems = [
    { path: "/admin", label: "Dashboard", icon: BarChart3 },
    { path: "/admin/verifications", label: "Verifications", icon: Users },
    { path: "/admin/reports", label: "Reports", icon: FileText },
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
        <h2 className="text-xl font-bold text-gray-800">
          {user.role === "admin" ? "Admin Panel" : "Manobalam"}
        </h2>
      </div>
      <nav className="p-4 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                transition-colors duration-150
                ${isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
                }
              `}
              onClick={onClose}
            >
              <Icon className="h-5 w-5" />
              {item.label}
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
