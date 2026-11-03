import { useLingui } from '@lingui/react'
import { Box, type Theme } from '@mui/material'
import { useId } from 'react'
import { spacing, type as typeScale } from '../../theme/tokens'
import { IconButton } from '../icon-button'

export type Copied = 'email' | 'phone'

// The props are documented in story-docs, not here, KN-207.
export interface RelatedPersonProps {
  name: string
  role?: string | null
  company?: string | null
  tag?: string | null
  email?: string | null
  phone?: string | null
  layout?: 'desktop' | 'mobile'
  onUnlink: () => void
  onCopied?: (what: Copied) => void
}

// The desktop row unless told otherwise, typed so the lint rule reads it as a
// value and not as copy.
const DESKTOP: NonNullable<RelatedPersonProps['layout']> = 'desktop'
const EMAIL: Copied = 'email'
const PHONE: Copied = 'phone'

// Node 1096:3109's desktop row is 60 tall, bound to no variable: its 12 above
// and below leave 36, and the name and role, 40, reach 2 into each, as the
// file draws them. The phone's row hugs what it holds.
const ROW = 60

// The class on the tag, so the row's hover can lift it to bg/surface.
const TAG = 'KarnamaRelatedPerson-tag'
// The class on the actions, so the row's hover and focus can show them.
const ACTIONS = 'KarnamaRelatedPerson-actions'

const { title, label } = typeScale

// The person's name in Title, and their role and company in Label: the
// Related Person's Text, 1096:3086 and 1313:3292. Under sx keys, which the
// lint rule reads as CSS.
const nameText = {
  sx: (theme: Theme) => ({
  fontSize: `${title.size}px`,
  lineHeight: `${title.lineHeight}px`,
  fontWeight: title.weight,
  letterSpacing: `${title.letterSpacing}px`,
  color: theme.karnama.semantic['text/primary'],
  }),
}
const labelText = {
  sx: (theme: Theme) => ({
  fontSize: `${label.size}px`,
  lineHeight: `${label.lineHeight}px`,
  fontWeight: label.weight,
  letterSpacing: `${label.letterSpacing}px`,
  color: theme.karnama.semantic['text/secondary'],
  }),
}

// One line, cut at its end rather than wrapped.
const oneLine = { sx: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } } as const

// Related Person, node 1096:3109, Default and Hover, and Related Person /
// Mobile, 1313:3295: a person linked to a job opportunity in its related
// people tab. Their name, «سمت · شرکت» under it and their tag in a chip at the
// inline start; at the inline end the Icon Buttons that unlink them, which
// leaves them in the network, and copy their email and their number, each
// drawn only when there is one to copy. On a desktop the buttons show on
// hover, on keyboard focus inside the row, and always where there is no hover;
// on a phone, Mobile, always, with the tag under the role. The row is a group
// named by the person, so each button is heard with whose it is.
export const RelatedPerson = ({ name, role, company, tag, email, phone, layout = DESKTOP, onUnlink, onCopied }: RelatedPersonProps) => {
  const { i18n } = useLingui()
  const nameId = useId()
  const mobile = layout !== DESKTOP
  const described = [role, company].filter((part) => part !== undefined && part !== null && part !== '').join(' · ')
  const copy = async (text: string, what: Copied) => {
    try {
      await window.navigator.clipboard.writeText(text)
    } catch {
      // The browser refused the clipboard: nothing was copied, so nothing is said.
      return
    }
    onCopied?.(what)
  }
  const chip =
    tag === undefined || tag === null || tag === '' ? null : (
      <Box
        component="span"
        className={TAG}
        sx={(theme) => ({
          ...labelText.sx(theme),
          ...oneLine.sx,
          flexShrink: 0,
          alignSelf: mobile ? 'flex-start' : 'center',
          paddingBlock: `${spacing['2xs']}px`,
          paddingInline: `${spacing.xs}px`,
          borderRadius: `${theme.karnama.radius.full}px`,
          backgroundColor: theme.karnama.semantic['bg/surface-secondary'],
        })}
      >
        {tag}
      </Box>
    )
  return (
    <Box
      role="group"
      aria-labelledby={nameId}
      sx={(theme) => ({
        boxSizing: 'border-box',
        width: '100%',
        ...(mobile ? {} : { height: ROW }),
        display: 'flex',
        alignItems: mobile ? 'flex-start' : 'center',
        gap: `${spacing.sm}px`,
        paddingBlock: `${spacing.sm}px`,
        paddingInline: `${spacing.md}px`,
        backgroundColor: theme.karnama.semantic['bg/surface'],
        ...(mobile
          ? {}
          : {
              // Default hides the buttons, which keep their room; Hover, 1096:3089,
              // fills the row with bg/surface-secondary, lifts the tag to
              // bg/surface and shows them. Keyboard focus inside the row does the
              // same, and so does a device with no hover.
              [`& .${ACTIONS}`]: { opacity: 0 },
              '@media (hover: hover)': {
                '&:hover': { backgroundColor: theme.karnama.semantic['bg/surface-secondary'] },
                [`&:hover .${TAG}`]: { backgroundColor: theme.karnama.semantic['bg/surface'] },
                [`&:hover .${ACTIONS}`]: { opacity: 1 },
              },
              '@media (hover: none)': { [`& .${ACTIONS}`]: { opacity: 1 } },
              '&:focus-within': { backgroundColor: theme.karnama.semantic['bg/surface-secondary'] },
              [`&:focus-within .${TAG}`]: { backgroundColor: theme.karnama.semantic['bg/surface'] },
              [`&:focus-within .${ACTIONS}`]: { opacity: 1 },
            }),
      })}
    >
      <Box
        sx={{
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: mobile ? `${spacing['2xs']}px` : 0,
          ...(mobile ? { flex: '1 1 auto' } : {}),
        }}
      >
        <Box component="span" id={nameId} sx={(theme) => ({ ...nameText.sx(theme), ...oneLine.sx })}>
          {name}
        </Box>
        {described === '' ? null : (
          <Box component="span" sx={(theme) => ({ ...labelText.sx(theme), ...oneLine.sx })}>
            {described}
          </Box>
        )}
        {mobile ? chip : null}
      </Box>
      {mobile ? null : chip}
      {/* From the content outward, as the file draws them: the number, the
          email, and the unlink at the row's very end. */}
      <Box className={ACTIONS} sx={{ display: 'flex', gap: `${spacing['2xs']}px`, flexShrink: 0, marginInlineStart: 'auto' }}>
        {phone === undefined || phone === null || phone === '' ? null : (
          <IconButton
            icon="phone"
            tone="primary"
            aria-label={i18n._('Copy number')}
            onClick={() => {
              void copy(phone, PHONE)
            }}
          />
        )}
        {email === undefined || email === null || email === '' ? null : (
          <IconButton
            icon="mail"
            tone="primary"
            aria-label={i18n._('Copy email')}
            onClick={() => {
              void copy(email, EMAIL)
            }}
          />
        )}
        <IconButton icon="link-off" aria-label={i18n._('Remove from this job opportunity')} onClick={onUnlink} />
      </Box>
    </Box>
  )
}
