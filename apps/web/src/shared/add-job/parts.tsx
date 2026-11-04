import { Box, InputBase } from '@mui/material'
import type { ReactNode } from 'react'
import { spacing, type as typeScale } from '../../theme/tokens'
import { Icon, type IconName } from '../icon'

// The file's one pixel edge, and the Input's two of border/focus while focused.
const EDGE = 1
const FOCUS_EDGE = 2

// A field of several lines without a label of its own, the description's and
// the note's: 12 above and below and 16 at the sides, one pixel of
// border/default inside, two of border/focus while it has focus, as the
// Input's. Named by the heading or tab it sits under. It grows from its rows,
// two unless asked, or holds a height and scrolls inside it.
export const JobArea = ({
  label,
  value,
  onChange,
  height,
  minRows = 2,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  height?: number
  minRows?: number
  placeholder?: string
}) => (
  <InputBase
    multiline
    {...(height === undefined ? { minRows } : { rows: 1 })}
    value={value}
    {...(placeholder === undefined ? {} : { placeholder })}
    onChange={(event) => {
      onChange(event.target.value)
    }}
    inputProps={{ 'aria-label': label }}
    sx={(theme) => ({
      position: 'relative',
      width: '100%',
      boxSizing: 'border-box',
      alignItems: 'flex-start',
      paddingBlock: `${spacing.sm}px`,
      paddingInline: `${spacing.md}px`,
      borderRadius: `${theme.karnama.radius.md}px`,
      backgroundColor: theme.karnama.semantic['bg/surface'],
      color: theme.karnama.semantic['text/primary'],
      fontSize: `${typeScale.body.size}px`,
      lineHeight: `${typeScale.body.lineHeight}px`,
      '& textarea': { padding: 0, resize: 'none' },
      '& textarea::placeholder': { color: theme.karnama.semantic['text/secondary'], opacity: 1 },
      ...(height === undefined ? {} : { height, '& textarea': { padding: 0, resize: 'none', height: '100%', overflowY: 'auto' } }),
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        borderStyle: 'solid',
        borderWidth: EDGE,
        borderColor: theme.karnama.semantic['border/default'],
        pointerEvents: 'none',
      },
      '&.Mui-focused::before': { borderWidth: FOCUS_EDGE, borderColor: theme.karnama.semantic['border/focus'] },
    })}
  />
)

// A part of a job opportunity's details under its heading, the Info tab's
// 210:56 and the add form's description, 1262:97379: a 16 icon in
// text/secondary and the title at 14 and SemiBold, 8 above what it heads.
export const JobPart = ({ icon, title, children }: { icon: IconName; title: string; children: ReactNode }) => (
  <Box component="section" sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing.xs}px` }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.xs}px` }}>
      <Icon name={icon} size="sm" />
      <Box
        component="h3"
        sx={(theme) => ({
          margin: 0,
          fontSize: `${typeScale.body.size}px`,
          lineHeight: `${typeScale.body.lineHeight}px`,
          fontWeight: typeScale['heading/m'].weight,
          color: theme.karnama.semantic['text/primary'],
        })}
      >
        {title}
      </Box>
    </Box>
    {children}
  </Box>
)
