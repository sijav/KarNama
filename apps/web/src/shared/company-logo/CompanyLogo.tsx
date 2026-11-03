import { Box } from '@mui/material'
import { useState } from 'react'
import { GLYPHS } from '../icon'

// The props are documented in story-docs, not here, KN-207.
export interface CompanyLogoProps {
  src?: string
}

// Node 620:3684 binds no variable to these, so they are component constants,
// as the Color Picker's width is: the square's 36, which the six named logos
// beside it share, and the building's 18, which is none of the icon sizes.
const LOGO = 36
const BUILDING = 18

// The square every logo is drawn in, at radius/md, the 8 the file leaves
// unbound, which each part's own sx sets.
const square = { flexShrink: 0, width: LOGO, height: LOGO }

// Node 620:3684, the default organisation icon: the Icon set's building on
// bg/surface-secondary, drawn at the 18 the file gives it here, off the size
// scale the Icon takes, so its own path from the set, as the Color Picker
// draws its check, KN-008. The file scales the drawing and keeps the set's two
// pixel stroke, and so does the browser.
const Placeholder = () => (
  <Box
    aria-hidden
    sx={(theme) => ({
      ...square,
      borderRadius: `${theme.karnama.radius.md}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.karnama.semantic['bg/surface-secondary'],
      color: theme.karnama.semantic['text/disabled'],
    })}
  >
    <Box
      component="svg"
      viewBox="0 0 24 24"
      sx={{ width: BUILDING, height: BUILDING, fill: 'none', stroke: 'currentColor' }}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {GLYPHS.building.stroke.map((d) => (
        <path key={d} d={d} vectorEffect="non-scaling-stroke" />
      ))}
    </Box>
  </Box>
)

// A company's logo, from wherever it was fetched, KN-830: the owner's answer
// of 2026-11-03 is the company's own website, else its LinkedIn page, else the
// default organisation icon, as LinkedIn shows one. The six named logos the
// file draws beside 620:3684 are what a fetched one looks like here, its image
// covering the square at the same radius. Decorative either way, since the card
// writes the company's name beside it: the image's alt is empty and the
// placeholder is hidden.
export const CompanyLogo = ({ src }: CompanyLogoProps) => {
  // The address that failed to load, so that a new one is tried afresh with no
  // effect to reset it.
  const [failed, setFailed] = useState<string | null>(null)
  if (src === undefined || src === '' || src === failed) return <Placeholder />
  return (
    <Box
      component="img"
      src={src}
      alt=""
      // A board draws one on every card, most of them out of sight.
      loading="lazy"
      onError={() => {
        setFailed(src)
      }}
      sx={(theme) => ({ ...square, borderRadius: `${theme.karnama.radius.md}px`, display: 'block', objectFit: 'cover' })}
    />
  )
}
