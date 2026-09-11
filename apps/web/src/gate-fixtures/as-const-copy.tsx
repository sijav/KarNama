import { Box, IconButton } from '@mui/material'

// Copy written 'as const', on purpose. lingui's no-unlocalized-strings returns
// early for a literal inside an 'as const' assertion, so both of these passed
// in any file until KN-217; the restricted-syntax rule must reject both. Not
// named unlocalized-*, since the rule that fails it is not lingui's. See
// README.md in this directory.
export const AsConstTitle = () => <Box title={'Delete this application' as const} />
export const AsConstLabel = () => <IconButton aria-label={'Delete' as const} />

// 'as const' on an object, the idiom this codebase uses, stays allowed: this
// line must not fail.
export const EDGES = { thin: 1, thick: 2 } as const
