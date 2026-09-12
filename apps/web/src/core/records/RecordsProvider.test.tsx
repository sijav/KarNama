import { I18nProvider } from '@lingui/react'
import { useContext } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { i18nFor } from '../../i18n'
import { emptyDraft } from '../../shared/add-job'
import { RecordsContext, RecordsProvider, STORAGE_KEY, type RecordsValue } from './RecordsProvider'
import { defaultStatuses, type Records } from './records'

/**
 * The provider, rendered here as well as in the screens' stories.
 *
 * Every story exercises it, and the browser project's coverage of a file the
 * node project also touches is thrown away, KN-103, so it is driven from the
 * node side too. `renderToString` gives one render; the value it captures holds
 * the actions, and each of them is called against the real state so what they
 * write is what is checked, not a description of it.
 */
const seeded = (): Records => ({ statuses: defaultStatuses((token) => token), jobs: [], contacts: [] })

/** Renders the provider once and hands back the value a consumer sees. */
const capture = (initial?: Records) => {
  let held: RecordsValue | undefined
  const Probe = () => {
    held = useContext(RecordsContext)
    return <span>{held.statuses.length}</span>
  }
  const html = renderToString(
    <I18nProvider i18n={i18nFor('en-US')}>
      <RecordsProvider {...(initial ? { initial } : {})}>
        <Probe />
      </RecordsProvider>
    </I18nProvider>,
  )
  if (!held) throw new Error('the probe never rendered')
  return { held, html }
}

