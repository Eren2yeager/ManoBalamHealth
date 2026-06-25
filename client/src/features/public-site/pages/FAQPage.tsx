import { useState } from "react";
import { ChevronDown, CircleHelp } from "lucide-react";
import { PublicFooter } from "../components/PublicFooter";
import { PublicPageHero } from "../components/PublicPageHero";
import { faqItems } from "../content/faq.content";

export function FAQPage() {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <div className="min-h-screen bg-[#fcfbff]">
      <PublicPageHero eyebrow="Helpful answers" title="Frequently asked questions" summary="Clear answers about the platform, assessments, consultations, professional registration, and urgent support." icon={CircleHelp} section="FAQ" highlights={["Platform", "Care", "Safety"]} />
      <main className="px-4 py-14 md:px-8">
        <div className="mx-auto grid max-w-4xl gap-3">
          {faqItems.map((item, index) => {
            const open = openIndex === index;
            return (
              <article key={item.question} className={`overflow-hidden rounded-2xl border bg-white transition-all ${open ? "border-violet-200 shadow-lg shadow-violet-100/60" : "border-slate-100 shadow-sm"}`}>
                <button type="button" onClick={() => setOpenIndex(open ? -1 : index)} className="flex w-full items-center justify-between gap-5 px-6 py-5 text-left" aria-expanded={open}>
                  <span className="font-black text-slate-900">{item.question}</span>
                  <ChevronDown className={`size-5 shrink-0 text-primary transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
                <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}><div className="overflow-hidden"><p className="px-6 pb-6 text-sm leading-7 text-slate-600">{item.answer}</p></div></div>
              </article>
            );
          })}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

