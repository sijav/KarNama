import { Box, useTheme } from '@mui/material'
import type { semantic } from '../../theme/tokens'
import geometry from './mark.json'

// The props are documented in story-docs, not here, KN-207.
export interface LogoMarkProps {
  'aria-label'?: string
}

// The mark's square, 32, the only size node 576:7665 and its instances draw.
const MARK = 32

// The three shapes of the asset 576:7665 exports, 576-7665.svg beside this file,
// read on 2026-11-03: path data is drawing, not copy, so it lives in mark.json,
// as the icons' does in glyphs.json. In the order the file stacks them, the
// capsule, the upper leaf and the lower leaf, each with the token its fill is
// bound to in the file. The geometry is the asset's own; only the colours come
// from the theme, so the derived dark palette reaches the mark as it reaches
// every other colour, KN-742.
export const SHAPES: readonly { d: string; fill: keyof typeof semantic }[] = [
  { d: geometry.stem, fill: 'bg/brand/default' },
  { d: geometry.leafTop, fill: 'bg/brand/default' },
  { d: geometry.leafBottom, fill: 'gray/200' },
]

// Node 576:7665, a K of a capsule and two leaves. Decorative unless a caller
// names it, when it is an image with that name; never mirrored, since a mark
// has no direction to follow.
export const LogoMark = ({ 'aria-label': label }: LogoMarkProps) => {
  const theme = useTheme()
  return (
    <Box
      component="svg"
      viewBox={`0 0 ${MARK} ${MARK}`}
      {...(label === undefined ? { 'aria-hidden': true } : { role: 'img', 'aria-label': label })}
      sx={{ display: 'block', flexShrink: 0, width: MARK, height: MARK }}
    >
      {SHAPES.map(({ d, fill }) => (
        <path key={d} d={d} fill={theme.karnama.semantic[fill]} />
      ))}
    </Box>
  )
}
