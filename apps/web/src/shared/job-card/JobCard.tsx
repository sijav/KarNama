import { useLingui } from '@lingui/react'
import { Box, ButtonBase, type Theme } from '@mui/material'
import { useRef, useState, type HTMLAttributes, type ReactNode } from 'react'
import { iconSize, spacing, status, type as typeScale, type StatusToken } from '../../theme/tokens'
import { Checkbox } from '../checkbox'
import { Icon } from '../icon'
import { IconButton } from '../icon-button'
import { CardMenu } from '../menu'

// The props are documented in story-docs, not here, KN-207.
/** The desktop board's card, or the phone's, which carries its own menu. */
export type JobCardLayout = 'desktop' | 'mobile'

export interface JobCardProps {
  dragEvents?: Pick<HTMLAttributes<HTMLElement>, 'draggable' | 'onDragStart' | 'onDragEnd' | 'onClickCapture'>
  title: string
  company: string
  date: string
  status: string
  link?: string | null
  layout?: JobCardLayout
  selected?: boolean
  interactive?: boolean
  onOpen: () => void
  onSelectedChange: (selected: boolean) => void
  onDelete: () => void
  onChangeStatus: () => void
}

// Node 137:44's measures that bind no variable: the title row, 30 on the desktop
// and 32 on the phone, where it holds the 32 three dots of 491:751; the meta
// row, 28 on the desktop and 19 on the phone, the date's own line there, which
// the web font's normal line height would make 16; the delete, a 24 square;
// the stripe, 4 wide. The edges are the file's: one pixel at rest, one and a
// half hovered and selected, an inset shadow over the one pixel border since
// Chromium floors a border of 1.5, KN-282, and two focused, with its halo.
const TITLE_ROW = { desktop: 30, mobile: 32 } as const
const META_ROW = { desktop: 28, mobile: 19 } as const
const DELETE = 24
const STRIPE = 4
const EDGE = 1
const LIFTED_EDGE = 1.5
const FOCUS_EDGE = 2

// What appears only on hover, with focus inside, or selected: the desktop
// card's checkbox and delete. The file hides them at rest, and a hidden layer
// gives up its room, so here they fold to none and fade, and unfold as the card
// is hovered, moving the title over by 28 while the row keeps its 30. Never
// display none, which would take them out of the keyboard's path: Tab meets
// the checkbox first, as KN-341 asks of the Contact Card.
const CHECK = 'KarnamaJobCard-check'
const BIN = 'KarnamaJobCard-delete'
// Folded, the checkbox gives up its 20 frame, the 8 after it and the four its
// root already gives back, so the title starts where it would alone.
const FOLDED_CHECK = iconSize.md + spacing.xs + spacing['2xs']
// The hover's motion, the reaction from 137:2 to 137:16: Smart Animate, ease in
// and out, over 200 ms.
const HOVER_MS = 200
// The card's own button, the title, whose focus is the card's.
const OPENER = 'KarnamaJobCard-title'

// What an outside link carries, as a link and as a window's features, so the
// page it opens cannot reach back.
type Rel = 'noopener noreferrer'
const OUTSIDE: Rel = 'noopener noreferrer'
type Features = 'noopener,noreferrer'
const OUTSIDE_WINDOW: Features = 'noopener,noreferrer'

// The desktop card unless told otherwise.
const DESKTOP: JobCardLayout = 'desktop'

// A status the board no longer has, deleted or unknown, takes the new colour
// rather than no stripe.
const isToken = (value: string): value is StatusToken => value in status
const stripeOf = (value: string): StatusToken => (isToken(value) ? value : 'new')

// The title, 16 at SemiBold on the file's automatic line height, composed as the
// Empty State's is; the date, 12 at 400 on CSS's normal, as the Contact Card's
// compact role is.
const TITLE = { size: typeScale.title.size, lineHeight: typeScale.title.lineHeight, weight: typeScale['heading/m'].weight }

// One line, cut rather than wrapped. Under an sx key, which the lint rule reads as CSS.
const oneLine = { sx: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } } as const

