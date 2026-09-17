import type { Request } from 'express'

/**
 * The caller's address, for a rate limit key. KN-484.
 *
 * **`CF-Connecting-IP` first, and that is a security property rather than a
 * preference.** All inbound traffic to a Render web service crosses Cloudflare,
 * which WRITES this header on every request and overwrites whatever the caller
 * sent, so its value is outside the caller's control. Cloudflare only APPENDS
 * to `X-Forwarded-For`, so a caller who sends their own copy controls the
 * leftmost entry and can claim any address: a limit keyed on that is a limit
 * the caller chooses, which is worse than one bucket for everybody because it
 * looks fixed and is trivially evaded. Render documents this, and Cloudflare's
 * own header reference says the same.
 *
 * **Express's `trust proxy` is deliberately not involved.** A numeric hop count
 * reads `X-Forwarded-For` from the right, so it inherits exactly the problem
 * above, and Render publishes no chain length to count anyway. `env.ts` still
 * carries `TRUST_PROXY_HOPS` because `trust proxy` also governs `req.protocol`
 * and secure cookies; this file simply does not depend on it.
 *
 * **The fallbacks are for a server nothing sits in front of**, where `req.ip`
 * IS the direct caller and is the right answer. They are not a silent
 * reintroduction of the shared bucket: that would only happen behind an
 * unconfigured proxy that is not Cloudflare, which is a deployment decision
 * somebody would have to make, and not a reason to make a laptop fail.
 */
export const clientIp = (req: Request) => {
  // Node gives a string for a header sent once and an array only when it was
  // sent more than once. Cloudflare overwrites rather than appends, so a second
  // copy is not something it produces; the array is handled because the type
  // allows it and reaching for `as` to deny it would be the escape hatch
  // `AGENTS.md` refuses.
  const written = req.headers['cf-connecting-ip']
  const address = Array.isArray(written) ? written[0] : written
  return address ?? req.ip ?? req.socket.remoteAddress ?? ''
}
