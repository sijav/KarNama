import { Box } from '@mui/material'
import { iconSize, type semantic } from '../../theme/tokens'
import { GLYPHS, type IconName } from './glyphs'

// The props are documented in story-docs, not here, KN-207.
export interface IconProps {
  name: IconName
  size?: keyof typeof iconSize
  color?: keyof typeof semantic | 'inherit'
  'aria-label'?: string
}

// The file's stroke, two pixels at every size: its instances resize the icon
// and keep the stroke, as the Color Picker's 14 pixel check does, so the
// stroke does not scale with the drawing.
const STROKE = 2

// An icon of node 239:44 in its 24 grid, drawn at a size from the token scale,
// `text/secondary` unless the caller names another role, or `inherit` to take
// the colour of what holds it. Decorative unless it is given a name, when it is
// an image with that name.
export const Icon = ({ name, size = 'base', color = 'text/secondary', 'aria-label': label }: IconProps) => {
  const glyph = GLYPHS[name]
  return (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      {...(label === undefined ? { 'aria-hidden': true } : { role: 'img', 'aria-label': label })}
      sx={(theme) => ({
        display: 'inline-block',
        flexShrink: 0,
        width: iconSize[size],
        height: iconSize[size],
        color: color === 'inherit' ? 'inherit' : theme.karnama.semantic[color],
        fill: 'none',
      })}
    >
      {glyph.stroke.map((d) => (
        <path key={d} d={d} stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      ))}
      {glyph.fill.map((d) => (
        <path key={d} d={d} fill="currentColor" />
      ))}
    </Box>
  )
}
