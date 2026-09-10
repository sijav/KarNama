import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { useTheme } from '@mui/material/styles'
import type { StoryMeta } from '../shared/story-docs/story-meta'
import { radius, spacing, type as typeScale } from './tokens'

interface SwatchesProps {
  /** Which token family to render. Drives the canvas from the Controls panel. */
  family: 'semantic' | 'status' | 'spacing' | 'radius' | 'type'
}

const Swatches = ({ family }: SwatchesProps) => {
  // Read from the THEME, not from the token module, so the Theme toolbar
  // actually changes what this page shows. Reading `tokens.ts` directly meant
  // the swatches went on displaying the light hexes on a dark page: a
  // Foundations page that disagrees with the app it documents.
  const theme = useTheme()
  const semantic = theme.karnama.semantic
  const status = theme.karnama.status

  if (family === 'semantic') {
    return (
      <Stack spacing={2} data-testid="swatches">
        {Object.entries(semantic).map(([name, hex]) => (
          <Stack key={name} direction="row" spacing={3} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 40, height: 40, bgcolor: hex, borderRadius: 1, border: 1, borderColor: 'divider' }} />
            <Typography variant="body1">{name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {hex}
            </Typography>
          </Stack>
        ))}
      </Stack>
    )
  }
  if (family === 'status') {
    return (
      <Stack spacing={2} data-testid="swatches">
        {Object.entries(status).map(([name, pair]) => (
          <Stack key={name} direction="row" spacing={3} sx={{ alignItems: 'center' }}>
            <Box sx={{ px: 3, py: 1, bgcolor: pair.container, color: pair.base, borderRadius: 999 }}>
              <Typography variant="caption">{name}</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {pair.base} / {pair.container}
            </Typography>
          </Stack>
        ))}
      </Stack>
    )
  }
  if (family === 'type') {
    return (
      <Stack spacing={2} data-testid="swatches">
        {Object.entries(typeScale).map(([name, role]) => (
          <Typography key={name} sx={{ fontSize: role.size, lineHeight: `${role.lineHeight}px`, fontWeight: role.weight }}>
            {name} {role.size}/{role.lineHeight}
          </Typography>
        ))}
      </Stack>
    )
  }
  const scale = family === 'spacing' ? spacing : radius
  return (
    <Stack spacing={2} data-testid="swatches">
      {Object.entries(scale).map(([name, value]) => (
        <Stack key={name} direction="row" spacing={3} sx={{ alignItems: 'center' }}>
          <Box sx={{ width: Math.min(value, 120), height: 16, bgcolor: 'primary.main', borderRadius: family === 'radius' ? `${value}px` : 0 }} />
          <Typography variant="caption">
            {name} {value}
          </Typography>
        </Stack>
      ))}
    </Stack>
  )
}

/**
 * The token set, rendered. Not a product component: this is the Foundations
 * page, and it exists so a value that drifts from `DESIGN.md` is visible rather
 * than only assertable.
 */
const meta = {
  title: 'Foundations/Tokens',
  component: Swatches,
  args: { family: 'semantic' },
  argTypes: {
    family: { control: 'inline-radio', options: ['semantic', 'status', 'spacing', 'radius', 'type'] },
  },
} satisfies StoryMeta<typeof Swatches>

export default meta
type Story = StoryObj<typeof meta>

export const Semantic: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByTestId('swatches')).toBeInTheDocument()
    await expect(canvas.getByText('bg/brand/default')).toBeInTheDocument()
  },
}

export const Status: Story = {
  args: { family: 'status' },
  play: async ({ canvasElement }) => {
    // Nine statuses: five defaults and four reserved for user-defined ones. A
    // tenth would mean the closed set was reopened somewhere.
    await expect(within(canvasElement).getByTestId('swatches').children).toHaveLength(9)
  },
}

export const Spacing: Story = { args: { family: 'spacing' } }

export const Radius: Story = { args: { family: 'radius' } }

export const Type: Story = {
  args: { family: 'type' },
  play: async ({ canvasElement }) => {
    // Five roles and only five. Body/Small at 13 was deleted from the design.
    await expect(within(canvasElement).getByTestId('swatches').children).toHaveLength(5)
  },
}
