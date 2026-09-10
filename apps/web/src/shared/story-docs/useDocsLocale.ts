import { useContext, useEffect, useState } from 'react'
import { DocsContext } from '@storybook/addon-docs/blocks'
import { addons } from 'storybook/preview-api'
import { defaultLocale, type Locale } from '../../i18n'
import { localeIn, localeInContext } from './docs-locale'

/**
 * The Language toolbar, read from inside a Docs page.
 *
 * `useGlobals` from `storybook/preview-api` looks like the obvious answer and is
 * the wrong one: it reads the preview HOOK context, which exists while a story
 * or a decorator renders. A Docs page is neither, so the hook has nothing to
 * read and the value never changes when the toolbar does. That was verified,
 * not assumed.
 *
 * What does work is the preview channel. `globalsUpdated` carries the new
 * globals on every toolbar change. The initial value cannot come from there,
 * because the page mounts after that event, so it is read from the docs context.
 *
 * Excluded from coverage, with `DocsPage`, because this repository covers React
 * by rendering stories in a real browser and a Docs page cannot be a story.
 * Everything it decides is in `docs-locale.ts`, which is tested; what is left
 * here is the wiring, and the wiring was checked by clicking the toolbar and
 * watching the page change.
 */
const GLOBALS_UPDATED = 'globalsUpdated'

export const useDocsLocale = (): Locale => {
  const context = useContext(DocsContext)
  const [locale, setLocale] = useState<Locale>(() => localeInContext(context) ?? defaultLocale)

  useEffect(() => {
    const channel = addons.getChannel()
    const onUpdate = (event: unknown) => {
      const next = localeIn((event as { globals?: unknown } | undefined)?.globals)
      if (next) setLocale(next)
    }
    channel.on(GLOBALS_UPDATED, onUpdate)
    return () => {
      channel.off(GLOBALS_UPDATED, onUpdate)
    }
  }, [])

  return locale
}
