import { Eye, Flag, ListChecks, Target } from "lucide-react";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { PublicFooter } from "../components/PublicFooter";
import "./about-page.css";

const aims = [
  "To make quality mental health support available to individuals regardless of background, income, or location.",
  "To reduce the stigma attached to mental illness through education and open conversation.",
  "To build a support system that works for the whole person, not just the diagnosis.",
];

const objectives = [
  "Provide timely assessment, counselling, and therapeutic services to individuals facing mental health challenges.",
  "Train and support caregivers and families in understanding mental health conditions.",
  "Partner with schools, workplaces, and community organisations to promote mental wellness.",
  "Develop and run outreach programmes that bring mental health resources to underserved areas.",
  "Maintain ethical, evidence-based clinical standards across all services.",
];

export function AboutPage() {
  return (
    <div className="about-page min-h-[100dvh] overflow-x-clip bg-[#f5f3ff] text-[#312e81]">
      <main>
        <section
          id="brief"
          className="about-hero scroll-mt-24 px-4 pb-14 pt-7 sm:px-6 md:px-8 md:pb-20 md:pt-9"
        >
          <div className="mx-auto max-w-7xl">
            <Breadcrumbs items={[{ label: "About" }]} variant="about" />
            <div className="mt-9 grid items-center gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,.72fr)] lg:gap-16">
              <div className="max-w-4xl">
                <h1 className="text-balance text-[clamp(2.5rem,5.3vw,5rem)] font-extrabold italic leading-[1.08] tracking-[-.055em] text-[#312e81]">
                  Manobalam - where your strength of mind finds a home.
                </h1>
              </div>
              <figure className="overflow-hidden rounded-[18px] border border-[#ddd6fe] bg-white p-2 shadow-[0_28px_80px_-42px_rgba(76,29,149,.32)]">
                <div className="aspect-[16/10] overflow-hidden rounded-xl lg:aspect-[4/3]">
                  <img
                    src="/images/about-care-team.png"
                    alt="A mental-health professional listening to a visitor in a calm community care setting"
                    className="size-full object-cover object-center"
                    fetchPriority="high"
                  />
                </div>
              </figure>
            </div>
          </div>
        </section>

        <section className="px-4 pb-8 sm:px-6 md:px-8 md:pb-12">
          <article className="mx-auto max-w-7xl rounded-[18px] border border-[#ddd6fe] bg-white p-7 shadow-[0_20px_60px_-48px_rgba(76,29,149,.45)] sm:p-9 lg:p-12">
            <h2 className="text-balance text-3xl font-extrabold tracking-[-.04em] text-[#312e81] md:text-5xl">
              About Manobalam Health Care
            </h2>
            <p className="mt-6 max-w-[74ch] text-base leading-8 text-[#6b5b95] sm:text-lg">
              Manobalam Health Care is a mental health organisation built on one
              straightforward belief: that every person deserves access to care
              that respects their mind, their story, and their dignity. We work
              across communities to provide mental health support that is
              compassionate, culturally sensitive, and grounded in evidence.
            </p>
            <p className="mt-6 max-w-[74ch] border-l-4 border-[#7c3aed] pl-5 text-base italic leading-8 text-[#4c1d95] sm:text-lg">
              Our name reflects our purpose; Manobalam means strength of the
              mind, and that is exactly what we help people find.
            </p>
          </article>
        </section>

        <section className="px-4 py-12 sm:px-6 md:px-8 md:py-16">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-12">
            <article
              id="vision"
              className="scroll-mt-24 rounded-[18px] border border-[#ddd6fe] bg-white p-7 shadow-[0_20px_55px_-45px_rgba(76,29,149,.55)] sm:p-9 md:col-span-5 lg:p-12"
            >
              <span className="grid size-12 place-items-center rounded-xl border border-[#ddd6fe] bg-[#ede9fe] text-[#7c3aed]">
                <Eye className="size-6" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <h2 className="mt-9 text-3xl font-extrabold tracking-[-.04em] text-[#312e81] md:text-4xl">
                Vision
              </h2>
              <p className="mt-5 max-w-[52ch] text-base leading-8 text-[#6b5b95]">
                A society where mental health is understood, not stigmatised —
                and where no one has to struggle alone.
              </p>
            </article>
            <article
              id="mission"
              className="scroll-mt-24 rounded-[18px] border border-[#ddd6fe] bg-[#ede9fe] p-7 shadow-[0_20px_55px_-45px_rgba(76,29,149,.55)] sm:p-9 md:col-span-7 lg:p-12"
            >
              <span className="grid size-12 place-items-center rounded-xl bg-[#7c3aed] text-white">
                <Flag className="size-6" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <h2 className="mt-9 text-3xl font-extrabold tracking-[-.04em] text-[#312e81] md:text-4xl">
                Mission
              </h2>
              <p className="mt-5 max-w-[58ch] text-base leading-8 text-[#6b5b95]">
                To deliver accessible, person-centred mental health care that
                empowers individuals, supports families, and strengthens
                communities — through clinical services, awareness, and
                advocacy.
              </p>
            </article>
          </div>
        </section>

        <section
          id="aim"
          className="scroll-mt-24 px-4 py-12 sm:px-6 md:px-8 md:py-16"
        >
          <div className="mx-auto grid max-w-7xl gap-8 rounded-[18px] border border-[#ddd6fe] bg-white p-7 shadow-[0_22px_60px_-48px_rgba(76,29,149,.5)] md:grid-cols-[.7fr_1.3fr] md:p-10 lg:p-12">
            <div>
              <span className="grid size-12 place-items-center rounded-xl border border-[#ddd6fe] bg-[#ede9fe] text-[#7c3aed]">
                <Target
                  className="size-6"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </span>
              <h2 className="mt-7 text-3xl font-extrabold tracking-[-.04em] text-[#312e81] md:text-4xl">
                Aims
              </h2>
            </div>
            <ul className="grid gap-3" aria-label="Aims">
              {aims.map((aim) => (
                <li
                  key={aim}
                  className="flex gap-4 rounded-xl bg-[#f5f3ff] p-4 text-sm leading-7 text-[#6b5b95] sm:text-base"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 size-2 shrink-0 rounded-full bg-[#7c3aed]"
                  />
                  <span>{aim}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="objectives"
          className="scroll-mt-24 px-4 pb-20 pt-12 sm:px-6 md:px-8 md:pb-28 md:pt-16"
        >
          <div className="mx-auto max-w-7xl rounded-[18px] border border-[#ddd6fe] bg-white p-7 shadow-[0_22px_60px_-48px_rgba(76,29,149,.5)] sm:p-9 lg:p-12">
            <div className="flex items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-[#ddd6fe] bg-[#ede9fe] text-[#7c3aed]">
                <ListChecks
                  className="size-6"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </span>
              <h2 className="text-3xl font-extrabold tracking-[-.04em] text-[#312e81] md:text-4xl">
                Objectives
              </h2>
            </div>
            <ul
              className="mt-8 grid gap-3 md:grid-cols-2"
              aria-label="Objectives"
            >
              {objectives.map((objective, index) => (
                <li
                  key={objective}
                  className={`rounded-xl border border-[#ede9fe] bg-[#f5f3ff] p-5 text-sm leading-7 text-[#6b5b95] sm:text-base ${index === objectives.length - 1 ? "md:col-span-2" : ""}`}
                >
                  {objective}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <PublicFooter variant="about" />
    </div>
  );
}
