import { Box } from '@mui/material'
import { spacing, type as typeScale } from '../../theme/tokens'
import { Button } from '../button'

// The props are documented in story-docs, not here, KN-207.
export interface EmptyStateProps {
  title: string
  body: string
  actionLabel: string
  onAction: () => void
}

// Node 159:80's measures that bind no variable: the round mark, 64 across, and
// the body's fixed width, 220. The title hugs its line and may be the wider,
// as the Contacts screen's is at 236, 305:2266.
const MARK = 64
const BODY_WIDTH = 220

// The title binds no text style: 16 at SemiBold on the file's automatic line
// height. It is composed from the roles, as the Status Chip's M is, Title's size
// and line height with Heading/M's weight, DESIGN.md.
const TITLE = { size: typeScale.title.size, lineHeight: typeScale.title.lineHeight, weight: typeScale['heading/m'].weight }

// The Empty State of node 159:80: a round mark, the title, the body and the
// primary action that starts the list's first item, each 12 apart, with the
// file's 8 pixel spacer frame and a second gap of 12 above the action. The
// screens use it for the job list, the contacts and a search with no result,
// each with its own copy, which arrives translated from the caller.
export const EmptyState = ({ title, body, actionLabel, onAction }: EmptyStateProps) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: `${spacing.sm}px`,
      boxSizing: 'border-box',
      width: 'fit-content',
      maxWidth: '100%',
      padding: `${spacing.xl}px`,
      textAlign: 'center',
    }}
  >
    <Box
      aria-hidden
      sx={(theme) => ({
        flexShrink: 0,
        width: MARK,
        height: MARK,
        borderRadius: `${theme.karnama.radius.full}px`,
        backgroundColor: theme.karnama.semantic['bg/surface-secondary'],
      })}
    />
    <Box
      component="h2"
      sx={(theme) => ({
        margin: 0,
        fontSize: `${TITLE.size}px`,
        lineHeight: `${TITLE.lineHeight}px`,
        fontWeight: TITLE.weight,
        color: theme.karnama.semantic['text/primary'],
      })}
    >
      {title}
    </Box>
    <Box
      component="p"
      sx={(theme) => ({
        margin: 0,
        width: BODY_WIDTH,
        maxWidth: '100%',
        fontSize: `${typeScale.body.size}px`,
        lineHeight: `${typeScale.body.lineHeight}px`,
        fontWeight: typeScale.body.weight,
        letterSpacing: typeScale.body.letterSpacing,
        color: theme.karnama.semantic['text/secondary'],
      })}
    >
      {body}
    </Box>
    {/* The spacer frame's 8 and the gap after it, so the action sits 32 below the body. */}
    <Box sx={{ marginTop: `${spacing.xs + spacing.sm}px` }}>
      <Button onClick={onAction}>{actionLabel}</Button>
    </Box>
  </Box>
)
