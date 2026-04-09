// jest.config.js - Testing framework configuration
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'services/**/*.js',
    '!services/**/node_modules/**',
    '!services/**/*.test.js',
    '!services/**/server.js'
  ],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30
    }
  },
  testPaths: ['<rootDir>/tests/**/*.test.js'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  testTimeout: 10000
};
