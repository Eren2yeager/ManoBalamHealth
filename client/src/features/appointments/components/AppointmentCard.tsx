import { useNavigate } from "react-router-dom";
import { MessageSquare, Phone, Video, User, Clock3, ArrowRight, PlayCircle, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatInViewerTz } from "@/lib/timezone";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";
import { useUserStore } from "@/stores/userStore";
import type { AppointmentListItem } from "../types/appointment.types";
import type { ConsultationMode } from "@/types/global.types";
import { getSessionAccessState } from "../utils/sessionAccess";

const MODE_CONFIG: Record<
  ConsultationMode,
  { label: string; icon: typeof MessageSquare; color: string; bg: string }
> = {
  chat: { label: "Chat", icon: MessageSquare, color: "text-emerald-700", bg: "bg-emerald-50" },
  audio: { label: "Audio", icon: Phone, color: "text-blue-700", bg: "bg-blue-50" },
  video: { label: "Video", icon: Video, color: "text-violet-700", bg: "bg-violet-50" },
};

interface AppointmentCardProps {
  appointment: AppointmentListItem;
}

export const AppointmentCard = ({ appointment }: AppointmentCardProps) => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const modeConfig = MODE_CONFIG[appointment.mode];
  const ModeIcon = modeConfig.icon;
  const { canJoinSession, isTooEarly, isExpired } = getSessionAccessState(appointment);
  const sessionPath =
    user?.role === "psychologist"
      ? `/psychologist/session/${appointment.id}`
      : `/session/${appointment.id}`;

  const initials = appointment.otherParty.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-2 hover:border-violet-100 hover:shadow-2xl hover:shadow-primary/10 sm:p-5"
      onClick={() => navigate(`/appointments/${appointment.id}`)}
    >
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-br from-violet-100/60 via-purple-50 to-blue-50 opacity-70 sm:h-20" />
      <div className="absolute -right-8 -top-8 size-24 rounded-full bg-primary/8 blur-2xl transition-transform duration-500 group-hover:scale-150 sm:-right-12 sm:-top-12 sm:size-32" />

      <div className="relative flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="relative">
            <Avatar className="size-12 border-4 border-white shadow-lg sm:size-16">
              {appointment.otherParty.avatarUrl ? (
                <AvatarImage
                  src={appointment.otherParty.avatarUrl}
                  alt={appointment.otherParty.name}
                />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-blue-500 text-sm font-black text-white sm:text-base">
                {initials || <User className="size-5 sm:size-6" />}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex flex-col items-end gap-2">
            <AppointmentStatusBadge status={appointment.status} />
            <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold capitalize ${modeConfig.bg} ${modeConfig.color} sm:px-2.5`}>
              <ModeIcon className="size-3" />
              {modeConfig.label}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-base font-black tracking-tight text-slate-950 sm:text-lg">
            {appointment.otherParty.name}
          </h3>
          
          <div className="mt-2 flex items-center gap-2 text-[11px] font-medium text-slate-500 sm:text-xs">
            <Clock3 className="size-3 text-primary sm:size-3.5" />
            {formatInViewerTz(appointment.scheduledAt, "EEE, MMM d · h:mm a")}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge variant="outline" className="rounded-full border-slate-200 px-2 py-1 text-[10px] font-bold capitalize text-slate-600 sm:px-2.5">
              {appointment.allocationMode}
            </Badge>
          </div>

          {/* Show feedback for psychologists if available */}
          {user?.role === "psychologist" && appointment.feedback && (
            <div className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs text-amber-900 border border-amber-100">
              <div className="flex items-center gap-1 mb-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-3.5 ${i < appointment.feedback!.rating ? "fill-amber-400 text-amber-400" : "text-amber-200"}`}
                  />
                ))}
              </div>
              {appointment.feedback.comment && (
                <p className="text-amber-800 text-[11px] leading-relaxed">
                  "{appointment.feedback.comment}"
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-auto space-y-2 pt-5">
          {canJoinSession && (
            <Button
              className="h-9 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-bold shadow-lg shadow-violet-200 transition-all hover:from-violet-700 hover:to-indigo-700 sm:h-10"
              onClick={(event) => {
                event.stopPropagation();
                navigate(sessionPath);
              }}
            >
              <PlayCircle className="mr-2 size-3.5 sm:size-4" />
              {appointment.status === "in_progress" ? "Rejoin session" : "Start session"}
            </Button>
          )}
          {!canJoinSession && !["pending_payment", "cancelled", "no_show"].includes(appointment.status) && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-medium text-slate-600">
              {isTooEarly
                ? "Session access opens 5 minutes before start"
                : isExpired
                  ? "Session window has ended"
                  : "Session unavailable"}
            </div>
          )}
          {user?.role === "patient" && appointment.status === "completed" && !appointment.hasFeedback && (
            <Button
              className="h-9 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-sm font-bold shadow-lg shadow-emerald-200 transition-all hover:from-emerald-600 hover:to-green-700 sm:h-10"
              onClick={(event) => {
                event.stopPropagation();
                navigate(`/feedback/${appointment.id}`);
              }}
            >
              <Star className="mr-2 size-3.5 sm:size-4" />
              Leave feedback
            </Button>
          )}
          {user?.role === "patient" && appointment.status === "completed" && appointment.hasFeedback && (
            <div className="flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-700 sm:h-10">
              <Star className="size-3.5 sm:size-4 fill-current" />
              Feedback submitted
            </div>
          )}
          <div className="flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-violet-600 text-sm font-bold text-white shadow-lg shadow-primary/15 transition-all group-hover:shadow-xl sm:h-10">
            View details
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1 sm:size-4" />
          </div>
        </div>
      </div>
    </article>
  );
};
