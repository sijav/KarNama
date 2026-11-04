import { useLingui } from '@lingui/react'
import { Box, Dialog, type Theme } from '@mui/material'
import { useEffect, useId, useRef, useState, type SyntheticEvent } from 'react'
import { apiErrorText, apiProblem } from '../../core/api'
import { spacing } from '../../theme/tokens'
import { Button, type ButtonType } from '../button'
import { LoadingState } from '../loading-state'
import { ConfirmModal, DISSOLVE_MS, ModalActions, ModalDivider, ModalHeader, modalPaper, modalScrim } from '../modal'
import type { SourceLists } from '../source-picker'
import { StatusSelect, type StatusOption } from '../status-picker'
import { draftFrom, hasContent, missingFields, type JobDraft, type Missing } from './draft'
import { JobForm } from './JobForm'
import { ManualPathLink } from './ManualPathLink'
import { PasteField } from './PasteField'

// Where the flow can be: the paste field, reading it, the filled form to
// correct, the empty form, and the paste field again after reading failed.
export type AddJobStep = 'paste' | 'loading' | 'review' | 'manual' | 'error'

// The props are documented in story-docs, not here, KN-207.
export interface AddJobModalProps {
  open: boolean
  stages: readonly StatusOption[]
  outcomes: readonly StatusOption[]
  status: string
  sources: SourceLists
  peopleAt?: (company: string) => number
  step?: Exclude<AddJobStep, 'loading'>
  source?: string
  draft?: Partial<JobDraft>
  onExtract: (source: string) => Promise<Partial<JobDraft>>
  onSave: (draft: JobDraft) => void
  onAddStatus: () => void
  onClose: () => void
}

// The button that finishes a form, typed so the lint rule reads it as a value.
const SUBMIT: ButtonType = 'submit'

// Where the modal opens unless told otherwise, typed for the same reason.
const PASTE: Exclude<AddJobStep, 'loading'> = 'paste'

// The fields a step starts at, found by their tags, typed for the same reason.
const TEXTAREA: keyof HTMLElementTagNameMap = 'textarea'
const INPUT: keyof HTMLElementTagNameMap = 'input'

// The fields Manual draws over its toggle; any other that stops a save is
// behind it.
const HEAD: readonly Missing[] = ['title', 'company']

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

// Everything the flow holds, set whole when the modal opens: where it is, what
// was pasted and whether it was touched, the draft, whether a save was tried,
// whether Manual's details are open, and the source reading found, which the
// Source Picker says filled it while the draft holds it.
interface Flow {
  errorCode?: string
  step: AddJobStep
  source: string
  touched: boolean
  draft: JobDraft
  tried: boolean
  details: boolean
  sourceRead: string
  startedAt: number
}

