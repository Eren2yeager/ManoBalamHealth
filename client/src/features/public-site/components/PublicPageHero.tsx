import type { LucideIcon } from "lucide-react";
import { Breadcrumbs } from "./Breadcrumbs";

export function PublicPageHero({
  eyebrow,
  title,
  summary,
  icon: Icon,
  section,
  highlights,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  icon: LucideIcon;
  section: string;
  highlights?: string[];
}) {
  return (
    <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_82%_12%,rgba(167,139,250,.32),transparent_30%),linear-gradient(135deg,#fff_0%,#fbf9ff_55%,#f4efff_100%)] px-4 py-14 md:px-8 md:py-20">
      <div className="absolute -left-28 -top-40 size-80 rounded-full bg-blue-200/20 blur-3xl" />
      <div className="mx-auto max-w-7xl">
        <Breadcrumbs items={[{ label: section }, { label: title }]} />
        <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1fr_340px]">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <p className="text-xs font-black uppercase tracking-[.2em] text-primary">{eyebrow}</p>
            <h1 className="mt-4 max-w-4xl text-balance text-4xl font-black tracking-[-.045em] text-[#111631] sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-3xl text-pretty text-lg leading-8 text-slate-600">{summary}</p>
            {highlights && (
              <div className="mt-7 flex flex-wrap gap-2">
                {highlights.map((highlight) => (
                  <span key={highlight} className="rounded-full border border-violet-100 bg-white/85 px-4 py-2 text-xs font-bold text-violet-700 shadow-sm">
                    {highlight}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="relative mx-auto hidden size-72 animate-in zoom-in-95 duration-700 place-items-center lg:grid">
            <div className="absolute inset-0 animate-[spin_30s_linear_infinite] rounded-full border border-dashed border-violet-300" />
            <div className="absolute inset-7 rounded-full bg-gradient-to-br from-violet-200 via-white to-blue-100 shadow-[0_30px_80px_rgba(109,40,217,.16)]" />
            <span className="relative grid size-28 place-items-center rounded-[2rem] bg-gradient-to-br from-primary to-violet-700 text-white shadow-2xl shadow-primary/30">
              <Icon className="size-13" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

