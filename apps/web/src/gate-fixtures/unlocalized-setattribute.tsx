import { Box } from '@mui/material'
import { useEffect, useRef } from 'react'

// The same untranslated accessible name, reached through a method call instead
// of a prop.
//
// `setAttribute` and `*.setAttribute` were both in the rule's ignoreFunctions,
// added so `documentElement.setAttribute('dir', 'rtl')` would pass, and they
// exempted every argument of every call. So the prop-level rule rejected
// aria-label while this went straight through. AppProviders assigns `.dir` and
// `.lang` as properties now, so nothing legitimate needs the exemption.
// See README.md in this directory.
export const UnlocalizedSetAttribute = () => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current?.setAttribute('aria-label', 'Delete this application')
  }, [])

  return <Box ref={ref}>x</Box>
}
