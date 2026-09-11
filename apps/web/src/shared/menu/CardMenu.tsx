import { useLingui } from '@lingui/react'
import { Menu } from './Menu'

// The props are documented in story-docs, not here, KN-207.
export interface CardMenuProps {
  anchorEl: HTMLElement | null
  onClose: () => void
  onChangeStatus: () => void
  onOpenLink?: () => void
  onDelete: () => void
}

// Type=Card of node 512:8350, a job opportunity's actions on a phone: change
// status, open the posting's link, and delete. Not every posting has a link,
// so the link's action is there only when there is one.
export const CardMenu = ({ anchorEl, onClose, onChangeStatus, onOpenLink, onDelete }: CardMenuProps) => {
  const { i18n } = useLingui()
  const choose = (then: () => void) => () => {
    onClose()
    then()
  }
  return (
    <Menu
      label={i18n._('Job opportunity actions')}
      anchorEl={anchorEl}
      onClose={onClose}
      actions={[
        { id: 'status', label: i18n._('Change status'), onSelect: choose(onChangeStatus) },
        ...(onOpenLink === undefined ? [] : [{ id: 'link', label: i18n._('Open the posting link'), onSelect: choose(onOpenLink) }]),
        { id: 'delete', label: i18n._('Delete job opportunity'), destructive: true, onSelect: choose(onDelete) },
      ]}
    />
  )
}