describe('the records provider', () => {
  it('starts with the five statuses the design draws, named through the catalog', () => {
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => undefined })
    const { held, html } = capture()
    expect(html).toContain('5')
    expect(held.statuses.map((entry) => entry.name)).toEqual(['Saved', 'Applied', 'Interview', 'Job offer', 'Rejected'])
    expect(held.jobs).toEqual([])
  })

  it('reads back what a previous visit stored', () => {
    const stored: Records = { ...seeded(), jobs: [] }
    vi.stubGlobal('localStorage', { getItem: () => JSON.stringify(stored), setItem: () => undefined })
    expect(capture().held.statuses.map((entry) => entry.id)).toEqual(stored.statuses.map((entry) => entry.id))
  })

  it('falls back to a fresh board when what is stored cannot be read', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => '{ not json',
      setItem: () => undefined,
    })
    expect(capture().held.statuses).toHaveLength(5)
  })

  it('still works for a reader whose browser refuses storage', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    })
    const { held } = capture()
    expect(() => {
      held.addJob(emptyDraft('new'))
    }).not.toThrow()
  })

  it('adds, saves, moves and deletes a job opportunity, and writes each change down', () => {
    const written: string[] = []
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: (_key: string, value: string) => written.push(value) })
    const { held } = capture(seeded())

    held.addJob({ ...emptyDraft('new'), title: 'Frontend developer', company: 'Digikala' })
    const added = JSON.parse(written[0] ?? '{}') as Records
    const id = added.jobs[0]?.id ?? ''
    expect(added.jobs).toHaveLength(1)

    held.saveJob(id, { ...emptyDraft('new'), title: 'Senior developer', description: 'about it', note: 'a note' })
    const saved = JSON.parse(written[1] ?? '{}') as Records
    // The status is the board's, never the modal's, KN-364.
    expect([saved.jobs[0]?.draft.title, saved.jobs[0]?.draft.status]).toEqual(['Senior developer', 'new'])

    held.moveJob(id, 'offer')
    expect((JSON.parse(written[2] ?? '{}') as Records).jobs[0]?.draft.status).toBe('offer')

    held.moveJobs([id], 'rejected')
    expect((JSON.parse(written[3] ?? '{}') as Records).jobs[0]?.draft.status).toBe('rejected')

    held.deleteJobs([id])
    expect((JSON.parse(written[4] ?? '{}') as Records).jobs).toEqual([])
  })

  it('adds a status, renames it, recolours it, and takes its jobs with it when it goes', () => {
    const written: string[] = []
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: (_key: string, value: string) => written.push(value) })
    const { held } = capture(seeded())

    const id = held.addStatus('Screening')
    const added = JSON.parse(written[0] ?? '{}') as Records
    expect(added.statuses.at(-1)).toMatchObject({ id, name: 'Screening', token: 'custom-1' })

    held.addJob({ ...emptyDraft(id), title: 'In that column', company: 'Somewhere' })
    held.renameStatus(id, 'Phone screen')
    expect((JSON.parse(written[2] ?? '{}') as Records).statuses.at(-1)?.name).toBe('Phone screen')

    held.recolourStatus(id, 'custom-3')
    expect((JSON.parse(written[3] ?? '{}') as Records).statuses.at(-1)?.token).toBe('custom-3')

    // A status holding a job opportunity is not deleted at all: the design's
    // rule, and the board's count can be narrowed by a search, KN-422.
    held.deleteStatus(id)
    const kept = JSON.parse(written[4] ?? '{}') as Records
    expect(kept.statuses.map((entry) => entry.id)).toContain(id)
    expect(kept.jobs).toHaveLength(1)

    // Emptied first, it goes.
    held.deleteJobs(kept.jobs.map((job) => job.id))
    held.deleteStatus(id)
    const gone = JSON.parse(written.at(-1) ?? '{}') as Records
    expect(gone.statuses.map((entry) => entry.id)).not.toContain(id)
    expect(gone.jobs).toEqual([])
  })

  it('keeps the board under its own key, beside the preferences', () => {
    expect(STORAGE_KEY).toContain('records')
  })

  it('does nothing, rather than throwing, for a component outside the provider', () => {
    let held: RecordsValue | undefined
    const Probe = () => {
      held = useContext(RecordsContext)
      return <span>{held.jobs.length}</span>
    }
    renderToString(<Probe />)
    expect(held?.statuses).toEqual([])
    expect(() => {
      held?.addJob(emptyDraft('new'))
      held?.saveJob('a', { ...emptyDraft('new'), description: '', note: '' })
      held?.moveJob('a', 'new')
      held?.moveJobs(['a'], 'new')
      held?.deleteJobs(['a'])
      held?.renameStatus('a', 'b')
      held?.recolourStatus('a', 'new')
      held?.deleteStatus('a')
    }).not.toThrow()
    expect(held?.addStatus('a')).toBe('')
  })

  it('keeps a person against a job opportunity, edits them, and lets them go', () => {
    const written: string[] = []
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: (_key: string, value: string) => written.push(value) })
    const { held } = capture(seeded())
    const person = { name: 'Mina', role: null, company: null, email: null, phone: null, linkedin: null, job: null }

    held.addContact(person, null)
    const added = JSON.parse(written[0] ?? '{}') as Records
    const id = added.contacts[0]?.id ?? ''
    expect(added.contacts).toHaveLength(1)

    held.saveContact(id, { ...person, name: 'Mina Rezaei' }, 'job-1')
    const saved = JSON.parse(written[1] ?? '{}') as Records
    expect(saved.contacts[0]).toMatchObject({ jobId: 'job-1', contact: { name: 'Mina Rezaei' } })

    held.deleteContacts([id])
    expect((JSON.parse(written[2] ?? '{}') as Records).contacts).toEqual([])
  })

  it('keeps what a file is, and hands back only what this visit added', () => {
    const written: string[] = []
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: (_key: string, value: string) => written.push(value) })
    const { held } = capture(seeded())
    held.addJob({ ...emptyDraft('new'), title: 'With a file', company: 'Somewhere' })
    const id = (JSON.parse(written[0] ?? '{}') as Records).jobs[0]?.id ?? ''

    const file = new File(['some bytes'], 'offer.pdf', { type: 'application/pdf' })
    held.addFiles(id, [file])
    const withFile = JSON.parse(written[1] ?? '{}') as Records
    expect(withFile.jobs[0]?.files[0]).toMatchObject({ name: 'offer.pdf', size: file.size })

    // The download is the browser's: it is asked for, and a file from an
    // earlier visit, whose bytes nothing holds, quietly does nothing.
    const clicked: string[] = []
    vi.stubGlobal('URL', { createObjectURL: () => 'blob:one', revokeObjectURL: () => undefined })
    vi.stubGlobal('window', {
      document: {
        createElement: () => ({
          set href(value: string) {
            clicked.push(value)
          },
          download: '',
          click: () => undefined,
        }),
      },
    })
    held.downloadFile(withFile.jobs[0]?.files[0]?.id ?? '')
    expect(clicked).toEqual(['blob:one'])
    expect(() => {
      held.downloadFile('a file from another visit')
    }).not.toThrow()
  })
})
