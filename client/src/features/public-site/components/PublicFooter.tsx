import { ArrowRight, HeartHandshake, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function PublicFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-[#0e1023] px-4 py-14 text-slate-400 md:px-8">
      <div className="absolute -right-32 -top-32 size-80 rounded-full bg-violet-600/15 blur-3xl" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-[1.35fr_1fr_1fr_1.15fr]">
          <div className="max-w-sm">
            <BrandLogo dark />
            <p className="mt-5 text-sm leading-7">Professional mental-health support through flexible booking, assessments, and secure online consultations.</p>
            <Link to="/mental-health-assessment" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-violet-300 hover:text-white">
              Explore MHQ <ArrowRight className="size-4" />
            </Link>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-black text-white">Organization</h3>
            <div className="grid gap-3 text-sm">
              <Link to="/about" className="hover:text-white">About us</Link>
              <Link to="/organization/executive-committee" className="hover:text-white">Committees</Link>
              <Link to="/events-achievements" className="hover:text-white">Events & achievements</Link>
              <Link to="/faq" className="hover:text-white">FAQ</Link>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-black text-white">Care</h3>
            <div className="grid gap-3 text-sm">
              <Link to="/services/first-aid-support" className="hover:text-white">First aid support</Link>
              <Link to="/services/clinical-psychology" className="hover:text-white">Clinical psychology</Link>
              <Link to="/services/mental-health-counselling" className="hover:text-white">Counselling</Link>
              <Link to="/psychologists" className="hover:text-white">Find a psychologist</Link>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-black text-white">Contact</h3>
            <div className="grid gap-3 text-sm">
              <span className="flex gap-3"><Mail className="mt-0.5 size-4 text-violet-300" /> support@manobalam.org</span>
              <span className="flex gap-3"><Phone className="mt-0.5 size-4 text-violet-300" /> Emergency: 112</span>
              <span className="flex gap-3"><MapPin className="mt-0.5 size-4 text-violet-300" /> Online support across India</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-7 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} ManoBalam. All rights reserved.</p>
          <p className="flex items-center gap-2"><HeartHandshake className="size-4 text-violet-300" /> Technology with a human purpose.</p>
        </div>
      </div>
    </footer>
  );
}
