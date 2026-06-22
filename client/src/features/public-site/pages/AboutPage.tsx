import { Compass } from "lucide-react";
import { ContentSection } from "../components/ContentSection";
import { PublicFooter } from "../components/PublicFooter";
import { PublicPageHero } from "../components/PublicPageHero";
import { aboutContent } from "../content/about.content";

const aboutSections = ["brief", "aim", "objectives", "vision", "mission"] as const;

export function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fcfbff]">
      <PublicPageHero
        eyebrow="About ManoBalam"
        title="Our purpose, direction, and commitment"
        summary="Discover who ManoBalam is, what we aim to achieve, and how our vision and mission guide accessible mental-health support."
        icon={Compass}
        section="About"
        highlights={["Brief", "Aim", "Objectives", "Vision", "Mission"]}
      />

      <main className="px-4 py-14 md:px-8 md:py-18">
        <div className="mx-auto grid max-w-5xl gap-8">
          {aboutSections.map((slug, sectionIndex) => {
            const page = aboutContent[slug];

            return (
              <section
                key={slug}
                id={slug}
                className="scroll-mt-28 rounded-[2rem] border border-violet-100 bg-white p-6 shadow-[0_18px_55px_rgba(31,21,70,.06)] md:p-9"
              >
                <div className="mb-6 flex items-start gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-violet-50 text-primary ring-1 ring-violet-100">
                    <page.icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.18em] text-primary">
                      {page.eyebrow}
                    </p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-[#111631] md:text-3xl">
                      {page.title}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{page.summary}</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {page.sections.map((content, index) => (
                    <ContentSection
                      key={content.title}
                      {...content}
                      index={sectionIndex + index}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
