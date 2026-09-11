import { DocsContext } from '@storybook/addon-docs/blocks'
import { useContext, useEffect, useState } from 'react'
import { GLOBALS_UPDATED } from 'storybook/internal/core-events'
import { defaultLocale, type Locale } from '../../i18n'
import { localeInContext, localeInEvent } from './docs-locale'

export interface DocsLocale {
  locale: Locale
  /**
   * False while the toolbar's language could not be read, so the page is in
   * the default and says so, KN-203. The first change of the toolbar makes it
   * true.
   */
  known: boolean
}

/**
 * The Language toolbar, read from inside a Docs page.
 *
 * `useGlobals` from `storybook/preview-api` looks like the obvious answer and is
 * the wrong one: it reads the preview HOOK context, which exists while a story
 * or a decorator renders. A Docs page is neither, so the hook has nothing to
 * read and the value never changes when the toolbar does. That was verified,
 * not assumed.
 *
 * What does work is the docs context: its calls give the first value, and its
 * channel's `globalsUpdated` carries a change of the toolbar. Storybook 10.5
 * reloads the whole preview frame when the toolbar changes on a Docs page,
 * seen on 2026-09-12, so here the first read serves every change and the
 * listener is for a Storybook that updates the page in place.
 *
 * Excluded from coverage, with `DocsPage`, because this repository covers React
 * by rendering stories in a real browser and a Docs page cannot be a story.
 * Everything it decides is in `docs-locale.ts`, which is tested; what is left
 * here is the wiring, and the wiring was checked by clicking the toolbar and
 * watching the page change.
 */
export const useDocsLocale = (): DocsLocale => {
  const context = useContext(DocsContext)
  const [docsLocale, setDocsLocale] = useState<DocsLocale>(() => {
    const read = localeInContext(context)
    return read ? { locale: read, known: true } : { locale: defaultLocale, known: false }
  })

  const { channel } = context
  useEffect(() => {
    const onUpdate = (event: unknown) => {
      const next = localeInEvent(event)
      if (next) setDocsLocale({ locale: next, known: true })
    }
    channel.on(GLOBALS_UPDATED, onUpdate)
    return () => {
      channel.off(GLOBALS_UPDATED, onUpdate)
    }
  }, [channel])

  return docsLocale
}
