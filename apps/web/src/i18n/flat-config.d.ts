/**
 * ESLint's flat config, as a module with no types of its own.
 *
 * `eslint.config.js` is JavaScript because ESLint loads it directly, and the
 * gate fixture beside it is JavaScript so its own text can carry the quote
 * style it exists to demonstrate, KN-367. Declaring the shape here is how they
 * are read without an `any` or a cast, which AGENTS.md forbids.
 */
declare module '*eslint.config.js' {
  const config: readonly { rules?: Record<string, unknown> }[]
  export default config
}

declare module '*ignore.config.js' {
  const config: readonly { rules?: Record<string, unknown> }[]
  export default config
}
