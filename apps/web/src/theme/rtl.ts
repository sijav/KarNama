import createCache from '@emotion/cache'
import rtlPlugin from '@mui/stylis-plugin-rtl'
import { prefixer } from 'stylis'

/**
 * Emotion caches, one per direction.
 *
 * RTL is achieved with `direction: rtl` and this plugin, never by reversing an
 * array. Figma reverses its arrays because horizontal Auto Layout always lays
 * out left to right; code must not copy that, and `DESIGN.md` calls reversing
 * an array in code to "fix" RTL a defect.
 *
 * The `stylis` version is pinned to 4.2.0 by a root `overrides`. That pin is
 * load bearing: `@emotion/cache` depends on exactly 4.2.0 while
 * `@mui/stylis-plugin-rtl` peers `4.x`, so a plain install resolves two copies
 * and emotion throws on every `::placeholder` rule.
 */
/**
 * The plugin lists are exported separately from the caches because a test has
 * to be able to drive stylis directly. Reading them back off an `EmotionCache`
 * is not possible, and probing the cache's own style sheet outside a DOM reads
 * an empty string, so every assertion passes and nothing is proved.
 */
export const rtlPlugins = [prefixer, rtlPlugin]

export const ltrPlugins = [prefixer]

export const createRtlCache = () => createCache({ key: 'karnama-rtl', stylisPlugins: rtlPlugins })

export const createLtrCache = () => createCache({ key: 'karnama', stylisPlugins: ltrPlugins })

export const cacheFor = (direction: 'rtl' | 'ltr') => (direction === 'rtl' ? createRtlCache() : createLtrCache())
