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

/**
 * One board per reader, KN-421.
 *
 * The key carries whoever it belongs to: without it, signing out and signing in
 * as somebody else showed the first reader's whole archive to the second, on a
 * product whose every record belongs to someone. A board with no owner, which
 * is a story or a test rendering the provider on its own, keeps the bare key.
 */
const keyFor = (owner: string) => (owner === '' ? STORAGE_KEY : `${STORAGE_KEY}:${owner}`)

export interface RecordsValue extends Records {
  addJob: (draft: JobDraft) => void
  saveJob: (id: string, saved: JobSaved) => void
  moveJob: (id: string, status: string) => void
  moveJobs: (ids: readonly string[], status: string) => void
  deleteJobs: (ids: readonly string[]) => void
  addContact: (contact: ContactCardContact, jobId: string | null) => void
  saveContact: (id: string, contact: ContactCardContact, jobId: string | null) => void
  deleteContacts: (ids: readonly string[]) => void
  /** Keeps what a file is, and its bytes for this visit, KN-045. */
  addFiles: (jobId: string, files: readonly File[]) => void
  /** Hands the reader back a file they added in this visit. */
  downloadFile: (id: string) => void
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
  addFiles: () => undefined,
  downloadFile: () => undefined,
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

const stored = (owner: string, fallback: Records): Records => {
  try {
    const raw = storage()?.getItem(keyFor(owner))
    if (typeof raw !== 'string') return fallback
    return readRecords(JSON.parse(raw), fallback)
  } catch {
    return fallback
  }
}

const keep = (owner: string, records: Records) => {
  try {
    storage()?.setItem(keyFor(owner), JSON.stringify(records))
  } catch {
    // A reader with storage blocked still gets a board for this visit.
  }
}

export interface RecordsProviderProps {
  /** Seeds the set instead of what is stored, for a story or a test. */
  initial?: Records
  /**
   * Whose board this is, which is the signed-in reader's number. It is part of
   * where the board is kept, so one reader never sees another's, KN-421, and
   * the provider is keyed on it by the tree above so a change starts afresh.
   */
  owner?: string
  children: ReactNode
}

export const RecordsProvider = ({ initial, owner = '', children }: RecordsProviderProps) => {
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
  const [records, setRecords] = useState<Records>(() => initial ?? stored(owner, empty))
  // What the last change produced, which is not what this render can see: two
  // changes in one batch would otherwise both build on the same snapshot, the
  // defect KN-112 closed for the preferences.
  const latest = useRef(records)
  // The bytes of the files added in this visit, by their id. They are not
  // written down: localStorage holds text and a board of attachments would fill
  // it, so what survives a reload is what a file IS, KN-039.
  const bytes = useRef(new Map<string, File>())

  const change = useCallback(
    (next: (from: Records) => Records) => {
      const answer = next(latest.current)
      latest.current = answer
      setRecords(answer)
      keep(owner, answer)
    },
    [owner],
  )

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
      addFiles: (jobId, files) => {
        const added = files.map((file) => ({ id: newId('file'), name: file.name, size: file.size, addedAt: new Date().toISOString() }))
        for (const [at, entry] of added.entries()) {
          const file = files[at]
          if (file) bytes.current.set(entry.id, file)
        }
        change((from) => ({
          ...from,
          jobs: from.jobs.map((job) => (job.id === jobId ? { ...job, files: [...job.files, ...added] } : job)),
        }))
      },
      downloadFile: (id) => {
        // Only what this visit added: the browser keeps what a file IS, its
        // name, size and when it arrived, but not its bytes, so a file from a
        // previous visit has nothing to hand back until the API holds them,
        // KN-039. Nothing is promised that cannot be delivered: the tile is
        // there either way and this quietly does nothing for the rest.
        const file = bytes.current.get(id)
        if (!file) return
        const address = URL.createObjectURL(file)
        const link = window.document.createElement('a')
        link.href = address
        link.download = file.name
        link.click()
        URL.revokeObjectURL(address)
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
