import { useLingui } from '@lingui/react'
import { Box, ButtonBase } from '@mui/material'
import { useId } from 'react'
import { usePreferences } from '../../core/preferences'
import { formatCount } from '../../i18n/formatCount'
import { spacing, type as typeScale, type StatusToken } from '../../theme/tokens'
import { Checkbox } from '../checkbox'
import { IconButton } from '../icon-button'
import type { Copied } from '../related-person'
import { labelText, nameText, oneLine } from '../related-person/personText'

// A job opportunity a person is linked to: its title and the status it is in.
export interface ContactRowJob {
  id: string
  title: string
  status: StatusToken
}

// The props are documented in story-docs, not here, KN-207.
export interface ContactRowProps {
  name: string
  role?: string | null
  company?: string | null
  label?: string | null
  jobs?: readonly ContactRowJob[]
  email?: string | null
  phone?: string | null
  link?: string | null
  selected?: boolean
  selecting?: boolean
  onOpen: () => void
  onSelectedChange: (selected: boolean) => void
  onCopied?: (what: Copied) => void
}

// Node 1056:2872 binds no variable to these: the row's 72, the name's column of
// 280 and the label's of 140, the bottom edge's one pixel, and the status
// stripe, 3 by 14, on the first job opportunity.
const ROW = 72
const NAME_WIDTH = 280
const LABEL_WIDTH = 140
const EDGE = 1
const STRIPE_WIDTH = 3
const STRIPE_HEIGHT = 14

const EMAIL: Copied = 'email'
const PHONE: Copied = 'phone'

// The classes the row's states reach into: the chips that lift to bg/surface,
// the checkbox that shows, and the actions that show under the pointer.
const CHIP = 'KarnamaContactRow-chip'
const CHECK = 'KarnamaContactRow-check'
const ACTIONS = 'KarnamaContactRow-actions'

const present = (value: string | null | undefined): value is string => value !== undefined && value !== null && value !== ''

