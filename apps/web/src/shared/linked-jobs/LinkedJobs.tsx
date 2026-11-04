import { useLingui } from '@lingui/react'
import { Box, InputBase, Popover, useTheme } from '@mui/material'
import { Fragment, useId, useState } from 'react'
import { inlineStartOf } from '../../theme/sides'
import { spacing, type as typeScale, type StatusToken } from '../../theme/tokens'
import { Button } from '../button'
import { Icon } from '../icon'
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

// Node 1092:3103 binds no variable to these: the list's and the picker's one
// pixel edges, in their layout; the picker's 360; the search's one and a half
// of border/focus, an inset shadow since Chromium floors a border of 1.5, so
// its padding takes the edge's room; an option's stripe, 3 by 28; and the three
// options the picker shows before it scrolls, 54 each and 4 apart.
const EDGE = 1
const PICKER_WIDTH = 360
const SEARCH_EDGE = 1.5
const OPTION_STRIPE = 28
const OPTION_HEIGHT = 54
const SHOWN_OPTIONS = 3

// The search suggests from a list it filters, typed so the lint rule reads it
// as a value and not as copy.
type Autocomplete = 'list'
const FROM_LIST: Autocomplete = 'list'

const present = (value: string | null | undefined): value is string => value !== undefined && value !== null && value !== ''

// A job opportunity matches the search when its title or company holds what
// is typed, whatever the case.
const matches = (job: LinkedJobItem, query: string, locale: string) => {
  const wanted = query.trim().toLocaleLowerCase(locale)
  if (wanted === '') return true
  return [job.title, job.company].some((part) => present(part) && part.toLocaleLowerCase(locale).includes(wanted))
}

