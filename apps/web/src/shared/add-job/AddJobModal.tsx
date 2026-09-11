import { useLingui } from '@lingui/react'
import { Box, ButtonBase, Dialog, type Theme } from '@mui/material'
import { useEffect, useId, useRef, useState } from 'react'
import { spacing, type as typeScale } from '../../theme/tokens'
import { Button } from '../button'
import { Input } from '../input'
import { LoadingState } from '../loading-state'
import { ConfirmModal, DISSOLVE_MS, ModalActions, ModalDivider, ModalHeader, modalPaper, modalScrim } from '../modal'
import type { StatusOption } from '../status-picker'
import { draftFrom, emptyDraft, hasContent, missingFields, type JobDraft } from './draft'
import { JobForm } from './JobForm'

// Where the flow can be: the paste field, reading it, the filled form to
// correct, the empty form, and the paste field again after reading failed.
export type AddJobStep = 'paste' | 'loading' | 'review' | 'manual' | 'error'

// The props are documented in story-docs, not here, KN-207.
export interface AddJobModalProps {
  open: boolean
  statuses: readonly StatusOption[]
  status: string
  step?: Exclude<AddJobStep, 'loading'>
  source?: string
  draft?: Partial<JobDraft>
  onExtract: (source: string) => Promise<Partial<JobDraft>>
  onSave: (draft: JobDraft) => void
  onAddStatus: () => void
  onClose: () => void
}

// Where the modal opens unless told otherwise, typed so the lint rule reads it
// as a value and not as copy.
const PASTE: Exclude<AddJobStep, 'loading'> = 'paste'
// The fields a step starts at, found by their tags, typed for the same reason.
const TEXTAREA: keyof HTMLElementTagNameMap = 'textarea'
const INPUT: keyof HTMLElementTagNameMap = 'input'

// Node 166:82's width, and the loading panel's of 243:964, which bind no
// variable.
const WIDTH = 560
const LOADING_WIDTH = 360

// The loading panel, 243:964: the shell's surface, radius and shadow, 32 above
// and below and 24 at the sides, the Loading State in its middle. Under an sx
// key, which the lint rule reads as CSS.
const loadingPaper = {
  sx: (theme: Theme) => ({
    ...modalPaper.sx(theme, LOADING_WIDTH),
    alignItems: 'center',
    justifyContent: 'center',
    paddingBlock: `${spacing.xl}px`,
    paddingInline: `${spacing.lg}px`,
  }),
}

// Everything the flow holds, set whole when the modal opens.
interface Flow {
  step: AddJobStep
  source: string
  touched: boolean
  draft: JobDraft
  tried: boolean
  startedAt: number
}

