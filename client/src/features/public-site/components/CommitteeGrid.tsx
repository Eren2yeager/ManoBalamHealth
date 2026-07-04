import { ImageIcon, UserRound } from "lucide-react";
import type { CommitteeMember } from "../types/public-site.types";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function CommitteeGrid({ members }: { members: CommitteeMember[] }) {
  if (members.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-violet-200 bg-violet-50/70 px-6 py-12 text-center dark:border-violet-900/70 dark:bg-violet-950/30">
        <UserRound className="mx-auto size-7 text-primary" aria-hidden="true" />
        <h3 className="mt-4 text-lg font-black">Member profiles are being prepared</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
          Names, photographs, roles, and professional information will appear here once confirmed.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {members.map((member, index) => (
        <article
          key={`${member.role}-${member.name}-${index}`}
          tabIndex={0}
          aria-label={`${member.name}, ${member.role}`}
          className="group overflow-hidden rounded-3xl border border-violet-100 bg-white outline-none transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_24px_60px_-32px_rgba(76,29,149,.42)] focus-visible:-translate-y-1 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-violet-100 motion-reduce:transform-none dark:border-violet-900/50 dark:bg-slate-900 dark:focus-visible:ring-violet-900/50"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-violet-100 dark:bg-violet-950/60">
            {member.imageUrl ? (
              <img
                src={member.imageUrl}
                alt={`Portrait of ${member.name}`}
                className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.035] group-focus-visible:scale-[1.035] motion-reduce:transform-none"
                loading="lazy"
              />
            ) : (
              <div className="flex size-full flex-col items-center justify-center bg-[linear-gradient(145deg,#ede9fe_0%,#f8f7ff_55%,#ddd6fe_100%)] text-violet-800 dark:bg-[linear-gradient(145deg,#261747_0%,#171526_55%,#31205a_100%)] dark:text-violet-200">
                <span className="grid size-20 place-items-center rounded-3xl border border-white/80 bg-white/75 text-2xl font-black shadow-sm dark:border-violet-800/50 dark:bg-violet-950/65">
                  {getInitials(member.name) || <ImageIcon className="size-7" aria-hidden="true" />}
                </span>
                <span className="mt-4 text-xs font-bold">Photo to be added</span>
              </div>
            )}
          </div>

          <div className="p-6">
            <p className="text-xs font-black uppercase tracking-[.16em] text-primary">{member.role}</p>
            <h3 className="mt-2 text-xl font-black tracking-tight">{member.name}</h3>
            {member.credentials && (
              <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">{member.credentials}</p>
            )}
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{member.description}</p>

            {member.focusAreas && member.focusAreas.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-violet-100 pt-4 dark:border-violet-900/50">
                {member.focusAreas.map((area) => (
                  <span key={area} className="text-xs font-bold text-violet-700 dark:text-violet-300">
                    {area}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
