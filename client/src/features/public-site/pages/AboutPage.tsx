import {
  ArrowRight,
  BrainCircuit,
  Eye,
  Flag,
  HeartHandshake,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { PublicFooter } from "../components/PublicFooter";

const objectives = [
  {
    icon: Users,
    title: "Connect people to care",
    description: "Help people discover verified mental-health professionals who fit their needs and preferences.",
    className: "bg-white dark:bg-slate-900",
  },
  {
    icon: HeartHandshake,
    title: "Make support flexible",
    description: "Enable secure chat, audio, and video consultations that work around real lives and schedules.",
    className: "bg-violet-50 dark:bg-violet-950/35",
  },
  {
    icon: BrainCircuit,
    title: "Build understanding",
    description: "Provide responsible self-assessments and practical education that guide useful next steps.",
    className: "bg-violet-100/65 dark:bg-violet-950/55",
  },
  {
    icon: ShieldCheck,
    title: "Support safer pathways",
    description: "Make urgent-help resources clear while protecting privacy, dignity, and professional boundaries.",
    className: "bg-white dark:bg-slate-900",
  },
];

export function AboutPage() {
  return (
    <div className="min-h-[100dvh] bg-[#fcfbff] text-[#111631] dark:bg-slate-950 dark:text-slate-100">
      <main>
        <section
          id="brief"
          className="relative isolate overflow-hidden border-b border-violet-100 bg-[linear-gradient(135deg,#fff_0%,#fbf9ff_58%,#f3edff_100%)] px-4 pb-14 pt-8 dark:border-violet-900/50 dark:bg-[linear-gradient(135deg,#0f172a_0%,#151326_58%,#21163d_100%)] md:px-8 md:pb-20 md:pt-10"
        >
          <div className="mx-auto max-w-7xl">
            <div className="dark:[&_a]:text-slate-300 dark:[&_span]:text-slate-300">
              <Breadcrumbs items={[{ label: "About" }]} />
            </div>

            <div className="mt-8 grid items-center gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16">
              <div className="max-w-xl">
                <p className="text-xs font-black uppercase tracking-[.2em] text-primary">
                  About ManoBalamHealthCare
                </p>
                <h1 className="mt-4 text-balance text-4xl font-black leading-[1.08] tracking-[-.045em] sm:text-5xl">
                  Mental healthcare designed around real life
                </h1>
                <p className="mt-5 max-w-[54ch] text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8">
                  We connect people with verified professionals, secure online care, guided assessments, and clear support when it matters.
                </p>
              </div>

              <figure className="relative overflow-hidden rounded-3xl border border-white/80 bg-violet-100 shadow-[0_28px_80px_-38px_rgba(76,29,149,.5)] dark:border-violet-800/40 dark:bg-violet-950">
                <div className="aspect-[3/2]">
                  <img
                    src="/images/about-care-team.png"
                    alt="A mental-health professional listening to a visitor in a calm community care setting"
                    className="size-full object-cover"
                    fetchPriority="high"
                  />
                </div>
              </figure>
            </div>
          </div>
        </section>

        <section id="aim" className="scroll-mt-24 px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-5xl rounded-3xl border border-violet-100 bg-violet-50 px-6 py-12 text-center dark:border-violet-900/60 dark:bg-violet-950/40 md:px-16 md:py-16">
            <h2 className="mx-auto max-w-4xl text-balance text-3xl font-black leading-tight tracking-[-.035em] text-violet-950 dark:text-violet-100 md:text-5xl">
              Make timely mental-health support easier to reach.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-violet-800/75 dark:text-violet-200/75 md:text-lg">
              We reduce the distance between a person seeking help and an appropriate, trusted professional.
            </p>
          </div>
        </section>

        <section id="objectives" className="scroll-mt-24 px-4 pb-16 md:px-8 md:pb-24">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-black tracking-[-.035em] md:text-5xl">What guides our work</h2>
              <p className="mt-4 max-w-[62ch] text-base leading-7 text-slate-600 dark:text-slate-300">
                Our objectives turn compassionate intent into practical, dependable access to mental-health support.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {objectives.map(({ icon: Icon, title, description, className }) => (
                <article
                  key={title}
                  className={`rounded-3xl border border-violet-100 p-6 transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_20px_50px_-28px_rgba(76,29,149,.4)] motion-reduce:transform-none dark:border-violet-900/50 ${className}`}
                >
                  <span className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-7 text-lg font-black tracking-tight">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 md:px-8 md:pb-24">
          <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-2">
            <article id="vision" className="scroll-mt-24 rounded-3xl border border-violet-100 bg-white p-7 dark:border-violet-900/50 dark:bg-slate-900 md:p-10">
              <span className="grid size-12 place-items-center rounded-2xl bg-violet-100 text-primary dark:bg-violet-950 dark:text-violet-300">
                <Eye className="size-6" aria-hidden="true" />
              </span>
              <h2 className="mt-8 text-3xl font-black tracking-[-.035em] md:text-4xl">Our vision</h2>
              <p className="mt-5 max-w-[52ch] text-base leading-8 text-slate-600 dark:text-slate-300">
                A future where asking for help feels normal and possible, and quality mental-health support is inclusive, approachable, and available early.
              </p>
            </article>

            <article id="mission" className="scroll-mt-24 rounded-3xl border border-violet-200 bg-violet-50 p-7 dark:border-violet-900/60 dark:bg-violet-950/40 md:p-10">
              <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
                <Flag className="size-6" aria-hidden="true" />
              </span>
              <h2 className="mt-8 text-3xl font-black tracking-[-.035em] md:text-4xl">Our mission</h2>
              <p className="mt-5 max-w-[52ch] text-base leading-8 text-slate-600 dark:text-slate-300">
                Build a trusted digital bridge between people, professionals, assessments, and urgent resources while respecting the boundaries of professional care.
              </p>
            </article>
          </div>
        </section>

        <section className="px-4 pb-20 md:px-8 md:pb-28">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 rounded-3xl border border-violet-200 bg-white px-7 py-9 shadow-[0_24px_70px_-42px_rgba(76,29,149,.45)] dark:border-violet-900/60 dark:bg-slate-900 md:flex-row md:items-center md:px-10 md:py-10">
            <div>
              <h2 className="text-2xl font-black tracking-tight md:text-3xl">Meet the people behind our direction</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Learn how our committees bring clinical, community, operational, and technical perspectives together.
              </p>
            </div>
            <Link
              to="/organization/executive-committee"
              className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-700 active:translate-y-px motion-reduce:transform-none"
            >
              Explore our organization
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
