import { useLingui } from '@lingui/react'
import { Box } from '@mui/material'
import { Fragment, useId, useState } from 'react'
import { spacing, type StatusToken } from '../../theme/tokens'
import { Button } from '../button'
import { holds, LinkedMark, SearchPicker } from '../picker'
import { labelText, oneLine } from '../related-person/personText'
import { StatusChip } from '../status-chip'
import { jobTitleText, LinkedJob, StatusStripe } from './LinkedJob'

// A job opportunity the section lists or offers: its title, company and status.
export interface LinkedJobItem {
  id: string
  title: string
  company?: string | null
  status: { token: StatusToken; name: string }
}

// The props are documented in story-docs, not here, KN-207.
export interface LinkedJobsProps {
  linked: readonly LinkedJobItem[]
  jobs: readonly LinkedJobItem[]
  onLink: (id: string) => void
  onUnlink: (id: string) => void
}

// Node 1092:3103 binds no variable to these: the list's one pixel edge, in its
// layout; the job picker's 360; and an option's stripe, 3 by 28.
const EDGE = 1
const PICKER_WIDTH = 360
const OPTION_STRIPE = 28

const present = (value: string | null | undefined): value is string => value !== undefined && value !== null && value !== ''

// Linked Jobs, node 1092:3103, Empty, Filled and Picking: the person modal's
// job opportunities linked to the person. «فرصت‌های شغلی وصل‌شده» in Label; with
// none, «هنوز به فرصت شغلی‌ای وصل نیست.» in Body text/secondary, else the Linked
// Job rows in a list of bg/surface at radius 8 inside one pixel of
// border/default, a divider between each; then the Text button «وصل کردن به
// فرصت شغلی» with its plus, which opens the job picker, 1092:3072, 360 wide:
// each of the reader's job opportunities it finds with its stripe, title,
// company and status, the linked ones muted with «وصل است» instead of their
// status. Choosing one links it and closes the picker.
export const LinkedJobs = ({ linked, jobs, onLink, onUnlink }: LinkedJobsProps) => {
  const { i18n } = useLingui()
  const labelId = useId()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [open, setOpen] = useState(false)
  const linkedIds = new Set(linked.map((job) => job.id))
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: `${spacing.xs}px` }}>
      <Box component="span" id={labelId} sx={(theme) => ({ ...labelText.sx(theme), color: theme.karnama.semantic['text/primary'] })}>
        {i18n._('Linked job opportunities')}
      </Box>
      {linked.length === 0 ? (
        <Box component="span" sx={(theme) => ({ ...jobTitleText.sx, color: theme.karnama.semantic['text/secondary'] })}>
          {i18n._('Not linked to a job opportunity yet.')}
        </Box>
      ) : (
        <Box
          role="list"
          aria-labelledby={labelId}
          sx={(theme) => ({
            alignSelf: 'stretch',
            overflow: 'hidden',
            borderRadius: `${theme.karnama.radius.md}px`,
            border: `${EDGE}px solid ${theme.karnama.semantic['border/default']}`,
            backgroundColor: theme.karnama.semantic['bg/surface'],
          })}
        >
          {linked.map((job, index) => (
            <Fragment key={job.id}>
              {index === 0 ? null : <Box aria-hidden sx={(theme) => ({ height: `${EDGE}px`, backgroundColor: theme.karnama.semantic['border/default'] })} />}
              <Box role="listitem">
                <LinkedJob
                  title={job.title}
                  company={job.company ?? null}
                  status={job.status}
                  onUnlink={() => {
                    onUnlink(job.id)
                  }}
                />
              </Box>
            </Fragment>
          ))}
        </Box>
      )}
      <Box ref={setAnchor}>
        <Button
          variant="text"
          size="S"
          startIcon="plus"
          onClick={() => {
            setOpen(true)
          }}
        >
          {i18n._('Link to a job opportunity')}
        </Button>
      </Box>
      <SearchPicker
        anchorEl={open ? anchor : null}
        width={PICKER_WIDTH}
        label={i18n._('Search your job opportunities')}
        items={jobs}
        idOf={(job) => job.id}
        matches={(job, query) => holds(i18n.locale, query, job.title, job.company)}
        isLinked={(job) => linkedIds.has(job.id)}
        renderItem={(job, isLinked) => (
          <>
            <StatusStripe status={job.status.token} height={OPTION_STRIPE} />
            <Box sx={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <Box component="span" sx={(theme) => ({ ...jobTitleText.sx, ...oneLine.sx, color: theme.karnama.semantic[isLinked ? 'text/secondary' : 'text/primary'] })}>
                {job.title}
              </Box>
              {present(job.company) ? (
                <Box component="span" sx={(theme) => ({ ...labelText.sx(theme), ...oneLine.sx })}>
                  {job.company}
                </Box>
              ) : null}
            </Box>
            {isLinked ? <LinkedMark /> : <StatusChip status={job.status.token} label={job.status.name} size="S" />}
          </>
        )}
        onChoose={(job) => {
          setOpen(false)
          onLink(job.id)
        }}
        onClose={() => {
          setOpen(false)
        }}
      />
    </Box>
  )
}
