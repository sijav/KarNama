// Looking for a string in what a build emitted, KN-306.
//
// Extracted so it can be exercised, the way `lib/verify.mjs` was: KN-058's first verifier asserted
// the absence of `shell: true` by slicing source between two markers, "which tests text rather than
// behaviour", and the fix was to make the real path and the proof call one function. The same
// mistake is what KN-306 is about — `story-fixtures.test.ts` scans SOURCE for an import specifier
// and calls that the bundle check — so this half is deliberately about the artifact and knows
// nothing about fixtures, Vite, or this product.
//
// **Bytes, not text.** A file is read as a Buffer and the needle is compared as UTF-8 bytes. Reading
// every emitted file as a string would decode binary assets as though they were text, which is both
// wasteful and a way to miss or invent a match; comparing bytes cannot.
//
// **Every regular file, not a chosen extension.** Requiring `.js` would leave a leak in HTML, CSS or
// an asset unlooked-at, and "the emitted files" is the claim being made.

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/** Every regular file beneath a directory, as paths relative to it. */
export const filesUnder = (directory, prefix = '') =>
  readdirSync(join(directory, prefix), { withFileTypes: true }).flatMap((entry) => {
    const path = prefix === '' ? entry.name : `${prefix}/${entry.name}`
    if (entry.isDirectory()) return filesUnder(directory, path)
    return entry.isFile() ? [path] : []
  })

/**
 * Which emitted files hold which sentinel.
 *
 * Returns `{ scanned, findings }`: how many files were read, and one entry per sentinel that was
 * found, naming the files holding it. A sentinel found nowhere is absent from `findings` entirely,
 * so an empty `findings` means every sentinel was absent from every file read.
 *
 * `scanned` is returned rather than inferred because **a scan that read nothing is not a clean
 * scan**, and a caller that cannot tell the two apart will eventually report the second as the
 * first. That mistake has its own history here: a run filtered down to nothing exited 0 and was
 * read as a pass, twice in one iteration, KN-626.
 */
export const scanBundle = (directory, sentinels) => {
  const paths = filesUnder(directory)
  const needles = sentinels.map((sentinel) => ({ sentinel, bytes: Buffer.from(sentinel, 'utf8') }))
  const held = new Map(needles.map(({ sentinel }) => [sentinel, []]))
  for (const path of paths) {
    const body = readFileSync(join(directory, path))
    for (const { sentinel, bytes } of needles) {
      if (body.includes(bytes)) held.get(sentinel).push(path)
    }
  }
  return {
    scanned: paths.length,
    findings: [...held].filter(([, files]) => files.length > 0).map(([sentinel, files]) => ({ sentinel, files })),
  }
}