// Linked Jobs, node 1092:3103, Empty, Filled and Picking: the person modal's
// job opportunities linked to the person. «فرصت‌های شغلی وصل‌شده» in Label; with
// none, «هنوز به فرصت شغلی‌ای وصل نیست.» in Body text/secondary, else the Linked
// Job rows in a list of bg/surface at radius 8 inside one pixel of
// border/default, a divider between each; then the Text button «وصل کردن به
// فرصت شغلی» with its plus, which opens the picker 4 under it from its inline
// start: 360 wide at radius 8, 8 round its parts and 4 between, its own shadow,
// a search over the reader's job opportunities with one and a half of
// border/focus, and the ones it finds, each its stripe, title, company and
// status, the linked ones muted with «وصل است» in text/brand instead of the
// status. Choosing one links it and closes the picker; Escape and a press
// outside close it. The search is a combobox over the list, so the arrows move
// through the ones that can be chosen and Enter chooses.
export const LinkedJobs = ({ linked, jobs, onLink, onUnlink }: LinkedJobsProps) => {
  const { i18n } = useLingui()
  const theme = useTheme()
  const start = inlineStartOf(theme.direction)
  const labelId = useId()
  const listId = useId()
  const optionPrefix = useId()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const linkedIds = new Set(linked.map((job) => job.id))
  const found = jobs.filter((job) => matches(job, query, i18n.locale))
  const choosable = found.filter((job) => !linkedIds.has(job.id))
  const activeJob = choosable[Math.min(active, choosable.length - 1)]
  const close = () => {
    setOpen(false)
    setQuery('')
    setActive(0)
  }
  const choose = (id: string) => {
    close()
    onLink(id)
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: `${spacing.xs}px` }}>
      <Box component="span" id={labelId} sx={(t) => ({ ...labelText.sx(t), color: t.karnama.semantic['text/primary'] })}>
        {i18n._('Linked job opportunities')}
      </Box>
      {linked.length === 0 ? (
        <Box component="span" sx={(t) => ({ ...jobTitleText.sx, color: t.karnama.semantic['text/secondary'] })}>
          {i18n._('Not linked to a job opportunity yet.')}
        </Box>
      ) : (
        <Box
          role="list"
          aria-labelledby={labelId}
          sx={(t) => ({
            alignSelf: 'stretch',
            overflow: 'hidden',
            borderRadius: `${t.karnama.radius.md}px`,
            border: `${EDGE}px solid ${t.karnama.semantic['border/default']}`,
            backgroundColor: t.karnama.semantic['bg/surface'],
          })}
        >
          {linked.map((job, index) => (
            <Fragment key={job.id}>
              {index === 0 ? null : <Box aria-hidden sx={(t) => ({ height: `${EDGE}px`, backgroundColor: t.karnama.semantic['border/default'] })} />}
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
      <Popover
        open={open && anchor !== null}
        anchorEl={anchor}
        onClose={close}
        // Menus open instantly, the prototype map's motion, DESIGN.md.
        transitionDuration={0}
        anchorOrigin={{ vertical: 'bottom', horizontal: start }}
        transformOrigin={{ vertical: 0, horizontal: start }}
        slotProps={{
          paper: {
            sx: (t) => ({
              boxSizing: 'border-box',
              width: PICKER_WIDTH,
              marginTop: `${spacing['2xs']}px`,
              display: 'flex',
              flexDirection: 'column',
              gap: `${spacing['2xs']}px`,
              padding: `${spacing.xs}px`,
              borderRadius: `${t.karnama.radius.md}px`,
              border: `${EDGE}px solid ${t.karnama.semantic['border/default']}`,
              backgroundColor: t.karnama.semantic['bg/surface'],
              backgroundImage: 'none',
              boxShadow: t.karnama.elevation.picker,
            }),
          },
        }}
      >
        <InputBase
          autoFocus
          value={query}
          placeholder={i18n._('Search your job opportunities')}
          onChange={(event) => {
            setQuery(event.target.value)
            setActive(0)
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              setActive((current) => Math.min(current + 1, Math.max(choosable.length - 1, 0)))
            } else if (event.key === 'ArrowUp') {
              event.preventDefault()
              setActive((current) => Math.max(current - 1, 0))
            } else if (event.key === 'Enter' && activeJob !== undefined) {
              event.preventDefault()
              choose(activeJob.id)
            }
          }}
          startAdornment={<Icon name="search" size="sm" />}
          inputProps={{
            role: 'combobox',
            'aria-label': i18n._('Search your job opportunities'),
            'aria-expanded': true,
            'aria-controls': listId,
            'aria-autocomplete': FROM_LIST,
            ...(activeJob === undefined ? {} : { 'aria-activedescendant': `${optionPrefix}-${activeJob.id}` }),
          }}
          sx={(t) => ({
            gap: `${spacing.xs}px`,
            paddingBlock: `${spacing.xs + SEARCH_EDGE}px`,
            paddingInline: `${spacing.sm + SEARCH_EDGE}px`,
            borderRadius: `${t.karnama.radius.sm}px`,
            backgroundColor: t.karnama.semantic['bg/surface'],
            boxShadow: `inset 0 0 0 ${SEARCH_EDGE}px ${t.karnama.semantic['border/focus']}`,
            fontSize: `${typeScale.body.size}px`,
            lineHeight: `${typeScale.body.lineHeight}px`,
            color: t.karnama.semantic['text/primary'],
            '& .MuiInputBase-input': { padding: 0, height: `${typeScale.body.lineHeight}px` },
            '& .MuiInputBase-input::placeholder': { color: t.karnama.semantic['text/secondary'], opacity: 1 },
          })}
        />
        <Box
          component="ul"
          role="listbox"
          id={listId}
          aria-labelledby={labelId}
          sx={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: `${spacing['2xs']}px`,
            maxHeight: SHOWN_OPTIONS * OPTION_HEIGHT + (SHOWN_OPTIONS - 1) * spacing['2xs'],
            overflowY: 'auto',
          }}
        >
          {found.length === 0 ? (
            <Box component="li" role="presentation" sx={(t) => ({ ...jobTitleText.sx, paddingBlock: `${spacing.xs}px`, paddingInline: `${spacing.sm}px`, color: t.karnama.semantic['text/secondary'] })}>
              {i18n._('No results found')}
            </Box>
          ) : null}
          {found.map((job) => {
            const isLinked = linkedIds.has(job.id)
            const isActive = activeJob?.id === job.id
            return (
              <Box
                key={job.id}
                component="li"
                role="option"
                id={`${optionPrefix}-${job.id}`}
                aria-selected={isActive}
                aria-disabled={isLinked}
                onMouseEnter={() => {
                  if (!isLinked) setActive(choosable.indexOf(job))
                }}
                onClick={() => {
                  if (!isLinked) choose(job.id)
                }}
                sx={(t) => ({
                  boxSizing: 'border-box',
                  flexShrink: 0,
                  height: OPTION_HEIGHT,
                  display: 'flex',
                  alignItems: 'center',
                  gap: `${spacing.xs}px`,
                  paddingBlock: `${spacing.xs}px`,
                  paddingInline: `${spacing.sm}px`,
                  borderRadius: `${t.karnama.radius.sm}px`,
                  cursor: isLinked ? 'default' : 'pointer',
                  backgroundColor: isActive ? t.karnama.semantic['bg/surface-secondary'] : 'transparent',
                })}
              >
                <StatusStripe status={job.status.token} height={OPTION_STRIPE} />
                <Box sx={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <Box component="span" sx={(t) => ({ ...jobTitleText.sx, ...oneLine.sx, color: t.karnama.semantic[isLinked ? 'text/secondary' : 'text/primary'] })}>
                    {job.title}
                  </Box>
                  {present(job.company) ? (
                    <Box component="span" sx={(t) => ({ ...labelText.sx(t), ...oneLine.sx })}>
                      {job.company}
                    </Box>
                  ) : null}
                </Box>
                {isLinked ? (
                  <Box component="span" sx={(t) => ({ ...labelText.sx(t), flexShrink: 0, display: 'flex', alignItems: 'center', gap: `${spacing['2xs']}px`, color: t.karnama.semantic['text/brand'] })}>
                    <Icon name="check" size="sm" color="inherit" />
                    {i18n._('Linked')}
                  </Box>
                ) : (
                  <StatusChip status={job.status.token} label={job.status.name} size="S" />
                )}
              </Box>
            )
          })}
        </Box>
      </Popover>
    </Box>
  )
}
