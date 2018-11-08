module.exports = {
  roots: ["<rootDir>/src", "<rootDir>/__tests__"],
  globals: {
    "ts-jest": { tsConfigFile: "tsconfig.json" }
  },
  transform: { "^.+\\.ts$": "ts-jest" },
  testEnvironment: "node",
  testMatch: ["**/__tests__/*.+(ts|js)"],
  moduleFileExtensions: ["ts", "js"],
  collectCoverage: true,
  coveragePathIgnorePatterns: ["(__tests__/.*.mock).(jsx?|tsx?)$"],
  verbose: true
};
