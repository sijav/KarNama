import { setupI18n } from '@lingui/core'
import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test'
import type { Locale } from '../../i18n'
import { messages as en } from '../../i18n/locales/en-US'
import type { StatusToken } from '../../theme/tokens'
import { emptyDraft } from '../add-job'
import { JobCard } from '../job-card'
import type { JobLevel } from '../job-selects'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { JobModal, type JobModalProps, type JobModalTab, type JobRecord, type JobSaved } from './JobModal'

const LEVEL: JobLevel = 'senior-specialist'
// The status the record is in, and the tab a page asks for first.
const INTERVIEW: StatusToken = 'interview'
const FIRST_TAB: JobModalTab = 'info'
// The event a drop is, typed so the lint rule reads it as a value and not as copy.
const DROP: keyof HTMLElementEventMap = 'drop'
const TABS: JobModalTab[] = ['info', 'history', 'note', 'contacts', 'files']
const CONTROLLED: (keyof JobModalProps)[] = ['open', 'tab']
// The controls a story offers: only the args its play holds for and that change
// what is on screen, KN-255, KN-571.
const offers = (names: (keyof JobModalProps)[]) => ({ controls: { include: names } })
// A story that offers none: a closed modal holds nothing its play asserts, and
// the tab decides which panel the play reads.
const FIXED = { controls: { disable: true } }

// A job opportunity's whole record from the story fixtures: the first job with
// what reading its posting found, its description, skills, note, the first
// two contacts, its files, and its status history, oldest first as recorded.
const recordIn = (locale: Locale): JobRecord => {
  const set = fixtures(locale)
  const [job] = set.jobs
  const detail = set.jobDetail
  return {
    // The fixture's own id, so the modal can tell this record from another,
    // KN-363.
    id: job?.id ?? '',
    draft: {
      ...emptyDraft(INTERVIEW),
      title: job?.title ?? '',
      company: job?.company ?? '',
      employmentTypes: ['full-time'],
      jobLevel: LEVEL,
      ...set.extraction,
    },
    description: detail.description,
    skills: detail.skills,
    note: set.notes.find((note) => note.jobId === job?.id)?.text ?? '',
    noteEditedAt: detail.noteEditedAt,
    contacts: set.contacts.slice(0, 2).map((contact) => ({
      id: contact.id,
      contact: {
        name: contact.fullName,
        role: contact.role,
        company: contact.company,
        email: contact.email,
        phone: contact.phone,
        job: null,
        linkedin: contact.linkedin,
      },
    })),
    files: detail.files,
    history: detail.history.map((change) => ({
      id: change.id,
      status: set.names[change.status],
      at: change.at,
      automatic: change.automatic,
    })),
  }
}

// The English copy, read from its catalog.
const english = setupI18n({ locale: 'en-US', messages: { 'en-US': en } })

const meta = {
  title: 'Shared/JobModal',
  component: JobModal,
  args: {
    open: true,
    job: recordIn('fa-IR'),
    // The five statuses the product starts with, the fixtures' first five.
    statuses: fixtures('fa-IR').statusOptions.slice(0, 5),
    tab: 'info',
    onStatusChange: fn(),
    onAddStatus: fn(),
    onSave: fn(),
    onDelete: fn(),
    onClose: fn(),
    onAddContact: fn(),
    onOpenContact: fn(),
    onDeleteContact: fn(),
    onAddFiles: fn(),
    onDownloadFile: fn(),
  },
  argTypes: { tab: { control: 'select', options: TABS } },
  parameters: { controls: { include: CONTROLLED } },
} satisfies StoryMeta<typeof JobModal>

export default meta
type Story = StoryObj<typeof meta>

// The dialog, once its dissolve has brought it into view.
const dialogNamed = async (name: string) => {
  const dialog = await within(document.body).findByRole('dialog', { name })
  await waitFor(() => expect(dialog).toBeVisible())
  return dialog
}
// The panel the chosen tab controls.
const panelOf = (dialog: HTMLElement) => {
  const chosen = within(dialog)
    .getAllByRole('tab')
    .find((tab) => tab.getAttribute('aria-selected') === 'true')
  const panel = dialog.ownerDocument.getElementById(chosen?.getAttribute('aria-controls') ?? '')
  if (!panel) throw new Error('no panel shows')
  return panel
}

