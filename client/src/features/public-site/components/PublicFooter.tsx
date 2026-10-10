import { ArrowRight, HeartHandshake, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { cn } from "@/lib/utils";

export function PublicFooter({ variant = "default" }: { variant?: "default" | "about" }) {
  const year = new Date().getFullYear();
  const about = variant === "about";

  return (
    <footer className={cn("relative overflow-hidden px-4 md:px-8", about ? "about-page-chrome border-t border-[#ddd6fe] bg-white py-10 text-[#6b5b95] md:py-14" : "bg-[#0e1023] py-14 text-slate-400")}>
      {!about && <div className="absolute -right-32 -top-32 size-80 rounded-full bg-violet-600/15 blur-3xl" />}
      <div className="relative mx-auto max-w-7xl">
        <div className={cn("grid border-b", about ? "gap-x-8 gap-y-10 border-[#ddd6fe] pb-10 sm:grid-cols-2 lg:grid-cols-[1.45fr_.75fr_.75fr_1.05fr] lg:pb-12" : "gap-10 border-white/10 pb-10 md:grid-cols-[1.35fr_1fr_1fr_1.15fr]")}>
          <div className={cn("max-w-sm", about && "sm:col-span-2 lg:col-span-1")}>
            <BrandLogo dark={!about} className={cn(about && "w-fit rounded-2xl bg-[#f5f3ff] p-2 pr-4 ring-1 ring-[#ddd6fe]")} imageClassName={cn(about && "size-9")} />
            <p className="mt-5 text-sm leading-7">Professional mental-health support through flexible booking, assessments, and secure online consultations.</p>
            <Link to="/mental-health-assessment" className={cn("mt-5 inline-flex items-center gap-2 text-sm font-bold", about ? "min-h-11 rounded-xl border border-[#ddd6fe] bg-[#f5f3ff] px-4 text-[#4c1d95] transition-colors hover:bg-[#ede9fe] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300" : "text-violet-300 hover:text-white")}>
              Explore MHQ <ArrowRight className="size-4" />
            </Link>
          </div>
          <div>
            <h3 className={cn("mb-4 text-sm font-black", about ? "text-[#312e81]" : "text-white")}>Organization</h3>
            <div className={cn("grid text-sm", about ? "gap-1" : "gap-3")}>
              <Link to="/about" className={cn(about ? "flex min-h-10 items-center rounded-lg px-2 transition-colors hover:bg-[#f5f3ff] hover:text-[#4c1d95]" : "hover:text-white")}>About us</Link>
              <Link to="/organization" className={cn(about ? "flex min-h-10 items-center rounded-lg px-2 transition-colors hover:bg-[#f5f3ff] hover:text-[#4c1d95]" : "hover:text-white")}>Committees</Link>
              <Link to="/events-achievements" className={cn(about ? "flex min-h-10 items-center rounded-lg px-2 transition-colors hover:bg-[#f5f3ff] hover:text-[#4c1d95]" : "hover:text-white")}>Events & achievements</Link>
              <Link to="/faq" className={cn(about ? "flex min-h-10 items-center rounded-lg px-2 transition-colors hover:bg-[#f5f3ff] hover:text-[#4c1d95]" : "hover:text-white")}>FAQ</Link>
            </div>
          </div>
          <div>
            <h3 className={cn("mb-4 text-sm font-black", about ? "text-[#312e81]" : "text-white")}>Care</h3>
            <div className={cn("grid text-sm", about ? "gap-1" : "gap-3")}>
              <Link to="/services/first-aid-support" className={cn(about ? "flex min-h-10 items-center rounded-lg px-2 transition-colors hover:bg-[#f5f3ff] hover:text-[#4c1d95]" : "hover:text-white")}>First aid support</Link>
              <Link to="/services/clinical-psychology" className={cn(about ? "flex min-h-10 items-center rounded-lg px-2 transition-colors hover:bg-[#f5f3ff] hover:text-[#4c1d95]" : "hover:text-white")}>Clinical psychology</Link>
              <Link to="/services/mental-health-counselling" className={cn(about ? "flex min-h-10 items-center rounded-lg px-2 transition-colors hover:bg-[#f5f3ff] hover:text-[#4c1d95]" : "hover:text-white")}>Counselling</Link>
              <Link to="/psychologists" className={cn(about ? "flex min-h-10 items-center rounded-lg px-2 transition-colors hover:bg-[#f5f3ff] hover:text-[#4c1d95]" : "hover:text-white")}>Find a psychologist</Link>
            </div>
          </div>
          <div>
            <h3 className={cn("mb-4 text-sm font-black", about ? "text-[#312e81]" : "text-white")}>Contact</h3>
            <div className="grid gap-3 text-sm">
              <span className={cn("flex gap-3", about && "min-h-10 items-center rounded-lg px-2")}><Mail className={cn("size-4 text-violet-300", about ? "shrink-0" : "mt-0.5")} /> support@manobalam.org</span>
              <span className={cn("flex gap-3", about && "min-h-10 items-center rounded-lg px-2")}><Phone className={cn("size-4 text-violet-300", about ? "shrink-0" : "mt-0.5")} /> Emergency: 112</span>
              <span className={cn("flex gap-3", about && "min-h-10 items-center rounded-lg px-2")}><MapPin className={cn("size-4 text-violet-300", about ? "shrink-0" : "mt-0.5")} /> Online support across India</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-7 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} ManoBalamHealthCare. All rights reserved.</p>
          <p className="flex items-center gap-2"><HeartHandshake className="size-4 text-violet-300" /> Technology with a human purpose.</p>
        </div>
      </div>
    </footer>
  );
}
