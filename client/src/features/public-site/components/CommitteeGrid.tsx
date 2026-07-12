import { BadgeCheck, BriefcaseBusiness, ImageIcon, Languages, ListChecks, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { CommitteeMember } from "../types/public-site.types";

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

function TagList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
          {item}
        </span>
      ))}
    </div>
  );
}

function MemberSpecificInfo({ member }: { member: CommitteeMember }) {
  switch (member.committeeType) {
    case "executive":
      return (
        <>
          <InfoRow icon={ShieldCheck} label="Governance experience" value={member.governanceExperience} />
          <InfoGroup icon={Sparkles} label="Leadership areas"><TagList items={member.leadershipAreas} /></InfoGroup>
        </>
      );
    case "administrative":
      return (
        <>
          <InfoRow icon={BriefcaseBusiness} label="Operations experience" value={member.operationsExperience} />
          <InfoGroup icon={ListChecks} label="Responsibilities"><TagList items={member.responsibilities} /></InfoGroup>
        </>
      );
    case "consultative":
      return (
        <>
          <InfoRow icon={BriefcaseBusiness} label="Advisory experience" value={member.advisoryExperience} />
          {member.specialties && <InfoGroup icon={Sparkles} label="Specialist areas"><TagList items={member.specialties} /></InfoGroup>}
        </>
      );
    case "technical":
      return (
        <>
          <InfoRow icon={BriefcaseBusiness} label="Technical experience" value={member.technicalExperience} />
          <InfoGroup icon={Sparkles} label="Technical skills"><TagList items={member.skills} /></InfoGroup>
          <InfoGroup icon={ListChecks} label="Responsibilities"><TagList items={member.responsibilities} /></InfoGroup>
        </>
      );
    case "clinical":
      return (
        <>
          <InfoRow icon={BadgeCheck} label="Qualifications" value={member.qualifications} />
          <InfoRow icon={BriefcaseBusiness} label="Clinical experience" value={member.clinicalExperience} />
          <InfoGroup icon={Sparkles} label="Clinical specialties"><TagList items={member.specialties} /></InfoGroup>
          <InfoGroup icon={Languages} label="Languages"><TagList items={member.languages} /></InfoGroup>
        </>
      );
  }
}

function InfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 border-t border-violet-100 pt-4 dark:border-violet-900/50">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.8} aria-hidden="true" />
      <div>
        <p className="text-xs font-black text-violet-800 dark:text-violet-200">{label}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{value}</p>
      </div>
    </div>
  );
}

function InfoGroup({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.8} aria-hidden="true" />
      <div>
        <p className="mb-2 text-xs font-black text-violet-800 dark:text-violet-200">{label}</p>
        {children}
      </div>
    </div>
  );
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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {members.map((member, index) => {
        const position = "position" in member ? member.position : member.designation;
        return (
          <article
            key={`${member.committeeType}-${member.name}-${index}`}
            tabIndex={0}
            aria-label={`${member.name}, ${position}`}
            style={{ animationDelay: `${Math.min(index * 90, 360)}ms`, animationFillMode: "both" }}
            className="group grid overflow-hidden rounded-3xl border border-violet-100 bg-white outline-none transition duration-300 animate-in fade-in slide-in-from-bottom-3 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_24px_60px_-32px_rgba(76,29,149,.32)] focus-visible:-translate-y-1 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-violet-100 motion-reduce:transform-none motion-reduce:animate-none dark:border-violet-900/50 dark:bg-slate-900 dark:focus-visible:ring-violet-900/50 sm:grid-cols-[180px_1fr]"
          >
            <div className="relative min-h-64 overflow-hidden bg-violet-100 sm:min-h-full dark:bg-violet-950/60">
              {member.imageUrl ? (
                <img src={member.imageUrl} alt={`Portrait of ${member.name}`} className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.04] group-focus-visible:scale-[1.04] motion-reduce:transform-none" loading="lazy" />
              ) : (
                <div className="flex size-full flex-col items-center justify-center bg-[linear-gradient(145deg,#ede9fe_0%,#f8f7ff_55%,#ddd6fe_100%)] text-violet-800 dark:bg-[linear-gradient(145deg,#261747_0%,#171526_55%,#31205a_100%)] dark:text-violet-200">
                  <span className="grid size-20 place-items-center rounded-3xl border border-white/80 bg-white/75 text-2xl font-black shadow-sm dark:border-violet-800/50 dark:bg-violet-950/65">{getInitials(member.name) || <ImageIcon className="size-7" aria-hidden="true" />}</span>
                  <span className="mt-4 text-xs font-bold">Photo to be added</span>
                </div>
              )}
            </div>

            <div className="flex flex-col p-6 sm:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-black uppercase tracking-[.14em] text-primary">{position}</p>
                {member.isExample && <span className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">Sample profile</span>}
              </div>
              <h3 className="mt-3 text-2xl font-black tracking-[-.025em]">{member.name}</h3>
              <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{member.bio}</p>
              <div className="mt-6 space-y-5"><MemberSpecificInfo member={member} /></div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