export const Info: Story = {
  parameters: FIXED,
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // Node 210:101: 720 by 617; the title and the company, the Status Control
    // and the close; the five tabs, the history second, the owner's KN-072;
    // the fields, the posting's link with its open button, the description
    // and the skills; Cancel and Save at the inline start and the delete at
    // the end.
    const dialog = await dialogNamed(args.job.draft.title)
    await expect([dialog.getBoundingClientRect().width, dialog.getBoundingClientRect().height]).toEqual([720, 617])
    await expect(within(dialog).getByText(args.job.draft.company)).toBeInTheDocument()
    await expect(within(dialog).getByRole('button', { name: /وضعیت: مصاحبه/u })).toBeInTheDocument()
    const tabs = within(dialog).getAllByRole('tab')
    await expect(tabs.map((tab) => tab.textContent)).toEqual(['اطلاعات فرصت شغلی', 'سابقه', 'یادداشت', 'افراد مرتبط', 'فایل‌ها'])
    // The row keeps its 44 over a panel taller than the body.
    await expect(within(dialog).getByRole('tablist').closest('.MuiTabs-root')?.getBoundingClientRect().height).toBe(44)
    await expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    const panel = panelOf(dialog)
    await expect(within(panel).getByRole('textbox', { name: 'عنوان شغلی' })).toHaveValue(args.job.draft.title)
    await expect(within(panel).getByRole('link', { name: 'باز کردن لینک آگهی' })).toHaveAttribute('href', args.job.draft.postingUrl)
    // A link's keyboard, and a key that saves, KN-464.
    await expect(within(panel).getByRole('textbox', { name: 'لینک آگهی' })).toHaveAttribute('type', 'url')
    await expect(within(panel).getByRole('textbox', { name: 'لینک آگهی' })).toHaveAttribute('enterkeyhint', 'done')
    await expect(within(panel).getByRole('textbox', { name: 'شرح شغل و مسئولیت‌ها' })).toHaveValue(args.job.description)
    await expect(within(panel).getAllByRole('listitem')).toHaveLength(args.job.skills.length)
    const save = within(dialog).getByRole('button', { name: 'ذخیره' })
    const remove = within(dialog).getByRole('button', { name: 'حذف فرصت شغلی' })
    await expect(remove.getBoundingClientRect().left).toBeLessThan(save.getBoundingClientRect().left)
  },
}

export const History: Story = {
  parameters: FIXED,
  args: { tab: 'history' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // The status history in its own tab, newest first: the record keeps it
    // oldest first, and the tab turns it round.
    const dialog = await dialogNamed(args.job.draft.title)
    const rows = within(panelOf(dialog)).getAllByRole('listitem')
    await expect(rows.map((row) => row.firstElementChild?.textContent)).toEqual(['مصاحبه', 'درخواست‌شده', 'ذخیره‌شده'])
    await expect(rows[0]).toHaveTextContent('۱۳ شهریور ۱۴۰۵ · دستی')
    await expect(rows[2]).toHaveTextContent('۱۰ شهریور ۱۴۰۵ · خودکار')
  },
}

