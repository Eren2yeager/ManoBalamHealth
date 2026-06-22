import { FileText, ShieldCheck } from "lucide-react";
import { useParams } from "react-router-dom";
import { PublicFooter } from "../components/PublicFooter";
import { PublicPageHero } from "../components/PublicPageHero";

const legalContent = {
  terms: {
    title: "Terms of Service",
    summary: "The conditions for using ManoBalam accounts, professional services, assessments, and online communication features.",
    sections: [
      ["Use of the platform", "Users must provide accurate account information, protect their credentials, and use ManoBalam lawfully and respectfully."],
      ["Mental-health services", "ManoBalam facilitates access to independent mental-health professionals. Assessments are informational and are not a diagnosis."],
      ["Emergency limitations", "The platform is not a replacement for emergency services. In immediate danger, contact local emergency services; in India, dial 112."],
      ["Professional accounts", "Psychologist features remain restricted until professional details and credentials are reviewed and approved."],
    ],
  },
  privacy: {
    title: "Privacy Policy",
    summary: "How ManoBalam collects and uses account, booking, professional, assessment, and support information.",
    sections: [
      ["Information collected", "We process information needed to create accounts, provide bookings and sessions, verify professionals, deliver assessments, and respond to support requests."],
      ["How information is used", "Information is used to operate the service, protect accounts, coordinate care workflows, meet legal obligations, and improve reliability."],
      ["Access and safeguards", "Access is limited by role and operational need. Sensitive credentials are stored through configured infrastructure providers and should not be shared outside designated upload areas."],
      ["Your choices", "Users may update profile information and contact support regarding account or privacy requests, subject to legal and operational retention requirements."],
    ],
  },
} as const;

export function LegalPage() {
  const { document = "terms" } = useParams();
  const content = legalContent[document as keyof typeof legalContent] ?? legalContent.terms;
  return (
    <div className="min-h-screen bg-[#fcfbff]">
      <PublicPageHero eyebrow="Legal information" title={content.title} summary={content.summary} icon={document === "privacy" ? ShieldCheck : FileText} section="Legal" />
      <main className="px-4 py-14 md:px-8"><div className="mx-auto grid max-w-4xl gap-5">{content.sections.map(([title, body]) => <section key={title} className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm"><h2 className="text-xl font-black text-[#111631]">{title}</h2><p className="mt-3 text-sm leading-7 text-slate-600">{body}</p></section>)}</div></main>
      <PublicFooter />
    </div>
  );
}
