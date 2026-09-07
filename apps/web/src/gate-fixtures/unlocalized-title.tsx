import Box from '@mui/material/Box'

// A bare tooltip, on purpose. `title` on a DOM element is what the browser
// shows on hover, so it is user-facing copy. The rule used to exempt the name
// `title` outright, to let a Storybook story path through, and this fixture
// passed. Story paths are exempted by their SHAPE now instead. See README.md.
export const UnlocalizedTitle = () => <Box title="Delete this job opportunity">x</Box>
