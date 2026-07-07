import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  to?: string;
  compact?: boolean;
  dark?: boolean;
  className?: string;
  imageClassName?: string;
}

export function BrandLogo({
  to = "/",
  compact = false,
  dark = false,
  className,
  imageClassName,
}: BrandLogoProps) {
  return (
    <Link
      to={to}
      aria-label="ManoBalamHealthCare home"
      className={cn("group flex items-center gap-2.5", className)}
    >
      <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-primary/15 ring-1 ring-slate-200/70 transition-transform group-hover:-rotate-2 group-hover:scale-105">
        <img
          src="/images/favicon.svg"
          alt=""
          className={cn("size-10 object-contain", imageClassName)}
        />
      </span>
      {!compact && (
        <span>
          <span
            className={cn(
              "block whitespace-nowrap text-sm font-black tracking-tight sm:text-base",
              dark ? "text-white" : "text-slate-950",
            )}
          >
            ManoBalamHealthCare
          </span>
          <span
            className={cn(
              "hidden text-[10px] font-medium sm:block",
              dark ? "text-white/70" : "text-slate-500",
            )}
          >
            Empowering your mind
          </span>
        </span>
      )}
    </Link>
  );
}

export function BrandMark({
  className,
  imageClassName,
}: Pick<BrandLogoProps, "className" | "imageClassName">) {
  return (
    <span
      className={cn(
        "grid size-16 place-items-center overflow-hidden rounded-3xl bg-white shadow-xl shadow-primary/15 ring-1 ring-slate-200/70",
        className,
      )}
    >
      <img
        src="/images/logo-mark.png"
        alt="ManoBalamHealthCare"
        className={cn("size-14 object-contain", imageClassName)}
      />
    </span>
  );
}
