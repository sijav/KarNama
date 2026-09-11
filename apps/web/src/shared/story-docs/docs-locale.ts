import { isLocale, type Locale } from '../../i18n'

/**
 * Reading the Language toolbar out of whatever Storybook hands us.
 *
 * These are separated from the hook that uses them for one reason: they are the
 * part that can be TESTED. This repository covers React by rendering stories in
 * a real browser, and a Docs page cannot be rendered as a story, so the hook
 * itself is excluded from coverage. Everything it decides lives here instead,
 * where it is ordinary data in and data out.
 */

/** The `locale` global, or null when it is absent or not one of ours. */
export const localeIn = (globals: unknown): Locale | null => {
  if (typeof globals !== 'object' || globals === null || !('locale' in globals)) return null
  const { locale } = globals
  return typeof locale === 'string' && isLocale(locale) ? locale : null
}

/** The two calls of Storybook's published `DocsContextProps` this reads. */
export interface DocsContextCalls<TStory> {
  storyById: () => TStory
  getStoryContext: (story: TStory) => unknown
}

/**
 * The toolbar's language when a Docs page mounts, or null when it cannot be read.
 *
 * The page mounts after the event that set the globals, so the channel cannot
 * supply the first value. It comes from the docs context's own calls instead,
 * `storyById` for the file's primary story and `getStoryContext` for that
 * story's context, both on the published interface, KN-203; this used to probe
 * four guessed shapes of Storybook's internals, and a Storybook that moved all
 * four would have shown Persian with nothing said.
 *
 * `userGlobals`, not `globals`: the context's `globals` have the primary story's
 * own laid over the toolbar's, and a page whose first story pins Persian then
 * reads Persian whatever the toolbar says, which the running Storybook showed.
 * `userGlobals` is in the declared return of Storybook's `DocsContext` class but
 * not of the interface, so it is read by shape; a Storybook without it makes
 * this null, and the page says so rather than guessing.
 */
export const localeInContext = <TStory>(context: DocsContextCalls<TStory>): Locale | null => {
  let story: unknown
  try {
    story = context.getStoryContext(context.storyById())
  } catch {
    // `storyById` throws for a page with no CSF file attached.
    return null
  }
  if (typeof story !== 'object' || story === null || !('userGlobals' in story)) return null
  return localeIn(story.userGlobals)
}

/**
 * The toolbar's language from a `globalsUpdated` event, or null.
 *
 * Its `userGlobals`, for the reason above; they are in Storybook's
 * `GlobalsUpdatedPayload`.
 */
export const localeInEvent = (event: unknown): Locale | null =>
  typeof event === 'object' && event !== null && 'userGlobals' in event ? localeIn(event.userGlobals) : null