export const Note: Story = {
  parameters: FIXED,
  args: { tab: 'note' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // Node 210:145: the note 200 tall and when it was last edited. What is
    // typed survives a switch of tabs and is saved with the rest.
    const dialog = await dialogNamed(args.job.draft.title)
    const field = within(panelOf(dialog)).getByRole('textbox', { name: 'یادداشت' })
    await expect(field.parentElement?.getBoundingClientRect().height).toBe(200)
    await expect(within(dialog).getByText('آخرین ویرایش: ۱۳ شهریور ۱۴۰۵')).toBeInTheDocument()
    await userEvent.clear(field)
    await userEvent.type(field, 'تماس دوم هفتهٔ بعد.')
    await userEvent.click(within(dialog).getByRole('tab', { name: 'اطلاعات فرصت شغلی' }))
    await userEvent.click(within(dialog).getByRole('tab', { name: 'یادداشت' }))
    await expect(within(panelOf(dialog)).getByRole('textbox', { name: 'یادداشت' })).toHaveValue('تماس دوم هفتهٔ بعد.')
    await userEvent.click(within(dialog).getByRole('button', { name: 'ذخیره' }))
    await expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({ note: 'تماس دوم هفتهٔ بعد.' }))
    // Save carries no status: the header changes it, KN-364.
    await expect(args.onSave).toHaveBeenLastCalledWith(expect.not.objectContaining({ status: args.job.draft.status }))
  },
}

export const Contacts: Story = {
  parameters: FIXED,
  args: { tab: 'contacts' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // Node 210:208: the related people as compact Contact Cards, and the
    // dashed «+ افزودن مخاطب».
    const dialog = await dialogNamed(args.job.draft.title)
    const panel = panelOf(dialog)
    const [first] = args.job.contacts
    if (!first) throw new Error('no contacts')
    await userEvent.click(within(panel).getByRole('button', { name: first.contact.name }))
    await expect(args.onOpenContact).toHaveBeenCalledWith(first.id)
    await userEvent.click(within(panel).getByRole('button', { name: 'افزودن مخاطب' }))
    await expect(args.onAddContact).toHaveBeenCalledTimes(1)
    const [remove] = within(panel).getAllByRole('button', { name: 'حذف مخاطب' })
    if (!remove) throw new Error('no delete')
    await userEvent.click(remove)
    await expect(args.onDeleteContact).toHaveBeenCalledWith(first.id)
  },
}

export const Files: Story = {
  parameters: FIXED,
  args: { tab: 'files' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // Node 210:275: each file's kind, size and day, its download, and the drop
    // zone, where a file is dropped or chosen; a cancelled choice adds nothing.
    const dialog = await dialogNamed(args.job.draft.title)
    const panel = panelOf(dialog)
    const [file] = args.job.files
    if (!file) throw new Error('no files')
    await expect(within(panel).getByText('PDF · ۲۴۰ کیلوبایت · ۱۰ شهریور ۱۴۰۵')).toBeInTheDocument()
    await userEvent.click(within(panel).getByRole('button', { name: `دانلود ${file.name}` }))
    await expect(args.onDownloadFile).toHaveBeenCalledWith(file.id)
    const chosen = new File(['cv'], 'cv.doc')
    // The file field, hidden, beside the button that opens it.
    const input = within(panel).getByRole('button', { name: 'انتخاب فایل' }).nextElementSibling
    if (!(input instanceof HTMLInputElement)) throw new Error('no file field')
    await userEvent.upload(input, chosen)
    await expect(args.onAddFiles).toHaveBeenLastCalledWith([chosen])
    await fireEvent.change(input, { target: { files: null } })
    await fireEvent.change(input, { target: { files: [] } })
    await expect(args.onAddFiles).toHaveBeenCalledTimes(1)
    const zone = within(panel).getByText('فایل را اینجا رها کن')
    await fireEvent.dragOver(zone)
    // A real browser's drop carries a real DataTransfer, which testing
    // library would copy into an empty one, so the event is the browser's own.
    const drop = (files: File[]) => {
      const carried = new DataTransfer()
      for (const file of files) carried.items.add(file)
      zone.dispatchEvent(new DragEvent(DROP, { bubbles: true, cancelable: true, dataTransfer: carried }))
    }
    drop([chosen])
    drop([])
    await expect(args.onAddFiles).toHaveBeenCalledTimes(2)
  },
}

