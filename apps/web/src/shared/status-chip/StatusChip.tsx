import { Box } from '@mui/material'
import { spacing, type as typeScale, type StatusToken } from '../../theme/tokens'

// The props are documented in story-docs, not here, KN-207.
export interface StatusChipProps {
  status: StatusToken
  label: string
  size?: 'S' | 'M'
}

// Heights from node 82:2, where no variable is bound to them: S everywhere, M
// only in the kanban column header.
const HEIGHT = { S: 24, M: 28 } as const

// S draws the label role. M draws body's size and line height with label's
// weight and tracking: the file binds no text style to it, and DESIGN.md allows
// no sixth role, so it is composed from the two it takes from.
const TEXT = {
  S: typeScale.label,
  M: { ...typeScale.body, weight: typeScale.label.weight, letterSpacing: typeScale.label.letterSpacing },
} as const

// Node 82:2. Display only: no role, no tabindex, no handler, so it can sit on
// every card and column header without a focus ring on each. The clickable
// version is the Status Control, a separate wrapper. The label is record data:
// a user can rename any status, so it arrives already in their words.
export const StatusChip = ({ status, label, size = 'S' }: StatusChipProps) => {
  const text = TEXT[size]
  return (
    <Box
      component="span"
      sx={(theme) => ({
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        height: HEIGHT[size],
        paddingInline: `${spacing.xs}px`,
        borderRadius: `${theme.karnama.radius.full}px`,
        backgroundColor: theme.karnama.status[status].container,
        color: theme.karnama.status[status].base,
        fontSize: `${text.size}px`,
        lineHeight: `${text.lineHeight}px`,
        fontWeight: text.weight,
        letterSpacing: `${text.letterSpacing}px`,
        whiteSpace: 'nowrap',
      })}
    >
      {label}
    </Box>
  )
}
