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
import "./organization-page.css";

const organizationGroups = [
  {
    slug: "executive-committee",
    icon: Building2,
    name: "Executive Committee",
    summary: "Sets direction and accountability.",
    detail: "Shapes strategy, approves major decisions, and represents ManoBalamHealthCare to external partners and stakeholders.",
    imageUrl: "/images/about-care-team.png",
    imageAlt: "A care team meeting in a calm professional setting",
  },
  {
    slug: "administrative-committee",
    icon: ClipboardCheck,
    name: "Administrative Committee",
    summary: "Runs day-to-day operations.",
    detail: "Coordinates budgets, staffing, schedules, logistics, and the practical systems that keep services moving.",
    imageUrl: "/images/admin-operations-illustration.png",
    imageAlt: "An illustration representing coordinated administrative operations",
  },
  {
    slug: "consultative-committee",
    icon: MessageSquareText,
    name: "Consultative Committee",
    summary: "Brings outside perspective in.",
    detail: "External advisors review our direction, question assumptions, and help the organization identify blind spots early.",
    imageUrl: "/images/landing-wellness-woman.png",
    imageAlt: "A person reflecting in a calm wellbeing setting",
  },
  {
    slug: "technical-committee",
    icon: Wrench,
    name: "Technical Committee",
    summary: "Owns tools, data, and delivery.",
    detail: "Builds and maintains internal systems, including intake forms, information workflows, and the MHQ assessment tool.",
    imageUrl: "/images/home-wellness-dashboard.png",
    imageAlt: "The ManoBalamHealthCare digital wellbeing experience",
  },
  {
    slug: "clinical-ambassadors",
    icon: Stethoscope,
    name: "Our Clinical Ambassadors",
    summary: "The licensed practitioners behind the care.",
    detail: "Psychiatrists, psychologists, and counsellors deliver services while helping define safe, responsible clinical standards.",
    imageUrl: "/images/psychologist-practice-illustration.png",
    imageAlt: "An illustration of professional mental-health practice",
  },
] as const;

export function OrganizationPage() {
  return (
    <div className="organization-page min-h-[100dvh] bg-[#f5f3ff] text-[#312e81]">
      <main>
        <header className="organization-hero border-b border-violet-100 bg-white px-4 py-10 md:px-8 md:py-14">
          <div className="mx-auto max-w-7xl">
            <div>
              <Breadcrumbs items={[{ label: "Organization" }]} variant="about" />
            </div>
            <div className="organization-hero-layout mt-8 grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,.72fr)] lg:gap-14">
              <div className="max-w-3xl">
                <h1 className="text-balance text-4xl font-black leading-tight tracking-[-.045em] sm:text-5xl lg:text-6xl">
                  Organizational Structure
                </h1>
                <p className="mt-5 max-w-[62ch] text-base leading-7 text-[#6b5b95] sm:text-lg sm:leading-8">
                  Each group has a distinct role in how we lead, operate, advise, build, and deliver care. Explore each one below.
                </p>
              </div>
              <figure className="organization-hero-media overflow-hidden rounded-[16px] border border-[#ddd6fe] bg-[#f5f3ff] p-2 shadow-[0_24px_60px_-42px_rgba(76,29,149,.48)]">
                <div className="aspect-[16/10] overflow-hidden rounded-xl lg:aspect-[4/3]">
                  <img src="/images/landing-care-illustration.png" alt="A supportive mental-health care experience" className="size-full object-cover object-center" fetchPriority="high" />
                </div>
              </figure>
            </div>
          </div>
        </header>

        <section aria-labelledby="organization-groups-title" className="relative overflow-hidden px-4 py-14 md:px-8 md:py-20">
          <div className="pointer-events-none absolute left-1/2 top-8 -z-0 size-[34rem] -translate-x-1/2 rounded-full bg-violet-200/25 blur-3xl" />
          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center rounded-xl border border-[#ddd6fe] bg-white px-4 py-2 text-xs font-black uppercase tracking-[.16em] text-[#7c3aed] shadow-sm">
                Simple structure
              </span>
              <h2 id="organization-groups-title" className="mt-5 text-balance text-3xl font-black tracking-[-.035em] sm:text-4xl">
                Five groups, one shared purpose
              </h2>
              <p className="mx-auto mt-4 max-w-[60ch] text-sm leading-7 text-[#6b5b95] sm:text-base">
                Each group supports a different part of ManoBalamHealthCare, from leadership and operations to technology and clinical care.
              </p>
            </div>

            <div className="organization-grid mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
              {organizationGroups.map(({ slug, icon: Icon, name, summary, detail, imageUrl, imageAlt }, index) => {
                const titleId = `${slug}-title`;
                const detailId = `${slug}-detail`;

                return (
                  <article
                    key={slug}
                    aria-labelledby={titleId}
                    aria-describedby={detailId}
                    className={`organization-card group relative flex min-h-72 flex-col overflow-hidden rounded-[1.75rem] border border-violet-100 bg-white p-6 shadow-[0_18px_50px_rgba(76,29,149,.07)] transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_28px_70px_rgba(76,29,149,.12)] focus-within:border-primary focus-within:ring-4 focus-within:ring-violet-100 motion-reduce:transform-none ${
                      index === 0 ? "lg:col-span-7" : index === 1 ? "lg:col-span-5" : "lg:col-span-4"
                    }`}
                  >
                    <div className="organization-card-media relative -mx-6 -mt-6 mb-6 overflow-hidden border-b border-[#ddd6fe] bg-[#f5f3ff]">
                      <img src={imageUrl} alt={imageAlt} className="size-full object-cover object-center transition duration-300 group-hover:scale-[1.025] motion-reduce:transform-none" loading="lazy" />
                    </div>
                    <div className="relative flex items-start justify-between gap-4">
                      <span className="grid size-12 place-items-center rounded-xl bg-[#ede9fe] text-[#7c3aed] ring-1 ring-[#ddd6fe] transition duration-300 group-hover:scale-105 group-hover:bg-[#7c3aed] group-hover:text-white">
                        <Icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
                      </span>
                      <span className="rounded-lg bg-[#f5f3ff] px-3 py-1 text-[11px] font-black text-[#6d28d9]">
                        0{index + 1}
                      </span>
                    </div>

                    <h3 id={titleId} className="relative mt-7 text-xl font-black leading-tight tracking-tight">
                      {name}
                    </h3>
                    <p className="relative mt-3 text-sm font-black leading-6 text-[#6d28d9]">
                      {summary}
                    </p>

                    <p id={detailId} className="relative mt-4 text-sm leading-7 text-[#6b5b95]">
                      {detail}
                    </p>

                    <Link
                      to={`/organization/${slug}`}
                      className="relative mt-auto inline-flex min-h-11 w-fit items-center rounded-xl border border-[#ddd6fe] bg-[#f5f3ff] px-4 py-2 text-sm font-black text-[#4c1d95] outline-none transition hover:border-[#7c3aed] hover:bg-[#7c3aed] hover:text-white focus-visible:ring-4 focus-visible:ring-violet-200"
                    >
                      View details
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter variant="about" />
    </div>
  );
}
