import { useLingui } from '@lingui/react'
import { Box } from '@mui/material'
import { useEffect, useRef } from 'react'
import { usePreferences } from '../../core/preferences'
import { formatCount } from '../../i18n/formatCount'
import { spacing, type as typeScale } from '../../theme/tokens'
import { Button } from '../button'
import { IconButton } from '../icon-button'

export type BulkActionBarType = 'jobs' | 'contacts'

// The props are documented in story-docs, not here, KN-207.
export interface BulkActionBarProps {
  type: BulkActionBarType
  count: number
  onClear: () => void
  onDelete: () => void
  onChangeStatus?: () => void
  onSelectAll?: () => void
}

// Node 401:436's measures that bind no variable: the edge and the divider, one
// pixel wide and 24 tall. Written as pixels: MUI reads a bare number up to 1
// as a fraction, so a width of 1 would be the whole row.
/** A key's own name, as the browser spells it in a KeyboardEvent. */
type KeyName = 'F6'

// The key that brings a keyboard reader to the bar, KN-330. Written once, read
// by the listener, the announcement and `aria-keyshortcuts`, so the three
// cannot disagree.
const SHORTCUT: KeyName = 'F6'

const EDGE = 1
const DIVIDER_HEIGHT = 24

// The count as the reader says it: the number in their digits, then the noun
// in the plural the number takes. Persian keeps the noun singular after a
// number, so both of its forms are one string.
const useCountText = (type: BulkActionBarType, count: number) => {
  const { i18n } = useLingui()
  const { locale } = usePreferences()
  const one = new Intl.PluralRules(locale).select(count) === 'one'
  const noun =
    type === 'jobs'
      ? one
        ? i18n._('job opportunity selected')
        : i18n._('job opportunities selected')
      : one
        ? i18n._('contact selected')
        : i18n._('contacts selected')
  return `${formatCount(locale, count)} ${noun}`
}

// The Bulk Action Bar of node 401:436: it floats at the bottom centre of the
// screen while anything is selected. From the inline start: the count, then the
// Jobs type's Select all and Change status, Delete, a divider and the close
// that clears the selection. It hugs its content, and on a screen too narrow
// for it, 16 from each side, it wraps, where the file's mobile bar overflows.
export const BulkActionBar = ({ type, count, onClear, onDelete, onChangeStatus, onSelectAll }: BulkActionBarProps) => {
  const { i18n } = useLingui()
  const text = useCountText(type, count)
  const selected = count > 0
  const bar = useRef<HTMLDivElement | null>(null)

  // A reader who selects with the keyboard is standing ON a card, deep in the
  // list, and the bar is somewhere else entirely: every forward Tab walks the
  // rest of the cards before reaching it, KN-330. So the bar answers a key.
  //
  // F6 rather than a letter or a chord. A letter is typed into fields and WCAG
  // 2.1.4 then asks for a way to turn it off; Alt+Shift is how Windows switches
  // keyboard layout, which a Persian reader does constantly; Ctrl+Shift+B and
  // Alt+D are the browser's. F6 is the long-standing key for moving between a
  // window's regions, it is not a character key, and nothing types it.
  useEffect(() => {
    if (!selected) return
    const jump = (event: KeyboardEvent) => {
      if (event.key !== SHORTCUT || event.altKey || event.ctrlKey || event.metaKey) return
      const first = bar.current?.querySelector('button')
      if (!first) return
      event.preventDefault()
      first.focus()
    }
    // On the document because the bar floats over whatever page raised it and
    // has no container of its own. Two can never be up at once: the board and
    // the network are different pages.
    window.document.addEventListener('keydown', jump)
    return () => {
      window.document.removeEventListener('keydown', jump)
    }
  }, [selected])

  return (
    <>
      {/* Out of sight but read by a screen reader, the usual clip. The count's
          status region is in the page whether or not the bar is, so the first
          count is a change to a region already there, which is what gets
          announced. */}
      <Box
        role="status"
        sx={{
          position: 'absolute',
          width: `${EDGE}px`,
          height: `${EDGE}px`,
          margin: `-${EDGE}px`,
          padding: 0,
          border: 0,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          whiteSpace: 'nowrap',
        }}
      >
        {selected ? `${text}. ${i18n._('Press F6 for the bulk actions.')}` : ''}
      </Box>
      {selected ? (
        <Box
          ref={bar}
          role="region"
          aria-label={i18n._('Bulk actions')}
          // What the region answers to, for anything that reads shortcuts off
          // the page. It describes the listener above; it does not implement it.
          aria-keyshortcuts={SHORTCUT}
          sx={(theme) => ({
            position: 'fixed',
            insetInline: 0,
            bottom: `${spacing.lg}px`,
            zIndex: theme.zIndex.appBar,
            boxSizing: 'border-box',
            width: 'fit-content',
            maxWidth: `calc(100% - ${2 * spacing.md}px)`,
            marginInline: 'auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: `${spacing.sm}px`,
            paddingBlock: `${spacing.sm}px`,
            paddingInline: `${spacing.md}px`,
            borderRadius: `${theme.karnama.radius.lg}px`,
            backgroundColor: theme.karnama.semantic['bg/surface'],
            boxShadow: theme.karnama.elevation.bulkBar,
            // The edge, one pixel of border/default drawn inside, over the
            // padding, as every stroke in the file is, DESIGN.md.
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
          })}
        >
          {/* Shown here and read from the status region, so it is not read twice. */}
          <Box
            aria-hidden
            sx={(theme) => ({
              flexShrink: 0,
              whiteSpace: 'nowrap',
              fontSize: `${typeScale.body.size}px`,
              lineHeight: `${typeScale.body.lineHeight}px`,
              fontWeight: typeScale.label.weight,
              letterSpacing: typeScale.body.letterSpacing,
              color: theme.karnama.semantic['text/primary'],
            })}
          >
            {text}
          </Box>
          {type === 'jobs' && onSelectAll !== undefined ? (
            <Button variant="ghost" size="S" onClick={onSelectAll}>
              {i18n._('Select all')}
            </Button>
          ) : null}
          {type === 'jobs' && onChangeStatus !== undefined ? (
            <Button variant="secondary" size="S" onClick={onChangeStatus}>
              {i18n._('Change status')}
            </Button>
          ) : null}
          <Button variant="destructive" size="S" onClick={onDelete}>
            {i18n._('Delete')}
          </Button>
          <Box
            aria-hidden
            sx={(theme) => ({
              flexShrink: 0,
              width: `${EDGE}px`,
              height: `${DIVIDER_HEIGHT}px`,
              backgroundColor: theme.karnama.semantic['border/default'],
            })}
          />
          <IconButton icon="x" iconSize="md" aria-label={i18n._('Clear selection')} onClick={onClear} />
        </Box>
      ) : null}
    </>
  )
}
