import { useNavigate } from "react-router-dom";
import { Star, Briefcase, IndianRupee, ArrowRight } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { PsychologistListItem } from "../types/psychologist.types";

interface PsychologistCardProps {
  psychologist: PsychologistListItem;
  style?: React.CSSProperties;
}

/** Derive initials from a full name, e.g. "Sarah Jenkins" → "SJ" */
function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

export const PsychologistCard = ({ psychologist, style }: PsychologistCardProps) => {
  const navigate = useNavigate();

  const fee = (psychologist.consultationFee.amount / 100).toLocaleString("en-IN");

  return (
    <article
      style={style}
      onClick={() => navigate(`/psychologists/${psychologist.id}`)}
      className={cn(
        "relative flex flex-col bg-card rounded-xl border border-border overflow-hidden cursor-pointer",
        "transition-all duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)]",
        "group"
      )}
    >
      {/* Top hover accent bar */}
      <div className="absolute top-0 left-0 h-[3px] w-full bg-primary scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />

      <div className="p-4 flex flex-col gap-4">
        {/* Header row: avatar + name + rating */}
        <div className="flex gap-4">
          {/* Avatar with online dot */}
          <div className="relative shrink-0">
            <Avatar className="size-[72px] border-2 border-background shadow-sm">
              {psychologist.avatarUrl ? (
                <AvatarImage src={psychologist.avatarUrl} alt={psychologist.name} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                {getInitials(psychologist.name)}
              </AvatarFallback>
            </Avatar>
            {psychologist.isOnline && (
              <span
                title="Online Now"
                className="absolute bottom-0.5 right-0.5 w-[14px] h-[14px] bg-emerald-500 border-2 border-card rounded-full"
              />
            )}
          </div>

          {/* Name + credential + rating */}
          <div className="flex-1 min-w-0">
            <h3 className="font-[Manrope,sans-serif] text-base font-semibold text-foreground truncate leading-tight">
              {psychologist.name}
            </h3>
            {psychologist.languages.length > 0 && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {psychologist.languages.slice(0, 3).join(", ")}
              </p>
            )}
            <div className="flex items-center gap-1 mt-1.5">
              <Star className="h-3.5 w-3.5 fill-primary text-primary shrink-0" />
              <span className="text-sm font-semibold text-foreground leading-none">
                {psychologist.rating.average.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground leading-none">
                ({psychologist.rating.count})
              </span>
            </div>
          </div>
        </div>

        {/* Specialization chips */}
        <div className="flex flex-wrap gap-1.5">
          {psychologist.specialization.slice(0, 3).map((spec) => (
            <span
              key={spec}
              className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground capitalize"
            >
              {spec.replace(/-/g, " ")}
            </span>
          ))}
          {psychologist.specialization.length > 3 && (
            <span className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">
              +{psychologist.specialization.length - 3}
            </span>
          )}
        </div>

        {/* Experience / Fee row */}
        <div className="grid grid-cols-2 gap-3 border-y border-border py-3">
          <div className="flex flex-col gap-0.5">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Briefcase className="h-3 w-3 shrink-0" />
              Experience
            </span>
            <span className="text-sm font-semibold text-foreground">
              {psychologist.experienceYears} yrs
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <IndianRupee className="h-3 w-3 shrink-0" />
              Fee
            </span>
            <span className="text-sm font-semibold text-foreground">
              ₹{fee} / session
            </span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/psychologists/${psychologist.id}`);
          }}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg",
            "text-sm font-semibold text-primary bg-muted",
            "transition-colors duration-200",
            "hover:bg-primary hover:text-primary-foreground",
            "mt-auto"
          )}
        >
          View Profile
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
};
