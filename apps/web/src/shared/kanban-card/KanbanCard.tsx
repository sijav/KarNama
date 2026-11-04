import { useLingui } from '@lingui/react'
import { Box, ButtonBase, type Theme } from '@mui/material'
import { useRef, type HTMLAttributes, type ReactNode } from 'react'
import { spacing, unstyledText, type StatusToken } from '../../theme/tokens'
import { Checkbox } from '../checkbox'
import { CompanyLogo } from '../company-logo'
import { Icon, type IconName } from '../icon'
import { IconButton } from '../icon-button'
import { InlineLink } from '../inline-link'
import type { CardFooter } from '../job-card'

// The props are documented in story-docs, not here, KN-207.
export interface KanbanCardProps {
  title: string
  company: string
  logo?: string
  location?: string | null
  salary?: string | null
  source?: string | null
  status: StatusToken
  note?: string | null
  footer: CardFooter
  interview?: ReactNode
  waiting?: boolean
  selecting?: boolean
  selected?: boolean
  dragEvents?: Pick<HTMLAttributes<HTMLElement>, 'draggable' | 'onDragStart' | 'onDragEnd' | 'onClickCapture'>
  onOpen: () => void
  onSelectedChange: (selected: boolean) => void
  onMore?: (anchor: HTMLElement) => void
  onEditDate?: (anchor: HTMLElement) => void
  onNoResponse?: () => void
}

// Node 793:1820's measures that bind no variable: the stripe's 4, the edge's
// one and the Selected ring's two; the 6 between the meta line's and the note
// line's parts, and the prompt's 6 above and below at radius 6; the footer's
// 10; the pencil's 28 by 19 at radius 5 and the 14 its icon, the note's and
// the More button's dots are drawn at, which is none of the icon sizes.
const STRIPE = 4
const EDGE = 1
const RING = 2
const NEAR = 6
const FOOTER_GAP = 10
const PENCIL = { width: 28, height: 19, radius: 5 } as const
const SMALL_ICON = 14
const PROMPT_RADIUS = 6
// The More button's square, which folds to nothing at rest.
const MORE = 28
// The hover's motion, the card's own reaction, Smart Animate over 150 ms, and
// the pencil's, 120 ms, 793:1764.
const HOVER_MS = 150
const PENCIL_MS = 120

// What shows only under the pointer or with the keyboard's focus inside: the
// More button and the pencil. Folded, not gone, so Tab still reaches them,
// KN-341, as the old card's checkbox and delete were.
const MORE_SLOT = 'KarnamaKanbanCard-more'
const PENCIL_SLOT = 'KarnamaKanbanCard-pencil'
// The card's own button, the title, whose focus is the card's.
const OPENER = 'KarnamaKanbanCard-title'

const titleText = unstyledText.kanbanTitle
const lineText = unstyledText.kanbanText
const deadlineText = unstyledText.kanbanDeadline

// One line, cut rather than wrapped. Under an sx key, which the lint rule reads as CSS.
const oneLine = { sx: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } } as const

// A line of the card's own text, 12 on 19, in a colour of the theme.
const line = {
  sx: (theme: Theme, colour: 'text/primary' | 'text/secondary' | 'text/disabled' | 'text/error', weight: number = lineText.weight) => ({
    fontSize: `${lineText.size}px`,
    lineHeight: `${lineText.lineHeight}px`,
    fontWeight: weight,
    letterSpacing: lineText.letterSpacing,
    color: theme.karnama.semantic[colour],
  }),
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

// The card's frame in each state, under an sx key for the same reason.
const frame = {
  sx: (theme: Theme, selecting: boolean, selected: boolean) => {
    const colour = theme.karnama.semantic
    const unfolded = { width: MORE, marginInlineStart: 0, opacity: 1, pointerEvents: 'auto' }
    const pencilUnfolded = { width: PENCIL.width, marginInlineStart: 0, opacity: 1, pointerEvents: 'auto' }
    return {
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: `${spacing.sm}px`,
      padding: `${spacing.md}px`,
      borderRadius: `${theme.karnama.radius.md}px`,
      backgroundColor: colour['bg/surface'],
      transition: `box-shadow ${HOVER_MS}ms ease-in-out`,
      // The edge, one pixel of border/default inside, and Selected's ring, two
      // of the brand's, over it.
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        borderStyle: 'solid',
        borderWidth: selected ? RING : EDGE,
        borderColor: selected ? colour['border/focus'] : colour['border/default'],
        pointerEvents: 'none',
        zIndex: 2,
      },
      '@media (hover: hover)': {
        // Hover, and Select Hover while the board is selecting: the shadow, and
        // More, which selecting keeps away.
        '&:hover': { boxShadow: theme.karnama.elevation.kanbanCard },
        ...(selecting ? {} : { [`&:hover .${MORE_SLOT}`]: unfolded }),
        [`&:hover .${PENCIL_SLOT}`]: pencilUnfolded,
      },
      // Where there is no hover, as on a phone, More is always in view, the
      // handoff's «منوی «…» روی کارت همیشه دیده می‌شود».
      '@media (hover: none)': selecting ? {} : { [`& .${MORE_SLOT}`]: unfolded },
      // The keyboard's focus inside unfolds both, so Tab reaches each.
      [`&:has(:focus-visible) .${PENCIL_SLOT}`]: pencilUnfolded,
      ...(selecting ? {} : { [`&:has(:focus-visible) .${MORE_SLOT}`]: unfolded }),
      // Focus on the card's own button: two of border/focus round it.
      [`&:has(.${OPENER}.Mui-focusVisible)::before`]: { borderWidth: RING, borderColor: colour['border/focus'] },
      '@media (prefers-reduced-motion: reduce)': {
        '&': { transition: 'none' },
        [`& .${MORE_SLOT}, & .${PENCIL_SLOT}`]: { transition: 'none' },
      },
    } as const
  },
}

