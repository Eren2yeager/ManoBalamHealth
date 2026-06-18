export const Roles = {
  PATIENT: "patient",
  PSYCHOLOGIST: "psychologist",
  ADMIN: "admin",
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];
