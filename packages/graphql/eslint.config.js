import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

/**
 * The same standard as the other workspaces, minus everything that only makes
 * sense where there is a user or a server.
 *
 * `src/generated.ts` is NOT linted. It is machine output compared byte for byte
 * against a fresh generation, so a lint rule that wants it different would put
 * the formatter and the checker in permanent disagreement. Whether it is
 * generated rather than written is checked by a test instead.
 */
export default defineConfig(
  { ignores: ['coverage', 'src/generated.ts'] },

  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    languageOptions: {
      ecmaVersion: 2023,
      globals: { ...globals.node },
      parserOptions: {
        projectService: { allowDefaultProject: ['eslint.config.js', 'scripts/check-generated.mjs'] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-expect-error': true, 'ts-ignore': true, 'ts-nocheck': true, 'ts-check': false }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
)
