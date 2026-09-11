/**
 * How long a wait runs before the Loading State says why it is slow, KN-022.
 * Extraction normally answers well inside it; past it the likely cause is the
 * Render free tier's cold start, about 50 seconds, DEPLOY.md.
 */
export const COLD_START_AFTER_MS = 15_000

/** How much longer a wait that began at `start` has, at `now`, before it runs past COLD_START_AFTER_MS; 0 once it has. */
export const untilSlow = (start: number, now: number) => Math.max(0, start + COLD_START_AFTER_MS - now)
