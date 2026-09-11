import { useLingui } from '@lingui/react'
import { Box, ButtonBase, type Theme } from '@mui/material'
import { Children, useRef, useState, type ReactNode } from 'react'
import { usePreferences } from '../../core/preferences'
import { formatCount } from '../../i18n/formatCount'
import { iconSize, spacing, status, type as typeScale, type StatusToken } from '../../theme/tokens'
import { Icon } from '../icon'
import { IconButton } from '../icon-button'
import { StatusMenu } from '../menu'
import { StatusChip } from '../status-chip'

// The props are documented in story-docs, not here, KN-207.
export interface KanbanColumnProps {
  name: string
  colour: string
  count: number
  layout?: 'desktop' | 'mobile'
  collapsed?: boolean
  children?: ReactNode
  onExpand: () => void
  onAdd: () => void
  onRename: () => void
  onColourChange: (colour: StatusToken) => void
  onDelete: () => void
}

// Node 241:125's measures that bind no variable: the column 300 wide; the
// header's 28 of height inside its padding, its Size=M chip's; and the empty
// column's message box, 241:46, 80 tall. The strokes are the file's one pixel,
// and the keyboard's ring is three drawn inside, as the Icon Button's.
const WIDTH = 300
const HEADER_CONTENT = 28
const EMPTY = 80
const EDGE = 1
const FOCUS_RING = 3

// The Icon Button is a 32 square round its 16 icon, where the header has 28 of
// height and draws the bare icon at its padding's end, 8 from the count: the
// button gives two back above and below and eight at either side, so it lays
// out as the file's icon does and its press reaches past it.
const TRIGGER_BLOCK = (spacing.xl - HEADER_CONTENT) / 2
const TRIGGER_END = (spacing.xl - iconSize.sm) / 2

// The desktop column unless told otherwise, typed so the lint rule reads it as
// a value and not as copy.
const DESKTOP: NonNullable<KanbanColumnProps['layout']> = 'desktop'

// A status the board no longer has takes the new colour, as the card's stripe does.
const isToken = (value: string): value is StatusToken => value in status
const tokenOf = (value: string): StatusToken => (isToken(value) ? value : 'new')

// The count and the Add Column label: 12 at Medium on 16, the Label role's
// size, weight and line height without its tracking, which the file does not
// give them. Under an sx key, which the lint rule reads as CSS.
const small = {
  sx: { fontSize: `${typeScale.label.size}px`, lineHeight: `${typeScale.label.lineHeight}px`, fontWeight: typeScale.label.weight },
}

// The keyboard's ring, drawn inside a control's edge. Under an sx key, which the
// lint rule reads as CSS.
const ring = {
  sx: (theme: Theme, radius: number) => ({
    '&.Mui-focusVisible::after': {
      content: '""',
      position: 'absolute',
      inset: EDGE,
      borderRadius: `${radius - EDGE}px`,
      borderStyle: 'solid',
      borderWidth: FOCUS_RING,
      borderColor: theme.karnama.semantic['border/focus'],
      pointerEvents: 'none',
    },
  }),
}

