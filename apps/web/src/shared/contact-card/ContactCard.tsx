import { useLingui } from '@lingui/react'
import { Box, ButtonBase, type Theme } from '@mui/material'
import type { ReactNode } from 'react'
import { usePreferences } from '../../core/preferences'
import { spacing, type as typeScale } from '../../theme/tokens'
import { Checkbox } from '../checkbox'
import { Icon, type IconName } from '../icon'
import { IconButton } from '../icon-button'
import { dialable, formatPhone } from './phone'

export interface ContactCardContact {
  name: string
  role: string
  company: string | null
  email: string | null
  phone: string | null
  job: string | null
  linkedin: string | null
}

// The props are documented in story-docs, not here, KN-207.
export interface ContactCardProps {
  contact: ContactCardContact
  layout?: 'full' | 'compact'
  selected?: boolean
  onOpen: () => void
  onSelectedChange: (selected: boolean) => void
  onDelete: () => void
}

// Node 248:116's measures that bind no variable: the full card's title row, 30;
// its delete, a 24 square; a field's icon box, 20; the compact card's avatar,
// 40. The edges are the file's: one pixel at rest, one and a half on hover and
// selected, an inset shadow over the one pixel border since Chromium floors a
// border of 1.5, KN-282; the keyboard's ring the three drawn inside.
const TITLE_ROW = 30
const DELETE = 24
const FIELD_ICON = 20
const AVATAR = 40
const EDGE = 1
const HOVER_EDGE = 1.5
const FOCUS_RING = 3

// The class on what appears only on hover, with focus inside, or selected: the
// full card's checkbox and delete. They join the layout then, so the name moves
// over by the checkbox, as the file's description says, and the row keeps its 30.
const REVEAL = 'KarnamaContactCard-reveal'

// The name is 16 at SemiBold on the file's automatic line height, composed as the
// Empty State's title is: Title's size and line height with Heading/M's weight.
const NAME = { size: typeScale.title.size, lineHeight: typeScale.title.lineHeight, weight: typeScale['heading/m'].weight }

// One line, cut with an ellipsis rather than wrapped, so a long value never
// reflows the card. Under an sx key, where the lint rule reads it as CSS.
const oneLine = { sx: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } } as const

// The card's frame in each state: the edge on a ::before, inside and out of
// layout, and hover and selected as the one and a half over it. Held under an
// sx key, where the lint rule reads it as CSS.
const frame = {
  sx: (theme: Theme, layout: 'full' | 'compact', selected: boolean) => {
    const colour = theme.karnama.semantic
    const lifted = {
      boxShadow: `inset 0 0 0 ${HOVER_EDGE}px ${colour['border/focus']}`,
      '&::before': { borderColor: colour['border/focus'] },
    }
    return {
      position: 'relative',
      boxSizing: 'border-box',
      width: '100%',
      borderRadius: `${layout === 'full' ? theme.karnama.radius.lg : theme.karnama.radius.md}px`,
      backgroundColor: selected ? colour['bg/brand/container'] : colour['bg/surface'],
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        borderStyle: 'solid',
        borderWidth: EDGE,
        borderColor: colour['border/default'],
        pointerEvents: 'none',
      },
      ...(selected ? lifted : {}),
      '&:hover':
        layout === 'compact' && !selected
          ? { ...lifted, boxShadow: `${lifted.boxShadow}, ${theme.karnama.elevation.contactCardHover}` }
          : lifted,
      [`& .${REVEAL}`]: { display: selected ? 'flex' : 'none' },
      [`&:hover .${REVEAL}, &:focus-within .${REVEAL}`]: { display: 'flex' },
    } as const
  },
}

