import {
  registerSchema,
  resetPasswordSchema,
} from "./auth.validation";

describe("authentication validation", () => {
  it("requires a verified email-capable registration payload", () => {
    const result = registerSchema.safeParse({
      name: "Test Psychologist",
      email: "psychologist@example.com",
      password: "SecurePass1",
      role: "psychologist",
      country: "IN",
      timezone: "Asia/Kolkata",
    });
    expect(result.success).toBe(true);
  });

  it("rejects phone-only registration until an SMS provider is supported", () => {
    const result = registerSchema.safeParse({
      name: "Test Psychologist",
      phone: "+911234567890",
      password: "SecurePass1",
      role: "psychologist",
      country: "IN",
      timezone: "Asia/Kolkata",
    });
    expect(result.success).toBe(false);
  });

  it("enforces password reset strength", () => {
    expect(resetPasswordSchema.safeParse({ token: "a".repeat(64), password: "weakpass" }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ token: "a".repeat(64), password: "Strongpass1" }).success).toBe(true);
  });
});