// The card's frame in each state, under an sx key for the same reason.
const frame = {
  sx: (theme: Theme, layout: JobCardLayout, selected: boolean, interactive: boolean) => {
    const colour = theme.karnama.semantic
    const lifted = {
      boxShadow: `inset 0 0 0 ${LIFTED_EDGE}px ${colour['border/focus']}`,
      '&::before': { borderColor: colour['border/focus'] },
    }
    const shadowed = (shadow: string) => ({ ...lifted, boxShadow: `${lifted.boxShadow}, ${shadow}` })
    return {
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: `${spacing['2xs']}px`,
      padding: `${spacing.lg}px`,
      borderRadius: `${theme.karnama.radius.lg}px`,
      backgroundColor: selected ? colour['bg/brand/container'] : colour['bg/surface'],
      transition: `box-shadow ${HOVER_MS}ms ease-in-out, background-color ${HOVER_MS}ms ease-in-out`,
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        borderStyle: 'solid',
        borderWidth: EDGE,
        borderColor: colour['border/default'],
        pointerEvents: 'none',
        transition: `border-color ${HOVER_MS}ms ease-in-out`,
      },
      // Selected, 137:44 and 491:751: the brand's pale fill and the lifted edge,
      // with the card's shadow on the desktop.
      ...(selected ? (layout === 'desktop' ? shadowed(theme.karnama.elevation.card) : lifted) : {}),
      ...(interactive && layout === 'desktop'
        ? {
            // Hover: the lifted edge and Elevation/Card. Pressed, which the file
            // gives no motion: the secondary surface and the resting edge, at once.
            '&:hover': selected ? {} : shadowed(theme.karnama.elevation.card),
            [`&:has(.${OPENER}:active)`]: selected
              ? {}
              : {
                  backgroundColor: colour['bg/surface-secondary'],
                  boxShadow: 'none',
                  transition: 'none',
                  '&::before': { borderColor: colour['border/default'], transition: 'none' },
                },
            // The checkbox and delete unfold, 137:16.
            [`&:hover .${CHECK}, &:focus-within .${CHECK}`]: { marginInlineEnd: `-${spacing['2xs']}px`, opacity: 1, pointerEvents: 'auto' },
            [`&:hover .${BIN}, &:focus-within .${BIN}`]: { width: DELETE, marginInlineStart: 0, opacity: 1, pointerEvents: 'auto' },
          }
        : {}),
      // Focus by the keyboard: two pixels of border/focus and the file's halo.
      [`&:has(.${OPENER}.Mui-focusVisible)`]: {
        boxShadow: theme.karnama.elevation.cardFocus,
        '&::before': { borderWidth: FOCUS_EDGE, borderColor: colour['border/focus'] },
      },
      // A reader who asks for less motion gets each state at once.
      '@media (prefers-reduced-motion: reduce)': {
        '&, &::before': { transition: 'none' },
        [`& .${CHECK}, & .${BIN}`]: { transition: 'none' },
      },
    } as const
  },
}

// The title as the card's button: its ::after covers the whole card, so a press
// anywhere that is not another control opens the job opportunity.
const Opener = ({ onOpen, children }: { onOpen: () => void; children: ReactNode }) => (
  <ButtonBase
    className={OPENER}
    disableRipple
    onClick={onOpen}
    sx={(theme) => ({
      position: 'static',
      display: 'block',
      ...oneLine.sx,
      textAlign: 'start',
      // A button takes the browser's own font, not the page's; ButtonBase does
      // not give it back.
      fontFamily: 'inherit',
      fontSize: `${TITLE.size}px`,
      lineHeight: `${TITLE.lineHeight}px`,
      fontWeight: TITLE.weight,
      color: theme.karnama.semantic['text/primary'],
      '&::after': { content: '""', position: 'absolute', inset: 0 },
    })}
  >
    {children}
  </ButtonBase>
)

