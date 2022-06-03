import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  roots: ["<rootDir>", "./src"],
  testEnvironment: "node",
  verbose: false,
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleNameMapper: {
    "@/(.*)$": "<rootDir>/src/$1",
  },
  moduleDirectories: ["node_modules", "src"],
  modulePathIgnorePatterns: ["<rootDir>/dist"],
};
export default config;
