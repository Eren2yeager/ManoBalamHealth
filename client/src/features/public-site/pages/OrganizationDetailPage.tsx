import { ArrowLeft } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { CommitteeGrid } from "../components/CommitteeGrid";
import { PublicFooter } from "../components/PublicFooter";
import { organizationContent } from "../content/organization.content";

export function OrganizationDetailPage() {
  const { slug = "" } = useParams();
  const page = organizationContent[slug];

  if (!page) return <Navigate to="/organization" replace />;

  const Icon = page.icon;
  const responsibility = page.sections[0];

  return (
    <div className="min-h-[100dvh] bg-[#fcfbff] text-[#111631] dark:bg-slate-950 dark:text-slate-100">
      <main>
        <header className="border-b border-violet-100 bg-[linear-gradient(135deg,#fff_0%,#fbf9ff_60%,#f4efff_100%)] px-4 py-10 dark:border-violet-900/50 dark:bg-[linear-gradient(135deg,#0f172a_0%,#151326_60%,#21163d_100%)] md:px-8 md:py-14">
          <div className="mx-auto max-w-7xl">
            <div className="dark:[&_a]:text-slate-300 dark:[&_span]:text-slate-300">
              <Breadcrumbs items={[{ label: "Organization", to: "/organization" }, { label: page.title }]} />
            </div>

            <div className="mt-8 grid items-end gap-8 lg:grid-cols-[1fr_320px]">
              <div className="max-w-3xl">
                <span className="grid size-13 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                  <Icon className="size-6" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <h1 className="mt-6 text-balance text-4xl font-black leading-tight tracking-[-.045em] sm:text-5xl lg:text-6xl">
                  {page.title}
                </h1>
                <p className="mt-5 max-w-[65ch] text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8">
                  {page.summary}
                </p>
              </div>

              <Link
                to="/organization"
                className="inline-flex w-fit items-center gap-2 rounded-2xl border border-violet-200 bg-white px-4 py-3 text-sm font-black text-violet-800 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-100 active:translate-y-px motion-reduce:transform-none dark:border-violet-800 dark:bg-slate-900 dark:text-violet-200 dark:focus-visible:ring-violet-900/50 lg:justify-self-end"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                All organization groups
              </Link>
            </div>
          </div>
        </header>

        <section className="px-4 py-12 md:px-8 md:py-16">
          <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.7fr_1.3fr]">
            <div className="rounded-3xl border border-violet-100 bg-violet-50 p-7 dark:border-violet-900/60 dark:bg-violet-950/35 md:p-9">
              <h2 className="text-2xl font-black tracking-tight">What this group does</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {responsibility?.body ?? page.summary}
              </p>
            </div>

            <div className="rounded-3xl border border-violet-100 bg-white p-7 dark:border-violet-900/50 dark:bg-slate-900 md:p-9">
              <h2 className="text-2xl font-black tracking-tight">Areas of responsibility</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {page.highlights.map((highlight) => (
                  <div key={highlight} className="border-l-2 border-violet-300 pl-4 dark:border-violet-700">
                    <p className="text-sm font-black text-violet-800 dark:text-violet-200">{highlight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 md:px-8 md:pb-28">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-black tracking-[-.035em] sm:text-4xl">People behind this work</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                Add each confirmed member's name, photograph, role, credentials, biography, and focus areas to the organization content file.
              </p>
            </div>
            <div className="mt-9">
              <CommitteeGrid members={page.members} />
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
