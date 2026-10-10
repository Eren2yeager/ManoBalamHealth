export type FAQCategory = "Platform" | "Booking" | "Assessments" | "Professionals" | "Safety";

export const faqItems: Array<{
  category: FAQCategory;
  question: string;
  answer: string;
}> = [
  {
    category: "Platform",
    question: "What is ManoBalamHealthCare?",
    answer:
      "ManoBalamHealthCare is an online mental-health platform for finding verified professionals, booking sessions, completing guided assessments, and accessing urgent support resources.",
  },
  {
    category: "Assessments",
    question: "Are self-assessments a diagnosis?",
    answer:
      "No. Assessments are informational check-ins and cannot diagnose a condition. A qualified professional can help interpret concerns and recommend appropriate next steps.",
  },
  {
    category: "Booking",
    question: "What session formats are available?",
    answer:
      "Depending on professional availability, sessions may use secure chat, audio, or video. You can review available options while booking a consultation.",
  },
  {
    category: "Booking",
    question: "How do I book a consultation?",
    answer:
      "Create or log in to your account, browse psychologists, choose a suitable professional and time, then complete the booking and payment steps.",
  },
  {
    category: "Professionals",
    question: "Can I choose my psychologist?",
    answer:
      "Yes. You can browse available profiles and choose a professional, or use supported allocation options available in the booking flow.",
  },
  {
    category: "Safety",
    question: "What should I do during an emergency?",
    answer:
      "If you or someone else is in immediate danger, contact local emergency services. In India, dial 112. ManoBalamHealthCare's urgent-support area also provides crisis resources.",
  },
  {
    category: "Professionals",
    question: "Can psychologists join the platform?",
    answer:
      "Yes. Professionals can register and submit their profile for administrative verification before offering appointments on the platform.",
  },
  {
    category: "Safety",
    question: "Is online care suitable for everyone?",
    answer:
      "Online support can be useful for many people, but suitability depends on individual needs and risk. A professional may recommend in-person or emergency care where appropriate.",
  },
];
