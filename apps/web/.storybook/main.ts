import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: { name: '@storybook/react-vite', options: {} },
  // Documentation prose lives in markdown under story-docs, never as JSDoc in a
  // .tsx, so autodocs pulls its page from an .mdx sitting beside the component
  // rather than from comments the type checker also reads.
  docs: { defaultName: 'Docs' },
  typescript: { reactDocgen: 'react-docgen-typescript' },
  // Storybook is published BESIDE the app, at `/KarNama/storybook/`, not inside
  // it. It needs its own base for the same reason the app does: every asset is
  // requested relative to it, so a wrong base 404s the whole page in production
  // while the dev server, served from `/`, looks perfectly fine. That is the
  // deploy failure that is invisible until it ships.
  //
  // Storybook does not inherit `base` from `vite.config.ts`, so it is set here
  // rather than assumed.
  // Returned unchanged when the variable is unset, rather than spreading an
  // `undefined` base over it: `exactOptionalPropertyTypes` rejects that, and it
  // is the honest shape anyway — there is no override, so do not override.
  viteFinal: (config) => {
    const base = process.env.KARNAMA_STORYBOOK_BASE
    return base === undefined ? config : { ...config, base }
  },
}

export default config
