/**
 * A source the picker offers: its name as the reader reads it, and the other
 * spellings that mean it, a common source's name in the other language; none
 * for a source the reader made.
 */
export interface SourceOption {
  name: string
  aliases: readonly string[]
}

/** The two lists the picker offers: the reader's own sources, and the common ones. */
export interface SourceLists {
  own: readonly SourceOption[]
  common: readonly SourceOption[]
}

// The Persian yeh and kaf the Arabic letters fold into.
const PERSIAN_YEH = String.fromCodePoint(0x6cc)
const PERSIAN_KAF = String.fromCodePoint(0x6a9)

/**
 * The quiet normalisation of the handoff's source field: the Arabic yeh and kaf
 * as the Persian letters, no spaces and no half-spaces, and no letter case, so
 * one source typed three ways is one source. A common source's name in the
 * other language reaches it through its aliases.
 */
export const sourceKey = (name: string): string =>
  name
    .replace(/\u064a/gu, PERSIAN_YEH)
    .replace(/\u0643/gu, PERSIAN_KAF)
    .replace(/[\s\u200c]/gu, '')
    .toLocaleLowerCase('en-US')

const keysOf = (source: SourceOption) => [source.name, ...source.aliases].map(sourceKey)

// Whether two keys that differ are one edit apart: a letter added, dropped or
// changed. Never handed two equal keys, which are the same source.
const oneApart = (one: string, other: string) => {
  if (Math.abs(one.length - other.length) > 1) return false
  const [short, long] = one.length <= other.length ? [one, other] : [other, one]
  let at = 0
  while (at < short.length && short[at] === long[at]) at += 1
  return short.slice(short.length === long.length ? at + 1 : at) === long.slice(at + 1)
}

/** What the picker offers for what is typed, and the source it exactly is, if any. */
export interface SourceSuggestions {
  own: readonly SourceOption[]
  common: readonly SourceOption[]
  near: readonly SourceOption[]
  exact: SourceOption | null
  create: string | null
}

/**
 * With nothing typed, the reader's sources and the common ones not among them.
 * Typed, the sources whose name or other spelling holds what was typed, under
 * the same two headers; and when none is exactly it, the sources one letter
 * away, «منظور شما این بود؟», and the typed name to create, «ساختن منبع «…»».
 */
export const suggestionsFor = (typed: string, own: readonly SourceOption[], common: readonly SourceOption[]): SourceSuggestions => {
  const ownKeys = new Set(own.flatMap(keysOf))
  const commonOnly = common.filter((source) => !keysOf(source).some((key) => ownKeys.has(key)))
  const key = sourceKey(typed)
  if (key === '') return { own, common: commonOnly, near: [], exact: null, create: null }
  const holds = (source: SourceOption) => keysOf(source).some((candidate) => candidate.includes(key))
  const every = [...own, ...commonOnly]
  const exact = every.find((source) => keysOf(source).includes(key)) ?? null
  return {
    own: own.filter(holds),
    common: commonOnly.filter(holds),
    near: exact === null ? every.filter((source) => !holds(source) && keysOf(source).some((candidate) => oneApart(candidate, key))) : [],
    exact,
    create: exact === null ? typed.trim() : null,
  }
}
