import { Box, IconButton } from '@mui/material'

// Short copy with no p, {, L or } in it, on purpose. The rule compiles each
// ignore entry with no flags, so the old no-letter entry, \p{L}, meant
// those four characters and whitelisted this word, as an aria-label, as a
// title and as text, until KN-214. The rule must reject all three. See
// README.md in this directory.
export const DeleteAsLabel = () => <IconButton aria-label="Delete" />
export const DeleteAsTitle = () => <Box title="Delete" />
export const DeleteAsText = () => <Box>Delete</Box>
