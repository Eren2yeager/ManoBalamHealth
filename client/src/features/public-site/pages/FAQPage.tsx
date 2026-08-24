import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarCheck2,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  HeartPulse,
  LifeBuoy,
  MessageCircleHeart,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react";
import { PublicFooter } from "../components/PublicFooter";
import { PublicPageHero } from "../components/PublicPageHero";
import { faqItems, type FAQCategory } from "../content/faq.content";

const categoryMeta: Record<
  FAQCategory,
  {
    icon: LucideIcon;
    tone: string;
    description: string;
  }
> = {
  Platform: {
    icon: Sparkles,
    tone: "bg-violet-50 text-violet-700 ring-violet-100",
    description: "How ManoBalamHealthCare works as a support platform.",
  },
  Booking: {
    icon: CalendarCheck2,
    tone: "bg-blue-50 text-blue-700 ring-blue-100",
    description: "Sessions, formats, booking flow, and next steps.",
  },
  Assessments: {
    icon: ClipboardCheck,
    tone: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-100",
    description: "Guided check-ins and how to understand results.",
  },
  Professionals: {
    icon: Stethoscope,
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    description: "Choosing a psychologist and professional onboarding.",
  },
  Safety: {
    icon: ShieldCheck,
    tone: "bg-rose-50 text-rose-700 ring-rose-100",
    description: "Urgent care guidance and safe use of online support.",
  },
};

const supportCards = [
  {
    icon: UserRoundCheck,
    title: "Looking for care?",
    text: "Browse verified professionals and choose a consultation path that feels right for you.",
    to: "/psychologists",
    action: "Find psychologists",
  },
  {
    icon: HeartPulse,
    title: "Not sure where to begin?",
    text: "Start with a guided mental-health questionnaire before booking support.",
    to: "/mental-health-assessment",
    action: "Start MHQ",
  },
  {
    icon: LifeBuoy,
    title: "Need urgent help?",
    text: "If there is immediate danger, contact local emergency services first. Our crisis page can guide you too.",
    to: "/services/first-aid-support",
    action: "View urgent support",
  },
];

const categories: Array<"All" | FAQCategory> = ["All", "Platform", "Booking", "Assessments", "Professionals", "Safety"];

