import type { ReactNode } from "react";
import type { ContentPage } from "../types/public-site.types";
import { ContentSection } from "./ContentSection";
import { PublicFooter } from "./PublicFooter";
import { PublicPageHero } from "./PublicPageHero";

export function PublicPageLayout({
  page,
  section,
  children,
}: {
  page: ContentPage;
  section: string;
  children?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fcfbff]">
      <PublicPageHero
        eyebrow={page.eyebrow}
        title={page.title}
        summary={page.summary}
        icon={page.icon}
        section={section}
        highlights={page.highlights}
      />
      <main className="px-4 py-14 md:px-8 md:py-18">
        <div className="mx-auto grid max-w-5xl gap-5">
          {page.sections.map((content, index) => (
            <ContentSection key={content.title} {...content} index={index} />
          ))}
          {children}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