// The Add / Edit modal of node 166:82, the add flow of DESIGN.md section 3:
// Paste, then Loading, then Review, with Manual and Manual Details as the way
// round and Error as the way out. The paste steps draw the Paste Field and,
// 4 under it, the Manual Path Link; extracting waits until the field is filled
// and has been touched, as the file says, and reading it shows the loading
// panel of 243:899 in the same dialog. What was read arrives in the form, every
// field open to correction, the title and the company marked as required, the
// owner's KN-075. The form steps' footer holds the Status Select at the inline
// start, the status the job opportunity is added in, and «افزودن» hands the
// draft over; the page closes the modal. Leaving with anything entered asks
// first, in the Confirm modal, since the file draws no discard of its own.
export const AddJobModal = ({
  open,
  stages,
  outcomes,
  status,
  sources,
  peopleAt,
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
  // A draft handed to Review came from reading, so its source is the one read.
  const start = (): Flow => ({
    step: opening,
    source: openingSource,
    touched: false,
    draft: draftFrom(status, openingSource, openingDraft ?? {}),
    tried: false,
    details: false,
    sourceRead: opening === 'review' ? (openingDraft?.source ?? '') : '',
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
  const formId = useId()
  const pasteFormId = useId()
  const loadingLineId = useId()
  const stepBody = useRef<HTMLDivElement>(null)
  const shownStep = useRef(flow.step)
  useEffect(() => {
    if (shownStep.current === flow.step) return
    shownStep.current = flow.step
    if (flow.step === 'loading') {
      loadingPanel.current?.focus()
      return
    }
    // The first field in reading order. Asking for a textarea before an input
    // found the job description once the form had one, far down it, so Manual
    // and Review opened scrolled to their middle with the title out of sight.
    const field = stepBody.current?.querySelector<HTMLElement>(`${INPUT}, ${TEXTAREA}`)
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
        settle({ step: 'review', draft: draftFrom(status, source, found), sourceRead: found.source ?? '', tried: false })
      },
      (error: unknown) => {
        settle({ step: 'error', errorCode: apiProblem(error) })
      },
    )
  }
  const manual = () => {
    update({ step: 'manual', draft: draftFrom(status, flow.source, {}), details: false, sourceRead: '', tried: false })
  }
  const save = () => {
    const missing = missingFields(flow.draft)
    if (missing.length > 0) {
      // What stops the save is shown: a field behind Manual's toggle opens it,
      // or its error would be said where nobody can see it.
      update({ tried: true, details: flow.details || missing.some((field) => !HEAD.includes(field)) })
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
  // Reading's failure, 304:2, said in the paste field's place: a service that
  // cannot read at all says the way round; a posting that could not be read
  // says why it may be and to try again; anything else is the API's own words.
  const failure =
    flow.errorCode === 'EXTRACTION_NOT_CONFIGURED' || flow.errorCode === 'API_NOT_CONFIGURED' || flow.errorCode === 'AUTH_NOT_CONFIGURED'
      ? i18n._('Automatic extraction is unavailable. You can enter the details yourself.')
      : flow.errorCode === undefined || flow.errorCode === 'POSTING_UNAVAILABLE' || flow.errorCode === 'INVALID_POSTING_URL'
        ? i18n._('The posting may have been removed, or its site may not allow reading it. Please try again.')
        : apiErrorText(i18n, flow.errorCode)
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
          // The panel takes focus as a group named by the line on screen, not the status, which
          // is a live region, and the status leaves that first line to the name, KN-362.
          <Box ref={loadingPanel} tabIndex={-1} role="group" aria-labelledby={loadingLineId} sx={{ outline: 'none' }}>
            <LoadingState startedAt={flow.startedAt} lineId={loadingLineId} announceFirstLine={false} />
          </Box>
        ) : (
          <>
            <ModalHeader title={title} titleId={titleId} onClose={leave} />
            <ModalDivider />
            {pasting ? (
              // The paste wrap, 166:67: the Paste Field, touched as soon as it
              // takes focus, the file's critical path, and the Manual Path Link
              // 4 under it.
              <Box
                ref={stepBody}
                component="form"
                noValidate
                id={pasteFormId}
                onSubmit={(event: SyntheticEvent) => {
                  event.preventDefault()
                  extract()
                }}
                sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing['2xs']}px` }}
              >
                <PasteField
                  value={flow.source}
                  onFocus={() => {
                    update({ touched: true })
                  }}
                  onChange={(value) => {
                    update({ source: value, touched: true, ...(flow.step === 'error' ? { step: 'paste' } : {}) })
                  }}
                  {...(flow.step === 'error' ? { error: failure } : {})}
                />
                <ManualPathLink onClick={manual} />
              </Box>
            ) : (
              <Box
                ref={stepBody}
                component="form"
                noValidate
                id={formId}
                onSubmit={(event: SyntheticEvent) => {
                  event.preventDefault()
                  save()
                }}
                // Draws no box of its own, so the dialog's layout is unchanged,
                // KN-463.
                sx={{ display: 'contents' }}
              >
                <JobForm
                  mode={flow.step === 'review' ? 'review' : 'manual'}
                  details={flow.details}
                  onDetails={(details) => {
                    update({ details })
                  }}
                  draft={flow.draft}
                  missing={flow.tried ? missingFields(flow.draft) : []}
                  sources={sources}
                  sourceRead={flow.sourceRead}
                  {...(peopleAt === undefined ? {} : { peopleAt })}
                  onChange={(draft) => {
                    update({ draft })
                  }}
                />
              </Box>
            )}
            <ModalDivider />
            {/* The footer, 254:13: on the form steps the Status Select at the
                inline start; Cancel and the primary at the inline end, 12 apart.
                On a phone's width the actions take a row of their own. */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: `${spacing.sm}px` }}>
              {pasting ? null : (
                <Box sx={{ marginInlineEnd: 'auto' }}>
                  <StatusSelect
                    stages={stages}
                    outcomes={outcomes}
                    value={flow.draft.status}
                    onChange={(chosen) => {
                      setFlow((current) => ({ ...current, draft: { ...current.draft, status: chosen } }))
                    }}
                    onAdd={onAddStatus}
                  />
                </Box>
              )}
              <ModalActions>
                <Button variant="ghost" onClick={leave}>
                  {i18n._('Cancel')}
                </Button>
                {pasting ? (
                  <Button type={SUBMIT} form={pasteFormId} disabled={flow.source.trim() === '' || (flow.step === 'paste' && !flow.touched)}>
                    {flow.step === 'error' ? i18n._('Retry') : i18n._('Extract details')}
                  </Button>
                ) : (
                  <Button type={SUBMIT} form={formId}>
                    {i18n._('Add')}
                  </Button>
                )}
              </ModalActions>
            </Box>
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
