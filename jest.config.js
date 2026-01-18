export default {
  // Use Node environment for backend tests
  testEnvironment: "node",

  // Support ES modules
  transform: {},

  // Test file patterns
  testMatch: ["**/tests/**/*.test.js", "**/?(*.)+(spec|test).js"],

  // Coverage configuration
  collectCoverageFrom: [
    "helpers/**/*.js",
    "controllers/**/*.js",
    "!**/node_modules/**",
    "!**/tests/**",
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Verbose output
  verbose: true,

  // Module paths
  moduleDirectories: ["node_modules", "<rootDir>"],

  // Setup files
  setupFilesAfterEnv: [],

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true,
};
