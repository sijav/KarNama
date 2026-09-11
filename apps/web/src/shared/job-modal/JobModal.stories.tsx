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
import type { StatusOption } from '../status-picker'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { JobModal, type JobModalProps, type JobModalTab, type JobRecord } from './JobModal'

const LEVEL: JobLevel = 'senior-specialist'
// The status the record is in, and the tab a page asks for first.
const INTERVIEW: StatusToken = 'interview'
const FIRST_TAB: JobModalTab = 'info'
// The event a drop is, typed so the lint rule reads it as a value and not as copy.
const DROP: keyof HTMLElementEventMap = 'drop'
const TABS: JobModalTab[] = ['info', 'history', 'note', 'contacts', 'files']
const CONTROLLED: (keyof JobModalProps)[] = ['open', 'tab']

// The board's five first statuses, from the story fixtures.
const statusesIn = (locale: Locale): StatusOption[] =>
  fixtures(locale)
    .statuses.slice(0, 5)
    .map((entry) => ({ id: entry.token, token: entry.token, name: entry.name }))

// A job opportunity's whole record from the story fixtures: the first job with
// what reading its posting found, its description, skills, note, the first
// two contacts, its files, and its status history, oldest first as recorded.
const recordIn = (locale: Locale): JobRecord => {
  const set = fixtures(locale)
  const [job] = set.jobs
  const detail = set.jobDetail
  return {
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
    statuses: statusesIn('fa-IR'),
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
    await expect(within(panel).getByRole('textbox', { name: 'شرح شغل و مسئولیت‌ها' })).toHaveValue(args.job.description)
    await expect(within(panel).getAllByRole('listitem')).toHaveLength(args.job.skills.length)
    const save = within(dialog).getByRole('button', { name: 'ذخیره' })
    const remove = within(dialog).getByRole('button', { name: 'حذف فرصت شغلی' })
    await expect(remove.getBoundingClientRect().left).toBeLessThan(save.getBoundingClientRect().left)
  },
}

export const History: Story = {
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
    await expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({ note: 'تماس دوم هفتهٔ بعد.', status: 'interview' }))
  },
}

export const Contacts: Story = {
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
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // The Status Control in the header opens the Change Status modal over the
    // job opportunity, as 377:6244 draws it, and Confirm there changes the
    // status at once, without Save, KN-337.
    const dialog = await dialogNamed(args.job.draft.title)
    await userEvent.click(within(dialog).getByRole('button', { name: /وضعیت: مصاحبه/u }))
    const change = await dialogNamed('تغییر وضعیت')
    await userEvent.click(within(change).getByRole('radio', { name: 'پیشنهاد کار' }))
    await expect(args.onStatusChange).not.toHaveBeenCalled()
    await userEvent.click(within(change).getByRole('button', { name: 'تأیید' }))
    await expect(args.onStatusChange).toHaveBeenCalledWith('offer')
  },
}

export const SaveAndDelete: Story = {
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
  args: { job: recordIn('en-US'), statuses: statusesIn('en-US') },
  globals: { locale: 'en-US' },
  play: async ({ args }) => {
    const i18n = english
    const dialog = await dialogNamed(args.job.draft.title)
    await expect(
      within(dialog)
        .getAllByRole('tab')
        .map((tab) => tab.textContent),
    ).toEqual([i18n._('Job opportunity info'), i18n._('History'), i18n._('Note'), i18n._('Related people'), i18n._('Files')])
  },
}