// Card / Kanban, node 793:1820, Default, Hover and Select Hover, each with the
// deadline normal, near or passed, KN-745. From the top: the head, the Select
// slot while selecting, the Company Logo, the title over the company, and More
// on hover; the meta line, the location, a dot and the salary; the interview
// slot, KN-747's; the note line; the prompt that asks whether the reader is
// still waiting; and the footer, the source at the inline start and every time
// at the inline end, the deadline with its clock, red when near, then the
// pencil that edits it. The status's stripe runs down the inline start. The
// title is the card's button: its ::after covers the card, so a press anywhere
// that is not another control opens it, or, while selecting, selects it, the
// handoff's «تا پایانش هر کلیک انتخاب است». Hover lifts it with its shadow.
export const KanbanCard = ({
  title,
  company,
  logo,
  location = null,
  salary = null,
  source = null,
  status,
  note = null,
  footer,
  interview,
  waiting = false,
  selecting = false,
  selected = false,
  dragEvents,
  onOpen,
  onSelectedChange,
  onMore,
  onEditDate,
  onNoResponse,
}: KanbanCardProps) => {
  const { i18n } = useLingui()
  const more = useRef<HTMLDivElement>(null)
  const pencil = useRef<HTMLDivElement>(null)
  const meta = [location, salary].filter((part): part is string => part !== null && part !== '')
  const editing = footer.edits !== null && onEditDate !== undefined
  return (
    <Box component="article" {...dragEvents} sx={(theme) => frame.sx(theme, selecting, selected)}>
      <Box
        aria-hidden
        sx={(theme) => ({
          position: 'absolute',
          insetBlock: 0,
          insetInlineStart: 0,
          width: `${STRIPE}px`,
          backgroundColor: theme.karnama.status[status].base,
        })}
      />
      {/* The head, 12 between its parts. */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.sm}px`, minWidth: 0 }}>
        {selecting ? (
          // The Select slot, 20: the Checkbox's 28 root gives its four back.
          <Box sx={{ position: 'relative', zIndex: 1, flexShrink: 0, margin: `-${spacing['2xs']}px` }}>
            <Checkbox
              checked={selected}
              aria-label={`${i18n._('Select')} ${title}`}
              onChange={(_, checked) => {
                onSelectedChange(checked)
              }}
            />
          </Box>
        ) : null}
        <Box sx={{ flexShrink: 0, display: 'inline-flex' }}>
          <CompanyLogo {...(logo === undefined ? {} : { src: logo })} />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: '1 1 0', minWidth: 0 }}>
          <ButtonBase
            className={OPENER}
            disableRipple
            onClick={() => {
              if (selecting) onSelectedChange(!selected)
              else onOpen()
            }}
            sx={(theme) => ({
              position: 'static',
              display: 'block',
              ...oneLine.sx,
              textAlign: 'start',
              fontFamily: 'inherit',
              fontSize: `${titleText.size}px`,
              lineHeight: `${titleText.lineHeight}px`,
              fontWeight: titleText.weight,
              letterSpacing: titleText.letterSpacing,
              color: theme.karnama.semantic['text/primary'],
              '&::after': { content: '""', position: 'absolute', inset: 0 },
            })}
          >
            {title}
          </ButtonBase>
          <Box component="span" sx={(theme) => ({ ...oneLine.sx, ...line.sx(theme, 'text/secondary') })}>
            {company}
          </Box>
        </Box>
        {onMore === undefined ? null : (
          <Box
            ref={more}
            className={MORE_SLOT}
            sx={{
              position: 'relative',
              zIndex: 1,
              flexShrink: 0,
              display: 'inline-flex',
              overflow: 'hidden',
              width: 0,
              marginInlineStart: `-${spacing.sm}px`,
              opacity: 0,
              pointerEvents: 'none',
              transition: `width ${HOVER_MS}ms ease-in-out, margin ${HOVER_MS}ms ease-in-out, opacity ${HOVER_MS}ms ease-in-out`,
            }}
          >
            <IconButton
              icon="more"
              compact
              aria-label={i18n._('Job opportunity actions')}
              aria-haspopup="menu"
              onClick={() => {
                if (more.current) onMore(more.current)
              }}
            />
          </Box>
        )}
      </Box>
      {/* The meta line, 6 between: the location, a dot, the salary. */}
      {meta.length === 0 ? null : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${NEAR}px`, minWidth: 0 }}>
          {meta.map((part, index) => (
            <Box key={part} component="span" sx={{ display: 'contents' }}>
              {index === 0 ? null : (
                <Box component="span" aria-hidden sx={(theme) => line.sx(theme, 'text/disabled')}>
                  ·
                </Box>
              )}
              <Box component="span" sx={(theme) => ({ ...oneLine.sx, ...line.sx(theme, 'text/secondary') })}>
                {part}
              </Box>
            </Box>
          ))}
        </Box>
      )}
      {interview === undefined ? null : <Box sx={{ position: 'relative', zIndex: 1 }}>{interview}</Box>}
      {/* The note line: its icon, then the note on one line. */}
      {note === null || note === '' ? null : (
        <Box
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            gap: `${NEAR}px`,
            minWidth: 0,
            color: theme.karnama.semantic['text/secondary'],
          })}
        >
          <Small name="note" />
          <Box component="span" sx={(theme) => ({ ...oneLine.sx, ...line.sx(theme, 'text/primary') })}>
            {note}
          </Box>
        </Box>
      )}
      {/* The prompt, when the board says the card has waited long: still
          waiting, and the link that says it went unanswered. */}
      {!waiting || onNoResponse === undefined ? null : (
        <Box
          sx={(theme) => ({
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: `${spacing.xs}px`,
            paddingBlock: `${NEAR}px`,
            paddingInline: `${spacing.xs}px`,
            borderRadius: `${PROMPT_RADIUS}px`,
            backgroundColor: theme.karnama.semantic['bg/surface-secondary'],
          })}
        >
          <Box component="span" sx={(theme) => line.sx(theme, 'text/primary')}>
            {i18n._('Still waiting?')}
          </Box>
          <InlineLink label={i18n._('It went unanswered')} onClick={onNoResponse} />
        </Box>
      )}
      {/* The footer, 10 between: the source at the inline start, the time at
          the inline end, the pencil after it. */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: `${FOOTER_GAP}px`, minWidth: 0 }}>
        {source === null || source === '' ? null : (
          <Box component="span" sx={(theme) => ({ ...oneLine.sx, ...line.sx(theme, 'text/secondary') })}>
            {source}
          </Box>
        )}
        <Box sx={{ flex: '1 1 0' }} />
        {footer.clock ? (
          <Box
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              gap: `${spacing['2xs']}px`,
              flexShrink: 0,
              color: theme.karnama.semantic['text/secondary'],
            })}
          >
            <Icon name="clock" size="sm" color="inherit" />
            <Box component="span" sx={(theme) => line.sx(theme, footer.urgent ? 'text/error' : 'text/secondary', deadlineText.weight)}>
              {footer.text}
            </Box>
          </Box>
        ) : (
          <Box component="span" sx={(theme) => ({ flexShrink: 0, ...line.sx(theme, footer.urgent ? 'text/error' : 'text/secondary') })}>
            {footer.text}
          </Box>
        )}
        {editing ? (
          <Box
            ref={pencil}
            className={PENCIL_SLOT}
            sx={{
              position: 'relative',
              zIndex: 1,
              flexShrink: 0,
              display: 'inline-flex',
              overflow: 'hidden',
              width: 0,
              marginInlineStart: `-${FOOTER_GAP}px`,
              opacity: 0,
              pointerEvents: 'none',
              transition: `width ${HOVER_MS}ms ease-in-out, margin ${HOVER_MS}ms ease-in-out, opacity ${HOVER_MS}ms ease-in-out`,
            }}
          >
            <ButtonBase
              disableRipple
              aria-label={footer.edits === 'deadline' ? i18n._('Change the deadline') : i18n._('Change the application date')}
              aria-haspopup="dialog"
              onClick={() => {
                if (pencil.current) onEditDate(pencil.current)
              }}
              sx={(theme) => ({
                flexShrink: 0,
                width: PENCIL.width,
                height: PENCIL.height,
                borderRadius: `${PENCIL.radius}px`,
                color: theme.karnama.semantic['text/secondary'],
                transition: `background-color ${PENCIL_MS}ms ease-out`,
                '@media (hover: hover)': { '&:hover': { backgroundColor: theme.karnama.semantic['bg/surface-secondary'] } },
                '&.Mui-focusVisible': { outlineWidth: RING, outlineStyle: 'solid', outlineColor: theme.karnama.semantic['border/focus'] },
              })}
            >
              <Small name="pencil" />
            </ButtonBase>
          </Box>
        ) : null}
      </Box>
    </Box>
  )
}
