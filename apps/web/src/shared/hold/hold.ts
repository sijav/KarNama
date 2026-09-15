import { useEffect, useRef, type MouseEvent, type PointerEvent } from 'react'

// A press held on a phone's card, the file's «نگه‌داشتن»: Card / Mobile 491:751
// and the Checkbox 204:11 say holding a card starts bulk selection, KN-428. Both
// numbers are chosen, not read: the file gives the gesture none, Android reads
// its own from the device and Safari offers the web neither.
// How long a press rests before it holds: long enough that no tap reaches it.
export const HOLD_MS = 500
// How far, in CSS pixels, a press may drift and still be a hold rather than the
// start of a scroll.
export const SLOP = 10

/**
 * The press, and the mark a hold leaves for the click its release may send.
 *
 * `canStart` says whether a press on its target may become a hold, and
 * `onHold` is what a hold does. The mark is bounded, KN-428's plan review: the
 * first click takes it, and the next press clears it before anything else, so a
 * release that sends no click, as a phone may after a long press, cannot
 * swallow the tap after it.
 */
export const useHold = (canStart: (target: EventTarget) => boolean, onHold: () => void) => {
  const press = useRef<{ x: number; y: number; timer: number } | null>(null)
  const held = useRef(false)
  // What a hold does as of the last render, read when the timer runs rather
  // than when the press began.
  const latest = useRef(onHold)
  useEffect(() => {
    latest.current = onHold
  })
  // A card that goes while it is pressed takes its timer with it.
  useEffect(
    () => () => {
      window.clearTimeout(press.current?.timer)
    },
    [],
  )

  const letGo = () => {
    window.clearTimeout(press.current?.timer)
    press.current = null
  }
  const hold = () => {
    letGo()
    held.current = true
    latest.current()
  }

  return {
    events: {
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        held.current = false
        letGo()
        if (!event.isPrimary || event.button !== 0 || !canStart(event.target)) return
        press.current = { x: event.clientX, y: event.clientY, timer: window.setTimeout(hold, HOLD_MS) }
      },
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        const from = press.current
        if (from && Math.hypot(event.clientX - from.x, event.clientY - from.y) > SLOP) letGo()
      },
      onPointerUp: letGo,
      // What a browser sends when it takes the touch over for a scroll.
      onPointerCancel: letGo,
      // A mouse has no implicit capture, so leaving the card ends its press.
      onPointerLeave: letGo,
      // A phone's browser may say contextmenu for its own long press, before the
      // timer or just after it: that is this hold, and no menu is shown for it.
      // A contextmenu with no hold in it, a right click, is the browser's.
      onContextMenu: (event: MouseEvent<HTMLElement>) => {
        if (!press.current && !held.current) return
        event.preventDefault()
        if (press.current) hold()
      },
    },
    // Whether a click is the one a hold's release sent, and so opens nothing. A
    // keyboard's Enter or Space clicks with a detail of 0, and always opens.
    heldClick: (event: { detail: number }) => {
      const wasHeld = held.current
      held.current = false
      return wasHeld && event.detail > 0
    },
  }
}
