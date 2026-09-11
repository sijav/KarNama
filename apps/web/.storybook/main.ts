import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  // `src/gate-fixtures` is excluded. It holds a story that is SUPPOSED to fail
  // the lint, KN-095, and it borrows a real title to prove a registered title
  // still passes, so indexing it would put a second `App/Shell` in the sidebar
  // and run a probe as if it were a component. No MDX: no lint block reads an
  // .mdx, so a story written in one would carry copy nothing checks, and the
  // docs pages are built from story-docs markdown instead, KN-097.
  stories: ['../src/!(gate-fixtures)/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: { name: '@storybook/react-vite', options: {} },
  // Documentation prose lives in markdown under story-docs, never as JSDoc in a
  // .tsx: the preview's own Docs page reads it, KN-207, rather than comments
  // the type checker also reads or an .mdx no lint block covers.
  docs: { defaultName: 'Docs' },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    // Storybook's own defaults, restated because giving ANY option replaces the
    // whole object, and dropping `propFilter` would fill every Controls table
    // with the DOM's props. Plus the one that matters here, KN-229: props are
    // documented in story-docs rather than JSDoc, and react-docgen hides an
    // undocumented `children` by default, so the Tooltip's Controls table lost
    // its type and its required flag. The story-docs guard sets the same rule.
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) => !prop.parent?.fileName.includes('node_modules'),
      skipChildrenPropWithoutDoc: false,
    },
  },
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
