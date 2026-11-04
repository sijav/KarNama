import type { I18n } from '@lingui/core'
import { useLingui } from '@lingui/react'
import { Box, RadioGroup } from '@mui/material'
import { useId, useState } from 'react'
import { type as typeScale, unstyledText } from '../../theme/tokens'
import { Button, type ButtonVariant } from '../button'
import { quoted } from '../quoted'
import { Modal } from './Modal'
import { ReasonOption } from './ReasonOption'

// Why a job opportunity is deleted: no longer wanted, no answer came, or it
// was added by mistake or twice.
export type DeleteReason = 'not-wanted' | 'no-answer' | 'mistake'

// The closed outcome a job opportunity can go to instead.
export type DeleteInstead = 'withdrawn' | 'no-response'

// The props are documented in story-docs, not here, KN-207.
export interface DeleteJobModalProps {
  open: boolean
  withdrawnName: string
  noResponseName: string
  onDelete: (reason: DeleteReason | null) => void
  onMove: (outcome: DeleteInstead) => void
  onKeep: () => void
}

// Node 865:33825 binds no variable to these: its width, the 4 between the
// question and its note, the 8 between the reasons, and the hint's radius of
// 10 with 10 above and below and 12 at the sides.
const DELETE_WIDTH = 400
const QUESTION_GAP = 4
const REASONS_GAP = 8
const HINT_RADIUS = 10
const HINT_BLOCK = 10
const HINT_INLINE = 12

// The note under the question, 12 on 19, and the hint, 13 on 20, at Regular.
const note = unstyledText.deleteNote
const hinted = unstyledText.deleteHint

// The delete's two looks: the Destructive button, or, beside the Primary that
// moves the job opportunity instead, the Text style in red, 865:33677.
const DESTRUCTIVE: ButtonVariant = 'destructive'
const RED_TEXT: ButtonVariant = 'destructive-text'

// The three reasons, in the order the file lists them.
const REASONS: readonly DeleteReason[] = ['not-wanted', 'no-answer', 'mistake']

const reasonLabels = (i18n: I18n): Record<DeleteReason, string> => ({
  'not-wanted': i18n._('I am not after it any more'),
  'no-answer': i18n._('I got no answer'),
  mistake: i18n._('Added by mistake or twice'),
})

// Where a reason suggests the job opportunity goes instead of being deleted:
// no longer wanted to withdrawn, no answer to no response. A mistake has
// nowhere.
const INSTEAD: Partial<Record<DeleteReason, DeleteInstead>> = { 'not-wanted': 'withdrawn', 'no-answer': 'no-response' }

// Modal / Delete, node 865:33825: deleting a job opportunity. The shell at
// 400, «حذف این فرصت شغلی؟» as its title; «چرا می‌خواید حذفش کنید؟» at Medium
// and «لازم نیست انتخاب کنید.» under it in text/secondary; then the three
// Reason Options, 8 apart, none chosen. With none, or a mistake, the footer is
// the Ghost «نگه داشتن» and the Destructive «حذف». Not wanted any more, or no
// answer, adds a hint in bg/brand/subtle that the job opportunity can go to
// withdrawn or no response instead, and the footer becomes Keep, «حذف» in red
// text and «بردن به …» as the Primary. Keep is not «انصراف», since that is a
// status's name; it takes focus as the modal opens, and the close, Escape and
// the scrim keep the job opportunity too.
export const DeleteJobModal = ({ open, withdrawnName, noResponseName, onDelete, onMove, onKeep }: DeleteJobModalProps) => {
  const { i18n } = useLingui()
  const questionId = useId()
  const noteId = useId()
  // The reason chosen, forgotten each time the modal opens.
  const [reason, setReason] = useState<DeleteReason | null>(null)
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setReason(null)
  }
  const labels = reasonLabels(i18n)
  const instead = reason === null ? undefined : INSTEAD[reason]
  const insteadName = instead === 'withdrawn' ? withdrawnName : noResponseName
  return (
    <Modal
      open={open}
      title={i18n._('Delete this job opportunity?')}
      width={DELETE_WIDTH}
      onClose={onKeep}
      actions={
        <>
          <Button variant="ghost" autoFocus onClick={onKeep}>
            {i18n._('Keep')}
          </Button>
          <Button
            variant={instead === undefined ? DESTRUCTIVE : RED_TEXT}
            onClick={() => {
              onDelete(reason)
            }}
          >
            {i18n._('Delete')}
          </Button>
          {instead === undefined ? null : (
            <Button
              onClick={() => {
                onMove(instead)
              }}
            >
              {`${i18n._('Move to')} ${insteadName}`}
            </Button>
          )}
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: `${QUESTION_GAP}px` }}>
        <Box
          component="span"
          id={questionId}
          sx={(theme) => ({
            fontSize: `${typeScale.body.size}px`,
            lineHeight: `${typeScale.body.lineHeight}px`,
            fontWeight: typeScale.label.weight,
            color: theme.karnama.semantic['text/primary'],
          })}
        >
          {i18n._('Why do you want to delete it?')}
        </Box>
        <Box
          component="span"
          id={noteId}
          sx={(theme) => ({
            fontSize: `${note.size}px`,
            lineHeight: `${note.lineHeight}px`,
            fontWeight: note.weight,
            letterSpacing: `${note.letterSpacing}px`,
            color: theme.karnama.semantic['text/secondary'],
          })}
        >
          {i18n._('You do not have to choose.')}
        </Box>
      </Box>
      <RadioGroup
        value={reason ?? ''}
        aria-labelledby={questionId}
        aria-describedby={noteId}
        onChange={(_, picked) => {
          const found = REASONS.find((entry) => entry === picked)
          if (found) setReason(found)
        }}
        sx={{ gap: `${REASONS_GAP}px` }}
      >
        {REASONS.map((entry) => (
          <ReasonOption key={entry} value={entry} label={labels[entry]} />
        ))}
      </RadioGroup>
      {instead === undefined ? null : (
        <Box
          sx={(theme) => ({
            paddingBlock: `${HINT_BLOCK}px`,
            paddingInline: `${HINT_INLINE}px`,
            borderRadius: `${HINT_RADIUS}px`,
            backgroundColor: theme.karnama.semantic['bg/brand/subtle'],
            color: theme.karnama.semantic['text/primary'],
            fontSize: `${hinted.size}px`,
            lineHeight: `${hinted.lineHeight}px`,
            fontWeight: hinted.weight,
            letterSpacing: `${hinted.letterSpacing}px`,
          })}
        >
          {`${i18n._('Instead of deleting it, you can move it to')} ${quoted(i18n, insteadName)}${i18n._('.')} ${i18n._('That way it is out of sight and still counts in your stats.')}`}
        </Box>
      )}
    </Modal>
  )
}
