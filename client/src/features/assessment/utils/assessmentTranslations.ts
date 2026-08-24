import type {
  AssessmentQuestionItem,
  AssessmentQuestionOption,
  AssessmentType,
} from "../types/assessment.types";

export type AssessmentLanguage = "en" | "hi";

const hindiTitles: Record<AssessmentType, string> = {
  anxiety: "चिंता जांच",
  depression: "मूड जांच",
  stress: "तनाव जांच",
};

const hindiQuestionText: Record<
  AssessmentType,
  Record<string, string>
> = {
  anxiety: {
    q1: "आपने कितनी बार घबराहट, चिंता या बेचैनी महसूस की है?",
    q2: "आप कितनी बार अपनी चिंता को रोक या नियंत्रित नहीं कर पाए?",
  },
  depression: {
    q1: "आपने कितनी बार मन उदास, खाली या निराश महसूस किया है?",
    q2: "आपने कितनी बार कामों में रुचि या आनंद कम महसूस किया है?",
  },
  stress: {
    q1: "आपने कितनी बार तनाव, दबाव या मानसिक थकान महसूस की है?",
    q2: "आपने कितनी बार महसूस किया कि चीज़ें संभालना मुश्किल हो रहा है?",
  },
};

const fallbackHindiQuestionByEnglish: Record<string, string> = {
  "How often have you felt nervous, anxious, or on edge?":
    "आपने कितनी बार घबराहट, चिंता या बेचैनी महसूस की है?",
  "How often have you not been able to stop or control worrying?":
    "आप कितनी बार अपनी चिंता को रोक या नियंत्रित नहीं कर पाए?",
};

const hindiOptionsByScore: Record<number, string> = {
  0: "बिल्कुल नहीं",
  1: "कुछ दिनों तक",
  2: "आधे से अधिक दिनों तक",
  3: "लगभग हर दिन",
};

export function getAssessmentTitle(
  type: AssessmentType,
  title: string,
  language: AssessmentLanguage,
) {
  return language === "hi" ? hindiTitles[type] : title;
}

export function getAssessmentInstruction(language: AssessmentLanguage) {
  return language === "hi"
    ? "ईमानदारी से उत्तर दें। आपके उत्तर आपके परिणाम समझने में मदद करेंगे।"
    : "Answer the following questions honestly to get your results";
}

export function getLocalizedQuestion(
  type: AssessmentType,
  question: AssessmentQuestionItem,
  language: AssessmentLanguage,
) {
  if (language === "en") return question.text;
  return (
    hindiQuestionText[type]?.[question.id] ??
    fallbackHindiQuestionByEnglish[question.text] ??
    question.text
  );
}

export function getLocalizedOption(
  option: AssessmentQuestionOption,
  language: AssessmentLanguage,
) {
  if (language === "en") return option.text;
  return hindiOptionsByScore[option.score] ?? option.text;
}

export const assessmentLanguageLabels: Record<
  AssessmentLanguage,
  { label: string; helper: string }
> = {
  en: {
    label: "English",
    helper: "Questions are shown in English.",
  },
  hi: {
    label: "हिन्दी",
    helper: "प्रश्न हिन्दी में दिखाए जा रहे हैं।",
  },
};
