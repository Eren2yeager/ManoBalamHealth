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

export interface CommitteeMember {
  name: string;
  role: string;
  description: string;
}

export interface OrganizationPage extends ContentPage {
  members: CommitteeMember[];
}

export interface ServicePage extends ContentPage {
  actionLabel: string;
  actionTo: string;
  urgent?: boolean;
}

