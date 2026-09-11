import { Box, IconButton } from '@mui/material'

// The three letters in Latin-1's punctuation block, U+00AA, U+00B5 and U+00BA.
// The no-letter entry this config carried took U+00A0 to U+00BF whole, so an
// ordinal, a unit and a degree-like letter passed as a title, a label and text
// until KN-366. The rule must reject all three. See README.md in this
// directory.
export const OrdinalAsTitle = () => <Box title="1ª" />
export const UnitAsLabel = () => <IconButton aria-label="5µ" />
export const LetterAsText = () => <Box>º</Box>
