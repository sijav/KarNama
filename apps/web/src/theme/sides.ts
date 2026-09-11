import type { KeyboardEvent } from 'react'

// The physical side a popover hangs from at the inline end: MUI's Popover
// places by left and right and does not mirror, so each direction names its
// own. Typed, so the side is a value and not copy.
export type Side = 'left' | 'right'
const LEFT: Side = 'left'
const RIGHT: Side = 'right'
export const inlineEndOf = (direction: 'rtl' | 'ltr'): Side => (direction === 'rtl' ? LEFT : RIGHT)

// What a keydown carries that decides an arrow's move.
export interface ArrowPress {
  key: string
  altKey: boolean
  ctrlKey: boolean
  metaKey: boolean
}

// Where the left or right arrow takes a row of radios, KN-301: the index of
// the radio that sits that way on screen, the order running from the row's
// inline start and wrapping at either end, as the browsers' own radio groups
// wrap. Null leaves the key to the browser: up and down, which move through
// the order in every engine, any other key, a modified arrow, and a key
// pressed on something in the row that is not one of its radios.
export const acrossTo = (press: ArrowPress, direction: string, at: number, count: number): number | null => {
  const across = press.key === 'ArrowRight' ? 1 : press.key === 'ArrowLeft' ? -1 : 0
  if (across === 0 || press.altKey || press.ctrlKey || press.metaKey || at === -1) return null
  const step = direction === 'rtl' ? -across : across
  return (at + step + count) % count
}

// The left and right arrows of a radio group laid out in a row, KN-301. Blink's
// native group already moves them the way they point in either direction, but
// WebKit keeps left as the previous radio even right to left, "and so moves to
// the right", in its RadioInputType::handleKeydownEvent. So a row takes them
// here, read against its own direction, and moves and chooses as the browser
// would: focus, then a click, which checks the radio and tells the group.
// Disabled radios are passed over, as the browsers pass them.
export const arrowsAcross = (event: KeyboardEvent<HTMLElement>) => {
  const radios = [...event.currentTarget.querySelectorAll<HTMLInputElement>('input[type="radio"]:not(:disabled)')]
  const at = radios.findIndex((radio) => radio === event.target)
  const to = acrossTo(event, window.getComputedStyle(event.currentTarget).direction, at, radios.length)
  const next = to === null ? undefined : radios[to]
  if (!next) return
  event.preventDefault()
  next.focus()
  next.click()
}
