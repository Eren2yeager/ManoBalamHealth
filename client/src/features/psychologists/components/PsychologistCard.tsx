import { Link } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  IndianRupee,
  Languages,
  MessageCircle,
  Star,
  Video,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { PsychologistListItem } from "../types/psychologist.types";

interface PsychologistCardProps {
  psychologist: PsychologistListItem;
  animationClass?: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export const PsychologistCard = ({
  psychologist,
  animationClass = "",
}: PsychologistCardProps) => {
  // Cheapest option (chat / 30 min) from the server-derived price matrix,
  // falling back to the base fee (paise, per 30-min video session).
  const startingPaise =
    psychologist.priceMatrix?.chat?.[30] ?? psychologist.consultationFee.amount;
  const fee = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: psychologist.consultationFee.currency || "INR",
    maximumFractionDigits: 0,
  }).format(startingPaise / 100);

  return (
    <article
      className={`group relative flex h-full animate-in fade-in slide-in-from-bottom-4 flex-col overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white shadow-sm duration-500 hover:-translate-y-2 hover:border-violet-100 hover:shadow-2xl hover:shadow-primary/10 ${animationClass}`}
    >
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-violet-100/75 via-purple-50 to-blue-50 opacity-80" />
      <div className="absolute -right-10 -top-10 size-28 rounded-full bg-primary/8 blur-2xl transition-transform duration-500 group-hover:scale-150" />

      <div className="relative flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="relative">
            <Avatar className="size-18 border-4 border-white shadow-lg">
              {psychologist.avatarUrl && (
                <AvatarImage src={psychologist.avatarUrl} alt={psychologist.name} />
              )}
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-blue-500 text-lg font-black text-white">
                {getInitials(psychologist.name)}
              </AvatarFallback>
            </Avatar>
            <span
              className={`absolute bottom-0 right-0 size-4 rounded-full border-[3px] border-white ${
                psychologist.isOnline ? "bg-emerald-500" : "bg-slate-300"
              }`}
              title={psychologist.isOnline ? "Online" : "Offline"}
            />
          </div>

          <span className="flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1.5 text-xs font-black text-amber-700 shadow-sm">
            <Star className="size-3.5 fill-current" />
            {psychologist.rating.average.toFixed(1)}
            <span className="font-medium text-amber-600/70">
              ({psychologist.rating.count})
            </span>
          </span>
        </div>

        <div className="mt-5">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-black tracking-tight text-slate-950">
              {psychologist.name}
            </h3>
            {psychologist.isOnline && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-emerald-700">
                Online
              </span>
            )}
          </div>
          <p className="mt-1 flex items-center gap-1.5 truncate text-xs font-medium text-slate-500">
            <Languages className="size-3.5 text-primary" />
            {psychologist.languages.length
              ? psychologist.languages.slice(0, 3).join(" · ")
              : "Language details available on profile"}
          </p>
        </div>

        <div className="mt-4 flex min-h-14 flex-wrap content-start gap-1.5">
          {psychologist.specialization.slice(0, 3).map((specialization) => (
            <span
              key={specialization}
              className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold capitalize text-primary"
            >
              {specialization.replaceAll("-", " ")}
            </span>
          ))}
          {psychologist.specialization.length > 3 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
              +{psychologist.specialization.length - 3} more
            </span>
          )}
        </div>

        <p className="mt-3 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
          {psychologist.bio ||
            "View this professional’s profile, approach, consultation details, and available slots."}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              <BriefcaseBusiness className="size-3.5" />
              Experience
            </p>
            <p className="mt-1 text-sm font-black text-slate-800">
              {psychologist.experienceYears} years
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              <IndianRupee className="size-3.5" />
              Sessions from
            </p>
            <p className="mt-1 text-sm font-black text-slate-800">{fee}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold text-slate-400">
          <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-blue-700">
            <Video className="size-3" /> Video
          </span>
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
            <MessageCircle className="size-3" /> Chat
          </span>
        </div>

        <div className="mt-auto pt-5">
          <Link
            to={`/psychologists/${psychologist.id}`}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-violet-600 text-sm font-bold text-white shadow-lg shadow-primary/15 transition-all hover:shadow-xl"
          >
            View profile
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
};
