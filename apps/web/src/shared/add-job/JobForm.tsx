import { useLingui } from '@lingui/react'
import { Box, ButtonBase } from '@mui/material'
import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { spacing, type as typeScale } from '../../theme/tokens'
import { Icon } from '../icon'
import { Input, type InputDirection, type InputHelperTone } from '../input'
import { EmploymentTypeSelect, JobLevelSelect } from '../job-selects'
import { useNetworkAt } from '../related-person'
import { SourcePicker, type SourceLists } from '../source-picker'
import { isDay } from './days'
import type { JobDraft, Missing } from './draft'
import { JobArea, JobPart } from './parts'

// A field of latin data: a phone number, an email or a link runs left to right
// whatever the page does, KN-458. Typed so the lint rule reads it as a value
// rather than as copy.
const LATIN: InputDirection = 'ltr'
// The company's note in the brand's colour, 150:94, typed for the same reason.
const BRAND: InputHelperTone = 'brand'

// The form of node 150:94, 420 tall inside the modal's 606, scrolling beyond,
// and the fade over its foot, 48 of bg/surface rising from nothing.
const FORM_HEIGHT = 420
const FADE_HEIGHT = 48

// The keyboard's outline on the toggle, the product's two of border/focus, as
// the Manual Path Link draws it: the file draws the toggle no focus.
const FOCUS_OUTLINE = 2

// The two fields that can be missing, typed so the lint rule reads them as
// values and not as copy.
const TITLE: Missing = 'title'
const COMPANY: Missing = 'company'

const { body } = typeScale

// The fields of the job opportunity, 150:94 and 210:101, the props of every part
// of them: the draft, what stops it being saved, the reader's sources and the one
// reading found, which the Source Picker says filled it while it holds it, and
// how many of the reader's network are at a company, said under the company.
export interface JobFieldsProps {
  draft: JobDraft
  missing: readonly Missing[]
  sources: SourceLists
  sourceRead?: string
  peopleAt?: (company: string) => number
  onChange: (draft: JobDraft) => void
}

// Two columns with 16 between, one on a phone's width; a field taller than its
// neighbour, the company with its note, keeps the neighbour at the row's top.
const FieldGrid = ({ children }: { children: ReactNode }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, alignItems: 'start', gap: `${spacing.md}px` }}>
    {children}
  </Box>
)

// The first row, from the inline start: the title and the company, both
// required; under the company, when the reader's network holds people there,
// «۳ نفر از دیجی‌کالا در شبکهٔ شما هستند», the field's own helper in Body
// text/brand, 150:94, said and not pressed.
const HeadFields = ({ draft, missing, peopleAt, onChange }: JobFieldsProps) => {
  const { i18n } = useLingui()
  const company = draft.company.trim()
  const people = peopleAt === undefined || company === '' ? 0 : peopleAt(company)
  const note = useNetworkAt(company, people)
  return (
    <>
      <Input
        label={i18n._('Job title')}
        enterKeyHint="done"
        required
        value={draft.title}
        onChange={(title) => {
          onChange({ ...draft, title })
        }}
        {...(missing.includes(TITLE) ? { error: i18n._('Write the job title') } : {})}
      />
      <Input
        label={i18n._('Company name')}
        enterKeyHint="done"
        required
        value={draft.company}
        onChange={(value) => {
          onChange({ ...draft, company: value })
        }}
        {...(missing.includes(COMPANY)
          ? { error: i18n._('Write the company name') }
          : people > 0
            ? { helperText: note, helperTone: BRAND }
            : {})}
      />
    </>
  )
}

// The rest, two to a row from the inline start: employment type and location,
// experience and level, the posted date and the salary, the source and the
// deadline.
const DetailFields = ({ draft, missing, sources, sourceRead = '', onChange }: JobFieldsProps) => {
  const { i18n } = useLingui()
  const text = (key: 'location' | 'experience' | 'salary', label: string) => (
    <Input
      label={label}
      enterKeyHint="done"
      value={draft[key]}
      onChange={(value) => {
        onChange({ ...draft, [key]: value })
      }}
    />
  )
  // A date is a day, which the picker holds, or a date written before the picker,
  // KN-494, which a picker would show as nothing: that one is a field of text,
  // holding it as written for the reader to change, and cleared it is a picker again.
  const date = (key: 'postedAt' | 'expiresAt', label: string) =>
    draft[key] !== '' && !isDay(draft[key]) ? (
      <Input
        label={label}
        enterKeyHint="done"
        value={draft[key]}
        onChange={(value) => {
          onChange({ ...draft, [key]: value })
        }}
      />
    ) : (
      <Input
        label={label}
        type="date"
        direction={LATIN}
        value={draft[key]}
        {...(key === 'expiresAt' && isDay(draft.postedAt) ? { min: draft.postedAt } : {})}
        {...(missing.includes(key) ? { error: i18n._('Enter a valid date; the deadline cannot be before the posting date') } : {})}
        onChange={(value) => {
          onChange({ ...draft, [key]: value })
        }}
      />
    )
  return (
    <>
      <EmploymentTypeSelect
        value={draft.employmentTypes}
        onChange={(employmentTypes) => {
          onChange({ ...draft, employmentTypes })
        }}
      />
      {text('location', i18n._('Location'))}
      {text('experience', i18n._('Required experience'))}
      <JobLevelSelect
        value={draft.jobLevel}
        onChange={(jobLevel) => {
          onChange({ ...draft, jobLevel })
        }}
      />
      {date('postedAt', i18n._('Posted on'))}
      {text('salary', i18n._('Salary'))}
      <SourcePicker
        value={draft.source}
        own={sources.own}
        common={sources.common}
        autoFilled={sourceRead !== '' && draft.source === sourceRead}
        onChange={(source) => {
          onChange({ ...draft, source })
        }}
      />
      {date('expiresAt', i18n._('Application deadline'))}
    </>
  )
}