// Contact Row, node 1056:2872, Default, Hover, Selectable and Selected: a
// person on the network page. From the inline start the checkbox, which shows
// under the pointer, with keyboard focus inside and while the page is
// selecting; the name in Title over «سمت · شرکت» in Body text/secondary, in a
// column of 280, each one line; the relationship label, a chip in a column of
// 140; the first job opportunity they are linked to, a pill with its status's
// stripe, and the rest as +N; and at the inline end the buttons that open their
// link, copy their number and copy their email, each drawn only when there is
// one, shown under the pointer and with focus inside. Hover fills the row with
// bg/surface-secondary and lifts the chips to bg/surface; Selected fills it with
// bg/brand/container. Pressing the name opens the person, or, while selecting,
// chooses them. The row is a group named by the person, so each button is heard
// with whose it is.
export const ContactRow = ({
  name,
  role,
  company,
  label,
  jobs = [],
  email,
  phone,
  link,
  selected = false,
  selecting = false,
  onOpen,
  onSelectedChange,
  onCopied,
}: ContactRowProps) => {
  const { i18n } = useLingui()
  const { locale } = usePreferences()
  const nameId = useId()
  const described = [role, company].filter(present).join(' · ')
  const [first, ...rest] = jobs
  const choosing = selecting || selected
  const copy = async (text: string, what: Copied) => {
    try {
      await window.navigator.clipboard.writeText(text)
    } catch {
      // The browser refused the clipboard: nothing was copied, so nothing is said.
      return
    }
    onCopied?.(what)
  }
  return (
    <Box
      role="group"
      aria-labelledby={nameId}
      sx={(theme) => {
        const colour = theme.karnama.semantic
        const lifted = { [`& .${CHIP}`]: { backgroundColor: colour['bg/surface'] } }
        const shown = { [`& .${CHECK}`]: { opacity: 1 } }
        const hovered = {
          backgroundColor: colour['bg/surface-secondary'],
          ...lifted,
          ...shown,
          [`& .${ACTIONS}`]: { opacity: 1 },
        }
        return {
          boxSizing: 'border-box',
          width: '100%',
          height: ROW,
          display: 'flex',
          alignItems: 'center',
          gap: `${spacing.md}px`,
          paddingBlock: `${spacing.sm}px`,
          paddingInline: `${spacing.md}px`,
          borderBottom: `${EDGE}px solid ${colour['border/default']}`,
          backgroundColor: colour[selected ? 'bg/brand/container' : 'bg/surface'],
          [`& .${CHECK}`]: { opacity: choosing ? 1 : 0 },
          [`& .${ACTIONS}`]: { opacity: 0 },
          ...(selected ? lifted : {}),
          ...(choosing
            ? {}
            : {
                '@media (hover: hover)': { '&:hover': hovered },
                '@media (hover: none)': { [`& .${ACTIONS}`]: { opacity: 1 } },
                '&:focus-within': hovered,
              }),
        }
      }}
    >
      <Box className={CHECK} sx={{ display: 'flex', flexShrink: 0 }}>
        <Checkbox
          checked={selected}
          aria-label={`${i18n._('Select')} ${name}`}
          onChange={(_, checked) => {
            onSelectedChange(checked)
          }}
        />
      </Box>
      <ButtonBase
        disableRipple
        aria-label={name}
        onClick={() => {
          if (selecting) onSelectedChange(!selected)
          else onOpen()
        }}
        sx={(theme) => ({
          flexShrink: 0,
          width: NAME_WIDTH,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          textAlign: 'start',
          fontFamily: 'inherit',
          borderRadius: `${theme.karnama.radius.sm}px`,
          '&.Mui-focusVisible': { outlineWidth: 2, outlineStyle: 'solid', outlineColor: theme.karnama.semantic['border/focus'], outlineOffset: 2 },
        })}
      >
        <Box component="span" id={nameId} sx={(theme) => ({ ...nameText.sx(theme), ...oneLine.sx, maxWidth: '100%' })}>
          {name}
        </Box>
        {described === '' ? null : (
          <Box
            component="span"
            sx={(theme) => ({
              ...oneLine.sx,
              maxWidth: '100%',
              fontSize: `${typeScale.body.size}px`,
              lineHeight: `${typeScale.body.lineHeight}px`,
              fontWeight: typeScale.body.weight,
              color: theme.karnama.semantic['text/secondary'],
            })}
          >
            {described}
          </Box>
        )}
      </ButtonBase>
      <Box sx={{ flexShrink: 0, width: LABEL_WIDTH, display: 'flex' }}>
        {present(label) ? (
          <Box
            component="span"
            className={CHIP}
            sx={(theme) => ({
              ...labelText.sx(theme),
              ...oneLine.sx,
              paddingBlock: `${spacing['2xs']}px`,
              paddingInline: `${spacing.xs}px`,
              borderRadius: `${theme.karnama.radius.full}px`,
              backgroundColor: theme.karnama.semantic['bg/surface-secondary'],
            })}
          >
            {label}
          </Box>
        ) : null}
      </Box>
      <Box sx={{ flex: '1 1 0', minWidth: 0, display: 'flex', alignItems: 'center', gap: `${spacing.xs}px` }}>
        {first === undefined ? null : (
          <Box
            component="span"
            sx={(theme) => ({
              boxSizing: 'border-box',
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              gap: `${spacing.xs}px`,
              paddingBlock: `${spacing['2xs']}px`,
              paddingInline: `${spacing.xs}px`,
              borderRadius: `${theme.karnama.radius.sm}px`,
              border: `${EDGE}px solid ${theme.karnama.semantic['border/default']}`,
              backgroundColor: theme.karnama.semantic['bg/surface'],
            })}
          >
            <Box
              component="span"
              aria-hidden
              sx={(theme) => ({ flexShrink: 0, width: STRIPE_WIDTH, height: STRIPE_HEIGHT, backgroundColor: theme.karnama.status[first.status].base })}
            />
            <Box component="span" sx={(theme) => ({ ...labelText.sx(theme), ...oneLine.sx, color: theme.karnama.semantic['text/primary'] })}>
              {first.title}
            </Box>
          </Box>
        )}
        {rest.length === 0 ? null : (
          <Box
            component="span"
            className={CHIP}
            dir="ltr"
            sx={(theme) => ({
              ...labelText.sx(theme),
              flexShrink: 0,
              paddingBlock: `${spacing['2xs']}px`,
              paddingInline: `${spacing.xs}px`,
              borderRadius: `${theme.karnama.radius.sm}px`,
              backgroundColor: theme.karnama.semantic['bg/surface-secondary'],
            })}
          >
            {`+${formatCount(locale, rest.length)}`}
          </Box>
        )}
      </Box>
      {/* From the content outward, as the file draws them: the link, the
          number, and the email at the row's very end. A link typed without
          its scheme is a web address, as the Contact Card reads it. */}
      <Box className={ACTIONS} sx={{ display: 'flex', gap: `${spacing['2xs']}px`, flexShrink: 0 }}>
        {present(link) ? <IconButton icon="external-link" tone="primary" aria-label={i18n._('Open link')} href={/^https?:\/\//.test(link) ? link : `https://${link}`} external /> : null}
        {present(phone) ? (
          <IconButton
            icon="phone"
            tone="primary"
            aria-label={i18n._('Copy number')}
            onClick={() => {
              void copy(phone, PHONE)
            }}
          />
        ) : null}
        {present(email) ? (
          <IconButton
            icon="mail"
            tone="primary"
            aria-label={i18n._('Copy email')}
            onClick={() => {
              void copy(email, EMAIL)
            }}
          />
        ) : null}
      </Box>
    </Box>
  )
}
