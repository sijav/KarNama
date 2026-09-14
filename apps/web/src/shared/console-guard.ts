/**
 * What the product says at the console, and the guard that fails a test for
 * anything else said there.
 *
 * KN-134 asked that a test which makes React warn fails rather than printing
 * into a log nobody reads. The first guard recorded a `console.error` only when
 * its first argument held `%s`, React's printf style. React also sends plain
 * strings, "Cannot call startTransition while rendering." among them, and it
 * calls `console.warn`, so most of what it says went through, KN-401.
 *
 * So the rule is inverted. The product MARKS its own diagnostics, and anything
 * unmarked fails, whatever its shape and whichever method it used. A warning
 * nobody has marked is either a defect or a story that has to say it provokes
 * one.
 */

/** What the product puts in front of anything it says at the console. */
export const MARK = 'KarNama:'

/** Says something as the product, where the guard will let it through. */
export const report = (message: string): void => {
  console.error(`${MARK} ${message}`)
}

/** Whether a console call is one of the product's own. */
export const isOurs = (args: readonly unknown[]): boolean => {
  const [first] = args
  return typeof first === 'string' && first.startsWith(MARK)
}

/** The console a guard wraps: the global one, or a stand-in a test drives. */
export interface Consoleish {
  error: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
}

export interface ConsoleGuard {
  /** What was said that neither the product nor the test accounted for. */
  unaccounted: () => string[]
  /** Says this test provokes a message, and why it is not a defect. */
  allow: (pattern: RegExp) => void
  /** Puts the console back as it was. */
  restore: () => void
}

/**
 * The guard watching the real console, so a story can reach it, and null
 * between tests. A story that provokes a message from the runner says so
 * through `allowConsole`, and one that expects the product's own reports holds
 * them back with `passOnUnmarked`; neither replaces the console outright, which
 * would take the guard off for the rest of that test, KN-522.
 */
let watching: ConsoleGuard | null = null

/** The guard now watching the real console, if one is. */
export const setWatching = (guard: ConsoleGuard | null): void => {
  watching = guard
}

/**
 * Says this test provokes a console message on purpose.
 *
 * For a warning the RUNNER produces and a reader never sees: React's act scope
 * complaining about a transition, for one. A message the product itself should
 * not be making is a defect, not something to allow.
 */
export const allowConsole = (pattern: RegExp): void => {
  watching?.allow(pattern)
}

/**
 * A stand-in for `console.error` in a test that expects the product's own
 * reports: it holds back what the product marks, so those do not fill the
 * published Storybook's console, and hands everything else to `through`, the
 * console as it was, which in a test is the guard, so an unmarked error still
 * fails the test, KN-522.
 *
 * `through` has to be read before the console is replaced: read after a spy has
 * taken its place, it is the spy, and the stand-in calls itself.
 */
export const passOnUnmarked =
  (through: (...args: unknown[]) => void) =>
  (...args: unknown[]): void => {
    if (!isOurs(args)) through(...args)
  }

/**
 * Wraps `error` and `warn` so anything unmarked is recorded, and everything is
 * still said: a warning that is hidden while it is judged is worse than one
 * that prints.
 */
export const installConsoleGuard = (target: Consoleish): ConsoleGuard => {
  const heard: string[] = []
  const allowed: RegExp[] = []
  const { error, warn } = target
  const watch =
    (through: (...args: unknown[]) => void) =>
    (...args: unknown[]) => {
      if (!isOurs(args)) heard.push(args.map((arg) => String(arg)).join(' '))
      through(...args)
    }
  target.error = watch(error.bind(target))
  target.warn = watch(warn.bind(target))
  return {
    unaccounted: () => heard.filter((said) => !allowed.some((pattern) => pattern.test(said))),
    allow: (pattern) => {
      allowed.push(pattern)
    },
    restore: () => {
      target.error = error
      target.warn = warn
    },
  }
}
