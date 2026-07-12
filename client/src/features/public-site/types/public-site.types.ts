import type { LucideIcon } from "lucide-react";

export interface PublicNavItem {
  label: string;
  to?: string;
  description?: string;
  icon?: LucideIcon;
  children?: PublicNavItem[];
}

export interface ContentPage {
  slug: string;
  eyebrow: string;
  title: string;
  summary: string;
  icon: LucideIcon;
  highlights: string[];
  sections: Array<{
    title: string;
    body: string;
    points?: string[];
  }>;
}

interface MemberBase {
  name: string;
  imageUrl?: string;
  bio: string;
  isExample?: boolean;
}

export interface ExecutiveMember extends MemberBase {
  committeeType: "executive";
  position: string;
  governanceExperience: string;
  leadershipAreas: string[];
}

export interface AdministrativeMember extends MemberBase {
  committeeType: "administrative";
  position: string;
  operationsExperience: string;
  responsibilities: string[];
}

export interface ConsultativeMember extends MemberBase {
  committeeType: "consultative";
  designation: string;
  advisoryExperience: string;
  specialties?: string[];
}

export interface TechnicalMember extends MemberBase {
  committeeType: "technical";
  position: string;
  technicalExperience: string;
  skills: string[];
  responsibilities: string[];
}

export interface ClinicalAmbassador extends MemberBase {
  committeeType: "clinical";
  designation: string;
  qualifications: string;
  clinicalExperience: string;
  specialties: string[];
  languages: string[];
}

export type CommitteeMember = ExecutiveMember | AdministrativeMember | ConsultativeMember | TechnicalMember | ClinicalAmbassador;

export interface OrganizationPage extends ContentPage {
  members: CommitteeMember[];
}

export interface ServicePage extends ContentPage {
  actionLabel: string;
  actionTo: string;
  urgent?: boolean;
}

