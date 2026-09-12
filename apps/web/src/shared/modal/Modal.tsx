import { useLingui } from '@lingui/react'
import { Box, Dialog, type Theme } from '@mui/material'
import { useId, type ReactNode } from 'react'
import { iconSize, spacing, type as typeScale } from '../../theme/tokens'
import { IconButton } from '../icon-button'

// The props are documented in story-docs, not here, KN-207.
export interface ModalProps {
  open: boolean
  title: string
  width: number
  onClose: () => void
  children: ReactNode
  actions: ReactNode
  /** Said once it has finished closing, after focus has been restored. */
  onClosed?: () => void
}

// A modal opens and closes with a dissolve of 150 ms, the prototype map's
// motion, DESIGN.md section 7. The edge of a divider is the file's one pixel.
export const DISSOLVE_MS = 150
const EDGE = 1

// The close is the Icon Button, a 32 square round the file's 20 x; it gives the
// difference back with a negative margin, so the x sits at the header's inline
// end and the header keeps the title's 28.
const CLOSE_OVERHANG = (spacing.xl - iconSize.md) / 2

// A divider, one pixel of border/default across the modal.
export const ModalDivider = () => (
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

// The shell's paper: bg/surface, radius lg, Elevation/Modal, 24 of padding and
// 16 between the parts, the caller's width, and 16 from the screen's edges
// where the screen is narrower. Under an sx key, which the lint rule reads as CSS.
export const modalPaper = {
  sx: (theme: Theme, width: number) =>
    ({
      boxSizing: 'border-box',
      width,
      maxWidth: `calc(100% - ${2 * spacing.md}px)`,
      margin: `${spacing.md}px`,
      display: 'flex',
      flexDirection: 'column',
      gap: `${spacing.md}px`,
      padding: `${spacing.lg}px`,
      borderRadius: `${theme.karnama.radius.lg}px`,
      backgroundColor: theme.karnama.semantic['bg/surface'],
      backgroundImage: 'none',
      boxShadow: theme.karnama.elevation.modal,
    }) as const,
}

// The file's scrim, overlay/scrim, under every modal.
export const modalScrim = { sx: (theme: Theme) => ({ backgroundColor: theme.karnama.semantic['overlay/scrim'] }) }

// The header: the title in Heading/M, which names the dialog, and the close at
// the other end.
export const ModalHeader = ({ title, titleId, onClose }: { title: string; titleId: string; onClose: () => void }) => {
  const { i18n } = useLingui()
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: `${spacing.sm}px` }}>
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
  )
}

// The actions at the inline end, 12 apart.
export const ModalActions = ({ children }: { children: ReactNode }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: `${spacing.sm}px` }}>{children}</Box>
)

// The modal shell of nodes 150:92 and 150:93, on MUI's Dialog, which traps
// focus while it is open, closes on Escape and on a press on the scrim, and
// gives focus back to whatever opened it. A named dialog: its title labels it.
// The header's title in Heading/M and the close at the other end, a divider,
// the body, a divider, and the actions at the inline end, 12 apart, in 24 of
// padding and 16 between the parts, radius lg, Elevation/Modal, over the file's
// overlay/scrim. The width is the caller's: 360 for a confirmation, 420 for a
// change of status.
export const Modal = ({ open, title, width, onClose, children, actions, onClosed }: ModalProps) => {
  const titleId = useId()
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby={titleId}
      transitionDuration={DISSOLVE_MS}
      // After the dissolve, which is after MUI's focus trap has put focus back
      // where it found it, so whoever listens can see where that landed.
      {...(onClosed === undefined ? {} : { onTransitionExited: onClosed })}
      slotProps={{ backdrop: { sx: modalScrim.sx }, paper: { sx: (theme) => modalPaper.sx(theme, width) } }}
    >
      <ModalHeader title={title} titleId={titleId} onClose={onClose} />
      <ModalDivider />
      {children}
      <ModalDivider />
      <ModalActions>{actions}</ModalActions>
    </Dialog>
  )
}
