import { updatePsychologistProfileSchema } from "./psychologist.validation";

describe("psychologist onboarding validation", () => {
  it("accepts a complete professional profile", () => {
    const result = updatePsychologistProfileSchema.safeParse({
      specialization: ["Clinical psychology"],
      languages: ["English", "Hindi"],
      experienceYears: 5,
      consultationFee: { amount: 1200, currency: "INR" },
      bio: "A qualified clinical psychologist providing evidence-informed and collaborative mental-health support.",
      licensedCountries: ["IN"],
      isAcceptingEmergency: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects incomplete or unsafe professional values", () => {
    const result = updatePsychologistProfileSchema.safeParse({
      specialization: [],
      languages: [],
      experienceYears: -1,
      consultationFee: { amount: 0, currency: "RUPEES" },
      bio: "Too short",
      licensedCountries: ["India"],
    });
    expect(result.success).toBe(false);
  });
});
