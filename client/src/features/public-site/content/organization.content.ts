import { BadgeCheck, Building2, Handshake, Laptop, Stethoscope } from "lucide-react";
import type { AdministrativeMember, ClinicalAmbassador, ConsultativeMember, ExecutiveMember, OrganizationPage, TechnicalMember } from "../types/public-site.types";
import executiveMembers from "./organization-members/executive-committee.json";
import administrativeMembers from "./organization-members/administrative-committee.json";
import consultativeMembers from "./organization-members/consultative-committee.json";
import technicalMembers from "./organization-members/technical-committee.json";
import clinicalAmbassadors from "./organization-members/clinical-ambassadors.json";

export const organizationContent: Record<string, OrganizationPage> = {
  "executive-committee": {
    slug: "executive-committee", eyebrow: "Organization", title: "Executive Committee",
    summary: "Responsible for strategic direction, governance, accountability, and alignment with ManoBalamHealthCare's purpose.",
    icon: Building2, highlights: ["Governance", "Strategy", "Accountability"],
    sections: [{ title: "Committee responsibility", body: "The Executive Committee reviews organizational priorities, responsible growth, service quality, and long-term sustainability." }],
    members: executiveMembers as ExecutiveMember[],
  },
  "administrative-committee": {
    slug: "administrative-committee", eyebrow: "Organization", title: "Administrative Committee",
    summary: "Coordinates day-to-day administration, operational processes, and dependable service delivery.",
    icon: BadgeCheck, highlights: ["Operations", "Coordination", "Quality"],
    sections: [{ title: "Committee responsibility", body: "The Administrative Committee supports documented workflows, operational readiness, communications, and coordination across teams." }],
    members: administrativeMembers as AdministrativeMember[],
  },
  "consultative-committee": {
    slug: "consultative-committee", eyebrow: "Organization", title: "Consultative Committee",
    summary: "Provides diverse perspectives from professionals, communities, and stakeholders to inform responsible decisions.",
    icon: Handshake, highlights: ["Consultation", "Community", "Inclusion"],
    sections: [{ title: "Committee responsibility", body: "The committee helps ensure policies and experiences are understandable, culturally aware, and responsive to real-world needs." }],
    members: consultativeMembers as ConsultativeMember[],
  },
  "technical-committee": {
    slug: "technical-committee", eyebrow: "Organization", title: "Technical Committee",
    summary: "Guides platform reliability, privacy-conscious architecture, accessibility, and responsible technology practices.",
    icon: Laptop, highlights: ["Security", "Reliability", "Accessibility"],
    sections: [{ title: "Committee responsibility", body: "The Technical Committee reviews platform standards, operational resilience, information safeguards, and accessible product delivery." }],
    members: technicalMembers as TechnicalMember[],
  },
  "clinical-ambassadors": {
    slug: "clinical-ambassadors", eyebrow: "Organization", title: "Clinical Ambassadors",
    summary: "Mental-health professionals who support awareness, professional dialogue, and responsible public education.",
    icon: Stethoscope, highlights: ["Awareness", "Clinical voice", "Outreach"],
    sections: [{ title: "Ambassador responsibility", body: "Clinical Ambassadors encourage informed conversations about mental wellbeing and help communicate when professional support may be useful." }],
    members: clinicalAmbassadors as ClinicalAmbassador[],
  },
};
