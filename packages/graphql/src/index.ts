/**
 * The contract between the two halves, and nothing else.
 *
 * Everything here is GENERATED from `apps/api/schema.gql`, which is itself
 * generated from the resolvers. Nothing in this package is written by hand, and
 * that is enforced: `handwritten.test.ts` fails when a type is declared outside
 * `generated.ts`, because a hand-written interface beside a generated one is
 * the exact drift a monorepo exists to prevent.
 *
 * The barrel re-exports rather than re-declares. A re-declaration would look
 * identical and would stop moving when the schema does.
 */
export * from './generated.js'
