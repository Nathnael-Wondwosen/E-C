// .eslintrc.js - Enforce code quality standards
module.exports = {
  env: {
    browser: true,
    node: true,
    es2020: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'warn',
    'eqeqeq': ['error', 'always'],
    'indent': ['error', 2],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'space-before-function-paren': ['error', 'always'],
    'no-async-promise-executor': 'error',
    'no-promise-executor-return': 'error'
  },
  overrides: [
    {
      files: ['**/*.test.js'],
      env: {
        jest: true
      }
    }
  ]
};
