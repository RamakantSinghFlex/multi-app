const { rules } = require("eslint-config-prettier");

module.exports = {
  root: true,
  extends: ['next'],
  rules: {
    'no-unused-vars': 'warn',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'import/no-anonymous-default-export': 'off',
    // 'import/prefer-default-export': 'off',
    // 'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
    ...rules,
  },
  ignorePatterns: [
    'node_modules/', // Ignore node_modules
    'dist/',         // Ignore build output
    '.next/',        // Ignore Next.js build folder
    'coverage/',     // Ignore test coverage reports
  ],
}