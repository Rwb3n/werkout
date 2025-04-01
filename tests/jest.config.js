module.exports = {
  // The root directory where Jest should scan for test files
  rootDir: '../',

  // The test environment
  testEnvironment: 'node',

  // The file extensions Jest will look for
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],

  // A list of paths to directories that Jest should use to search for files in
  roots: ['<rootDir>/tests/'],

  // The pattern Jest uses to detect test files
  testMatch: ['**/__tests__/**/*.js?(x)', '**/?(*.)+(spec|test).js?(x)'],

  // A list of paths to modules that run before each test
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],

  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: '<rootDir>/tests/coverage',

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    '<rootDir>/src/backend/src/**/*.js',
    '<rootDir>/src/frontend/**/*.js',
    '!<rootDir>/src/frontend/pages/_app.js',
    '!<rootDir>/src/frontend/pages/_document.js',
    '!<rootDir>/node_modules/**'
  ],

  // The test coverage threshold
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Skip coverage for these files
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/'
  ]
}; 