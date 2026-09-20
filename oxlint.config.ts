import { defineConfig } from 'oxlint';

export default defineConfig({
  plugins: [
    'eslint',
    'typescript',
    'import',
    'jsdoc',
    'unicorn',
    'vitest',
    'promise',
    'node',
    'oxc',
  ],
  categories: {
    correctness: 'error',
    perf: 'error',
  },
  options: {
    typeAware: true,
    typeCheck: true,
    reportUnusedDisableDirectives: 'warn',
  },
});
