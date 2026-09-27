import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Breadcrumbs({
  items,
  variant = "default",
}: {
  items: Array<{ label: string; to?: string }>;
  variant?: "default" | "about";
}) {
  const about = variant === "about";

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex flex-wrap items-center text-xs font-semibold",
        about ? "gap-1.5 text-[#6b5b95]" : "gap-2 text-slate-500",
      )}
    >
      <Link
        to="/"
        className={cn(
          "flex items-center transition-colors hover:text-primary",
          about
            ? "min-h-11 gap-2 rounded-xl border border-[#ddd6fe] bg-white px-3.5 text-[#4c1d95] hover:bg-[#ede9fe] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300"
            : "gap-1",
        )}
      >
        <Home className={cn(about ? "size-4" : "size-3.5")} />
        Home
      </Link>
      {items.map((item) => (
        <span key={item.label} className={cn("flex items-center", about ? "gap-1.5" : "gap-2")}>
          <ChevronRight className="size-3.5 text-violet-300" />
          {item.to ? (
            <Link
              to={item.to}
              className={cn(
                "transition-colors hover:text-primary",
                about && "flex min-h-11 items-center rounded-xl px-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200",
              )}
            >
              {item.label}
            </Link>
          ) : (
            <span className={cn("text-slate-700", about && "flex min-h-11 items-center px-2 text-[#312e81]")}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

