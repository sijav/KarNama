import type { I18n } from '@lingui/core'
import { useLingui } from '@lingui/react'
import { Box } from '@mui/material'
import { useId, useState } from 'react'
import { usePreferences } from '../../core/preferences'
import { formatCount } from '../../i18n/formatCount'
import { spacing, unstyledText, type StatusToken } from '../../theme/tokens'
import { Button } from '../button'
import { ColorPicker } from '../color-picker'
import { FilterChip } from '../filter-chip'
import { Input } from '../input'
import { Modal } from './Modal'

// A stage the reader made: its name and its colour.
export interface Stage {
  name: string
  colour: StatusToken
}

// The props are documented in story-docs, not here, KN-207.
export interface StageModalProps {
  open: boolean
  mode: 'add' | 'edit'
  stage: Stage
  takenNames: readonly string[]
  onSave: (stage: Stage) => void
  onCancel: () => void
  onDelete?: () => void
}

// Node 919:2804 binds no variable to these: its width, the name's cap of 20
// letters, which its description sets, and the 20 between its fields.
const STAGE_WIDTH = 440
const NAME_MAX = 20
const FIELDS_GAP = 20

// The suggestions' label, 12 on Figma's automatic 19 at Medium.
const heading = unstyledText.stageSuggestions

// The names the modal suggests for a new stage, in the order 919:2550 lays
// them out from the inline start.
const suggestions = (i18n: I18n) => [
  i18n._('Assignment'),
  i18n._('HR interview'),
  i18n._('Technical interview'),
  i18n._('Salary negotiation'),
  i18n._('Final interview'),
]

// Two names are the same one when they read the same, whatever the case or
// the spaces round them.
const sameName = (locale: string, one: string, other: string) => one.trim().toLocaleLowerCase(locale) === other.trim().toLocaleLowerCase(locale)

// Modal / Status, node 919:2804: adding a stage the reader makes, or editing
// one. The shell at 440, «افزودن وضعیت» or «ویرایش وضعیت» as its title; the
// stage's name, at most 20 letters with the count under it, which turns to
// the error when another stage has the name; on Add the suggestions, chips
// that fill the name; and the Color Picker across the field, which starts on
// the colour chosen for it. Add and Save are off while the name is empty or
// taken; Enter in the name does what they do. Edit puts Delete status, in red
// text, at the footer's inline start. The close, Escape and the scrim cancel.
export const StageModal = ({ open, mode, stage, takenNames, onSave, onCancel, onDelete }: StageModalProps) => {
  const { i18n } = useLingui()
  const { locale } = usePreferences()
  const formId = useId()
  const suggestionsId = useId()
  // What is typed and picked, started afresh from the stage each time the
  // modal opens: React's pattern for state that follows a prop.
  const [name, setName] = useState(stage.name)
  const [colour, setColour] = useState(stage.colour)
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setName(stage.name)
      setColour(stage.colour)
    }
  }
  const editing = mode === 'edit'
  const taken = name.trim() !== '' && takenNames.some((other) => sameName(locale, other, name))
  const ready = name.trim() !== '' && !taken
  const save = () => {
    if (ready) onSave({ name: name.trim(), colour })
  }
  const counted = `${formatCount(locale, name.length)} ${i18n._('of')} ${formatCount(locale, NAME_MAX)} ${i18n._('characters')}`
  return (
    <Modal
      open={open}
      title={editing ? i18n._('Edit status') : i18n._('Add status')}
      width={STAGE_WIDTH}
      onClose={onCancel}
      actions={
        <>
          {editing && onDelete !== undefined ? (
            // The footer's other end, the inline start, as 919:2803 sets it.
            <Box sx={{ marginInlineEnd: 'auto' }}>
              <Button variant="destructive-text" onClick={onDelete}>
                {i18n._('Delete status')}
              </Button>
            </Box>
          ) : null}
          <Button variant="ghost" onClick={onCancel}>
            {i18n._('Cancel')}
          </Button>
          <Button type="submit" form={formId} disabled={!ready}>
            {editing ? i18n._('Save') : i18n._('Add')}
          </Button>
        </>
      }
    >
      <Box
        component="form"
        id={formId}
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          save()
        }}
        sx={{ display: 'flex', flexDirection: 'column', gap: `${FIELDS_GAP}px` }}
      >
        <Input
          label={i18n._('Status name')}
          value={name}
          placeholder={`${i18n._('For example:')} ${i18n._('Technical interview')}`}
          maxLength={NAME_MAX}
          helperText={counted}
          {...(taken ? { error: i18n._('You have already chosen this name. Choose another name.') } : {})}
          onChange={(value) => {
            setName(value)
          }}
        />
        {editing ? null : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: `${spacing.xs}px` }}>
            <Box
              component="span"
              id={suggestionsId}
              sx={(theme) => ({
                fontSize: `${heading.size}px`,
                lineHeight: `${heading.lineHeight}px`,
                fontWeight: heading.weight,
                letterSpacing: `${heading.letterSpacing}px`,
                color: theme.karnama.semantic['text/secondary'],
              })}
            >
              {i18n._('Suggestions')}
            </Box>
            <Box role="group" aria-labelledby={suggestionsId} sx={{ display: 'flex', flexWrap: 'wrap', gap: `${spacing.xs}px` }}>
              {suggestions(i18n).map((suggestion) => (
                <FilterChip
                  key={suggestion}
                  label={suggestion}
                  selected={sameName(locale, name, suggestion)}
                  onToggle={(on) => {
                    setName(on ? suggestion : '')
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
        <ColorPicker fullWidth value={colour} onChange={setColour} />
      </Box>
    </Modal>
  )
}