// The Add / Edit modal of node 166:82, the add flow of DESIGN.md section 3:
// Paste, then Loading, then Review, with Manual as the way round and Error as
// the way out. The paste field takes a link or the whole text of a posting;
// extracting waits until it is filled and has been touched, as the file says,
// and reading it shows the loading panel of 243:899 in the same dialog. What
// was read arrives in the form, every field open to correction, the title and
// the company marked as required, the owner's KN-075; saving hands the draft
// over and the page closes the modal. Leaving with anything entered asks
// first, in the Confirm modal, since the file draws no discard of its own.
export const AddJobModal = ({
  open,
  statuses,
  status,
  step: opening = PASTE,
  source: openingSource = '',
  draft: openingDraft,
  onExtract,
  onSave,
  onAddStatus,
  onClose,
}: AddJobModalProps) => {
  const { i18n } = useLingui()
  const titleId = useId()
  const start = (): Flow => ({
    step: opening,
    source: openingSource,
    touched: false,
    draft: draftFrom(status, openingSource, openingDraft ?? {}),
    tried: false,
    startedAt: 0,
  })
  const [flow, setFlow] = useState(start)
  const [confirming, setConfirming] = useState(false)
  // Each opening starts over, and so does a change, while open, to what it
  // opens on, the step, the source or the draft, as Storybook's Controls make
  // one, KN-361: React's pattern for state that follows a prop, adjusted during
  // render. The draft is compared by what it holds, since a parent that renders
  // again hands over a new object with the same draft in it, KN-347's trap.
  const given = { open, step: opening, source: openingSource, draft: JSON.stringify(openingDraft ?? {}) }
  const [seen, setSeen] = useState(given)
  const changed = given.step !== seen.step || given.source !== seen.source || given.draft !== seen.draft
  if (given.open !== seen.open || (open && changed)) {
    setSeen(given)
    if (open) {
      setFlow(start())
      setConfirming(false)
    }
  }
  // The reading in flight: a later one, or leaving the loading panel, makes an
  // earlier answer arrive to nobody.
  const reading = useRef(0)
  const update = (change: Partial<Flow>) => {
    setFlow((current) => ({ ...current, ...change }))
  }
  // Focus follows the step. The control that moved the flow on is gone with
  // the step it was in, so reading takes focus into its panel, where Escape
  // can reach the dialog and the status is heard, and every other step starts
  // at its first field.
  const loadingPanel = useRef<HTMLDivElement>(null)
  const stepBody = useRef<HTMLDivElement>(null)
  const shownStep = useRef(flow.step)
  useEffect(() => {
    if (shownStep.current === flow.step) return
    shownStep.current = flow.step
    if (flow.step === 'loading') {
      loadingPanel.current?.focus()
      return
    }
    const field = stepBody.current?.querySelector(TEXTAREA) ?? stepBody.current?.querySelector(INPUT)
    field?.focus()
  }, [flow.step])

  const extract = () => {
    reading.current += 1
    const mine = reading.current
    const source = flow.source.trim()
    const startedAt = Date.now()
    update({ step: 'loading', startedAt })
    // An answer lands only on the flow that asked for it: still loading, and
    // loading since this reading began. A restart from changed props, KN-361,
    // replaces the flow and never with a loading one, so an answer it left
    // behind lands nowhere, KN-391.
    const settle = (change: Partial<Flow>) => {
      if (reading.current !== mine) return
      setFlow((current) => (current.step === 'loading' && current.startedAt === startedAt ? { ...current, ...change } : current))
    }
    void onExtract(source).then(
      (found) => {
        settle({ step: 'review', draft: draftFrom(status, source, found), tried: false })
      },
      () => {
        settle({ step: 'error' })
      },
    )
  }
  const manual = () => {
    update({ step: 'manual', draft: emptyDraft(status), tried: false })
  }
  const save = () => {
    if (missingFields(flow.draft).length > 0) {
      update({ tried: true })
      return
    }
    onSave({ ...flow.draft, title: flow.draft.title.trim(), company: flow.draft.company.trim() })
  }
  // Escape, the scrim and the close: reading is left for the paste field;
  // anything entered asks before it goes.
  const leave = () => {
    if (flow.step === 'loading') {
      reading.current += 1
      update({ step: 'paste' })
      return
    }
    const entered = flow.step === 'review' || flow.source.trim() !== '' || hasContent(flow.draft)
    if (entered) setConfirming(true)
    else onClose()
  }

  const pasting = flow.step === 'paste' || flow.step === 'error'
  // Reading's failure, 304:11, three sentences each its own message, joined as
  // both languages join sentences.
  const unreadable = [
    i18n._('We could not read this link.'),
    i18n._('The posting may have been removed or the site may not allow reading it.'),
    i18n._('Try again, or enter the details yourself.'),
  ].join(' ')
  const title = flow.step === 'error' ? i18n._('We could not read the posting') : i18n._('Add job opportunity')

  return (
    <>
      <Dialog
        open={open}
        onClose={leave}
        transitionDuration={DISSOLVE_MS}
        {...(flow.step === 'loading' ? { 'aria-label': i18n._('Add job opportunity') } : { 'aria-labelledby': titleId })}
        slotProps={{
          backdrop: { sx: modalScrim.sx },
          paper: { sx: (theme) => (flow.step === 'loading' ? loadingPaper.sx(theme) : modalPaper.sx(theme, WIDTH)) },
        }}
      >
        {flow.step === 'loading' ? (
          <Box ref={loadingPanel} tabIndex={-1} sx={{ outline: 'none' }}>
            <LoadingState startedAt={flow.startedAt} />
          </Box>
        ) : (
          <>
            <ModalHeader title={title} titleId={titleId} onClose={leave} />
            <ModalDivider />
            {pasting ? (
              <Box ref={stepBody} sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing['2xs']}px` }}>
                {/* The paste field, 166:67: the Input of several lines, its
                    helper under it, or reading's failure in its place; touched
                    as soon as it takes focus, the file's critical path. */}
                <Box
                  onFocus={() => {
                    update({ touched: true })
                  }}
                >
                  <Input
                    multiline
                    label={i18n._('Posting link or full text')}
                    placeholder={i18n._('Paste the posting link, or copy the whole posting text here')}
                    value={flow.source}
                    onChange={(value) => {
                      update({ source: value, touched: true, ...(flow.step === 'error' ? { step: 'paste' } : {}) })
                    }}
                    {...(flow.step === 'error'
                      ? { error: unreadable }
                      : { helperText: i18n._('It takes a link or the whole posting text; you do not need to separate anything.') })}
                  />
                </Box>
                {/* The Manual Path Row, 269:3292: the way round, at 14. */}
                <Box
                  sx={(theme) => ({
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: `${spacing['2xs']}px`,
                    fontSize: `${typeScale.body.size}px`,
                    lineHeight: `${typeScale.body.lineHeight}px`,
                    color: theme.karnama.semantic['text/secondary'],
                  })}
                >
                  <span>{i18n._('No link or posting text?')}</span>
                  <ButtonBase
                    disableRipple
                    onClick={manual}
                    sx={(theme) => ({
                      position: 'relative',
                      fontFamily: 'inherit',
                      fontSize: `${typeScale.body.size}px`,
                      lineHeight: `${typeScale.body.lineHeight}px`,
                      fontWeight: typeScale.label.weight,
                      color: theme.karnama.semantic['text/brand'],
                      borderRadius: `${theme.karnama.radius.sm}px`,
                      '&.Mui-focusVisible': {
                        outlineWidth: 2,
                        outlineStyle: 'solid',
                        outlineColor: theme.karnama.semantic['border/focus'],
                      },
                    })}
                  >
                    {i18n._('Enter it yourself')}
                  </ButtonBase>
                </Box>
              </Box>
            ) : (
              <Box ref={stepBody} sx={{ display: 'contents' }}>
                <JobForm
                  draft={flow.draft}
                  statuses={statuses}
                  missing={flow.tried ? missingFields(flow.draft) : []}
                  onChange={(draft) => {
                    update({ draft })
                  }}
                  onAddStatus={onAddStatus}
                />
              </Box>
            )}
            <ModalDivider />
            <ModalActions>
              <Button variant="ghost" onClick={leave}>
                {i18n._('Cancel')}
              </Button>
              {pasting ? (
                <Button disabled={flow.source.trim() === '' || (flow.step === 'paste' && !flow.touched)} onClick={extract}>
                  {flow.step === 'error' ? i18n._('Try again') : i18n._('Extract details')}
                </Button>
              ) : (
                <Button onClick={save}>{i18n._('Save')}</Button>
              )}
            </ModalActions>
          </>
        )}
      </Dialog>
      <ConfirmModal
        open={confirming}
        title={i18n._('Close without saving?')}
        body={i18n._('What you entered here will not be kept.')}
        confirmLabel={i18n._('Close')}
        onConfirm={() => {
          setConfirming(false)
          onClose()
        }}
        onCancel={() => {
          setConfirming(false)
        }}
      />
    </>
  )
}