export const ChangeStatus: Story = {
  // The header's Status Control is there on every tab, KN-571.
  parameters: offers(['tab']),
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // The Status Control in the header opens the Change Status modal over the
    // job opportunity, as 377:6244 draws it, and Confirm there changes the
    // status at once, without Save, KN-337. Save pressed straight after, before
    // the page hands back a job with the new status, carries no status, so it
    // cannot write the old one back over the change, KN-364.
    const dialog = await dialogNamed(args.job.draft.title)
    await userEvent.click(within(dialog).getByRole('button', { name: /وضعیت: مصاحبه/u }))
    const change = await dialogNamed('تغییر وضعیت')
    await userEvent.click(within(change).getByRole('radio', { name: 'پیشنهاد کار' }))
    await expect(args.onStatusChange).not.toHaveBeenCalled()
    await userEvent.click(within(change).getByRole('button', { name: 'تأیید' }))
    await expect(args.onStatusChange).toHaveBeenCalledWith('offer')
    await waitFor(() => expect(within(document.body).queryByRole('dialog', { name: 'تغییر وضعیت' })).toBeNull())
    await userEvent.click(within(dialog).getByRole('button', { name: 'ذخیره' }))
    await expect(args.onSave).toHaveBeenCalledTimes(1)
    await expect(args.onSave).toHaveBeenLastCalledWith(expect.not.objectContaining({ status: args.job.draft.status }))
  },
}

export const SaveAndDelete: Story = {
  parameters: FIXED,
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // Saving without a title says so on the Info tab; with one, it hands the
    // edits over. The delete asks the page, which confirms.
    const dialog = await dialogNamed(args.job.draft.title)
    const title = within(dialog).getByRole('textbox', { name: 'عنوان شغلی' })
    await userEvent.clear(title)
    await userEvent.click(within(dialog).getByRole('tab', { name: 'فایل‌ها' }))
    await userEvent.click(within(dialog).getByRole('button', { name: 'ذخیره' }))
    await expect(args.onSave).not.toHaveBeenCalled()
    await expect(within(dialog).getByRole('tab', { name: 'اطلاعات فرصت شغلی' })).toHaveAttribute('aria-selected', 'true')
    await expect(title).toHaveAccessibleDescription('عنوان شغلی را بنویس')
    await userEvent.type(title, 'مهندس نرم‌افزار')
    await userEvent.click(within(dialog).getByRole('button', { name: 'ذخیره' }))
    await expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({ title: 'مهندس نرم‌افزار', description: args.job.description }))
    await userEvent.click(within(dialog).getByRole('button', { name: 'حذف فرصت شغلی' }))
    await expect(args.onDelete).toHaveBeenCalledTimes(1)
  },
}

// How many lines a field of several holds.
const linesIn = (field: HTMLElement) => (field instanceof HTMLTextAreaElement ? field.value.split('\n').length : 0)

export const EnterSaves: Story = {
  parameters: FIXED,
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // The owner, 2026-09-12: the fields are a form and Save submits it, KN-463,
    // so Enter in a field of one line does what Save does, KN-467. Save sits in
    // the footer, outside the form, and names it by id.
    const dialog = await dialogNamed(args.job.draft.title)
    const title = within(dialog).getByRole('textbox', { name: 'عنوان شغلی' })
    await userEvent.clear(title)

    // The runner's own keyboard, KN-225: implicit submission is the browser's,
    // and testing-library stands in for it by clicking a submit button inside
    // the form, which Save is not.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const browser = await import('vitest/browser')

    // Without a title, Enter refuses as Save does: the title says what is
    // missing, nothing is saved, and the title keeps the focus.
    await browser.userEvent.keyboard('{Enter}')
    await waitFor(async () => {
      await expect(title).toHaveAccessibleDescription('عنوان شغلی را بنویس')
    })
    await expect(args.onSave).not.toHaveBeenCalled()
    await expect(title).toHaveFocus()

    // With one, Enter hands the edits over, as Save does.
    await userEvent.type(title, 'مهندس نرم‌افزار')
    await browser.userEvent.keyboard('{Enter}')
    await waitFor(async () => {
      await expect(args.onSave).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'مهندس نرم‌افزار', description: args.job.description }),
      )
    })

    // Enter in the description, a field of several lines, starts a new line and
    // saves nothing, the exception KN-463 wrote down.
    const description = within(dialog).getByRole('textbox', { name: 'شرح شغل و مسئولیت‌ها' })
    const before = linesIn(description)
    // Clicked by the runner's own pointer: after testing-library's click the
    // field has focus, yet a real key types nothing into it, measured.
    await browser.userEvent.click(description)
    await browser.userEvent.keyboard('{Enter}')
    await waitFor(async () => {
      await expect(linesIn(description)).toBe(before + 1)
    })
    await expect(args.onSave).toHaveBeenCalledTimes(1)
  },
}