// Every field in the two columns, the order 150:94 and 210:101 draw. The add
// modal's form and the Job Modal's Info tab draw them, so the record is edited
// the same way in both.
export const JobFields = (props: JobFieldsProps) => (
  <FieldGrid>
    <HeadFields {...props} />
    <DetailFields {...props} />
  </FieldGrid>
)

// Which form the add modal draws: Review's, every field filled in by reading,
// or Manual's, the title and the company over the toggle and the rest behind it.
export type JobFormMode = 'review' | 'manual'

export interface JobFormProps extends JobFieldsProps {
  mode: JobFormMode
  details: boolean
  onDetails: (open: boolean) => void
}

// The Details Toggle of 254:2 and 1262:97354, at the inline start: the 20
// chevron in text/secondary and 4 after it «جزئیات بیشتر» in Body text/brand;
// open, «جزئیات کمتر» and the chevron turned. A disclosure, so a button that
// says whether what it shows is open.
const DetailsToggle = ({ open, controls, onToggle }: { open: boolean; controls: string; onToggle: () => void }) => {
  const { i18n } = useLingui()
  return (
    <Box sx={{ display: 'flex' }}>
      <ButtonBase
        disableRipple
        aria-expanded={open}
        {...(open ? { 'aria-controls': controls } : {})}
        onClick={onToggle}
        sx={(theme) => ({
          gap: `${spacing['2xs']}px`,
          fontFamily: 'inherit',
          fontSize: `${body.size}px`,
          lineHeight: `${body.lineHeight}px`,
          fontWeight: body.weight,
          color: theme.karnama.semantic['text/brand'],
          borderRadius: `${theme.karnama.radius.sm}px`,
          '& > svg': { transform: open ? 'rotate(180deg)' : 'none' },
          '&.Mui-focusVisible': {
            outlineWidth: FOCUS_OUTLINE,
            outlineStyle: 'solid',
            outlineColor: theme.karnama.semantic['border/focus'],
          },
        })}
      >
        <Icon name="chevron-down" size="md" />
        {open ? i18n._('Fewer details') : i18n._('More details')}
      </ButtonBase>
    </Box>
  )
}

// The form of Review, Manual and Manual Details, one form, DESIGN.md section 4:
// the fields, then the posting's link across the row and the description under
// its heading row, a field that grows from one line. Review draws them all,
// filled, under a fade that says there is more until the form is scrolled to its
// end; Manual draws the title and the company over the toggle, and Manual
// Details the rest under it, with no fade, as 1262:97354 draws it. It scrolls in
// its 420, its bar in the modal's padding at the inline end so the fields keep
// their width.
export const JobForm = ({ mode, details, onDetails, ...fields }: JobFormProps) => {
  const { i18n } = useLingui()
  const { draft, missing, onChange } = fields
  const detailsId = useId()
  const scroll = useRef<HTMLDivElement>(null)
  // Whether the form shows its end, scrolled there or too short to scroll: read
  // after every render, as typing lengthens it, and on every scroll.
  const [atEnd, setAtEnd] = useState(true)
  const readEnd = () => {
    const box = scroll.current
    if (box) setAtEnd(Math.ceil(box.scrollTop + box.clientHeight) >= box.scrollHeight)
  }
  useLayoutEffect(readEnd)
  const rest = (
    <>
      <Input
        label={i18n._('Posting link')}
        type="url"
        enterKeyHint="done"
        {...(missing.includes('postingUrl') ? { error: i18n._('Enter a valid http or https link') } : {})}
        direction={LATIN}
        value={draft.postingUrl}
        onChange={(postingUrl) => {
          onChange({ ...draft, postingUrl })
        }}
      />
      <JobPart icon="note" title={i18n._('Job description and responsibilities')}>
        <JobArea
          label={i18n._('Job description and responsibilities')}
          minRows={1}
          placeholder={i18n._('Put the posting text or the job description here')}
          value={draft.description ?? ''}
          onChange={(description) => {
            onChange({ ...draft, description })
          }}
        />
      </JobPart>
    </>
  )
  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        ref={scroll}
        onScroll={readEnd}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: `${spacing.md}px`,
          maxHeight: FORM_HEIGHT,
          overflowY: 'auto',
          marginInlineEnd: `-${spacing.lg}px`,
          paddingInlineEnd: `${spacing.lg}px`,
        }}
      >
        {mode === 'review' ? (
          <>
            <JobFields {...fields} />
            {rest}
          </>
        ) : (
          <>
            <FieldGrid>
              <HeadFields {...fields} />
            </FieldGrid>
            <DetailsToggle
              open={details}
              controls={detailsId}
              onToggle={() => {
                onDetails(!details)
              }}
            />
            {details ? (
              <Box id={detailsId} sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing.md}px` }}>
                <FieldGrid>
                  <DetailFields {...fields} />
                </FieldGrid>
                {rest}
              </Box>
            ) : null}
          </>
        )}
      </Box>
      {mode === 'review' ? (
        <Box
          aria-hidden
          sx={(theme) => ({
            position: 'absolute',
            insetInline: 0,
            bottom: 0,
            height: FADE_HEIGHT,
            pointerEvents: 'none',
            backgroundImage: `linear-gradient(transparent, ${theme.karnama.semantic['bg/surface']})`,
            opacity: atEnd ? 0 : 1,
          })}
        />
      ) : null}
    </Box>
  )
}
