import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import lingui from 'eslint-plugin-lingui'
import reactHooks from 'eslint-plugin-react-hooks'
import storybook from 'eslint-plugin-storybook'
import globals from 'globals'
import tseslint from 'typescript-eslint'

/**
 * The gate that makes two project rules mechanical rather than aspirational:
 * every user-facing string goes through lingui, and there are no TypeScript
 * escape hatches.
 *
 * `--max-warnings 0` in the lint script means a warning is a failure, so a rule
 * set to warn is not a softer rule, it is the same rule with a different word.
 */
export default defineConfig(
  {
    // `src/gate-fixtures` holds files that are SUPPOSED to fail, so an ordinary
    // run ignores them. `agent/scripts/verify/KN-003.mjs` lints them with
    // --no-ignore and requires the failure, which is how the gate is shown to
    // work rather than assumed to.
    ignores: ['dist', 'storybook-static', 'coverage', 'playwright-report', 'test-results', 'src/gate-fixtures/**', '!.storybook'],
  },

  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    languageOptions: {
      ecmaVersion: 2023,
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        // eslint.config.js is not in the tsconfig and cannot be: it is the file
        // that configures the linter. allowDefaultProject gives it types without
        // putting the build's own config inside the build.
        projectService: { allowDefaultProject: ['eslint.config.js'] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,

      // No escape hatches. `as` that forces a mismatch, ts-ignore, ts-expect-error
      // and any are all defects, and they are defects because every one of them
      // is a place where the type system was told to stop checking.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-expect-error': true, 'ts-ignore': true, 'ts-nocheck': true, 'ts-check': false }],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],

      // Unused code is a defect rather than a warning: it is either a mistake or
      // a leftover, and both are worth a build failure while they are small.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      // A number in a template literal is how every CSS length in this codebase
      // is written, `${lineHeight}px`. The rule's default forbids it to catch
      // accidental `[object Object]`, which objects and arrays still are.
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },

  {
    // The rule that makes "every user-facing string goes through lingui" a
    // build failure rather than a habit.
    //
    // Scoped to source, and NOT to the catalogs or the tests. A catalog file IS
    // the translations, so every literal in it is the point; a test asserts on
    // rendered output, so its literals are the expected values. Excluding them
    // is not a softening: including them would force `t` around data and around
    // assertions, which teaches people to reach for the escape hatch.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/i18n/locales/**', 'src/**/*.test.{ts,tsx}'],
    plugins: { lingui },
    rules: {
      'lingui/no-unlocalized-strings': [
        'error',
        {
          // Anything with no letter in it cannot be a sentence: css values,
          // numbers, punctuation, and the token names that are identifiers.
          ignore: ['^[^\\p{L}]*$', '^[a-z-]+/[a-z0-9-/]+$', '^(rtl|ltr|fa-IR|en-US)$'],
          ignoreNames: [
            {
              regex: {
                pattern:
                  '^(id|key|data-testid|className|variant|color|component|role|dir|lang|type|name|sx|to|href|title|icon|provider|family|direction|locale|aria-[a-z]+' +
                  // CSS values are not user-facing text and the rule cannot tell
                  // the difference, so the properties that hold them are named.
                  '|boxShadow|fontFamily|lineHeight|letterSpacing|fontSize|card|modal)$',
              },
            },
          ],
          // Developer-facing text, not user-facing. An Error thrown at mount
          // because index.html has no #root is read by whoever broke the build,
          // never by a job seeker.
          ignoreFunctions: [
            // Developer-facing text, not user-facing. An Error thrown at mount
            // because index.html has no #root is read by whoever broke the
            // build, never by a job seeker.
            'Error',
            'console.*',
            'setAttribute',
            '*.setAttribute',
            'document.*',
            // A story's play function is a test, and the literal it passes to a
            // query or an assertion IS the expected rendered output. Wrapping it
            // in `t` would assert that the translation of the expectation equals
            // the translation of the value, which is a test that cannot fail.
            '*.getByText',
            '*.getByRole',
            '*.getByLabelText',
            '*.getByTestId',
            '*.getByPlaceholderText',
            '*.findByText',
            '*.findByRole',
            '*.queryByText',
            '*.toHaveTextContent',
            '*.toHaveAttribute',
            '*.toHaveAccessibleName',
          ],
          useTsTypes: true,
        },
      ],
      'lingui/t-call-in-function': 'error',
      'lingui/no-single-variables-to-translate': 'error',
      'lingui/no-trans-inside-trans': 'error',
    },
  },

  {
    files: ['**/*.stories.tsx', '.storybook/**/*.{ts,tsx}'],
    plugins: { storybook },
    rules: { ...storybook.configs['flat/recommended'].at(-1)?.rules },
  },

  {
    // Configuration and tooling files are not shipped to a user, so the string
    // rule does not apply and the type-aware rules run against the tsconfig that
    // includes them.
    files: ['*.config.ts', '*.config.js', 'e2e/**/*.ts'],
    rules: { '@typescript-eslint/no-unsafe-assignment': 'off' },
  },
)