// A card on the board and its modal: pressing the card opens it, and leaving
// it closes it again.
const FromTheBoard = (args: JobModalProps) => {
  const [open, setOpen] = useState(false)
  return (
    <Box sx={{ width: 400 }}>
      <JobCard
        title={args.job.draft.title}
        company={args.job.draft.company}
        date={args.job.draft.postedAt}
        status={args.job.draft.status}
        link={args.job.draft.postingUrl}
        onOpen={() => {
          setOpen(true)
        }}
        onSelectedChange={() => undefined}
        onDelete={() => undefined}
        onChangeStatus={() => undefined}
      />
      <JobModal
        {...args}
        open={open}
        onClose={() => {
          args.onClose()
          setOpen(false)
        }}
      />
    </Box>
  )
}

export const OpensFromCard: Story = {
  // Its open is the card's to say, so only the tab is a control, KN-571.
  parameters: offers(['tab']),
  args: { open: false },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  render: (args) => <FromTheBoard {...args} />,
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: args.job.draft.title }))
    const dialog = await dialogNamed(args.job.draft.title)
    await userEvent.click(within(dialog).getByRole('button', { name: 'انصراف' }))
    await waitFor(() => expect(within(document.body).queryByRole('dialog')).toBeNull())
    await expect(args.onClose).toHaveBeenCalledTimes(1)
  },
}

// The tab asked for while the modal is open, as a page moving to a tab would.
const AskedTab = (args: JobModalProps) => {
  const [tab, setTab] = useState<JobModalTab>(FIRST_TAB)
  const i18n = english
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setTab('files')
        }}
      >
        {i18n._('Files')}
      </button>
      <JobModal {...args} tab={tab} />
    </>
  )
}

export const TabFollowsItsProp: Story = {
  // Its tab is its parent's, so neither control would hold or show, KN-571.
  parameters: FIXED,
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  render: (args) => <AskedTab {...args} />,
  play: async ({ args, canvasElement }) => {
    const dialog = await dialogNamed(args.job.draft.title)
    const i18n = english
    await fireEvent.click(within(canvasElement.ownerDocument.body).getByRole('button', { name: i18n._('Files'), hidden: true }))
    await waitFor(() => expect(within(dialog).getByRole('tab', { name: 'فایل‌ها' })).toHaveAttribute('aria-selected', 'true'))
  },
}

export const Phone: Story = {
  // Its assertions, which only the runner reaches, hold on any tab, KN-571.
  parameters: offers(['tab']),
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // On a phone's width, 243:1078, the modal sits 16 from the edges, the
    // fields are one column and the tabs scroll. The screen is resized by the
    // runner's own browser, which only the runner has, KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const { page } = await import('vitest/browser')
    const before = { width: window.innerWidth, height: window.innerHeight }
    try {
      await page.viewport(390, 844)
      const dialog = await dialogNamed(args.job.draft.title)
      await waitFor(() => expect(dialog.getBoundingClientRect().width).toBe(358))
      const list = within(dialog).getByRole('tablist')
      await expect(list.scrollWidth).toBeGreaterThan(list.clientWidth)
    } finally {
      await page.viewport(before.width, before.height)
    }
  },
}

