import { Box, useTheme } from '@mui/material'
import { useId } from 'react'
import { elevation } from '../../theme/tokens'
import geometry from './illustrations.json'

// The two pictures the empty states draw: the board's stacked cards and the
// network's two people.
export type EmptyPictureName = 'jobs' | 'network'

// The pictures' frame, 160 by 120, the edges' one pixel and the plus's two and
// a half, as 894:79231 and 1083:55308 draw them, binding no variable.
const WIDTH = 160
const HEIGHT = 120
const EDGE = 1
const PLUS = 2.5
// The shadow's room round the network's front card, in the card's own size,
// so its blur is not cut off: the filter's region from a fifth before it to a
// fifth after it across, and three fifths beyond it down.
const SHADOW_FROM = -0.2
const SHADOW_ACROSS = 1.4
const SHADOW_DOWN = 1.6

// A box shadow from the tokens as an SVG drop shadow: its offset, half its blur
// as the Gaussian's deviation, as a box shadow's blur is, and its colour's last
// two hex digits as the opacity.
const dropShadowOf = (shadow: string) => {
  const [x = '', y = '', blur = '', , colour = ''] = shadow.split(' ')
  return {
    dx: Number.parseFloat(x),
    dy: Number.parseFloat(y),
    stdDeviation: Number.parseFloat(blur) / 2,
    floodColor: colour.slice(0, 7),
    floodOpacity: Number.parseInt(colour.slice(7, 9), 16) / 255,
  }
}

// The pictures of Empty State / Jobs, 894:79231, and Empty State / Network,
// 1083:55308, read on 2026-11-04: the exported drawings, 894-79231.svg and
// 1083-55308.svg beside this file, their geometry in illustrations.json, as the
// mark's is in mark.json. Behind both a disc of picture/disc and, in front, the
// plus on a brand disc; between them the board's three cards, tilted, with a
// brand stripe and the lines of a card, or the network's two people's cards,
// the front one raised by its own shadow. Only the colours come from the theme,
// so the dark palette reaches the pictures as it reaches every other colour.
// Decorative, and never mirrored: a drawing has no direction to follow.
export const EmptyPicture = ({ picture }: { picture: EmptyPictureName }) => {
  const colour = useTheme().karnama.semantic
  // React's ids hold characters an SVG reference cannot follow, so the filter's
  // keeps only letters, digits, the dash and the underscore.
  const shadowId = useId().replace(/[^\w-]/g, '')
  const shadow = dropShadowOf(elevation.illustrationCard)
  const { jobs, network } = geometry
  return (
    <Box component="svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} aria-hidden sx={{ display: 'block', flexShrink: 0, width: WIDTH, height: HEIGHT }}>
      <path d={geometry.backdrop} fill={colour['picture/disc']} />
      {picture === 'jobs' ? (
        <>
          <path d={jobs.backCard} fill={colour['picture/blue']} />
          <path d={jobs.tiltedCard} fill={colour['picture/pale']} stroke={colour['picture/edge']} strokeWidth={EDGE} />
          <path d={jobs.frontCard} fill={colour['bg/surface']} stroke={colour['picture/edge']} strokeWidth={EDGE} />
          <path d={jobs.stripe} fill={colour['bg/brand/default']} />
          <path d={jobs.square} fill={colour['picture/pale']} />
          <path d={jobs.titleLine} fill={colour['picture/edge']} />
          {jobs.lines.map((d) => (
            <path key={d} d={d} fill={colour['picture/line']} />
          ))}
        </>
      ) : (
        <>
          <defs>
            <filter id={shadowId} x={SHADOW_FROM} y={SHADOW_FROM} width={SHADOW_ACROSS} height={SHADOW_DOWN}>
              <feDropShadow {...shadow} />
            </filter>
          </defs>
          <rect {...network.topCard} fill={colour['picture/pale']} stroke={colour['picture/edge']} strokeWidth={EDGE} />
          <circle {...network.topAvatar} fill={colour['picture/blue']} />
          <rect {...network.topTitle} fill={colour['picture/edge']} />
          <rect {...network.topLine} fill={colour['picture/line']} />
          <rect {...network.frontCard} fill={colour['bg/surface']} stroke={colour['picture/edge']} strokeWidth={EDGE} filter={`url(#${shadowId})`} />
          <circle {...network.frontAvatar} fill={colour['picture/blue']} />
          <rect {...network.frontTitle} fill={colour['picture/edge']} />
          <rect {...network.frontLine} fill={colour['picture/line']} />
          <rect {...network.frontStripe} fill={colour['bg/brand/default']} />
        </>
      )}
      <path d={geometry.badge} fill={colour['bg/brand/default']} />
      <path d={geometry.plus} stroke={colour['text/on-accent']} strokeWidth={PLUS} strokeLinecap="round" />
    </Box>
  )
}
