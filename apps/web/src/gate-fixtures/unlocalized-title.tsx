import { Box } from '@mui/material'

// A bare tooltip, on purpose. `title` on a DOM element is what the browser
// shows on hover, so it is user-facing copy. The rule used to exempt the name
// `title` outright, to let a Storybook story path through, and this fixture
// passed. A story path is exempted by WHERE it is now, in the stories block,
// rather than by its shape: the shape matched real copy. See README.md.
export const UnlocalizedTitle = () => <Box title="Delete this application">x</Box>