// The name, the card's own button: its ::after covers the whole card, so a
// press anywhere that is not another control opens the contact, and its ring,
// drawn inside the card's edge, is the card's focus.
const Name = ({ layout, onOpen, children }: { layout: 'full' | 'compact'; onOpen: () => void; children: ReactNode }) => (
  <ButtonBase
    disableRipple
    onClick={onOpen}
    sx={(theme) => ({
      position: 'static',
      display: 'block',
      ...oneLine.sx,
      textAlign: 'start',
      fontSize: `${layout === 'full' ? NAME.size : typeScale.body.size}px`,
      lineHeight: `${layout === 'full' ? NAME.lineHeight : typeScale.body.lineHeight}px`,
      fontWeight: layout === 'full' ? NAME.weight : typeScale.label.weight,
      color: theme.karnama.semantic['text/primary'],
      '&::after': {
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: `${layout === 'full' ? theme.karnama.radius.lg : theme.karnama.radius.md}px`,
      },
      '&.Mui-focusVisible::after': {
        inset: EDGE,
        borderStyle: 'solid',
        borderWidth: FOCUS_RING,
        borderColor: theme.karnama.semantic['border/focus'],
      },
    })}
  >
    {children}
  </ButtonBase>
)

// A field row of the full card: its icon in a 20 box at the inline start, and its
// value at the other end, cut rather than wrapped.
const Field = ({ icon, children }: { icon: IconName; children: ReactNode }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: `${spacing.xs}px`, minWidth: 0 }}>
    <Box
      sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: FIELD_ICON, height: FIELD_ICON }}
    >
      <Icon name={icon} size="sm" />
    </Box>
    {children}
  </Box>
)

// What an outside link carries, so the page it opens cannot reach back.
type Rel = 'noopener noreferrer'
const OUTSIDE: Rel = 'noopener noreferrer'

// A value that is a link, raised above the card's own button so it can be
// pressed, its ring two pixels of border/focus outside it.
const Link = ({
  href,
  external = false,
  brand = false,
  children,
}: {
  href: string
  external?: boolean
  brand?: boolean
  children: ReactNode
}) => (
  <Box
    component="a"
    href={href}
    dir="ltr"
    {...(external ? { target: '_blank', rel: OUTSIDE } : {})}
    sx={(theme) => ({
      position: 'relative',
      zIndex: 1,
      ...oneLine.sx,
      color: theme.karnama.semantic[brand ? 'text/brand' : 'text/primary'],
      textDecoration: 'none',
      '&:hover': { textDecoration: 'underline' },
      '&:focus-visible': { outlineWidth: 2, outlineStyle: 'solid', outlineColor: theme.karnama.semantic['border/focus'], outlineOffset: 2 },
    })}
  >
    {children}
  </Box>
)

