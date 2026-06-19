import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",

  // Resolve @/ path alias (mirrors tsconfig.json paths)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Only look for tests inside src/
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts", "**/*.spec.ts", "**/*.test.ts"],

  // ts-jest configuration — use the project's tsconfig
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.json" }],
  },

  // Coverage
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.types.ts",
    "!src/**/*.d.ts",
    "!src/server.ts",      // bootstrap entry — not unit-testable
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
};

export default config;