export function FAQPage() {
  const [openIndex, setOpenIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<"All" | FAQCategory>("All");
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return faqItems.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        item.question.toLowerCase().includes(normalizedQuery) ||
        item.answer.toLowerCase().includes(normalizedQuery) ||
        item.category.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  return (
    <div className="min-h-screen bg-[#fcfbff]">
      <PublicPageHero
        eyebrow="Helpful answers"
        title="Frequently asked questions"
        summary="Clear, calm answers about using ManoBalamHealthCare — from assessments and booking to professional support, privacy-minded care, and urgent-help guidance."
        icon={CircleHelp}
        section="FAQ"
        highlights={["Quick answers", "Care guidance", "Safety first"]}
      />
      <main className="relative overflow-hidden px-4 py-14 md:px-8 md:py-18">
        <div className="absolute left-1/2 top-10 -z-0 size-[32rem] -translate-x-1/2 rounded-full bg-violet-200/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl gap-8">
          <section className="overflow-hidden rounded-[2rem] border border-violet-100 bg-white/85 p-5 shadow-[0_24px_80px_rgba(76,29,149,.08)] backdrop-blur md:p-7">
            <div className="grid gap-5 lg:grid-cols-[1fr_340px] lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-violet-700 ring-1 ring-violet-100">
                  <MessageCircleHeart className="size-4" />
                  Support hub
                </span>
                <h2 className="mt-4 text-2xl font-black tracking-[-.035em] text-[#111631] md:text-3xl">
                  Find the answer that matches your next step.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  Search all frequently asked questions or filter by topic. Each answer is written to be simple,
                  reassuring, and action-focused.
                </p>
              </div>

              <label className="group flex items-center gap-3 rounded-2xl border border-violet-100 bg-[#fbf9ff] px-4 py-3 shadow-inner shadow-violet-100/50 transition focus-within:border-violet-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-100">
                <Search className="size-5 shrink-0 text-violet-500" />
                <span className="sr-only">Search frequently asked questions</span>
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setOpenIndex(0);
                  }}
                  placeholder="Search FAQ..."
                  className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                />
              </label>
            </div>

            <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => {
                const selected = activeCategory === category;
                const Icon = category === "All" ? CircleHelp : categoryMeta[category].icon;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setActiveCategory(category);
                      setOpenIndex(0);
                    }}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs font-black transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 ${
                      selected
                        ? "bg-primary text-white shadow-lg shadow-violet-200"
                        : "border border-violet-100 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-violet-200 hover:text-violet-700"
                    }`}
                  >
                    <Icon className="size-4" />
                    {category}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[320px_1fr]">
            <aside className="grid gap-3 self-start rounded-[2rem] border border-violet-100 bg-gradient-to-br from-white via-violet-50/70 to-blue-50/70 p-5 shadow-[0_18px_55px_rgba(76,29,149,.07)] lg:sticky lg:top-24">
              <p className="text-xs font-black uppercase tracking-[.18em] text-primary">Topics covered</p>
              {Object.entries(categoryMeta).map(([category, meta]) => {
                const Icon = meta.icon;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setActiveCategory(category as FAQCategory);
                      setOpenIndex(0);
                    }}
                    className="group rounded-2xl border border-white/80 bg-white/80 p-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-violet-100 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
                  >
                    <span className={`grid size-10 place-items-center rounded-2xl ring-1 ${meta.tone}`}>
                      <Icon className="size-5" />
                    </span>
                    <span className="mt-3 block text-sm font-black text-[#111631]">{category}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">{meta.description}</span>
                  </button>
                );
              })}
            </aside>

            <div className="grid gap-3">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => {
                  const open = openIndex === index;
                  const meta = categoryMeta[item.category];
                  const Icon = meta.icon;

                  return (
                    <article
                      key={item.question}
                      className={`group overflow-hidden rounded-[1.65rem] border bg-white transition-all duration-300 ${
                        open
                          ? "border-violet-200 shadow-[0_24px_70px_rgba(109,40,217,.12)]"
                          : "border-slate-100 shadow-sm hover:-translate-y-0.5 hover:border-violet-100 hover:shadow-lg"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenIndex(open ? -1 : index)}
                        className="flex w-full items-start justify-between gap-5 px-5 py-5 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-violet-200 md:px-6"
                        aria-expanded={open}
                      >
                        <span className="flex items-start gap-4">
                          <span className={`mt-0.5 grid size-11 shrink-0 place-items-center rounded-2xl ring-1 ${meta.tone}`}>
                            <Icon className="size-5" />
                          </span>
                          <span>
                            <span className="mb-2 inline-flex rounded-full bg-violet-50 px-3 py-1 text-[11px] font-black uppercase tracking-[.15em] text-violet-700">
                              {item.category}
                            </span>
                            <span className="block text-base font-black leading-6 text-[#111631] md:text-lg">
                              {item.question}
                            </span>
                          </span>
                        </span>
                        <ChevronDown
                          className={`mt-3 size-5 shrink-0 text-primary transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                        />
                      </button>
                      <div className={`grid transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                        <div className="overflow-hidden">
                          <div className="mx-5 mb-5 rounded-2xl bg-gradient-to-br from-violet-50/90 to-white px-5 py-4 ring-1 ring-violet-100 md:mx-6">
                            <p className="text-sm leading-7 text-slate-600">{item.answer}</p>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-[1.65rem] border border-violet-100 bg-white p-8 text-center shadow-[0_18px_55px_rgba(76,29,149,.07)]">
                  <CircleHelp className="mx-auto size-10 text-violet-500" />
                  <h3 className="mt-4 text-lg font-black text-[#111631]">No FAQ matched your search</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-600">
                    Try a different keyword, choose another topic, or contact the ManoBalamHealthCare team for help.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {supportCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  to={card.to}
                  className="group rounded-[1.75rem] border border-violet-100 bg-white p-5 shadow-[0_18px_55px_rgba(76,29,149,.07)] transition-all hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-violet-50 text-primary ring-1 ring-violet-100 transition group-hover:scale-105 group-hover:bg-primary group-hover:text-white">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-4 text-lg font-black text-[#111631]">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{card.text}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary">
                    {card.action}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

