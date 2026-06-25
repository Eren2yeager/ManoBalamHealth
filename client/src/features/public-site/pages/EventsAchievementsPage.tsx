import { Award, CalendarDays, CheckCircle2, Sparkles } from "lucide-react";
import { PublicFooter } from "../components/PublicFooter";
import { PublicPageHero } from "../components/PublicPageHero";
import { achievements, events } from "../content/events.content";

export function EventsAchievementsPage() {
  return (
    <div className="min-h-screen bg-[#fcfbff]">
      <PublicPageHero eyebrow="Community and progress" title="Events & achievements" summary="A growing record of awareness work, professional exchange, community orientation, and product milestones." icon={Award} section="Events" highlights={["Awareness", "Collaboration", "Progress"]} />
      <main className="px-4 py-14 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.2fr_.8fr]">
          <section>
            <p className="text-xs font-black uppercase tracking-[.18em] text-primary">Events</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#111631]">Conversations that move care forward</h2>
            <div className="mt-7 grid gap-4">
              {events.map((event) => (
                <article key={event.title} className="group rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-violet-100 hover:shadow-lg">
                  <div className="flex items-start gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-violet-50 text-primary"><CalendarDays className="size-5" /></span>
                    <div><div className="flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-wider text-violet-600"><span>{event.date}</span><span>•</span><span>{event.category}</span></div><h3 className="mt-2 text-lg font-black text-slate-900">{event.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{event.description}</p></div>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <section className="rounded-[2rem] bg-[#111631] p-7 text-white shadow-2xl md:p-9">
            <span className="grid size-13 place-items-center rounded-2xl bg-white/10 text-violet-300"><Sparkles className="size-6" /></span>
            <p className="mt-6 text-xs font-black uppercase tracking-[.18em] text-violet-300">Achievements</p>
            <h2 className="mt-3 text-2xl font-black">A connected mental-health application</h2>
            <div className="mt-6 grid gap-4">
              {achievements.map((item) => <p key={item} className="flex gap-3 text-sm leading-6 text-slate-300"><CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-300" />{item}</p>)}
            </div>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

