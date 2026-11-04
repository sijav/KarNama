import { useLingui } from '@lingui/react'
import { Box, ButtonBase, type Theme } from '@mui/material'
import { useId, useRef } from 'react'
import { usePreferences } from '../../core/preferences'
import { spacing, unstyledText, type SemanticToken } from '../../theme/tokens'
import { ActionChip } from '../action-chip'
import { Icon, type IconName } from '../icon'
import { InlineLink } from '../inline-link'
import { interviewDay, interviewWhen, waitingFor } from './words'

// The props are documented in story-docs, not here, KN-207.
export type InterviewSlotState = 'none' | 'dated' | 'waiting' | 'question' | 'next'

export interface InterviewSlotProps {
  state: InterviewSlotState
  at?: string | null
  today: string
  waitingSince?: string | null
  onPlan: (anchor: HTMLElement) => void
  onAsk?: () => void
  onResult: (anchor: HTMLElement) => void
  onWaiting: () => void
  onNextRound: () => void
  onReschedule: (anchor: HTMLElement) => void
}

// Node 656:6291 binds no variable to its sizes. The open rows, no date and the
// next round, are 4 above and below with 4 between and nothing at the sides;
// the boxed rows, dated and waiting, 6 above and below and 8 at the sides with
// 6 between, at radius 6; the question 8 round and 8 between, its answers 6
// apart. 4 and 8 are spacing 2xs and xs.
const BOXED_GAP = 6
const BOXED_PADDING_BLOCK = 6
const RADIUS = 6
const ANSWER_GAP = 6
const SMALL_ICON = 14
// The hover's dissolve, 120 ms, which fades the label's underline in.
const HOVER_MS = 120
// The keyboard's ring, which the file does not draw: three inside a boxed row,
// as inside the Action Chip, and round an open row an outline two clear of it,
// as round the Inline Link, KN-294.
const FOCUS_RING = 3
const FOCUS_GAP = 2

// The part of a row that its hover underlines, the label.
const UNDERLINED = 'KarnamaInterviewSlot-label'

const labelText = unstyledText.interviewSlotLabel
const plainText = unstyledText.interviewSlotText

type Row = Exclude<InterviewSlotState, 'question'>

// How each row is drawn: its icon, its colour, the fill of a boxed row, and
// whether its label and its words at the inline end are at Medium.
interface Look {
  icon: IconName
  colour: SemanticToken
  fill: SemanticToken | null
  strongLabel: boolean
  strongEnd: boolean
}

const LOOKS: Record<Row, Look> = {
  none: { icon: 'plus', colour: 'text/secondary', fill: null, strongLabel: false, strongEnd: false },
  next: { icon: 'plus', colour: 'text/secondary', fill: null, strongLabel: false, strongEnd: false },
  dated: { icon: 'calendar', colour: 'text/brand', fill: 'bg/brand/container', strongLabel: true, strongEnd: true },
  waiting: { icon: 'clock', colour: 'text/secondary', fill: 'bg/surface-secondary', strongLabel: true, strongEnd: false },
}

// Words at 12 on 19, at Medium or at Regular, under an sx key, which the lint
// rule reads as CSS.
const words = {
  sx: (strong: boolean) => {
    const text = strong ? labelText : plainText
    return {
      fontSize: `${text.size}px`,
      lineHeight: `${text.lineHeight}px`,
      fontWeight: text.weight,
      letterSpacing: text.letterSpacing,
      whiteSpace: 'nowrap',
    } as const
  },
}

// A row in its look: open or boxed, a button when it does something, its label
// underlined under the pointer.
const row = {
  sx: (theme: Theme, look: Look, pressable: boolean) => {
    const colour = theme.karnama.semantic
    const boxed = look.fill !== null
    return {
      position: 'relative',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      width: '100%',
      gap: `${boxed ? BOXED_GAP : spacing['2xs']}px`,
      paddingBlock: `${boxed ? BOXED_PADDING_BLOCK : spacing['2xs']}px`,
      paddingInline: `${boxed ? spacing.xs : 0}px`,
      borderRadius: `${boxed ? RADIUS : theme.karnama.radius.sm}px`,
      ...(look.fill === null ? {} : { backgroundColor: colour[look.fill] }),
      color: colour[look.colour],
      textAlign: 'start',
      ...(pressable
        ? {
            [`& .${UNDERLINED}`]: {
              textDecorationLine: 'underline',
              textDecorationColor: 'transparent',
              textDecorationThickness: 'from-font',
              textUnderlinePosition: 'from-font',
              transition: `text-decoration-color ${HOVER_MS}ms ease-out`,
            },
            '@media (hover: hover)': { [`&:hover .${UNDERLINED}`]: { textDecorationColor: 'currentcolor' } },
            '@media (prefers-reduced-motion: reduce)': { [`& .${UNDERLINED}`]: { transition: 'none' } },
            '&.Mui-focusVisible': boxed
              ? {}
              : { outlineStyle: 'solid', outlineWidth: FOCUS_RING, outlineColor: colour['border/focus'], outlineOffset: FOCUS_GAP },
            '&.Mui-focusVisible::after': boxed
              ? {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 'inherit',
                  borderStyle: 'solid',
                  borderWidth: FOCUS_RING,
                  borderColor: colour['border/focus'],
                  pointerEvents: 'none',
                }
              : {},
          }
        : {}),
    } as const
  },
}

