import { Box } from '@mui/material'
import { usePreferences } from '../../core/preferences'
import { formatCount } from '../../i18n/formatCount'
import { spacing, type as typeScale } from '../../theme/tokens'

// The props are documented in story-docs, not here, KN-207.
export interface WeekBarProps {
  count: number
  current?: boolean
  height?: number
}

// Node 1168:3183 binds no variable to its width, 32, or to the specimen's
// height, 68, which the page replaces with one in proportion to the count; the
// bar keeps at least a pixel, as the file's minimum height does.
const WIDTH = 32
const SPECIMEN_HEIGHT = 68
const LEAST_BAR = 1

const { label } = typeScale

// The least a bar is drawn at: its count, the 4 under it and a pixel of bar.
const LEAST_HEIGHT = label.lineHeight + spacing['2xs'] + LEAST_BAR

// Stats / Week Bar, node 1168:3183, Current=No and Current=Yes: one bar of the
// Stats page's applications by week. The count in Label, centred, 4 above a bar
// of radius sm that fills the rest of the height the page gives it; this week,
// Current, draws the count in text/primary over bg/brand/default, the others in
// text/secondary over bg/brand/container. The bar is the count drawn, so it is
// hidden from a screen reader, which reads the count.
export const WeekBar = ({ count, current = false, height = SPECIMEN_HEIGHT }: WeekBarProps) => {
  const { locale } = usePreferences()
  return (
    <Box
      sx={{
        boxSizing: 'border-box',
        flexShrink: 0,
        width: WIDTH,
        height: Math.max(height, LEAST_HEIGHT),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: `${spacing['2xs']}px`,
      }}
    >
      <Box
        component="span"
        sx={(theme) => ({
          flexShrink: 0,
          fontSize: `${label.size}px`,
          lineHeight: `${label.lineHeight}px`,
          fontWeight: label.weight,
          letterSpacing: `${label.letterSpacing}px`,
          whiteSpace: 'nowrap',
          color: theme.karnama.semantic[current ? 'text/primary' : 'text/secondary'],
        })}
      >
        {formatCount(locale, count)}
      </Box>
      <Box
        aria-hidden
        sx={(theme) => ({
          flex: '1 0 0',
          // In pixels: MUI reads a size of 1 or less as a fraction of the parent.
          minHeight: `${LEAST_BAR}px`,
          width: '100%',
          borderRadius: `${theme.karnama.radius.sm}px`,
          backgroundColor: theme.karnama.semantic[current ? 'bg/brand/default' : 'bg/brand/container'],
        })}
      />
    </Box>
  )
}
