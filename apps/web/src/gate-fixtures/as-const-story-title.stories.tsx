import { Box } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react-vite'

// A story's meta title written 'as const', on purpose. It skips lingui's rule
// and, with a plain Meta, the StoryMeta type that holds titles to the sidebar's
// paths, KN-095; the restricted-syntax rule must reject it, KN-217. Storybook's
// glob excludes this directory, so it is linted and never indexed.
const Probe = () => <Box />

const meta = {
  title: 'Delete this application' as const,
  component: Probe,
} satisfies Meta<typeof Probe>

export default meta
export const Example: StoryObj<typeof meta> = {}
