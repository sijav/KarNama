import { useLingui } from '@lingui/react'
import { Box, ButtonBase, type Theme } from '@mui/material'
import { spacing, unstyledText, type StatusToken } from '../../theme/tokens'
import { GLYPHS } from '../icon/glyphs'
import { StatusChip } from '../status-chip'

// The props are documented in story-docs, not here, KN-207.
interface SharedProps {
  date: string
  source: string
  lineAbove: boolean
  lineBelow: boolean
  locked?: boolean
  layout?: 'desktop' | 'mobile'
  onEdit?: () => void
}

interface StatusRowProps extends SharedProps {
  kind: 'status'
  status: { token: StatusToken; name: string }
}

interface RoundRowProps extends SharedProps {
  kind: 'round'
  title: string
}

export type HistoryRowProps = StatusRowProps | RoundRowProps

// Nodes 749:32 and 1313:3390 bind no variable to these: the marker's 12 and
// its two pixel lines, a status's solid dot of 10 and a round's hollow 8 inside
// one and a half, the 6 inside the date, the pencil's 14 off the icon sizes,
// its two pixel stroke, and the keyboard's ring of three.
const MARKER = 12
const LINE = 2
const STATUS_DOT = 10
const ROUND_DOT = 8
const ROUND_EDGE = 1.5
const DATE_GAP = 6
const PENCIL = 14
const STROKE = 2
const FOCUS_RING = 3

// The desktop row's typed default, so the lint rule reads it as a value.
const DESKTOP: NonNullable<SharedProps['layout']> = 'desktop'

// The classes the desktop row's hover reaches into: the date and source turn
// and hide, the pencil shows.
const DATE = 'KarnamaHistoryRow-date'
const SOURCE = 'KarnamaHistoryRow-source'
const EDIT = 'KarnamaHistoryRow-pencil'

const dated = unstyledText.historyDate
const titled = unstyledText.historyTitle
// Medium, the date's weight under the pointer, the title's own.
const typeHover = titled.weight

// The words the date is set in, 12 on 19 at Regular in text/secondary.
const dateText = {
  sx: (theme: Theme) => ({
    fontSize: `${dated.size}px`,
    lineHeight: `${dated.lineHeight}px`,
    fontWeight: dated.weight,
    letterSpacing: `${dated.letterSpacing}px`,
    color: theme.karnama.semantic['text/secondary'],
    whiteSpace: 'nowrap',
  }),
}

// A line of the marker, two pixels of border/default, or room kept for one
// when the row is the first or the last.
const Line = ({ shown }: { shown: boolean }) => (
  <Box
    aria-hidden
    sx={(theme) => ({
      flex: '1 1 0',
      width: `${LINE}px`,
      backgroundColor: theme.karnama.semantic['border/default'],
      visibility: shown ? 'visible' : 'hidden',
    })}
  />
)

