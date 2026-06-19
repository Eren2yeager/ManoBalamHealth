import { useUserStore } from "@/stores/userStore";
import { Home, Calendar, User, AlertCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function BottomNav() {
  const location = useLocation();
  const { user } = useUserStore();

  if (!user) return null;

  const navItems = [
    { path: "/home", label: "Home", icon: Home },
    { path: "/appointments", label: "Appointments", icon: Calendar },
    { path: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center gap-1 px-4 py-2 rounded-lg
                ${isActive ? "text-blue-600" : "text-gray-500"}
              `}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}

        {user.role === "patient" && (
          <Link
            to="/emergency"
            className="flex flex-col items-center gap-1 px-4 py-2 text-red-600"
          >
            <AlertCircle className="h-6 w-6" />
            <span className="text-xs">Emergency</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