// The Contact Card of node 248:116, Full and Compact, each Default, Hover and
// Selected. A contact has no detail view, so everything is on the card, and
// the card opens the contact's modal, already editable. The full card's
// checkbox and delete join its title row on hover, with focus inside, or when
// selected; the compact card, for the phone, keeps its mail and delete in view.
export const ContactCard = ({ contact, layout = 'full', selected = false, onOpen, onSelectedChange, onDelete }: ContactCardProps) => {
  const { i18n } = useLingui()
  const { locale } = usePreferences()
  const role = [contact.role, contact.company].filter((part) => part !== null && part !== '').join(' · ')
  if (layout === 'compact') {
    return (
      <Box
        component="article"
        sx={(theme) => ({
          ...frame.sx(theme, 'compact', selected),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: `${spacing.sm}px`,
          padding: `${spacing.sm}px`,
        })}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.sm}px`, minWidth: 0 }}>
          <Box
            aria-hidden
            sx={(theme) => ({
              flexShrink: 0,
              width: AVATAR,
              height: AVATAR,
              borderRadius: `${theme.karnama.radius.full}px`,
              backgroundColor: theme.karnama.semantic['bg/brand/container'],
            })}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing['2xs']}px`, minWidth: 0 }}>
            <Name layout="compact" onOpen={onOpen}>
              {contact.name}
            </Name>
            {/* 12 at 400 on the file's automatic line height, the font's own,
                which is CSS's normal, as the Color Picker's helper is: the label
                role's size with the body's weight. */}
            <Box
              component="span"
              sx={(theme) => ({
                ...oneLine.sx,
                fontSize: `${typeScale.label.size}px`,
                lineHeight: 'normal',
                fontWeight: typeScale.body.weight,
                color: theme.karnama.semantic['text/secondary'],
              })}
            >
              {role}
            </Box>
          </Box>
        </Box>
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', gap: `${spacing['2xs']}px`, flexShrink: 0 }}>
          {contact.email === null ? null : (
            <IconButton
              icon="mail"
              aria-label={i18n._('Send an email')}
              onClick={() => {
                if (contact.email !== null) window.location.assign(`mailto:${contact.email}`)
              }}
            />
          )}
          <IconButton icon="trash" tone="danger" aria-label={i18n._('Delete contact')} onClick={onDelete} />
        </Box>
      </Box>
    )
  }
  return (
    <Box
      component="article"
      sx={(theme) => ({
        ...frame.sx(theme, 'full', selected),
        display: 'flex',
        flexDirection: 'column',
        gap: `${spacing.sm}px`,
        padding: `${spacing.lg}px`,
        fontSize: `${typeScale.body.size}px`,
        lineHeight: `${typeScale.body.lineHeight}px`,
        color: theme.karnama.semantic['text/primary'],
      })}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: `${spacing.xs}px`,
          height: TITLE_ROW,
          minWidth: 0,
        }}
      >
        {/* The Title Group: the checkbox flush at its inline start, 8 from the
            name. The Checkbox's 28 root gives its four back with a negative
            margin, and nothing here clips, so its ring is whole, KN-293. */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.xs}px`, minWidth: 0 }}>
          <Box className={REVEAL} sx={{ position: 'relative', zIndex: 1, flexShrink: 0, margin: `-${spacing['2xs']}px` }}>
            <Checkbox
              checked={selected}
              aria-label={`${i18n._('Select')} ${contact.name}`}
              onChange={(_, checked) => {
                onSelectedChange(checked)
              }}
            />
          </Box>
          <Name layout="full" onOpen={onOpen}>
            {contact.name}
          </Name>
        </Box>
        <ButtonBase
          className={REVEAL}
          disableRipple
          aria-label={i18n._('Delete contact')}
          onClick={onDelete}
          sx={(theme) => ({
            position: 'relative',
            zIndex: 1,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            width: DELETE,
            height: DELETE,
            borderRadius: `${theme.karnama.radius.md}px`,
            color: theme.karnama.semantic['text/secondary'],
            '&:hover': { backgroundColor: theme.karnama.semantic['bg/surface-secondary'], color: theme.karnama.semantic['text/error'] },
            '&.Mui-focusVisible::after': {
              content: '""',
              position: 'absolute',
              inset: EDGE,
              borderRadius: 'inherit',
              borderStyle: 'solid',
              borderWidth: FOCUS_RING,
              borderColor: theme.karnama.semantic['border/focus'],
              pointerEvents: 'none',
            },
          })}
        >
          <Icon name="trash" size="sm" color="inherit" />
        </ButtonBase>
      </Box>
      <Box component="p" sx={(theme) => ({ margin: 0, ...oneLine.sx, color: theme.karnama.semantic['text/secondary'] })}>
        {role}
      </Box>
      <Box
        component="hr"
        sx={(theme) => ({
          margin: 0,
          border: 0,
          height: `${EDGE}px`,
          flexShrink: 0,
          backgroundColor: theme.karnama.semantic['border/default'],
        })}
      />
      {contact.email === null ? null : (
        <Field icon="mail">
          <Link href={`mailto:${contact.email}`}>{contact.email}</Link>
        </Field>
      )}
      {contact.phone === null ? null : (
        <Field icon="phone">
          <Link href={`tel:${dialable(contact.phone)}`}>{formatPhone(locale, contact.phone)}</Link>
        </Field>
      )}
      {contact.job === null ? null : (
        <Field icon="building">
          <Box component="span" sx={oneLine.sx}>
            {contact.job}
          </Box>
        </Field>
      )}
      {contact.linkedin === null ? null : (
        <Field icon="link">
          <Link href={/^https?:\/\//.test(contact.linkedin) ? contact.linkedin : `https://${contact.linkedin}`} external brand>
            {contact.linkedin}
          </Link>
        </Field>
      )}
    </Box>
  )
}
