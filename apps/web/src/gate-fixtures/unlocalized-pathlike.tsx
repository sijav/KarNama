import { Box, IconButton } from '@mui/material'

// Copy that LOOKS like a Storybook path, on purpose.
//
// A previous version of the rule exempted `^[A-Z][A-Za-z]*(/[A-Z][A-Za-z ]*)+$`
// globally so a story's `title: 'App/Shell'` would pass. «New/Applied» matches
// it too, and it is exactly the kind of status-transition copy this product
// shows, so the exemption reopened the hole KN-087 had just closed, in both
// `aria-label` and `title`. Story titles are exempted by WHERE they are now.
// See README.md in this directory.
export const UnlocalizedPathlikeAria = () => <IconButton aria-label="New/Applied">x</IconButton>

export const UnlocalizedPathlikeTitle = () => <Box title="New/Applied">x</Box>
