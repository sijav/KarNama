import { Box, IconButton } from '@mui/material'

// Copy that LOOKS like a design token, on purpose.
//
// A previous version of the rule exempted `^[a-z-]+/[a-z0-9-/]+$` globally so a
// token name rendered as a label, `bg/page`, would pass. «delete/application»
// matches it too, so this was the third way into the hole KN-087 closed: first
// the prop NAME, then a capitalised SHAPE, then a lower-case one. The exemption
// is gone rather than narrowed, because nothing in `src` needed it. See
// README.md in this directory.
export const UnlocalizedTokenlikeAria = () => <IconButton aria-label="delete/application" />

export const UnlocalizedTokenlikeTitle = () => <Box title="delete/application" />