// History / Row, node 749:32, and History / Row (Mobile), 1313:3390: one entry
// of a job opportunity's history, a status it entered or an interview round,
// newest first. From the inline start the Marker, a line above and below a dot,
// solid for a status and hollow for a round; the status's small chip or the
// round's title; and the date with its source after it. On a desktop the row is
// 43 tall and its date, its source and the hidden pencil sit after the heading;
// under the pointer, and while keyboard focus is inside, it fills with
// bg/surface-secondary, the date turns text/brand at Medium, the source gives
// way to the pencil. On a phone the heading sits over the date and the pencil
// always shows. A locked row, the saved one, has no pencil and does not change.
// The date, its source and the pencil are one button that asks to change the
// date.
export const HistoryRow = (props: HistoryRowProps) => {
  const { date, source, lineAbove, lineBelow, locked = false, layout = DESKTOP, onEdit } = props
  const { i18n } = useLingui()
  const mobile = layout !== DESKTOP
  const editable = !locked && onEdit !== undefined
  const heading =
    props.kind === 'status' ? (
      <StatusChip status={props.status.token} label={props.status.name} size="S" />
    ) : (
      <Box
        component="span"
        sx={(theme) => ({
          fontSize: `${titled.size}px`,
          lineHeight: `${titled.lineHeight}px`,
          fontWeight: titled.weight,
          letterSpacing: `${titled.letterSpacing}px`,
          color: theme.karnama.semantic['text/primary'],
        })}
      >
        {props.title}
      </Box>
    )
  const pencil = (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      aria-hidden
      className={EDIT}
      sx={(theme) => ({
        display: mobile && editable ? 'block' : 'none',
        flexShrink: 0,
        width: PENCIL,
        height: PENCIL,
        fill: 'none',
        stroke: 'currentColor',
        color: theme.karnama.semantic[mobile ? 'text/secondary' : 'text/brand'],
      })}
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {GLYPHS.pencil.stroke.map((d) => (
        <path key={d} d={d} vectorEffect="non-scaling-stroke" />
      ))}
    </Box>
  )
  const words = (
    <>
      <Box component="span" className={DATE} sx={(theme) => dateText.sx(theme)}>
        {date}
      </Box>
      <Box component="span" className={SOURCE} sx={(theme) => dateText.sx(theme)}>
        {`· ${source}`}
      </Box>
      {pencil}
    </>
  )
  // The date, its source and the pencil, 6 apart, 12 above and below on a
  // desktop. Under an sx key, which the lint rule reads as CSS.
  const dateGroup = { sx: { display: 'flex', alignItems: 'center', gap: `${DATE_GAP}px`, paddingBlock: mobile ? 0 : `${spacing.sm}px` } }
  return (
    <Box
      sx={(theme) => {
        const colour = theme.karnama.semantic
        const lit = {
          backgroundColor: colour['bg/surface-secondary'],
          [`& .${DATE}`]: { color: colour['text/brand'], fontWeight: typeHover },
          [`& .${SOURCE}`]: { display: 'none' },
          [`& .${EDIT}`]: { display: 'block' },
        }
        return {
          boxSizing: 'border-box',
          width: '100%',
          display: 'flex',
          alignItems: mobile ? 'stretch' : 'center',
          gap: `${spacing.sm}px`,
          paddingInline: `${spacing.sm}px`,
          borderRadius: `${theme.karnama.radius.md}px`,
          ...(mobile || !editable ? {} : { '@media (hover: hover)': { '&:hover': lit }, '&:focus-within': lit }),
        }
      }}
    >
      <Box aria-hidden sx={{ flexShrink: 0, width: MARKER, display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'stretch' }}>
        <Line shown={lineAbove} />
        <Box
          sx={(theme) =>
            props.kind === 'status'
              ? { flexShrink: 0, width: STATUS_DOT, height: STATUS_DOT, borderRadius: '50%', backgroundColor: theme.karnama.semantic['text/secondary'] }
              : {
                  // The one and a half inside as an inset shadow, since Chromium
                  // floors a border of 1.5 to one, as the Select's open edge is drawn.
                  flexShrink: 0,
                  width: ROUND_DOT,
                  height: ROUND_DOT,
                  borderRadius: '50%',
                  boxShadow: `inset 0 0 0 ${ROUND_EDGE}px ${theme.karnama.semantic['text/secondary']}`,
                  backgroundColor: theme.karnama.semantic['bg/surface'],
                }
          }
        />
        <Line shown={lineBelow} />
      </Box>
      <Box
        sx={
          mobile
            ? { minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: `${spacing['2xs']}px`, paddingBlock: `${spacing.xs}px` }
            : { minWidth: 0, display: 'flex', alignItems: 'center', gap: `${spacing.sm}px` }
        }
      >
        {heading}
        {editable ? (
          <ButtonBase
            disableRipple
            aria-label={`${i18n._('Change the date')} ${date}`}
            onClick={onEdit}
            sx={(theme) => ({
              ...dateGroup.sx,
              position: 'relative',
              borderRadius: `${theme.karnama.radius.sm}px`,
              fontFamily: 'inherit',
              '&.Mui-focusVisible::after': {
                content: '""',
                position: 'absolute',
                inset: `-${FOCUS_RING}px`,
                borderRadius: 'inherit',
                borderStyle: 'solid',
                borderWidth: FOCUS_RING,
                borderColor: theme.karnama.semantic['border/focus'],
                pointerEvents: 'none',
              },
            })}
          >
            {words}
          </ButtonBase>
        ) : (
          <Box sx={dateGroup.sx}>{words}</Box>
        )}
      </Box>
    </Box>
  )
}
