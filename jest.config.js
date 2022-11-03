const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

/** @type {import('jest').Config} */
const customJestConfig = {
  moduleDirectories: ['node_modules'],
  testEnvironment: 'jest-environment-jsdom',
  coverageReporters: ['json-summary'],
  collectCoverageFrom: ['./pages/**', './lib/**', './components/**']
}

module.exports = createJestConfig(customJestConfig)