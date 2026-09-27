import { BadgeCheck, ImageIcon, Sparkles, UserRound } from "lucide-react";
import type { CommitteeMember } from "../types/public-site.types";

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

function getRole(member: CommitteeMember) {
  return "position" in member ? member.position : member.designation;
}

function getSimpleDetails(member: CommitteeMember) {
  switch (member.committeeType) {
    case "executive":
      return member.leadershipAreas.slice(0, 2);
    case "administrative":
      return member.responsibilities.slice(0, 2);
    case "consultative":
      return member.specialties?.slice(0, 2) ?? ["External guidance"];
    case "technical":
      return member.skills.slice(0, 2);
    case "clinical":
      return member.specialties.slice(0, 2);
  }
}

function getExperienceLine(member: CommitteeMember) {
  switch (member.committeeType) {
    case "executive":
      return member.governanceExperience;
    case "administrative":
      return member.operationsExperience;
    case "consultative":
      return member.advisoryExperience;
    case "technical":
      return member.technicalExperience;
    case "clinical":
      return member.qualifications;
  }
}

export function CommitteeGrid({ members }: { members: CommitteeMember[]; committeeSlug: string }) {
  if (members.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-violet-200 bg-violet-50/70 px-6 py-12 text-center dark:border-violet-900/70 dark:bg-violet-950/30">
        <UserRound className="mx-auto size-7 text-primary" aria-hidden="true" />
        <h3 className="mt-4 text-lg font-black">Member profiles are being prepared</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">Confirmed member information will appear here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member, index) => {
        const role = getRole(member);
        const details = getSimpleDetails(member);
        return (
          <article
            key={`${member.committeeType}-${member.name}-${index}`}
            tabIndex={0}
            aria-label={`${member.name}, ${role}`}
            style={{ animationDelay: `${Math.min(index * 90, 360)}ms`, animationFillMode: "both" }}
            className="group rounded-[1.75rem] border border-violet-100 bg-white p-5 outline-none transition duration-300 animate-in fade-in slide-in-from-bottom-3 hover:-translate-y-1 hover:border-violet-200 hover:bg-violet-50/40 hover:shadow-[0_22px_55px_-36px_rgba(76,29,149,.38)] focus-visible:-translate-y-1 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-violet-100 motion-reduce:transform-none motion-reduce:animate-none dark:border-violet-900/50 dark:bg-slate-900 dark:hover:bg-violet-950/20 dark:focus-visible:ring-violet-900/50"
          >
            <div className="flex items-start gap-4">
              {member.imageUrl ? (
                <img
                  src={member.imageUrl}
                  alt={`Portrait of ${member.name}`}
                  className="size-18 shrink-0 rounded-3xl border border-violet-100 object-cover shadow-sm transition duration-300 group-hover:scale-[1.03] group-focus-visible:scale-[1.03] motion-reduce:transform-none dark:border-violet-900/60"
                  loading="lazy"
                />
              ) : (
                <div className="grid size-18 shrink-0 place-items-center rounded-3xl border border-violet-100 bg-[linear-gradient(145deg,#f5f3ff_0%,#ede9fe_100%)] text-lg font-black text-violet-800 shadow-sm dark:border-violet-900/60 dark:bg-[linear-gradient(145deg,#261747_0%,#171526_100%)] dark:text-violet-200">
                  {getInitials(member.name) || <ImageIcon className="size-6" aria-hidden="true" />}
                </div>
              )}

              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[.14em] text-primary">{role}</p>
                <h3 className="mt-2 text-xl font-black tracking-[-.025em] text-slate-950 dark:text-white">{member.name}</h3>
                {member.isExample && (
                  <span className="mt-2 inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                    Representative profile
                  </span>
                )}
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-300">{member.bio}</p>

            <div className="mt-5 rounded-2xl bg-violet-50/70 p-4 dark:bg-violet-950/25">
              <div className="flex items-start gap-2.5">
                <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.8} aria-hidden="true" />
                <p className="text-xs font-bold leading-5 text-violet-900 dark:text-violet-100">{getExperienceLine(member)}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {details.map((detail) => (
                <span key={detail} className="inline-flex items-center gap-1.5 rounded-full border border-violet-100 bg-white px-3 py-1.5 text-xs font-bold text-violet-700 dark:border-violet-900/70 dark:bg-slate-950/40 dark:text-violet-300">
                  <Sparkles className="size-3" aria-hidden="true" />
                  {detail}
                </span>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}
