// Storybook only, like the rest of this folder: nothing that ships imports it.

/** A clock a play holds: `Date.now` reads the time it holds until it is let go. */
export interface HeldClock {
  /** Moves the held time on by so many milliseconds. */
  forward: (milliseconds: number) => void
  /** Gives `Date.now` back its own clock. */
  release: () => void
}

/**
 * Holds `Date.now` at a time, so a play reaches the end of the sign-in step's
 * minute before a resend without waiting the minute, KN-587.
 *
 * Only `Date.now` is held. Timers keep real time, and so does `performance.now`,
 * which React's scheduler and Vitest read, so a countdown that looks at the clock
 * on a timer sees a move at its next look, and a play waits for that look.
 */
export const holdClock = (at: number): HeldClock => {
  const own = Date.now
  let now = at
  Date.now = () => now
  return {
    forward: (milliseconds) => {
      now += milliseconds
    },
    release: () => {
      Date.now = own
    },
  }
}
