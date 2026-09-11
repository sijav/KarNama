import { useLingui } from '@lingui/react'
import { Box, Dialog } from '@mui/material'
import { useId, type ReactNode } from 'react'
import { iconSize, spacing, type as typeScale } from '../../theme/tokens'
import { IconButton } from '../icon-button'

// The props are documented in story-docs, not here, KN-207.
export interface PanelModalProps {
  open: boolean
  title: string
  width: number
  onClose: () => void
  children: ReactNode
  actions: ReactNode
  aside?: ReactNode
}

// The dissolve of section 7 and the file's one pixel divider, as the shell's.
const DISSOLVE_MS = 150
const EDGE = 1
const CLOSE_OVERHANG = (spacing.xl - iconSize.md) / 2

// A divider across the whole panel, edge to edge, as 270:152 draws it.
const Divider = () => (
  <Box
    component="hr"
    sx={(theme) => ({
      margin: 0,
      border: 0,
      flexShrink: 0,
      height: `${EDGE}px`,
      backgroundColor: theme.karnama.semantic['border/default'],
    })}
  />
)

// The panel modal of the Contact Modal, 270:152, and the Job Modal, 210:276,
// on MUI's Dialog, with everything the shell does for focus, Escape and the
// scrim. Where the shell pads the whole modal, the panel lays its dividers edge
// to edge: the header, 24 above and at the sides and 16 below, then the body in
// 24, then the footer in 16 and 24. The actions sit at the inline end; with an
// aside, the Edit mode's delete, the actions move to the inline start and the
// aside takes the end, as the file's Edit mode draws them.
export const PanelModal = ({ open, title, width, onClose, children, actions, aside }: PanelModalProps) => {
  const { i18n } = useLingui()
  const titleId = useId()
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby={titleId}
      transitionDuration={DISSOLVE_MS}
      slotProps={{
        backdrop: { sx: (theme) => ({ backgroundColor: theme.karnama.semantic['overlay/scrim'] }) },
        paper: {
          sx: (theme) => ({
            boxSizing: 'border-box',
            width,
            maxWidth: `calc(100% - ${2 * spacing.md}px)`,
            margin: `${spacing.md}px`,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: `${theme.karnama.radius.lg}px`,
            backgroundColor: theme.karnama.semantic['bg/surface'],
            backgroundImage: 'none',
            boxShadow: theme.karnama.elevation.modal,
          }),
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: `${spacing.sm}px`,
          paddingTop: `${spacing.lg}px`,
          paddingInline: `${spacing.lg}px`,
          paddingBottom: `${spacing.md}px`,
        }}
      >
        <Box
          component="h2"
          id={titleId}
          sx={(theme) => ({
            margin: 0,
            fontSize: `${typeScale['heading/m'].size}px`,
            lineHeight: `${typeScale['heading/m'].lineHeight}px`,
            fontWeight: typeScale['heading/m'].weight,
            color: theme.karnama.semantic['text/primary'],
          })}
        >
          {title}
        </Box>
        <Box sx={{ display: 'inline-flex', flexShrink: 0, margin: `-${CLOSE_OVERHANG}px` }}>
          <IconButton icon="x" iconSize="md" aria-label={i18n._('Close')} onClick={onClose} />
        </Box>
      </Box>
      <Divider />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing.md}px`, padding: `${spacing.lg}px`, overflowY: 'auto' }}>
        {children}
      </Box>
      <Divider />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: aside === undefined ? 'flex-end' : 'space-between',
          gap: `${spacing.sm}px`,
          paddingBlock: `${spacing.md}px`,
          paddingInline: `${spacing.lg}px`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.sm}px` }}>{actions}</Box>
        {aside}
      </Box>
    </Dialog>
  )
}
