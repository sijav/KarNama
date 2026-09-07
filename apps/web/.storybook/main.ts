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
}

export default config
