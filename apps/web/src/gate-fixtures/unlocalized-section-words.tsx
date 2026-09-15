import { Box, IconButton } from '@mui/material'

// The story-docs format's two section names, as a label, a title and text. The
// ignore entry written for the parser, '^(props|stories)$', let both words through
// in every file until KN-215. The rule must reject all three. See README.md in
// this directory.
export const StoriesAsLabel = () => <IconButton aria-label="stories" />
export const PropsAsTitle = () => <Box title="props" />
export const StoriesAsText = () => <Box>stories</Box>
