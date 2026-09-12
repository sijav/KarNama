import { useRef } from 'react'
import { IconButton, type IconButtonProps } from './IconButton'

// PROBE A: is `ref` typed to a button when href makes it an anchor?
export const ProbeAnchorRef = () => {
  const anchor = useRef<HTMLAnchorElement>(null)
  return <IconButton icon="trash" aria-label="x" href="mailto:a@b.c" ref={anchor} />
}

// PROBE B: does a wider spread get refused, or pass through silently?
const wider = { icon: 'trash' as const, 'aria-label': 'x', onKeyDown: () => {}, id: 'nope', 'aria-expanded': true }
export const ProbeWiderSpread = () => <IconButton {...wider} />

// PROBE C: the menu-trigger props a popup button owes.
export const ProbePopup = () => <IconButton icon="more" aria-label="x" aria-haspopup="menu" aria-expanded={false} />

// PROBE D: what is the declared ref type?
export type ProbeRefType = IconButtonProps['ref']
export type ProbeMouseOver = IconButtonProps['onMouseOver']
