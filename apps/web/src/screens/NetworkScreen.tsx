import { Box, Stack } from '@mui/material'
import { useLingui } from '@lingui/react'
import { useState } from 'react'
import { ContactCard } from '../shared/contact-card'
import { EmptyState } from '../shared/empty-state'
import { ContactModal, type ContactModalValues } from '../shared/modal'
import { PageHeader } from '../shared/page-header'
import { SearchBar } from '../shared/search-bar'
import { useRecords } from '../core/records'
import { spacing } from '../theme/tokens'

/**
 * The network: the people met on the way to a job, KN-056.
 *
 * A first version of the page, under the owner's instruction of 2026-09-12 to
 * build the screens now: it draws the contacts the job opportunities already
 * hold, searches them by name, and opens the Contact Modal over one. What it
 * does not do yet is keep a contact of its own, select several, or delete one,
 * which KN-415 carries.
 */
export const NetworkScreen = () => {
  const { i18n } = useLingui()
  const records = useRecords()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<ContactModalValues | null>(null)

  const contacts = records.jobs.flatMap((job) => job.contacts.map((held) => ({ jobId: job.id, ...held })))
  const wanted = search.trim().toLocaleLowerCase()
  const shown = contacts.filter((held) => wanted === '' || held.contact.name.toLocaleLowerCase().includes(wanted))
  const jobs = records.jobs.map((job) => ({ value: job.id, label: job.draft.title }))

  return (
    <Stack sx={{ gap: `${spacing.lg}px`, flex: '1 1 auto', minHeight: 0 }}>
      <PageHeader title={i18n._('My network')} />

      <Box sx={{ maxWidth: 480 }}>
        <SearchBar value={search} onChange={setSearch} />
      </Box>

      {shown.length === 0 ? (
        <EmptyState
          title={i18n._('You have not added anyone to your network yet')}
          body={i18n._('Keep the people you meet on the way to a job here: recruiters, managers, future teammates.')}
          actionLabel={i18n._('Add contact')}
          onAction={() => {
            setEditing({ name: '', role: '', company: '', email: '', phone: '', linkedin: '', jobId: null })
          }}
        />
      ) : (
        <Box sx={{ display: 'grid', gap: `${spacing.md}px`, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {shown.map((held) => (
            <ContactCard
              key={held.id}
              contact={held.contact}
              onOpen={() => {
                setEditing({
                  name: held.contact.name,
                  role: held.contact.role ?? '',
                  company: held.contact.company ?? '',
                  email: held.contact.email ?? '',
                  phone: held.contact.phone ?? '',
                  linkedin: held.contact.linkedin ?? '',
                  jobId: held.jobId,
                })
              }}
              onSelectedChange={() => undefined}
              onDelete={() => undefined}
            />
          ))}
        </Box>
      )}

      <ContactModal
        open={editing !== null}
        mode={editing?.name === '' ? 'add' : 'edit'}
        {...(editing ? { initial: editing } : {})}
        jobs={jobs}
        onSave={() => {
          setEditing(null)
        }}
        onCancel={() => {
          setEditing(null)
        }}
      />
    </Stack>
  )
}
