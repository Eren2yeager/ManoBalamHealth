import {
  Award,
  BrainCircuit,
  Building2,
  CircleHelp,
  ClipboardCheck,
  Compass,
  HeartHandshake,
  Home,
  Mail,
  ShieldPlus,
  Sparkles,
  Stethoscope,
  Target,
  Users,
} from "lucide-react";
import type { PublicNavItem } from "../types/public-site.types";

export const publicNavigation: PublicNavItem[] = [
  { label: "Home", to: "/", icon: Home },
  {
    label: "About",
    to: "/about",
    icon: Compass,
  },
  {
    label: "Organization",
    to: "/organization",
    icon: Building2,
  },
  {
    label: "Services",
    icon: HeartHandshake,
    children: [
      { label: "First Aid Support", to: "/services/first-aid-support", description: "Immediate guidance and urgent resources", icon: ShieldPlus },
      { label: "Psychiatric Consultation", to: "/services/psychiatric-consultation", description: "Specialist evaluation and care planning", icon: Stethoscope },
      { label: "Clinical Psychology", to: "/services/clinical-psychology", description: "Evidence-informed psychological support", icon: BrainCircuit },
      { label: "Mental Health Counselling", to: "/services/mental-health-counselling", description: "Confidential space to talk and grow", icon: Sparkles },
    ],
  },
  { label: "MHQ", to: "/mental-health-assessment", icon: ClipboardCheck },
  { label: "Events", to: "/events-achievements", icon: Award },
  { label: "FAQ", to: "/faq", icon: CircleHelp },
  { label: "Contact", to: "/contact", icon: Mail },
];

export const featuredNavCards = [
  {
    icon: Target,
    title: "Start with a check-in",
    text: "Explore guided mental-health assessments.",
    to: "/mental-health-assessment",
  },
  {
    icon: Users,
    title: "Find a professional",
    text: "Browse verified psychologist profiles.",
    to: "/psychologists",
  },
];
