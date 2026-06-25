import { BrainCircuit, HeartHandshake, ShieldPlus, Stethoscope } from "lucide-react";
import type { ServicePage } from "../types/public-site.types";

export const servicesContent: Record<string, ServicePage> = {
  "first-aid-support": {
    slug: "first-aid-support", eyebrow: "Our services", title: "First Aid Support",
    summary: "A clear first response when someone feels overwhelmed, distressed, or unsure what to do next.",
    icon: ShieldPlus, highlights: ["Immediate guidance", "Crisis resources", "Safe next steps"], urgent: true,
    actionLabel: "Open urgent support", actionTo: "/emergency",
    sections: [
      { title: "What this service offers", body: "First Aid Support provides grounding guidance and access to local crisis resources while helping users identify an appropriate next step." },
      { title: "Important", body: "This service is not a replacement for emergency medical care. If there is immediate danger, contact local emergency services. In India, dial 112." },
    ],
  },
  "psychiatric-consultation": {
    slug: "psychiatric-consultation", eyebrow: "Our services", title: "Psychiatric Consultation",
    summary: "Specialist consultation for the evaluation of mental-health concerns and discussion of suitable treatment pathways.",
    icon: Stethoscope, highlights: ["Specialist evaluation", "Care planning", "Follow-up guidance"],
    actionLabel: "Find a professional", actionTo: "/psychologists",
    sections: [
      { title: "When it may help", body: "A psychiatric consultation may be appropriate when symptoms are persistent, significantly affect daily life, or require medical evaluation." },
      { title: "What to expect", body: "The professional will discuss symptoms, history, current concerns, and possible next steps. Any treatment decisions remain between the user and qualified clinician." },
    ],
  },
  "clinical-psychology": {
    slug: "clinical-psychology", eyebrow: "Our services", title: "Clinical Psychology",
    summary: "Evidence-informed psychological assessment and therapeutic support for emotional, behavioural, and psychological concerns.",
    icon: BrainCircuit, highlights: ["Psychological support", "Structured sessions", "Evidence-informed care"],
    actionLabel: "Browse psychologists", actionTo: "/psychologists",
    sections: [
      { title: "Support tailored to the person", body: "Clinical psychologists work collaboratively to understand patterns, build coping strategies, and support meaningful change." },
      { title: "Common areas of support", body: "People may seek support for anxiety, mood difficulties, trauma, adjustment, relationships, stress, or other concerns.", points: ["Assessment and formulation", "Therapeutic goal setting", "Skills and coping strategies", "Progress review"] },
    ],
  },
  "mental-health-counselling": {
    slug: "mental-health-counselling", eyebrow: "Our services", title: "Mental Health Counselling",
    summary: "A confidential and supportive space to explore emotions, life transitions, relationships, stress, and personal wellbeing.",
    icon: HeartHandshake, highlights: ["Confidential conversation", "Practical support", "Personal growth"],
    actionLabel: "Book counselling", actionTo: "/psychologists",
    sections: [
      { title: "A space to be heard", body: "Counselling offers collaborative support without judgement, helping people clarify concerns and develop practical ways forward." },
      { title: "Flexible online access", body: "ManoBalamHealthCare supports chat, audio, and video session options depending on professional availability and user preference." },
    ],
  },
};
