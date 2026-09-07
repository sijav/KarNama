import { IconButton } from '@mui/material'

// A bare accessible name, on purpose. `aria-label` IS the text a screen reader
// speaks, so an untranslated one is untranslated user-facing copy that no
// sighted reviewer will ever notice. The rule used to exempt every `aria-*`
// prop and this fixture passed. See README.md in this directory.
export const UnlocalizedAria = () => <IconButton aria-label="Delete this application">x</IconButton>
