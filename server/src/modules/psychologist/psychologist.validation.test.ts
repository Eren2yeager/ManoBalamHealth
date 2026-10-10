import { setPsychologistFeeSchema, updatePsychologistProfileSchema } from "./psychologist.validation";
import { computeSessionFee, buildPriceMatrix } from "./psychologist.constants";

describe("psychologist onboarding validation", () => {
  it("accepts a complete professional profile", () => {
    const result = updatePsychologistProfileSchema.safeParse({
      specialization: ["anxiety", "trauma"],
      languages: ["English", "Hindi"],
      experienceYears: 5,
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

  it("ignores self-submitted consultation fees because admin owns pricing", () => {
    expect(
      updatePsychologistProfileSchema.safeParse({
        consultationFee: { amount: 50000, currency: "INR" },
      }).success,
    ).toBe(true);
  });

  it("enforces paise bounds and integer amounts on admin-set fees", () => {
    expect(
      setPsychologistFeeSchema.safeParse({
        amount: 100.5,
        currency: "INR",
      }).success,
    ).toBe(false);
    expect(
      setPsychologistFeeSchema.safeParse({
        amount: 100, // ₹1 — below minimum
        currency: "INR",
      }).success,
    ).toBe(false);
    expect(
      setPsychologistFeeSchema.safeParse({
        amount: 50000, // ₹500
        currency: "INR",
      }).success,
    ).toBe(true);
  });
});

describe("computeSessionFee", () => {
  const base = 50000; // ₹500 admin-controlled session fee

  it("returns the admin-controlled fee for a standard session", () => {
    expect(computeSessionFee(base, "video", 30)).toBe(50000);
  });

  it("keeps the fee stable across current modes and slot durations", () => {
    expect(computeSessionFee(base, "audio", 30)).toBe(50000);
    expect(computeSessionFee(base, "chat", 30)).toBe(50000);
    expect(computeSessionFee(base, "video", 45)).toBe(50000);
    expect(computeSessionFee(base, "video", 60)).toBe(50000);
    expect(computeSessionFee(base, "chat", 60)).toBe(50000);
  });

  it("rounds to integer paise", () => {
    expect(computeSessionFee(33333.4, "audio", 45)).toBe(33333);
  });

  it("does not scale non-standard durations unless explicit pricing is added", () => {
    expect(computeSessionFee(base, "video", 90)).toBe(50000);
  });

  it("builds a full 3x3 price matrix", () => {
    const matrix = buildPriceMatrix(base);
    expect(matrix.video[30]).toBe(50000);
    expect(matrix.chat[60]).toBe(50000);
    expect(Object.keys(matrix)).toEqual(["chat", "audio", "video"]);
  });
});
