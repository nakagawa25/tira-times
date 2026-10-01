module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  ignorePatterns: ['dist/', '.astro/', 'node_modules/'],
  overrides: [
    {
      // Astro's own generated ambient-types file; the triple-slash reference
      // here is Astro's required pattern, not something we authored.
      files: ['src/env.d.ts'],
      rules: { '@typescript-eslint/triple-slash-reference': 'off' },
    },
  ],
};
