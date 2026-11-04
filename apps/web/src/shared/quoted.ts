import type { I18n } from '@lingui/core'

/**
 * A name set in the reader's own quotation marks, «…» in Persian and “…” in
 * English, so a title can hold a name the reader gave, KN-761. The marks are
 * the catalog's, so each language keeps its own, and the name is never
 * translated: it is the reader's.
 */
export const quoted = (i18n: I18n, name: string): string => `${i18n._('“')}${name}${i18n._('”')}`
