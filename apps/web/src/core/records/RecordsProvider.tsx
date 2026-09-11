import { useLingui } from '@lingui/react'
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import type { JobDraft } from '../../shared/add-job'
import type { ContactCardContact } from '../../shared/contact-card'
import type { JobSaved } from '../../shared/job-modal'
import type { StatusOption } from '../../shared/status-picker'
import type { StatusToken } from '../../theme/tokens'
import { emptyRecords, jobFrom, newId, nextCustomToken, readRecords, withSaved, withStatus, type JobEntry, type Records } from './records'

/** Where the board is kept between visits, beside the preferences. */
export const STORAGE_KEY = 'karnama.records'

export interface RecordsValue extends Records {
  addJob: (draft: JobDraft) => void
  saveJob: (id: string, saved: JobSaved) => void
  moveJob: (id: string, status: string) => void
  moveJobs: (ids: readonly string[], status: string) => void
  deleteJobs: (ids: readonly string[]) => void
  addContact: (contact: ContactCardContact, jobId: string | null) => void
  saveContact: (id: string, contact: ContactCardContact, jobId: string | null) => void
  deleteContacts: (ids: readonly string[]) => void
  addStatus: (name: string) => string
  renameStatus: (id: string, name: string) => void
  recolourStatus: (id: string, token: StatusToken) => void
  deleteStatus: (id: string) => void
}

/**
 * The board's records, held for the whole application.
 *
 * The context is created with an empty set and setters that do nothing, as the
 * preferences are: a component rendered outside the provider then draws an
 * empty board instead of throwing, which is what a story about layout wants.
 */
const NO_RECORDS: RecordsValue = {
  statuses: [],
  jobs: [],
  contacts: [],
  addJob: () => undefined,
  saveJob: () => undefined,
  moveJob: () => undefined,
  moveJobs: () => undefined,
  deleteJobs: () => undefined,
  addContact: () => undefined,
  saveContact: () => undefined,
  deleteContacts: () => undefined,
  addStatus: () => '',
  renameStatus: () => undefined,
  recolourStatus: () => undefined,
  deleteStatus: () => undefined,
}

export const RecordsContext = createContext<RecordsValue>(NO_RECORDS)

// `localStorage` throws on ACCESS in a browser with site data blocked and is
// absent in the node test project, so every use is guarded, as the preferences'
// is.
const storage = (): Storage | undefined => {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}

const stored = (fallback: Records): Records => {
  try {
    const raw = storage()?.getItem(STORAGE_KEY)
    if (typeof raw !== 'string') return fallback
    return readRecords(JSON.parse(raw), fallback)
  } catch {
    return fallback
  }
}

const keep = (records: Records) => {
  try {
    storage()?.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    // A reader with storage blocked still gets a board for this visit.
  }
}

export interface RecordsProviderProps {
  /** Seeds the set instead of what is stored, for a story or a test. */
  initial?: Records
  children: ReactNode
}

export const RecordsProvider = ({ initial, children }: RecordsProviderProps) => {
  const { i18n } = useLingui()
  // The catalog names the five the product starts with; a status the reader
  // renames is their own text from then on.
  const empty = useMemo(
    () =>
      emptyRecords((token) =>
        token === 'new'
          ? i18n._('Saved')
          : token === 'applied'
            ? i18n._('Applied')
            : token === 'interview'
              ? i18n._('Interview')
              : token === 'offer'
                ? i18n._('Job offer')
                : i18n._('Rejected'),
      ),
    [i18n],
  )
  const [records, setRecords] = useState<Records>(() => initial ?? stored(empty))
  // What the last change produced, which is not what this render can see: two
  // changes in one batch would otherwise both build on the same snapshot, the
  // defect KN-112 closed for the preferences.
  const latest = useRef(records)

  const change = useCallback((next: (from: Records) => Records) => {
    const answer = next(latest.current)
    latest.current = answer
    setRecords(answer)
    keep(answer)
  }, [])

  const value = useMemo<RecordsValue>(() => {
    const changeJobs = (ids: readonly string[], how: (job: JobEntry) => JobEntry) => {
      const wanted = new Set(ids)
      change((from) => ({ ...from, jobs: from.jobs.map((job) => (wanted.has(job.id) ? how(job) : job)) }))
    }
    return {
      ...records,
      addJob: (draft) => {
        change((from) => ({ ...from, jobs: [jobFrom(draft, new Date().toISOString()), ...from.jobs] }))
      },
      saveJob: (id, saved) => {
        changeJobs([id], (job) => withSaved(job, saved))
      },
      moveJob: (id, status) => {
        changeJobs([id], (job) => withStatus(job, status, new Date().toISOString()))
      },
      moveJobs: (ids, status) => {
        changeJobs(ids, (job) => withStatus(job, status, new Date().toISOString()))
      },
      deleteJobs: (ids) => {
        const wanted = new Set(ids)
        change((from) => ({ ...from, jobs: from.jobs.filter((job) => !wanted.has(job.id)) }))
      },
      addContact: (contact, jobId) => {
        change((from) => ({ ...from, contacts: [{ id: newId('contact'), jobId, contact }, ...from.contacts] }))
      },
      saveContact: (id, contact, jobId) => {
        change((from) => ({
          ...from,
          contacts: from.contacts.map((held) => (held.id === id ? { ...held, jobId, contact } : held)),
        }))
      },
      deleteContacts: (ids) => {
        const wanted = new Set(ids)
        change((from) => ({ ...from, contacts: from.contacts.filter((held) => !wanted.has(held.id)) }))
      },
      addStatus: (name) => {
        const added: StatusOption = { id: newId('status'), token: nextCustomToken(records.statuses), name }
        change((from) => ({ ...from, statuses: [...from.statuses, added] }))
        return added.id
      },
      renameStatus: (id, name) => {
        change((from) => ({ ...from, statuses: from.statuses.map((entry) => (entry.id === id ? { ...entry, name } : entry)) }))
      },
      recolourStatus: (id, token) => {
        change((from) => ({ ...from, statuses: from.statuses.map((entry) => (entry.id === id ? { ...entry, token } : entry)) }))
      },
      deleteStatus: (id) => {
        change((from) => ({
          ...from,
          statuses: from.statuses.filter((entry) => entry.id !== id),
          // The jobs go with it: the board holds nothing without a column, and
          // what happens to them is the owner's question, KN-149.
          jobs: from.jobs.filter((job) => job.draft.status !== id),
        }))
      },
    }
  }, [change, records])

  return <RecordsContext.Provider value={value}>{children}</RecordsContext.Provider>
}

export const useRecords = (): RecordsValue => useContext(RecordsContext)
