import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import type { StoryMeta } from '../shared/story-docs/story-meta'

// A story whose JSX carries a bare tooltip, on purpose, beside a meta title that
// must still pass.
//
// The stories block of the lint config used to exempt the NAME `title`, so a
// meta could carry its sidebar path. ESLint matches a name wherever it appears,
// so the tooltip below passed too, and it is a real tooltip rendered by a real
// component. The meta title is exempt by TYPE now, through `StoryMeta`, and this
// file is named `.stories.tsx` so that any stories-only block anyone adds later
// applies to it. Excluded from Storybook in `.storybook/main.ts`. See README.md.
const TitledBox = () => <Box title="Delete this application" />

const meta = {
  title: 'App/Shell',
  component: TitledBox,
} satisfies StoryMeta<typeof TitledBox>

export default meta

export const Probe: StoryObj<typeof meta> = {}
