import { updatePsychologistProfileSchema } from "./psychologist.validation";
import { computeSessionFee, buildPriceMatrix } from "./psychologist.constants";

describe("psychologist onboarding validation", () => {
  it("accepts a complete professional profile", () => {
    const result = updatePsychologistProfileSchema.safeParse({
      specialization: ["anxiety", "trauma"],
      languages: ["English", "Hindi"],
      experienceYears: 5,
      consultationFee: { amount: 120000, currency: "INR" },
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

  it("rejects specializations and languages outside the platform lists", () => {
    expect(
      updatePsychologistProfileSchema.safeParse({
        specialization: ["Clinical psychology"],
      }).success,
    ).toBe(false);
    expect(
      updatePsychologistProfileSchema.safeParse({ languages: ["Klingon"] }).success,
    ).toBe(false);
  });

  it("rejects unsupported country codes even when well-formed", () => {
    expect(
      updatePsychologistProfileSchema.safeParse({ licensedCountries: ["XX"] }).success,
    ).toBe(false);
    expect(
      updatePsychologistProfileSchema.safeParse({ licensedCountries: ["IN", "US"] }).success,
    ).toBe(true);
  });

  it("enforces paise bounds and integer amounts on the base fee", () => {
    expect(
      updatePsychologistProfileSchema.safeParse({
        consultationFee: { amount: 100.5, currency: "INR" },
      }).success,
    ).toBe(false);
    expect(
      updatePsychologistProfileSchema.safeParse({
        consultationFee: { amount: 100, currency: "INR" }, // ₹1 — below minimum
      }).success,
    ).toBe(false);
    expect(
      updatePsychologistProfileSchema.safeParse({
        consultationFee: { amount: 50000, currency: "INR" }, // ₹500
      }).success,
    ).toBe(true);
  });
});

describe("computeSessionFee", () => {
  const base = 50000; // ₹500 for 30-min video

  it("returns the base fee for 30-min video", () => {
    expect(computeSessionFee(base, "video", 30)).toBe(50000);
  });

  it("applies mode and duration multipliers", () => {
    expect(computeSessionFee(base, "audio", 30)).toBe(40000);
    expect(computeSessionFee(base, "chat", 30)).toBe(30000);
    expect(computeSessionFee(base, "video", 45)).toBe(75000);
    expect(computeSessionFee(base, "video", 60)).toBe(100000);
    expect(computeSessionFee(base, "chat", 60)).toBe(60000);
  });

  it("rounds to integer paise", () => {
    // 33333 * 0.8 * 1.5 = 39999.6 → 40000
    expect(computeSessionFee(33333, "audio", 45)).toBe(40000);
  });

  it("falls back to linear duration scaling for non-standard durations", () => {
    expect(computeSessionFee(base, "video", 90)).toBe(150000);
  });

  it("builds a full 3x3 price matrix", () => {
    const matrix = buildPriceMatrix(base);
    expect(matrix.video[30]).toBe(50000);
    expect(matrix.chat[60]).toBe(60000);
    expect(Object.keys(matrix)).toEqual(["chat", "audio", "video"]);
  });
});
