import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function AdminWorkspaceHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  actions,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-[#17162e] p-7 text-white shadow-[0_24px_70px_rgba(35,24,75,.2)] md:p-9">
      <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-violet-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 size-56 rounded-full bg-indigo-400/15 blur-3xl" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[.16em] text-violet-100">
            <Icon className="size-3.5" /> {eyebrow}
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-violet-100/75">{description}</p>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    </section>
  );
}

export function AdminMetricCard({
  icon: Icon,
  label,
  value,
  note,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  note: string;
  tone: string;
}) {
  return (
    <article className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <span className={`grid size-11 place-items-center rounded-2xl ${tone}`}><Icon className="size-5" /></span>
      <p className="mt-4 text-2xl font-black tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-sm font-bold text-slate-800">{label}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>
    </article>
  );
}
