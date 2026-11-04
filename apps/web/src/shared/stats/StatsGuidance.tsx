import { Box } from '@mui/material'
import { spacing, type as typeScale } from '../../theme/tokens'
import { Button } from '../button'

// The props are documented in story-docs, not here, KN-207.
export interface StatsGuidanceAction {
  label: string
  onClick: () => void
}

export interface StatsGuidanceProps {
  message: string
  action?: StatsGuidanceAction
}

const { body } = typeScale

// Stats / Guidance, node 1168:3170: a message at the top of the Stats page,
// made by a fixed rule from the reader's own data, at most two of them, which
// the page decides. A row of bg/brand/container at radius md, 12 above and
// below, 16 at the sides and 16 between, its items centred, filling the page's
// width: the message in Body in text/primary from the inline start, filling
// the row and wrapping, and at the inline end its action, a Secondary S with
// no fill of its own, so the ground shows through it. The file always draws
// the action; without one the message fills the row.
export const StatsGuidance = ({ message, action }: StatsGuidanceProps) => (
  <Box
    sx={(theme) => ({
      boxSizing: 'border-box',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: `${spacing.md}px`,
      paddingBlock: `${spacing.sm}px`,
      paddingInline: `${spacing.md}px`,
      borderRadius: `${theme.karnama.radius.md}px`,
      backgroundColor: theme.karnama.semantic['bg/brand/container'],
    })}
  >
    <Box
      component="p"
      sx={(theme) => ({
        flex: '1 1 auto',
        minWidth: 0,
        margin: 0,
        fontSize: `${body.size}px`,
        lineHeight: `${body.lineHeight}px`,
        fontWeight: body.weight,
        letterSpacing: `${body.letterSpacing}px`,
        color: theme.karnama.semantic['text/primary'],
      })}
    >
      {message}
    </Box>
    {action === undefined ? null : (
      <Box sx={{ display: 'flex', flexShrink: 0 }}>
        <Button variant="secondary" size="S" onClick={action.onClick}>
          {action.label}
        </Button>
      </Box>
    )}
  </Box>
)
