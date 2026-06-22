import { Compass, Eye, Flag, Goal, Target } from "lucide-react";
import type { ContentPage } from "../types/public-site.types";

export const aboutContent: Record<string, ContentPage> = {
  brief: {
    slug: "brief",
    eyebrow: "About ManoBalam",
    title: "Mental healthcare designed around real life",
    summary: "ManoBalam is a digital mental-health platform that helps people discover verified professionals, schedule care, join secure online sessions, and use guided self-assessments.",
    icon: Compass,
    highlights: ["Accessible online support", "Verified professionals", "Privacy-conscious care"],
    sections: [
      { title: "Why we exist", body: "Finding the right mental-health support can feel confusing, delayed, or inaccessible. ManoBalam brings the essential steps into one clear and supportive experience." },
      { title: "What the platform provides", body: "People can explore psychologists, book suitable appointment slots, attend chat, audio, or video sessions, and keep track of their care journey.", points: ["Role-based patient and professional workspaces", "Secure booking and payment flow", "Assessment and urgent-support pathways"] },
    ],
  },
  aim: {
    slug: "aim",
    eyebrow: "Our direction",
    title: "Make timely mental-health support easier to reach",
    summary: "Our aim is to reduce the distance between a person seeking help and an appropriate, trusted mental-health professional.",
    icon: Target,
    highlights: ["Earlier support", "Clearer choices", "Comfortable access"],
    sections: [
      { title: "Care without unnecessary friction", body: "We want people to move from uncertainty to a useful next step without confusing processes or avoidable delays." },
      { title: "Technology with a human purpose", body: "Every product decision should support trust, dignity, continuity, and informed choice rather than replacing professional care." },
    ],
  },
  objectives: {
    slug: "objectives",
    eyebrow: "Our priorities",
    title: "Practical objectives that guide the platform",
    summary: "ManoBalam combines accessible technology, responsible clinical pathways, and dependable operations.",
    icon: Goal,
    highlights: ["Connect", "Support", "Educate"],
    sections: [
      { title: "Core objectives", body: "Our product and service priorities are grounded in safe access and useful continuity.", points: ["Connect users with verified mental-health professionals", "Enable flexible and secure online consultations", "Provide responsible self-assessment and wellness education", "Offer clear urgent-help and crisis-resource pathways", "Support psychologists with practical scheduling and session tools"] },
    ],
  },
  vision: {
    slug: "vision",
    eyebrow: "Our future",
    title: "A future where asking for help feels normal and possible",
    summary: "We envision communities where quality mental-health support is approachable, inclusive, and available before distress becomes overwhelming.",
    icon: Eye,
    highlights: ["Inclusive care", "Reduced stigma", "Stronger communities"],
    sections: [
      { title: "The future we want to help build", body: "Mental wellbeing should be treated as an essential part of overall health, with trustworthy support available across geography, schedules, and life circumstances." },
    ],
  },
  mission: {
    slug: "mission",
    eyebrow: "Our work",
    title: "Turn compassionate intent into dependable access",
    summary: "Our mission is to provide a trusted digital bridge between people, mental-health professionals, assessments, and urgent resources.",
    icon: Flag,
    highlights: ["Trust", "Access", "Continuity"],
    sections: [
      { title: "How we deliver the mission", body: "We build coordinated experiences for discovery, booking, sessions, follow-up, and self-reflection while protecting the boundaries of professional mental-health care.", points: ["Maintain clear professional verification workflows", "Design inclusive and understandable user experiences", "Improve access through flexible online care", "Communicate assessment limitations responsibly"] },
    ],
  },
};