// An icon at 14, the size none of the icon set's names is, in its box.
const Small = ({ name }: { name: IconName }) => (
  <Box
    component="span"
    aria-hidden
    sx={{ display: 'inline-flex', flexShrink: 0, width: SMALL_ICON, height: SMALL_ICON, '& > svg': { width: '100%', height: '100%' } }}
  >
    <Icon name={name} size="sm" color="inherit" />
  </Box>
)

// Card / Interview Slot, node 656:6291, KN-747: the interview's row on a card
// in the interview column, in one of five states. No date, «+ تاریخ مصاحبه»,
// and the next round, «+ تاریخ دور دوم», are open rows in text/secondary that
// plan the date. Dated is a row on bg/brand/container in text/brand, the
// calendar and «مصاحبه» at the inline start and when, «امروز · ۱۴:۰۰», at the
// inline end; pressed, it plans the date again. Waiting is the same on
// bg/surface-secondary in text/secondary, the clock, «منتظر نتیجهٔ مصاحبه» and
// how long, «از ۳ روز پیش»; the file gives its press no action, so it is a
// button only when the board asks again. The question, «مصاحبهٔ سه‌شنبه چی
// شد؟», offers the next round, waiting and the result as three Chip / Action,
// and the Link / Inline «تاریخش عوض شد». Under the pointer a row's label is
// underlined over the file's 120 ms dissolve. A dated row or a question with
// no day to name is drawn as the row with no date.
export const InterviewSlot = ({
  state,
  at = null,
  today,
  waitingSince = null,
  onPlan,
  onAsk,
  onResult,
  onWaiting,
  onNextRound,
  onReschedule,
}: InterviewSlotProps) => {
  const { i18n } = useLingui()
  const { locale } = usePreferences()
  const questionId = useId()
  const slot = useRef<HTMLDivElement>(null)
  const drawn: InterviewSlotState = (state === 'dated' || state === 'question') && at === null ? 'none' : state

  if (drawn === 'question' && at !== null) {
    return (
      <Box
        ref={slot}
        role="group"
        aria-labelledby={questionId}
        sx={(theme) => ({
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          width: '100%',
          gap: `${spacing.xs}px`,
          padding: `${spacing.xs}px`,
          borderRadius: `${RADIUS}px`,
          backgroundColor: theme.karnama.semantic['bg/surface-secondary'],
        })}
      >
        <Box
          component="span"
          id={questionId}
          sx={(theme) => ({ ...words.sx(true), alignSelf: 'stretch', whiteSpace: 'normal', color: theme.karnama.semantic['text/primary'] })}
        >
          {`${i18n._('How did the interview on')} ${interviewDay(locale, at)} ${i18n._('go?')}`}
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: `${ANSWER_GAP}px` }}>
          <ActionChip label={i18n._('Next round')} onClick={onNextRound} />
          <ActionChip label={i18n._('Waiting for the result')} onClick={onWaiting} />
          <ActionChip
            label={i18n._('Got the result')}
            onClick={() => {
              if (slot.current) onResult(slot.current)
            }}
          />
        </Box>
        <InlineLink
          label={i18n._('Its date changed')}
          onClick={() => {
            if (slot.current) onReschedule(slot.current)
          }}
        />
      </Box>
    )
  }

  const kind: Row = drawn === 'question' ? 'none' : drawn
  const look = LOOKS[kind]
  const label =
    kind === 'dated'
      ? i18n._('Interview')
      : kind === 'waiting'
        ? i18n._('Result pending')
        : kind === 'next'
          ? i18n._('Second round date')
          : i18n._('Interview date')
  const end =
    kind === 'dated' && at !== null
      ? interviewWhen(i18n, locale, at, today)
      : kind === 'waiting' && waitingSince !== null
        ? waitingFor(i18n, locale, waitingSince, today)
        : null
  const ask = kind === 'waiting' ? onAsk : undefined
  const pressable = kind !== 'waiting' || ask !== undefined
  const content = (
    <>
      <Small name={look.icon} />
      <Box
        component="span"
        className={UNDERLINED}
        sx={{ ...words.sx(look.strongLabel), minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        {label}
      </Box>
      {end === null ? null : (
        <>
          <Box component="span" sx={{ flexGrow: 1 }} />
          <Box component="span" sx={{ ...words.sx(look.strongEnd), flexShrink: 0 }}>
            {end}
          </Box>
        </>
      )}
    </>
  )

  if (!pressable) return <Box sx={(theme) => row.sx(theme, look, false)}>{content}</Box>
  return (
    <ButtonBase
      disableRipple
      onClick={(event) => {
        if (ask) ask()
        else onPlan(event.currentTarget)
      }}
      sx={(theme) => row.sx(theme, look, true)}
    >
      {content}
    </ButtonBase>
  )
}
