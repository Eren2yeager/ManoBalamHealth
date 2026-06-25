import { updateUserSchema } from "./user.validation";

describe("user profile validation", () => {
  it("accepts valid editable profile fields", () => {
    expect(
      updateUserSchema.safeParse({
        name: "Aarav Sharma",
        age: 29,
        gender: "male",
        timezone: "Asia/Kolkata",
        emergencyContact: {
          name: "Nisha Sharma",
          phone: "+919876543210",
        },
      }).success,
    ).toBe(true);
  });

  it("allows an emergency contact to be removed", () => {
    expect(
      updateUserSchema.safeParse({
        age: null,
        gender: null,
        emergencyContact: null,
      }).success,
    ).toBe(true);
  });

  it("rejects invalid timezones and phone numbers", () => {
    expect(
      updateUserSchema.safeParse({ timezone: "India/Somewhere" }).success,
    ).toBe(false);
    expect(
      updateUserSchema.safeParse({
        emergencyContact: { name: "Support Person", phone: "9876543210" },
      }).success,
    ).toBe(false);
  });

  it("strips fields that users must not edit", () => {
    const result = updateUserSchema.parse({
      name: "Updated Name",
      role: "admin",
      isVerified: true,
    });
    expect(result).toEqual({ name: "Updated Name" });
  });
});