// The header's chip and count: the Size=M chip, its one use, and the count 8
// after it in the reader's digits.
const Title = ({ name, token, count }: { name: string; token: StatusToken; count: number }) => {
  const { locale } = usePreferences()
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.xs}px`, minWidth: 0 }}>
      {/* The chip is as wide as its group at most; held in an item that can
          shrink, a long name is cut before the count is pushed into the menu. */}
      <Box sx={{ display: 'flex', minWidth: 0 }}>
        <StatusChip status={token} label={name} size="M" />
      </Box>
      <Box component="span" sx={(theme) => ({ ...small.sx, flexShrink: 0, color: theme.karnama.semantic['text/secondary'] })}>
        {formatCount(locale, count)}
      </Box>
    </Box>
  )
}

// The header row of 241:126: 4 of padding above and at the sides, 8 below, its
// parts at either end.
const headerRow = {
  sx: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: `${spacing.xs}px`,
    paddingBlockStart: `${spacing['2xs']}px`,
    paddingInline: `${spacing['2xs']}px`,
    paddingBlockEnd: `${spacing.xs}px`,
  },
} as const

// The column's frame: bg/surface-secondary, radius lg, 12 of padding and 8
// between its parts.
const frame = {
  sx: (theme: Theme) =>
    ({
      display: 'flex',
      flexDirection: 'column',
      gap: `${spacing.xs}px`,
      boxSizing: 'border-box',
      width: WIDTH,
      padding: `${spacing.sm}px`,
      borderRadius: `${theme.karnama.radius.lg}px`,
      backgroundColor: theme.karnama.semantic['bg/surface-secondary'],
    }) as const,
}

// The message of an empty column, 241:46: 12 at 400 on CSS's normal line
// height in text/secondary, centred in a dashed box of radius md.
const EmptyColumn = () => {
  const { i18n } = useLingui()
  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxSizing: 'border-box',
        height: EMPTY,
        paddingInline: `${spacing.sm}px`,
        borderRadius: `${theme.karnama.radius.md}px`,
        borderStyle: 'dashed',
        borderWidth: EDGE,
        borderColor: theme.karnama.semantic['border/default'],
        fontSize: `${typeScale.label.size}px`,
        lineHeight: 'normal',
        fontWeight: typeScale.body.weight,
        textAlign: 'center',
        color: theme.karnama.semantic['text/secondary'],
      })}
    >
      {i18n._('No job opportunities at this stage yet')}
    </Box>
  )
}

// A column of the board, node 241:125: a status's header, its cards, and the
// Add Card row pinned at the bottom as a plus only. The cards scroll between
// the header and the row. The phone's column, 241:176, is its cards alone, the
// status being chosen above it. Collapsed, a column is its header alone, one
// button that opens it; the board decides which column starts that way.
export const KanbanColumn = ({
  name,
  colour,
  count,
  layout = DESKTOP,
  collapsed = false,
  children,
  onExpand,
  onAdd,
  onRename,
  onColourChange,
  onDelete,
}: KanbanColumnProps) => {
  const { i18n } = useLingui()
  const token = tokenOf(colour)
  const trigger = useRef<HTMLElement>(null)
  const [menu, setMenu] = useState<HTMLElement | null>(null)
  const cards = Children.count(children) === 0 ? <EmptyColumn /> : children

  if (layout === 'mobile') {
    return (
      <Box
        component="section"
        aria-label={name}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: `${spacing.sm}px`,
          boxSizing: 'border-box',
          width: '100%',
          padding: `${spacing.md}px`,
          '& > *': { flexShrink: 0 },
        }}
      >
        {cards}
      </Box>
    )
  }

  if (collapsed) {
    return (
      <Box component="section" aria-label={name} sx={frame.sx}>
        <ButtonBase
          disableRipple
          aria-expanded={false}
          onClick={onExpand}
          sx={(theme) => ({
            ...headerRow.sx,
            position: 'relative',
            width: '100%',
            // A button takes the browser's own font; the count takes the page's.
            fontFamily: 'inherit',
            borderRadius: `${theme.karnama.radius.md}px`,
            color: theme.karnama.semantic['text/secondary'],
            ...ring.sx(theme, theme.karnama.radius.md),
          })}
        >
          <Title name={name} token={token} count={count} />
          <Icon name="chevron-down" size="sm" color="inherit" />
        </ButtonBase>
      </Box>
    )
  }

  return (
    <Box component="section" aria-label={name} sx={(theme) => ({ ...frame.sx(theme), height: '100%', overflow: 'hidden' })}>
      <Box sx={{ ...headerRow.sx, flexShrink: 0 }}>
        <Title name={name} token={token} count={count} />
        <Box
          ref={trigger}
          sx={{
            display: 'inline-flex',
            flexShrink: 0,
            marginBlock: `-${TRIGGER_BLOCK}px`,
            marginInline: `-${TRIGGER_END}px`,
          }}
        >
          <IconButton
            icon="more"
            aria-label={`${i18n._('Status actions')}: ${name}`}
            onClick={() => {
              setMenu(trigger.current)
            }}
          />
        </Box>
        <StatusMenu
          anchorEl={menu}
          colour={token}
          jobCount={count}
          onClose={() => {
            setMenu(null)
          }}
          onRename={onRename}
          onColourChange={onColourChange}
          onDelete={onDelete}
        />
      </Box>
      {/* The cards, scrolling between the header and the Add Card row. The
          region reaches four into the column's padding, so a card's shadow
          and its focus halo are not cut at its edge. */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: `${spacing.xs}px`,
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          // Thin, so a column that scrolls keeps as much of its cards' width as
          // it can where the system draws a scrollbar in the layout.
          scrollbarWidth: 'thin',
          margin: `-${spacing['2xs']}px`,
          padding: `${spacing['2xs']}px`,
          // A card clips its own corners, which lets a flex item shrink below
          // its content; here the cards keep their height and the region scrolls.
          '& > *': { flexShrink: 0 },
        }}
      >
        {cards}
      </Box>
      {/* Add Card, 241:142: 36 tall, bg/surface with one pixel of
          border/default inside, radius md, and a 20 plus in text/brand. */}
      <ButtonBase
        disableRipple
        aria-label={`${i18n._('Add a job opportunity to')} ${name}`}
        onClick={onAdd}
        sx={(theme) => ({
          position: 'relative',
          flexShrink: 0,
          width: '100%',
          paddingBlock: `${spacing.xs}px`,
          borderRadius: `${theme.karnama.radius.md}px`,
          backgroundColor: theme.karnama.semantic['bg/surface'],
          color: theme.karnama.semantic['text/brand'],
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            borderStyle: 'solid',
            borderWidth: EDGE,
            borderColor: theme.karnama.semantic['border/default'],
            pointerEvents: 'none',
          },
          ...ring.sx(theme, theme.karnama.radius.md),
        })}
      >
        <Icon name="plus" size="md" color="inherit" />
      </ButtonBase>
    </Box>
  )
}

// The Add Column tile of node 241:34, labelled «افزودن وضعیت», since a column
// is a status: 220 by 120, one pixel of border/default dashed, radius lg, a 20
// plus 8 above its label, both in text/secondary.
const TILE = { width: 220, height: 120 } as const

export interface AddColumnProps {
  onAdd: () => void
}

export const AddColumn = ({ onAdd }: AddColumnProps) => {
  const { i18n } = useLingui()
  return (
    <ButtonBase
      disableRipple
      onClick={onAdd}
      sx={(theme) => ({
        position: 'relative',
        flexDirection: 'column',
        flexShrink: 0,
        gap: `${spacing.xs}px`,
        boxSizing: 'border-box',
        width: TILE.width,
        height: TILE.height,
        borderRadius: `${theme.karnama.radius.lg}px`,
        borderStyle: 'dashed',
        borderWidth: EDGE,
        borderColor: theme.karnama.semantic['border/default'],
        color: theme.karnama.semantic['text/secondary'],
        fontFamily: 'inherit',
        ...small.sx,
        ...ring.sx(theme, theme.karnama.radius.lg),
      })}
    >
      <Icon name="plus" size="md" color="inherit" />
      {i18n._('Add status')}
    </ButtonBase>
  )
}