// The Card of node 137:44, desktop, Default, Hover, Pressed, Selected, Static and
// Focus, and 491:751, the phone's, Default and Selected, with the status stripe
// of 358:430 at the inline start, 4 wide, in the status's colour. The title is
// the card's button and opens the job opportunity; the link, when the posting
// has one, follows it. The desktop card's checkbox and delete join its title
// row on hover, with focus inside, or selected; the phone's card has no hover
// and keeps its three dots, which open the Card menu, in view.
export const JobCard = ({
  title,
  company,
  date,
  status: token,
  link = null,
  layout: given,
  selected = false,
  interactive = true,
  onOpen,
  onSelectedChange,
  onDelete,
  onChangeStatus,
  dragEvents,
}: JobCardProps) => {
  const { i18n } = useLingui()
  const layout = given ?? DESKTOP
  const more = useRef<HTMLElement>(null)
  const [menu, setMenu] = useState<HTMLElement | null>(null)
  // Desktop controls unfold on hover. Phones need a visible selection control
  // before the first card is selected, because they have no hover state.
  const folded = layout === 'desktop' && !selected
  const checkbox = (
    <Box
      className={CHECK}
      sx={{
        position: 'relative',
        zIndex: 1,
        flexShrink: 0,
        margin: `-${spacing['2xs']}px`,
        transition: `margin ${HOVER_MS}ms ease-in-out, opacity ${HOVER_MS}ms ease-in-out`,
        ...(folded ? { marginInlineEnd: `-${FOLDED_CHECK}px`, opacity: 0, pointerEvents: 'none' } : {}),
      }}
    >
      <Checkbox
        checked={selected}
        aria-label={`${i18n._('Select')} ${title}`}
        onChange={(_, checked) => {
          onSelectedChange(checked)
        }}
      />
    </Box>
  )
  return (
    <Box component="article" {...dragEvents} sx={(theme) => frame.sx(theme, layout, selected, interactive)}>
      <Box
        aria-hidden
        sx={(theme) => ({
          position: 'absolute',
          insetBlock: 0,
          insetInlineStart: 0,
          width: `${STRIPE}px`,
          backgroundColor: theme.karnama.status[stripeOf(token)].base,
        })}
      />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: `${spacing.xs}px`,
          height: TITLE_ROW[layout],
          minWidth: 0,
        }}
      >
        {/* The Title Group: the checkbox flush at its inline start, 8 from the
            title, its 28 root giving the four back, and nothing here clips, so
            its ring is whole, KN-293. */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.xs}px`, minWidth: 0 }}>
          {interactive ? checkbox : null}
          {interactive ? (
            <Opener onOpen={onOpen}>{title}</Opener>
          ) : (
            <Box
              component="span"
              sx={(theme) => ({
                ...oneLine.sx,
                fontSize: `${TITLE.size}px`,
                lineHeight: `${TITLE.lineHeight}px`,
                fontWeight: TITLE.weight,
                color: theme.karnama.semantic['text/primary'],
              })}
            >
              {title}
            </Box>
          )}
          {link === null ? null : (
            <Box
              component="a"
              href={link}
              target="_blank"
              rel={OUTSIDE}
              aria-label={i18n._('Open the posting link')}
              sx={(theme) => ({
                position: 'relative',
                zIndex: 1,
                display: 'inline-flex',
                flexShrink: 0,
                color: theme.karnama.semantic['text/secondary'],
                '&:focus-visible': {
                  outlineWidth: 2,
                  outlineStyle: 'solid',
                  outlineColor: theme.karnama.semantic['border/focus'],
                  outlineOffset: 2,
                },
              })}
            >
              <Icon name="link" size="sm" color="inherit" />
            </Box>
          )}
        </Box>
        {interactive && layout === 'desktop' ? (
          <ButtonBase
            className={BIN}
            disableRipple
            aria-label={i18n._('Delete job opportunity')}
            onClick={onDelete}
            sx={(theme) => ({
              position: 'relative',
              zIndex: 1,
              flexShrink: 0,
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
              width: DELETE,
              height: DELETE,
              borderRadius: `${theme.karnama.radius.md}px`,
              color: theme.karnama.semantic['text/secondary'],
              transition: `width ${HOVER_MS}ms ease-in-out, margin ${HOVER_MS}ms ease-in-out, opacity ${HOVER_MS}ms ease-in-out`,
              // Folded: no width, and the row's 8 before it taken back.
              ...(folded ? { width: 0, marginInlineStart: `-${spacing.xs}px`, opacity: 0, pointerEvents: 'none' } : {}),
              '&:hover': { backgroundColor: theme.karnama.semantic['bg/surface-secondary'], color: theme.karnama.semantic['text/error'] },
              '&.Mui-focusVisible': { outlineWidth: 2, outlineStyle: 'solid', outlineColor: theme.karnama.semantic['border/focus'] },
            })}
          >
            <Icon name="trash" size="sm" color="inherit" />
          </ButtonBase>
        ) : null}
        {interactive && layout === 'mobile' ? (
          <Box ref={more} sx={{ position: 'relative', zIndex: 1, display: 'inline-flex', flexShrink: 0 }}>
            <IconButton
              icon="more"
              iconSize="md"
              aria-label={i18n._('Job opportunity actions')}
              onClick={() => {
                setMenu(more.current)
              }}
            />
            <CardMenu
              anchorEl={menu}
              onClose={() => {
                setMenu(null)
              }}
              onChangeStatus={onChangeStatus}
              {...(link === null
                ? {}
                : {
                    onOpenLink: () => {
                      window.open(link, '_blank', OUTSIDE_WINDOW)
                    },
                  })}
              onDelete={onDelete}
            />
          </Box>
        ) : null}
      </Box>
      <Box
        component="p"
        sx={(theme) => ({
          margin: 0,
          ...oneLine.sx,
          fontSize: `${typeScale.body.size}px`,
          lineHeight: `${typeScale.body.lineHeight}px`,
          color: theme.karnama.semantic['text/secondary'],
        })}
      >
        {company}
      </Box>
      {/* The file's meta gap, an 8 frame with the column's 4 either side of
          it: 16 from the company, 12 more than the gap already gives. */}
      <Box sx={{ display: 'flex', alignItems: 'center', marginTop: `${spacing.xs + spacing['2xs']}px`, height: META_ROW[layout] }}>
        <Box
          component="span"
          sx={(theme) => ({
            fontSize: `${typeScale.label.size}px`,
            lineHeight: 'normal',
            fontWeight: typeScale.body.weight,
            color: theme.karnama.semantic['text/secondary'],
          })}
        >
          {date}
        </Box>
      </Box>
    </Box>
  )
}
