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
import "./about-page.css";

const objectives = [
  { icon: Users, title: "Connect people to care", description: "Help people discover verified mental-health professionals who fit their needs and preferences." },
  { icon: HeartHandshake, title: "Make support flexible", description: "Enable secure chat, audio, and video consultations that work around real lives and schedules." },
  { icon: BrainCircuit, title: "Build understanding", description: "Provide responsible self-assessments and practical education that guide useful next steps." },
  { icon: ShieldCheck, title: "Support safer pathways", description: "Make urgent-help resources clear while protecting privacy, dignity, and professional boundaries." },
];

export function AboutPage() {
  return (
    <div className="about-page min-h-[100dvh] overflow-x-clip bg-[#f5f3ff] text-[#312e81]">
      <main>
        <section id="brief" className="relative isolate scroll-mt-24 overflow-hidden px-4 pb-16 pt-7 sm:px-6 md:px-8 md:pb-24 md:pt-9">
          <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-10 -z-10 size-[32rem] rounded-full bg-[#7c3aed]/10 blur-3xl" />
          <div className="mx-auto max-w-7xl">
            <Breadcrumbs items={[{ label: "About" }]} variant="about" />
            <div className="mt-10 grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,.72fr)] lg:gap-16">
              <div className="max-w-3xl lg:pb-5">
                <p className="text-xs font-extrabold uppercase tracking-[.19em] text-[#7c3aed]">About ManoBalamHealthCare</p>
                <h1 className="mt-5 text-balance text-[clamp(2.65rem,5.7vw,5.25rem)] font-extrabold leading-[.98] tracking-[-.06em] text-[#312e81]">Mental healthcare designed around real life</h1>
                <p className="mt-7 max-w-[58ch] text-base leading-7 text-[#6b5b95] sm:text-lg sm:leading-8">We connect people with verified professionals, secure online care, guided assessments, and clear support when it matters.</p>
              </div>
              <figure className="relative overflow-hidden rounded-[18px] border border-[#ddd6fe] bg-white p-2 shadow-[0_28px_80px_-42px_rgba(76,29,149,.32)]">
                <div className="aspect-[4/3] overflow-hidden rounded-xl sm:aspect-[16/10] lg:aspect-[4/3]">
                  <img src="/images/about-care-team.png" alt="A mental-health professional listening to a visitor in a calm community care setting" className="size-full object-cover object-center opacity-90" fetchPriority="high" />
                </div>
              </figure>
            </div>
          </div>
        </section>

        <section id="aim" className="scroll-mt-24 px-4 pb-8 sm:px-6 md:px-8 md:pb-12">
          <div className="mx-auto grid max-w-7xl gap-7 rounded-[18px] border border-[#ddd6fe] bg-white p-7 shadow-[0_20px_60px_-48px_rgba(76,29,149,.45)] md:grid-cols-[.85fr_1fr] md:items-center md:gap-14 md:p-10 lg:p-12">
            <h2 className="text-balance text-3xl font-extrabold leading-tight tracking-[-.04em] text-[#312e81] md:text-4xl">Make timely mental-health support easier to reach.</h2>
            <p className="max-w-[58ch] text-lg leading-8 text-[#6b5b95] md:text-xl md:leading-9">We reduce the distance between a person seeking help and an appropriate, trusted professional.</p>
          </div>
        </section>

        <section id="objectives" className="scroll-mt-24 px-4 py-16 sm:px-6 md:px-8 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <h2 className="text-balance text-3xl font-extrabold tracking-[-.04em] text-[#312e81] md:text-5xl">What guides our work</h2>
              <p className="mt-5 max-w-[58ch] text-base leading-7 text-[#6b5b95]">Our objectives turn compassionate intent into practical, dependable access to mental-health support.</p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-2">
              {objectives.map(({ icon: Icon, title, description }, index) => (
                <article key={title} className={`group flex min-w-0 flex-col rounded-[18px] border border-[#ddd6fe] bg-white p-7 shadow-[0_20px_55px_-45px_rgba(76,29,149,.55)] transition duration-200 hover:-translate-y-1 hover:border-[#c4b5fd] hover:shadow-[0_24px_60px_-42px_rgba(76,29,149,.42)] sm:p-8 ${index === 0 ? "lg:col-span-4 lg:row-span-2 lg:min-h-[34rem]" : index === 3 ? "lg:col-span-8" : "lg:col-span-4 lg:min-h-[16.5rem]"}`}>
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-[#ddd6fe] bg-[#ede9fe] text-[#7c3aed]"><Icon className="size-6" strokeWidth={1.8} aria-hidden="true" /></span>
                  <div className={index === 0 ? "mt-auto pt-16" : "mt-auto pt-10"}>
                    <h3 className="text-xl font-extrabold tracking-[-.025em] text-[#312e81]">{title}</h3>
                    <p className="mt-3 max-w-[52ch] text-sm leading-6 text-[#6b5b95]">{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 md:px-8 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-12">
            <article id="vision" className="scroll-mt-24 rounded-[18px] border border-[#ddd6fe] bg-white p-7 shadow-[0_20px_55px_-45px_rgba(76,29,149,.55)] md:col-span-5 sm:p-9 lg:p-12">
              <span className="grid size-12 place-items-center rounded-xl border border-[#ddd6fe] bg-[#ede9fe] text-[#7c3aed]"><Eye className="size-6" strokeWidth={1.8} aria-hidden="true" /></span>
              <h2 className="mt-10 text-3xl font-extrabold tracking-[-.04em] text-[#312e81] md:text-4xl">Our vision</h2>
              <p className="mt-5 max-w-[52ch] text-base leading-8 text-[#6b5b95]">A future where asking for help feels normal and possible, and quality mental-health support is inclusive, approachable, and available early.</p>
            </article>
            <article id="mission" className="scroll-mt-24 rounded-[18px] border border-[#ddd6fe] bg-[#ede9fe] p-7 shadow-[0_20px_55px_-45px_rgba(76,29,149,.55)] md:col-span-7 sm:p-9 lg:p-12">
              <span className="grid size-12 place-items-center rounded-xl bg-[#7c3aed] text-white"><Flag className="size-6" strokeWidth={1.8} aria-hidden="true" /></span>
              <h2 className="mt-10 text-3xl font-extrabold tracking-[-.04em] text-[#312e81] md:text-4xl">Our mission</h2>
              <p className="mt-5 max-w-[52ch] text-base leading-8 text-[#6b5b95]">Build a trusted digital bridge between people, professionals, assessments, and urgent resources while respecting the boundaries of professional care.</p>
            </article>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 md:px-8 md:pb-28">
          <div className="mx-auto grid max-w-7xl gap-7 rounded-[18px] border border-[#ddd6fe] bg-white px-7 py-9 text-[#312e81] shadow-[0_28px_70px_-45px_rgba(76,29,149,.4)] md:grid-cols-[1fr_auto] md:items-center md:px-10 md:py-11 lg:px-12">
            <div>
              <h2 className="text-balance text-2xl font-extrabold tracking-[-.025em] md:text-3xl">Meet the people behind our direction</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6b5b95]">Learn how our committees bring clinical, community, operational, and technical perspectives together.</p>
            </div>
            <Link to="/organization/executive-committee" className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#7c3aed] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#6d28d9] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 active:translate-y-px motion-reduce:transform-none md:w-auto">
              Explore our organization
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter variant="about" />
    </div>
  );
}
