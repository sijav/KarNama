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

/**
 * The options for `lingui/no-unlocalized-strings`, in one place because ESLint
 * REPLACES rule options rather than merging them. A later block that wants one
 * more exemption has to restate all of them, and a block that restates them by
 * hand drops the rest silently: the old stories block did exactly that and
 * quietly removed every ignore the src block had.
 *
 * `structuralProps` is the whole idea of the list. A prop whose value is an
 * identifier, a css value or a routing target is not copy. A prop whose value is
 * read by a person is copy, and `title` and `aria-*` are the second kind, which
 * is what KN-087 is about.
 */
const structuralProps =
  'id|key|data-testid|className|variant|color|component|role|dir|lang|type|name|sx|to|href|icon|provider|family|direction|locale' +
  // CSS values are not user-facing text and the rule cannot tell the
  // difference, so the properties that hold them are named.
  '|boxShadow|fontFamily|lineHeight|letterSpacing|fontSize|card|modal' +
  // A localStorage key is an identifier the browser stores things under, not
  // text anyone reads. Named, not pattern-matched, so one key does not exempt
  // every dotted string in the codebase.
  '|STORAGE_KEY'

const linguiOptions = {
  ignore: [
    // Anything with no letter in it cannot be a sentence: css values, numbers
    // and punctuation.
    '^[^\\p{L}]*$',
    '^(rtl|ltr|fa-IR|en-US)$',
    // A Storybook preview-channel event name. An API string the docs page
    // subscribes to, not something a person reads.
    '^globalsUpdated$',
    // The two section headings of the story-docs markdown format, matched while
    // PARSING a file. Named rather than shape-matched, so this exempts the
    // parser's comparison and not every occurrence of the words.
    '^(props|stories)$',
    // A CSS media query is an API string, not copy. Written out in full rather
    // than as a wildcard for anything in brackets, because the point of this
    // list is that each entry names one thing.
    '^\\(prefers-color-scheme: (dark|light)\\)$',
    // A shape-based exemption for Storybook paths used to live here,
    // `^[A-Z][A-Za-z]*(/[A-Z][A-Za-z ]*)+$`, and it reopened the exact hole
    // KN-087 closed: `New/Applied` matches it, so `aria-label="New/Applied"`
    // and `title="New/Applied"` both passed. Status-transition copy looks like
    // a path. A story title is exempted by its TYPE instead: see the note where
    // the stories block used to be, below.
    //
    // The lower-case version of the same mistake used to live here too,
    // `^[a-z-]+/[a-z0-9-/]+$`, added so a token name rendered as a label,
    // `bg/page`, would pass. It matched `delete/application` just as happily,
    // in `aria-label` and in `title`, which is the third route into the hole
    // KN-087 closed twice. It is not narrowed, it is GONE: nothing in `src`
    // needs it. The Foundations page reads its labels out of the token objects
    // with `Object.entries`, so they are data rather than literals, and the one
    // literal token name left is inside a `getByText` query, exempt as a test
    // assertion. An exemption is a hole; an exemption nothing uses is a hole
    // for nothing.
  ],
  ignoreNames: [{ regex: { pattern: `^(${structuralProps})$` } }],
  ignoreFunctions: [
    // Developer-facing text, not user-facing. An Error thrown at mount because
    // index.html has no #root is read by whoever broke the build, never by a
    // job seeker.
    'Error',
    'console.*',
    // `setAttribute` and `*.setAttribute` used to be here, so
    // `el.setAttribute('aria-label', 'Delete this application')` passed: the
    // same untranslated accessible name the prop-level rule rejects, reached
    // through a method call. AppProviders assigns `documentElement.dir` and
    // `.lang` as properties instead, so nothing needs the exemption.
    //
    // A story's play function is a test, and the literal it passes to a query
    // or an assertion IS the expected rendered output. Wrapping it in `t` would
    // assert that the translation of the expectation equals the translation of
    // the value, which is a test that cannot fail.
    '*.getByText',
    '*.getByRole',
    '*.getByLabelText',
    '*.getByTestId',
    '*.getByPlaceholderText',
    '*.findByText',
    '*.findByRole',
    '*.queryByText',
    // `queryByRole` was missing while `findByRole` and `queryByText` were here,
    // which is the sort of gap a list of names grows: it is the same helper
    // asking the same question, in the negative.
    '*.queryByRole',
    '*.toHaveTextContent',
    '*.toHaveAttribute',
    '*.toHaveAccessibleName',
    // Asserts a COMPUTED CSS value, so the literal is a CSS keyword such as
    // `none` or `solid`. Those are API values, not copy: there is no Persian
    // for `pointer-events: none` and translating it would break the assertion
    // rather than localise anything.
    '*.toHaveProperty',
    // A key descriptor, not copy. `userEvent.keyboard('{Enter}')` names a key
    // the way testing-library spells it; there is no Persian for Enter and
    // translating it would break the test rather than localise anything.
    // Listed as a function rather than as a pattern over braces, so it exempts
    // this one call and not every string that happens to contain them.
    '*.keyboard',
  ],
  useTsTypes: true,
}

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
      'lingui/no-unlocalized-strings': ['error', linguiOptions],
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

  // There is deliberately NO stories-only lingui block any more. Stories are in
  // `src`, so the block above lints them exactly as it lints a screen, and that
  // is the point: a story renders the same components a screen does, and its
  // JSX is not metadata.
  //
  // The block that used to be here added `title` to the exempt names so a meta
  // could carry its sidebar path, `App/Shell`. ESLint matches a NAME wherever it
  // appears, so it also exempted `<Box title="Delete this application" />`
  // inside a story, and every string nested anywhere under a `title` property.
  // KN-095. A meta title is exempt by TYPE now: `StoryMeta` narrows it to the
  // union of registered story paths in `src/shared/story-docs/story-meta.ts`,
  // and `useTsTypes` skips a literal typed as a union of string literals.
  // Nothing else in a story has that type, so nothing else is skipped.
  //
  // `.storybook/**` stays out of lingui entirely: it is build configuration for
  // a developer tool, and its toolbar labels never reach a user.

  {
    // Configuration and tooling files are not shipped to a user, so the string
    // rule does not apply and the type-aware rules run against the tsconfig that
    // includes them.
    files: ['*.config.ts', '*.config.js', 'e2e/**/*.ts'],
    rules: { '@typescript-eslint/no-unsafe-assignment': 'off' },
  },
)
