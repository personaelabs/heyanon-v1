const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

//@dev: using moduleNameMapper for using CJS module instead of ES

/** @type {import('jest').Config} */
const customJestConfig = {
  moduleDirectories: ["<rootDir>/node_modules/"],
  testEnvironment: "jest-environment-jsdom",
  coverageReporters: ["json-summary"],
  collectCoverageFrom: ["./pages/**", "./lib/**", "./components/**"],
  moduleNameMapper: {
    axios: "<rootDir>/node_modules/axios/dist/node/axios.cjs",
  },
  setupFiles: ["<rootDir>/jest/setup.ts"],
};
module.exports = createJestConfig(customJestConfig);
