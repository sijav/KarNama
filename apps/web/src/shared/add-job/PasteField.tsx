import { useLingui } from '@lingui/react'
import { Box } from '@mui/material'
import { Input } from '../input'

// The props are documented in story-docs, not here, KN-207.
export interface PasteFieldProps {
  value: string
  onChange: (value: string) => void
  error?: string
  onFocus?: () => void
}

// The Paste Field, node 961:101573, Default and Hover, in its Field Wrap,
// 166:67: «لینک آگهی یا متن کامل آگهی» at 12 on 19 over the field, 4 below it
// the helper, or reading's failure in its place, as the Input draws them. The
// field is the Input of several lines at one row, 54 tall, its placeholder in
// text/secondary 16 in from every edge; it grows with what is pasted up to the
// Input's eight rows. At rest its edge is the owner's border/control, where the
// file draws border/default, since an empty field is found by its edge alone,
// KN-275; on hover it is text/secondary, as the file's Hover is, and focused
// the Input's two of border/focus, which the file draws no state for.
export const PasteField = ({ value, onChange, error, onFocus }: PasteFieldProps) => {
  const { i18n } = useLingui()
  return (
    <Box onFocus={onFocus}>
      <Input
        multiline
        minRows={1}
        labelStyle="paste"
        label={i18n._('Posting link or full text')}
        placeholder={i18n._('Put the posting link or its full text here')}
        value={value}
        onChange={(next) => {
          onChange(next)
        }}
        {...(error === undefined ? { helperText: i18n._('A link or the full posting text; no need to separate anything.') } : { error })}
      />
    </Box>
  )
}
