import {
  Building2,
  ClipboardCheck,
  MessageSquareText,
  Stethoscope,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { PublicFooter } from "../components/PublicFooter";

const organizationGroups = [
  {
    slug: "executive-committee",
    icon: Building2,
    name: "Executive Committee",
    summary: "Sets direction and accountability.",
    detail: "Shapes strategy, approves major decisions, and represents ManoBalamHealthCare to external partners and stakeholders.",
  },
  {
    slug: "administrative-committee",
    icon: ClipboardCheck,
    name: "Administrative Committee",
    summary: "Runs day-to-day operations.",
    detail: "Coordinates budgets, staffing, schedules, logistics, and the practical systems that keep services moving.",
  },
  {
    slug: "consultative-committee",
    icon: MessageSquareText,
    name: "Consultative Committee",
    summary: "Brings outside perspective in.",
    detail: "External advisors review our direction, question assumptions, and help the organization identify blind spots early.",
  },
  {
    slug: "technical-committee",
    icon: Wrench,
    name: "Technical Committee",
    summary: "Owns tools, data, and delivery.",
    detail: "Builds and maintains internal systems, including intake forms, information workflows, and the MHQ assessment tool.",
  },
  {
    slug: "clinical-ambassadors",
    icon: Stethoscope,
    name: "Our Clinical Ambassadors",
    summary: "The licensed practitioners behind the care.",
    detail: "Psychiatrists, psychologists, and counsellors deliver services while helping define safe, responsible clinical standards.",
  },
] as const;

export function OrganizationPage() {
  return (
    <div className="min-h-[100dvh] bg-[#fcfbff] text-[#111631] dark:bg-slate-950 dark:text-slate-100">
      <main>
        <header className="border-b border-violet-100 bg-[linear-gradient(135deg,#fff_0%,#fbf9ff_60%,#f4efff_100%)] px-4 py-10 dark:border-violet-900/50 dark:bg-[linear-gradient(135deg,#0f172a_0%,#151326_60%,#21163d_100%)] md:px-8 md:py-14">
          <div className="mx-auto max-w-7xl">
            <div className="dark:[&_a]:text-slate-300 dark:[&_span]:text-slate-300">
              <Breadcrumbs items={[{ label: "Organization" }]} />
            </div>
            <div className="mt-8 max-w-3xl">
              <h1 className="text-balance text-4xl font-black leading-tight tracking-[-.045em] sm:text-5xl lg:text-6xl">
                Organizational Structure
              </h1>
              <p className="mt-5 max-w-[62ch] text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8">
                Each group has a distinct role in how we lead, operate, advise, build, and deliver care. Explore each one below.
              </p>
            </div>
          </div>
        </header>

        <section aria-labelledby="organization-groups-title" className="px-4 py-14 md:px-8 md:py-20">
          <div className="mx-auto max-w-[1400px]">
            <div className="max-w-2xl">
              <h2 id="organization-groups-title" className="text-2xl font-black tracking-tight sm:text-3xl">
                Five groups, one shared purpose
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Focus or hover over a group to learn what it handles day to day.
              </p>
            </div>

            <div className="mt-9 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {organizationGroups.map(({ slug, icon: Icon, name, summary, detail }) => {
                const titleId = `${slug}-title`;
                const detailId = `${slug}-detail`;

                return (
                  <article
                    key={slug}
                    tabIndex={0}
                    aria-labelledby={titleId}
                    aria-describedby={detailId}
                    className="group flex min-h-64 flex-col rounded-3xl border border-violet-100 bg-white p-6 shadow-[0_16px_45px_-34px_rgba(76,29,149,.35)] outline-none transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_24px_55px_-30px_rgba(76,29,149,.4)] focus-visible:-translate-y-1 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-violet-100 focus-within:-translate-y-1 focus-within:border-primary motion-reduce:transform-none dark:border-violet-900/50 dark:bg-slate-900 dark:focus-visible:ring-violet-900/50"
                  >
                    <span className="grid size-11 place-items-center rounded-2xl bg-violet-100 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-focus-visible:bg-primary group-focus-visible:text-primary-foreground group-focus-within:bg-primary group-focus-within:text-primary-foreground dark:bg-violet-950 dark:text-violet-300">
                      <Icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
                    </span>

                    <h3 id={titleId} className="mt-7 text-xl font-black leading-tight tracking-tight">
                      {name}
                    </h3>
                    <p className="mt-3 text-sm font-bold leading-6 text-violet-700 dark:text-violet-300">
                      {summary}
                    </p>

                    <div
                      id={detailId}
                      className="grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity,margin] duration-300 group-hover:mt-4 group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-visible:mt-4 group-focus-visible:grid-rows-[1fr] group-focus-visible:opacity-100 group-focus-within:mt-4 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100 motion-reduce:transition-none"
                    >
                      <div className="overflow-hidden">
                        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{detail}</p>
                        <Link
                          to={`/organization/${slug}`}
                          className="mt-4 inline-flex rounded-lg text-sm font-black text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                        >
                          View group details
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