export const InEnglish: Story = {
  parameters: FIXED,
  args: { job: recordIn('en-US'), statuses: fixtures('en-US').statusOptions.slice(0, 5) },
  globals: { locale: 'en-US' },
  play: async ({ args }) => {
    const i18n = english
    const dialog = await dialogNamed(args.job.draft.title)
    await expect(
      within(dialog)
        .getAllByRole('tab')
        .map((tab) => tab.textContent),
    ).toEqual([i18n._('Job opportunity info'), i18n._('History'), i18n._('Note'), i18n._('Related people'), i18n._('Files')])
    // A link's keyboard, and a key that saves, in English too, KN-464.
    await expect(within(dialog).getByRole('textbox', { name: i18n._('Posting link') })).toHaveAttribute('type', 'url')
    await expect(within(dialog).getByRole('textbox', { name: i18n._('Posting link') })).toHaveAttribute('enterkeyhint', 'done')
    // And the English record saves a note, its dates the days the fixtures hold,
    // KN-494: they used to be written «1 September 2026», which the form refused.
    await userEvent.click(within(dialog).getByRole('tab', { name: i18n._('Note') }))
    await userEvent.type(within(panelOf(dialog)).getByRole('textbox', { name: i18n._('Note') }), ' They called back.')
    await userEvent.click(within(dialog).getByRole('button', { name: i18n._('Save') }))
    await expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({ postedAt: '2026-09-01', expiresAt: '2026-09-04' }))
  },
}

// A record kept before the date picker, whose posting date no calendar reads,
// written as its reader wrote it with the day not known, KN-494.
const WRITTEN = '۱۴۰۵/۰۶/؟؟'
const keptAsWritten = (): JobRecord => {
  const record = recordIn('fa-IR')
  return { ...record, draft: { ...record.draft, postedAt: WRITTEN } }
}

export const KeepsAWrittenDate: Story = {
  parameters: FIXED,
  args: { job: keptAsWritten() },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // KN-494: a date no calendar reads stays in the Info tab as written, in a
    // field of text a reader can change, rather than a picker that would show
    // nothing, and it does not stop a note from saving.
    const dialog = await dialogNamed(args.job.draft.title)
    const posted = within(panelOf(dialog)).getByRole('textbox', { name: 'تاریخ انتشار' })
    await expect(posted).toHaveValue(WRITTEN)
    await expect(posted).not.toHaveAttribute('type', 'date')
    // The expiry, a day, keeps its picker.
    await expect(within(panelOf(dialog)).getByLabelText('تاریخ انقضا')).toHaveAttribute('type', 'date')
    await userEvent.click(within(dialog).getByRole('tab', { name: 'یادداشت' }))
    await userEvent.type(within(panelOf(dialog)).getByRole('textbox', { name: 'یادداشت' }), ' تماس گرفتند.')
    await userEvent.click(within(dialog).getByRole('button', { name: 'ذخیره' }))
    await expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({ postedAt: WRITTEN }))
    // Cleared, it is a picker again.
    await userEvent.click(within(dialog).getByRole('tab', { name: 'اطلاعات فرصت شغلی' }))
    await userEvent.clear(within(panelOf(dialog)).getByRole('textbox', { name: 'تاریخ انتشار' }))
    await expect(within(panelOf(dialog)).getByLabelText('تاریخ انتشار')).toHaveAttribute('type', 'date')
  },
}

// Another record entirely: the second fixture job opportunity, with its own id.
const otherIn = (locale: Locale): JobRecord => {
  const set = fixtures(locale)
  const other = set.jobs[1]
  const first = recordIn(locale)
  return {
    ...first,
    id: other?.id ?? '',
    draft: { ...first.draft, title: other?.title ?? '', company: other?.company ?? '' },
    // Its OWN description and note, KN-475: with the first record's in both,
    // the handoff story passed with the reset of those two fields deleted, and
    // the writing a reader would lose is mostly there rather than in the title.
    description: set.jobDetail.skills.join('، '),
    note: set.notes[1]?.text ?? '',
  }
}

