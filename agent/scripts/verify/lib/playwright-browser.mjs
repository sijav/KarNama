import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'

/**
 * Whether the browser the Storybook test project needs is actually installed.
 *
 * The Storybook project runs in real Chromium. Playwright normally fetches the
 * browser in a postinstall, and the owner's allow-scripts policy blocks
 * postinstall scripts, so a clean clone has the package and not the browser.
 * `npm test` then fails with a message about a missing executable that does not
 * say "install a browser", and it reads like a broken suite.
 *
 * `executablePath()` answers where the browser WOULD be. It returns a path
 * whether or not anything is there, which is what makes the check possible: the
 * path is the name of the thing to install.
 *
 * Resolved through `createRequire` from the web workspace, because `playwright`
 * is a dependency of `apps/web` rather than of the repository root, and a bare
 * import from a script in `agent/` would not find it.
 */
// `exists` is injectable so the MISSING case can be proved without uninstalling
// a browser. The message is the deliverable here, and a message nothing ever
// renders is a message nobody has read.
export const chromiumStatus = (webDirectory, { exists = existsSync } = {}) => {
  const requireFromWeb = createRequire(`${webDirectory.replaceAll('\\', '/')}/package.json`)
  let executablePath
  try {
    const { chromium } = requireFromWeb('playwright')
    executablePath = chromium.executablePath()
  } catch (error) {
    return {
      installed: false,
      reason: `the playwright package itself could not be loaded from apps/web: ${error instanceof Error ? error.message : String(error)}`,
    }
  }

  if (exists(executablePath)) return { installed: true, executablePath }
  return {
    installed: false,
    executablePath,
    reason:
      `Chromium is not installed. Playwright expects it at:\n      ${executablePath}\n` +
      `      Run: npm run setup:browsers\n` +
      `      The browser is NOT fetched by npm install: Playwright does that in a\n` +
      `      postinstall script, and the allow-scripts policy blocks those.`,
  }
}
