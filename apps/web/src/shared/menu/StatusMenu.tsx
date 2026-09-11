import { useLingui } from '@lingui/react'
import { Popover, useTheme } from '@mui/material'
import { useLayoutEffect, useRef, useState } from 'react'
import { usePreferences } from '../../core/preferences'
import { formatCount } from '../../i18n/formatCount'
import { inlineEndOf } from '../../theme/sides'
import { spacing, type StatusToken } from '../../theme/tokens'
import { ColorPicker } from '../color-picker'
import { Menu } from './Menu'

// The props are documented in story-docs, not here, KN-207.
export interface StatusMenuProps {
  anchorEl: HTMLElement | null
  colour: StatusToken
  jobCount: number
  onClose: () => void
  onRename: () => void
  onColourChange: (colour: StatusToken) => void
  onDelete: () => void
}

// The menu's two views: its actions, and the Color Picker in their place.
type View = 'actions' | 'colour'
const ACTIONS: View = 'actions'
const COLOUR: View = 'colour'

// Why a status that holds job opportunities cannot be deleted, 259:295: the
// number in the reader's digits between the catalog's two halves, since both
// languages put it there.
const useBlockedReason = (jobCount: number) => {
  const { i18n } = useLingui()
  const { locale } = usePreferences()
  const one = new Intl.PluralRules(locale).select(jobCount) === 'one'
  const rest = one
    ? i18n._('job opportunity; to delete it, first move it to another column.')
    : i18n._('job opportunities; to delete it, first move them to another column.')
  return `${i18n._('This status has')} ${formatCount(locale, jobCount)} ${rest}`
}

// Type=Status of node 512:8350, a column's menu: rename, change colour, and
// delete, exactly three, DESIGN.md. Delete is disabled while the column holds
// job opportunities, and says why beside itself. Change colour replaces the
// menu with the Color Picker in the same place, 259:184; the two are never on
// screen together.
export const StatusMenu = ({ anchorEl, colour, jobCount, onClose, onRename, onColourChange, onDelete }: StatusMenuProps) => {
  const { i18n } = useLingui()
  const reason = useBlockedReason(jobCount)
  const end = inlineEndOf(useTheme().direction)
  const [view, setView] = useState<View>(ACTIONS)
  // Each opening starts at the actions: React's pattern for state that follows
  // a prop, adjusted during render.
  const [openedFrom, setOpenedFrom] = useState(anchorEl)
  if (anchorEl !== openedFrom) {
    setOpenedFrom(anchorEl)
    setView(ACTIONS)
  }
  // What had focus when the menu opened, the trigger. The menu gives focus back
  // to it by itself; the colour view cannot, since its own opener, the menu
  // item, is gone by then, so it does so once it has closed, when its focus
  // trap no longer holds focus inside. Read in a layout effect, which runs
  // before the menu's own effect moves focus into it.
  const returnTo = useRef<HTMLElement | null>(null)
  useLayoutEffect(() => {
    if (anchorEl === null) return
    const active = window.document.activeElement
    returnTo.current = active instanceof HTMLElement ? active : anchorEl
  }, [anchorEl])
  const close = () => {
    onClose()
  }
  return (
    <>
      <Menu
        label={i18n._('Status actions')}
        anchorEl={view === 'actions' ? anchorEl : null}
        onClose={close}
        actions={[
          {
            id: 'rename',
            label: i18n._('Rename'),
            onSelect: () => {
              close()
              onRename()
            },
          },
          {
            id: 'colour',
            label: i18n._('Change colour'),
            onSelect: () => {
              setView(COLOUR)
            },
          },
          {
            id: 'delete',
            label: i18n._('Delete status'),
            destructive: true,
            disabled: jobCount > 0,
            reason,
            onSelect: () => {
              close()
              onDelete()
            },
          },
        ]}
      />
      <Popover
        open={anchorEl !== null && view === 'colour'}
        anchorEl={anchorEl}
        onClose={close}
        disableRestoreFocus
        transitionDuration={0}
        anchorOrigin={{ vertical: 'bottom', horizontal: end }}
        transformOrigin={{ vertical: 0, horizontal: end }}
        // The picker draws its own panel, so the popover draws none.
        slotProps={{
          transition: {
            onExited: () => {
              returnTo.current?.focus()
            },
          },
          paper: {
            sx: {
              marginTop: `${spacing['2xs']}px`,
              backgroundColor: 'transparent',
              backgroundImage: 'none',
              boxShadow: 'none',
              overflow: 'visible',
            },
          },
        }}
      >
        <ColorPicker
          value={colour}
          onChange={(next) => {
            close()
            onColourChange(next)
          }}
        />
      </Popover>
    </>
  )
}