// A modal the story can hand a different record to while it stays open.
const Swappable = ({ onSave }: { onSave: (job: JobSaved) => void }) => {
  const [record, setRecord] = useState(() => recordIn('fa-IR'))
  return (
    <>
      <button
        data-testid="swap"
        type="button"
        onClick={() => {
          setRecord(otherIn('fa-IR'))
        }}
      />
      <button
        data-testid="same-again"
        type="button"
        onClick={() => {
          setRecord((held) => ({ ...held }))
        }}
      />
      <JobModal
        open
        job={record}
        statuses={fixtures('fa-IR').statusOptions.slice(0, 5)}
        onStatusChange={fn()}
        onAddStatus={fn()}
        onSave={onSave}
        onDelete={fn()}
        onClose={fn()}
        onAddContact={fn()}
        onOpenContact={fn()}
        onDeleteContact={fn()}
        onAddFiles={fn()}
        onDownloadFile={fn()}
      />
    </>
  )
}

export const StartsOverForAnotherRecord: Story = {
  parameters: { controls: { disable: true } },
  globals: { locale: 'fa-IR' },
  render: (args) => <Swappable onSave={args.onSave} />,
  play: async ({ args, canvasElement }) => {
    // KN-363: a page that swapped the record under an open modal drew the new
    // record's header over the OLD record's editable fields, and Save wrote
    // those fields onto the new record.
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    const set = fixtures('fa-IR')
    const title = body.getByRole('textbox', { name: 'عنوان شغلی' })
    await userEvent.clear(title)
    await userEvent.type(title, set.jobs[2]?.title ?? '')

    // The description and the note as well, which is where a reader's writing
    // actually is, KN-475.
    await userEvent.click(body.getByRole('tab', { name: 'یادداشت' }))
    const note = await body.findByRole('textbox', { name: 'یادداشت' })
    await userEvent.clear(note)
    await userEvent.type(note, set.notes[0]?.text.slice(0, 20) ?? '')

    await userEvent.click(canvas.getByTestId('swap'))

    // A different record starts the modal over, tab included, so the reader is
    // looking at the new record's own information rather than at a tab they
    // chose for the one before it.
    await waitFor(async () => {
      await expect(body.getByRole('textbox', { name: 'عنوان شغلی' })).toHaveValue(set.jobs[1]?.title ?? '')
    })

    // Every field is the SECOND record's, including the writing: the note and
    // the description are where a reader's work actually is, KN-475.
    await userEvent.click(body.getByRole('tab', { name: 'یادداشت' }))
    await expect(await body.findByRole('textbox', { name: 'یادداشت' })).toHaveValue(otherIn('fa-IR').note)
    await userEvent.click(body.getByRole('button', { name: 'ذخیره' }))
    await expect(args.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ title: set.jobs[1]?.title, note: otherIn('fa-IR').note, description: otherIn('fa-IR').description }),
    )
  },
}

export const KeepsTypingForTheSameRecord: Story = {
  parameters: { controls: { disable: true } },
  globals: { locale: 'fa-IR' },
  render: (args) => <Swappable onSave={args.onSave} />,
  play: async ({ canvasElement }) => {
    // The other half: the provider builds a new object for the same record on
    // every change, so anything comparing identity rather than the id would
    // throw away what a reader is typing whenever anything else moved.
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    const typed = fixtures('fa-IR').jobs[2]?.title ?? ''
    const title = body.getByRole('textbox', { name: 'عنوان شغلی' })
    await userEvent.clear(title)
    await userEvent.type(title, typed)

    await userEvent.click(canvas.getByTestId('same-again'))
    await expect(body.getByRole('textbox', { name: 'عنوان شغلی' })).toHaveValue(typed)
  },
}

// Info in the derived dark scheme, KN-496: the posting date's field is a native
// date field, whose calendar glyph the browser draws by the page's color-scheme
// and nothing on the page can measure, so the story reads that scheme.
export const InfoInTheDark: Story = {
  parameters: FIXED,
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ args }) => {
    const dialog = await dialogNamed(args.job.draft.title)
    const posted = panelOf(dialog).querySelector('input[type="date"]')
    if (!(posted instanceof HTMLInputElement)) throw new Error('the Info panel draws no date field')
    await expect(getComputedStyle(posted).colorScheme).toBe('dark')
  },
}
