import { UserRound } from "lucide-react";
import type { CommitteeMember } from "../types/public-site.types";

export function CommitteeGrid({ members }: { members: CommitteeMember[] }) {
  return (
    <section className="mt-5">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[.18em] text-primary">Committee structure</p>
        <h2 className="mt-2 text-2xl font-black text-[#111631]">People and responsibilities</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {members.map((member, index) => (
          <article key={`${member.role}-${index}`} className="rounded-3xl border border-violet-100 bg-gradient-to-br from-white to-violet-50/50 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <span className="grid size-12 place-items-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-violet-100">
              <UserRound className="size-5" />
            </span>
            <h3 className="mt-5 font-black text-slate-900">{member.name}</h3>
            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-primary">{member.role}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{member.description}</p>
          </article>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">Committee member names can be added to the organization content file when formally confirmed.</p>
    </section>
  );
}

