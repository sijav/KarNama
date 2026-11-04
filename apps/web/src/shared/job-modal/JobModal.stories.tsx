import { setupI18n } from '@lingui/core'
import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fireEvent, fn, spyOn, userEvent, waitFor, within } from 'storybook/test'
import type { Locale } from '../../i18n'
import { messages as en } from '../../i18n/locales/en-US'
import { darkSemantic } from '../../theme/darkMode'
import { semantic, type StatusToken } from '../../theme/tokens'
import { emptyDraft } from '../add-job'
import { JobCard } from '../job-card'
import type { JobLevel } from '../job-selects'
import type { CompanyMatchPerson } from '../related-person'
import type { SourceLists } from '../source-picker'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { formatDay } from './format'
import { JobModal, type InterviewRound, type JobModalProps, type JobModalTab, type JobRecord, type JobSaved } from './JobModal'

const LEVEL: JobLevel = 'senior-specialist'
// The status the record is in, and the tab a page asks for first.
const INTERVIEW: StatusToken = 'interview'
const FIRST_TAB: JobModalTab = 'info'
// The event a drop is, typed so the lint rule reads it as a value and not as copy.
const DROP: keyof HTMLElementEventMap = 'drop'
const TABS: JobModalTab[] = ['info', 'note', 'contacts', 'files', 'history']
const CONTROLLED: (keyof JobModalProps)[] = ['open', 'tab']
// The controls a story offers: only the args its play holds for and that change
// what is on screen, KN-255, KN-571.
const offers = (names: (keyof JobModalProps)[]) => ({ controls: { include: names } })
// A story that offers none: a closed modal holds nothing its play asserts, and
// the tab decides which panel the play reads.
const FIXED = { controls: { disable: true } }

// A job opportunity's whole record from the story fixtures: the first job with
// what reading its posting found, its description, skills, note, the first
// two contacts, its files, and its status history, oldest first as recorded,
// each change naming its status by id as the records do.
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
    history: detail.history,
  }
}

// An interview round after the record's last change of status, as the history
// tab of 760:47508 draws one: its title and its time and result.
const ROUND_AT = new Date(Date.UTC(2026, 8, 8, 10)).toISOString()
const roundIn = (locale: Locale): InterviewRound => ({
  id: 'round-1',
  title: fixtures(locale).historyWords.roundTitle,
  at: ROUND_AT,
  detail: fixtures(locale).historyWords.roundDetail,
})

// The network's people at the job opportunity's company who are not linked to
// it, the related people tab's Company Match: the fixtures' third person.
const matchesIn = (locale: Locale): CompanyMatchPerson[] => {
  const set = fixtures(locale)
  const person = set.contacts[2]
  return person === undefined ? [] : [{ id: person.id, name: person.fullName, role: person.role, company: set.jobs[0]?.company ?? '' }]
}

// The English copy, read from its catalog.
const english = setupI18n({ locale: 'en-US', messages: { 'en-US': en } })

// The reader's sources and the common ones the Info tab's Source Picker offers.
const sourcesIn = (locale: Locale): SourceLists => ({
  own: fixtures(locale).sourcePicker.own,
  common: fixtures(locale).sourcePicker.common,
})

const meta = {
  title: 'Shared/JobModal',
  component: JobModal,
  args: {
    open: true,
    job: recordIn('fa-IR'),
    // The five statuses the product starts with, the fixtures' first five.
    statuses: fixtures('fa-IR').statusOptions.slice(0, 5),
    sources: sourcesIn('fa-IR'),
    matches: matchesIn('fa-IR'),
    tab: 'info',
    onStatusChange: fn(),
    onAddStatus: fn(),
    onSave: fn(),
    onDelete: fn(),
    onClose: fn(),
    onAddContact: fn(),
    onConnectContact: fn(),
    onUnlinkContact: fn(),
    onCopied: fn(),
    onAddFiles: fn(),
    onDownloadFile: fn(),
    onEditHistory: fn(),
  },
  argTypes: { tab: { control: 'select', options: TABS } },
  parameters: { controls: { include: CONTROLLED } },
} satisfies StoryMeta<typeof JobModal>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A colour as the browser computes it, borrowed on the body's own inline style
// and put back in the same tick. Never inside waitFor, KN-014.
const computed = (value: string) => {
  const host = document.body
  const previous = host.style.color
  host.style.color = value
  const result = getComputedStyle(host).color
  host.style.color = previous
  return result
}

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

// The footer of 210:86 and 760:47508: «ذخیره» at the very inline end, 24 in,
// and «انصراف» 12 before it; no delete, which the «…» holds.
const isTheFooter = async (dialog: HTMLElement, save: HTMLElement, cancel: HTMLElement) => {
  const rtl = getComputedStyle(dialog).direction === 'rtl'
  const box = dialog.getBoundingClientRect()
  const [saveBox, cancelBox] = [save.getBoundingClientRect(), cancel.getBoundingClientRect()]
  await expect(Math.round(rtl ? saveBox.left - box.left : box.right - saveBox.right)).toBe(24)
  await expect(Math.round(rtl ? cancelBox.left - saveBox.right : saveBox.left - cancelBox.right)).toBe(12)
  await expect([saveBox.height, cancelBox.height]).toEqual([44, 44])
}

export const Info: Story = {
  parameters: FIXED,
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // Node 210:101: 720 by 617. The header: the title at 20 and SemiBold over
    // the company at the inline start, and at the inline end the 20 close, the
    // More Button at 32 and the Status Control, 12 apart. The five tabs,
    // «تاریخچه» last. The fields, the posting's link with its open button 8
    // after it, the description from two lines and the skills. The footer's
    // «ذخیره», off until something changes, and «انصراف» at the inline end.
    const dialog = await dialogNamed(args.job.draft.title)
    const box = dialog.getBoundingClientRect()
    await expect([box.width, box.height]).toEqual([720, 617])
    const title = within(dialog).getByRole('heading', { level: 2, name: args.job.draft.title })
    const titleStyle = getComputedStyle(title)
    await expect([px(titleStyle.fontSize), Number(titleStyle.fontWeight)]).toEqual([20, 600])
    await expect(Math.round(box.right - title.getBoundingClientRect().right)).toBe(24)
    await expect(within(dialog).getByText(args.job.draft.company)).toBeInTheDocument()
    const [close, more, status] = [
      within(dialog).getByRole('button', { name: 'بستن' }),
      within(dialog).getByRole('button', { name: 'کارهای فرصت شغلی' }),
      within(dialog).getByRole('button', { name: /وضعیت: مصاحبه/u }),
    ].map((part) => part.getBoundingClientRect())
    if (!close || !more || !status) throw new Error('the header is missing a control')
    await expect([close.width, close.height, more.width, more.height]).toEqual([20, 20, 32, 32])
    await expect([Math.round(close.left - box.left), Math.round(more.left - close.right), Math.round(status.left - more.right)]).toEqual([
      24, 12, 12,
    ])
    const tabs = within(dialog).getAllByRole('tab')
    await expect(tabs.map((tab) => tab.textContent)).toEqual(['اطلاعات فرصت شغلی', 'یادداشت', 'افراد مرتبط', 'فایل‌ها', 'تاریخچه'])
    // The row keeps its 44 over a panel taller than the body.
    await expect(within(dialog).getByRole('tablist').closest('.MuiTabs-root')?.getBoundingClientRect().height).toBe(44)
    await expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    const panel = panelOf(dialog)
    await expect(within(panel).getByRole('textbox', { name: 'عنوان شغلی' })).toHaveValue(args.job.draft.title)
    await expect(within(panel).getByRole('combobox', { name: 'منبع' })).toHaveValue(args.job.draft.source)
    const open = within(panel).getByRole('link', { name: 'باز کردن لینک آگهی' })
    await expect(open).toHaveAttribute('href', args.job.draft.postingUrl)
    const link = within(panel).getByRole('textbox', { name: 'لینک آگهی' })
    const field = link.parentElement?.getBoundingClientRect()
    const openBox = open.getBoundingClientRect()
    await expect([openBox.width, openBox.height, Math.round((field?.left ?? 0) - openBox.right)]).toEqual([44, 44, 8])
    // A link's keyboard, and a key that saves, KN-464.
    await expect(link).toHaveAttribute('type', 'url')
    await expect(link).toHaveAttribute('enterkeyhint', 'done')
    const description = within(panel).getByRole('textbox', { name: 'شرح شغل و مسئولیت‌ها' })
    await expect(description).toHaveValue(args.job.description)
    await expect(description.parentElement?.getBoundingClientRect().height).toBe(68)
    await expect(within(panel).getAllByRole('listitem')).toHaveLength(args.job.skills.length)
    const save = within(dialog).getByRole('button', { name: 'ذخیره' })
    await expect(save).toBeDisabled()
    await isTheFooter(dialog, save, within(dialog).getByRole('button', { name: 'انصراف' }))
    await expect(within(dialog).queryByRole('button', { name: 'حذف فرصت شغلی' })).toBeNull()
  },
}

// What had focus at the moment the delete was handed over: the page remembers it
// then, KN-344, so a delete backed out of goes back to it.
const focusedAtDelete: (Element | null)[] = []

export const MoreMenu: Story = {
  // The «…» is in the header on every tab, KN-571.
  parameters: offers(['tab']),
  args: {
    onDelete: fn(() => {
      focusedAtDelete.push(document.activeElement)
    }),
  },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    focusedAtDelete.length = 0
    // Node 894:75677: the «…» opens Menu Type=Card, 220 wide, with «باز کردن
    // لینک آگهی», which opens the posting where the page cannot be reached back,
    // and «حذف فرصت شغلی», which hands over for the page to ask; the Status
    // Control beside it changes the status, so the menu does not.
    const dialog = await dialogNamed(args.job.draft.title)
    const opened = spyOn(window, 'open').mockImplementation(() => null)
    try {
      await userEvent.click(within(dialog).getByRole('button', { name: 'کارهای فرصت شغلی' }))
      const menu = await within(document.body).findByRole('menu')
      await expect(menu.parentElement?.getBoundingClientRect().width).toBe(220)
      const items = within(menu).getAllByRole('menuitem')
      await expect(items.map((item) => item.textContent)).toEqual(['باز کردن لینک آگهی', 'حذف فرصت شغلی'])
      await userEvent.click(within(menu).getByRole('menuitem', { name: 'باز کردن لینک آگهی' }))
      await expect(opened).toHaveBeenCalledWith(args.job.draft.postingUrl, '_blank', 'noopener,noreferrer')
      await waitFor(() => expect(within(document.body).queryByRole('menu')).toBeNull())
      await userEvent.click(within(dialog).getByRole('button', { name: 'کارهای فرصت شغلی' }))
      await userEvent.click(await within(document.body).findByRole('menuitem', { name: 'حذف فرصت شغلی' }))
      await waitFor(() => expect(args.onDelete).toHaveBeenCalledTimes(1))
      // Handed over with focus already back on the «…», not on a menu item about
      // to go, so a delete backed out of leaves the reader where they asked from,
      // KN-344.
      await expect(focusedAtDelete).toEqual([within(dialog).getByRole('button', { name: 'کارهای فرصت شغلی' })])
    } finally {
      opened.mockRestore()
    }
  },
}

// The record with no posting link.
const withoutALink = (): JobRecord => {
  const record = recordIn('fa-IR')
  return { ...record, draft: { ...record.draft, postingUrl: '' } }
}

export const MoreMenuWithoutALink: Story = {
  parameters: FIXED,
  args: { job: withoutALink() },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // A posting with no link has no link to open, in the menu or by the field.
    const dialog = await dialogNamed(args.job.draft.title)
    await expect(within(panelOf(dialog)).queryByRole('link', { name: 'باز کردن لینک آگهی' })).toBeNull()
    await userEvent.click(within(dialog).getByRole('button', { name: 'کارهای فرصت شغلی' }))
    const menu = await within(document.body).findByRole('menu')
    await expect(
      within(menu)
        .getAllByRole('menuitem')
        .map((item) => item.textContent),
    ).toEqual(['حذف فرصت شغلی'])
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(within(document.body).queryByRole('menu')).toBeNull())
    await expect(args.onClose).not.toHaveBeenCalled()
  },
}

export const SaveWaitsForAChange: Story = {
  parameters: FIXED,
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // The handoff: «ذخیره» is off until something changes, and off again when
    // the change is undone; on, it hands the fields over with the status.
    const dialog = await dialogNamed(args.job.draft.title)
    const save = within(dialog).getByRole('button', { name: 'ذخیره' })
    await expect(save).toBeDisabled()
    const location = within(panelOf(dialog)).getByRole('textbox', { name: 'موقعیت مکانی' })
    await userEvent.type(location, ' شمالی')
    await expect(save).toBeEnabled()
    await userEvent.clear(location)
    await userEvent.type(location, args.job.draft.location)
    await expect(save).toBeDisabled()
    await userEvent.type(location, ' شمالی')
    await userEvent.click(save)
    await expect(args.onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        location: `${args.job.draft.location} شمالی`,
        status: args.job.draft.status,
        description: args.job.description,
      }),
    )
  },
}

export const ChangeStatus: Story = {
  // The header's Status Control is there on every tab, KN-571.
  parameters: offers(['tab']),
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // The handoff: a status changed in the modal is recorded with «ذخیره», the
    // ready-to-save frame 938:109984. A stage chosen in the Change Status modal,
    // 377:6244, shows in the header and turns «ذخیره» on, and nothing is handed
    // over until it is pressed, when the status goes with the rest.
    const dialog = await dialogNamed(args.job.draft.title)
    await userEvent.click(within(dialog).getByRole('button', { name: /وضعیت: مصاحبه/u }))
    const change = await dialogNamed('تغییر وضعیت')
    await userEvent.click(within(change).getByRole('radio', { name: 'پیشنهاد کار' }))
    await userEvent.click(within(change).getByRole('button', { name: 'تأیید' }))
    await waitFor(() => expect(within(document.body).queryByRole('dialog', { name: 'تغییر وضعیت' })).toBeNull())
    await expect(args.onStatusChange).not.toHaveBeenCalled()
    await expect(within(dialog).getByRole('button', { name: /وضعیت: پیشنهاد کار/u })).toBeInTheDocument()
    const save = within(dialog).getByRole('button', { name: 'ذخیره' })
    await expect(save).toBeEnabled()
    await userEvent.click(save)
    await expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({ status: 'offer' }))
  },
}

export const ChooseAClosedStatus: Story = {
  parameters: FIXED,
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // The handoff: a closed status chosen in the modal closes it and shows the
    // board with its undo, so the outcome is handed to the page at once, and
    // nothing is saved.
    const dialog = await dialogNamed(args.job.draft.title)
    await userEvent.click(within(dialog).getByRole('button', { name: /وضعیت: مصاحبه/u }))
    const change = await dialogNamed('تغییر وضعیت')
    await userEvent.click(within(change).getByRole('radio', { name: 'رد شده' }))
    await userEvent.click(within(change).getByRole('button', { name: 'تأیید' }))
    await expect(args.onStatusChange).toHaveBeenCalledWith('rejected')
    await expect(args.onSave).not.toHaveBeenCalled()
  },
}

export const LeavingAsks: Story = {
  parameters: FIXED,
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // The handoff: closing with unsaved changes asks in Modal / Unsaved,
    // 893:3780. Its close goes back to the job opportunity; «بستن بدون ذخیره»
    // closes; «ذخیره» there saves. Cancel asks the same as the close.
    const dialog = await dialogNamed(args.job.draft.title)
    await userEvent.type(within(panelOf(dialog)).getByRole('textbox', { name: 'حقوق' }), ' خالص')
    await userEvent.click(within(dialog).getByRole('button', { name: 'بستن' }))
    const ask = await dialogNamed('تغییرات ذخیره نشده')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(within(document.body).queryByRole('dialog', { name: 'تغییرات ذخیره نشده' })).toBeNull())
    await expect(args.onClose).not.toHaveBeenCalled()
    await expect(ask).not.toBeInTheDocument()
    await userEvent.click(within(dialog).getByRole('button', { name: 'انصراف' }))
    await userEvent.click(within(await dialogNamed('تغییرات ذخیره نشده')).getByRole('button', { name: 'ذخیره' }))
    await expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({ salary: `${args.job.draft.salary} خالص` }))
    await waitFor(() => expect(within(document.body).queryByRole('dialog', { name: 'تغییرات ذخیره نشده' })).toBeNull())
    await userEvent.click(within(dialog).getByRole('button', { name: 'بستن' }))
    await userEvent.click(within(await dialogNamed('تغییرات ذخیره نشده')).getByRole('button', { name: 'بستن بدون ذخیره' }))
    await expect(args.onClose).toHaveBeenCalledTimes(1)
  },
}

export const Note: Story = {
  parameters: FIXED,
  args: { tab: 'note' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // Node 210:145: the note 200 tall and when it was last edited, 16 under
    // it. What is typed survives a switch of tabs and is saved with the rest.
    const dialog = await dialogNamed(args.job.draft.title)
    const field = within(panelOf(dialog)).getByRole('textbox', { name: 'یادداشت' })
    const box = field.parentElement?.getBoundingClientRect()
    await expect([box?.width, box?.height]).toEqual([672, 200])
    const edited = within(dialog).getByText('آخرین ویرایش: ۱۳ شهریور ۱۴۰۵')
    await expect(Math.round(edited.getBoundingClientRect().top - (box?.bottom ?? 0))).toBe(16)
    await expect(getComputedStyle(edited).color).toBe(computed(semantic['text/secondary']))
    await userEvent.clear(field)
    await userEvent.type(field, 'تماس دوم هفتهٔ بعد.')
    await userEvent.click(within(dialog).getByRole('tab', { name: 'اطلاعات فرصت شغلی' }))
    await userEvent.click(within(dialog).getByRole('tab', { name: 'یادداشت' }))
    await expect(within(panelOf(dialog)).getByRole('textbox', { name: 'یادداشت' })).toHaveValue('تماس دوم هفتهٔ بعد.')
    await userEvent.click(within(dialog).getByRole('button', { name: 'ذخیره' }))
    await expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({ note: 'تماس دوم هفتهٔ بعد.' }))
  },
}

export const People: Story = {
  parameters: FIXED,
  args: { tab: 'contacts' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // Node 210:208: the Company Match at the top, the people of the company in
    // the network who are not linked, 16 over the list of the related people:
    // Related Person rows 60 tall in a box of bg/surface at radius md with an
    // edge of border/default, a rule between rows; then «+ افزودن نفر». Connect
    // links a match, the row's remove only unlinks.
    const dialog = await dialogNamed(args.job.draft.title)
    const panel = panelOf(dialog)
    const [match] = args.matches
    const [first, second] = args.job.contacts
    if (!match || !first || !second) throw new Error('the fixtures hold too few people')
    const box = within(panel).getByRole('group', { name: `۱ نفر از ${args.job.draft.company} در شبکهٔ شماست` })
    const list = within(panel).getByRole('list', { name: 'افراد مرتبط' })
    const [boxRect, listRect] = [box.getBoundingClientRect(), list.getBoundingClientRect()]
    await expect([boxRect.width, listRect.width, Math.round(listRect.top - boxRect.bottom)]).toEqual([672, 672, 16])
    const listStyle = getComputedStyle(list)
    await expect([px(listStyle.borderTopWidth), px(listStyle.borderTopLeftRadius)]).toEqual([1, 8])
    await expect(listStyle.borderTopColor).toBe(computed(semantic['border/default']))
    const rows = within(list).getAllByRole('group')
    await expect(rows.map((row) => row.getBoundingClientRect().height)).toEqual([60, 60])
    await expect(Math.round((rows[1]?.getBoundingClientRect().top ?? 0) - (rows[0]?.getBoundingClientRect().bottom ?? 0))).toBe(1)
    await expect(rows.map((row) => Math.round(row.getBoundingClientRect().width))).toEqual([670, 670])
    await userEvent.click(within(box).getByRole('button', { name: 'وصل کردن' }))
    await expect(args.onConnectContact).toHaveBeenCalledWith(match.id)
    const row = within(list).getByRole('group', { name: second.contact.name })
    await userEvent.hover(row)
    await userEvent.click(within(row).getByRole('button', { name: 'برداشتن از این فرصت شغلی' }))
    await expect(args.onUnlinkContact).toHaveBeenCalledWith(second.id)
    const add = within(panel).getByRole('button', { name: 'افزودن نفر' })
    await expect(Math.round(add.getBoundingClientRect().top - listRect.bottom)).toBe(16)
    await userEvent.click(add)
    await expect(args.onAddContact).toHaveBeenCalledTimes(1)
  },
}

export const PeopleWithNobodyToMatch: Story = {
  parameters: FIXED,
  args: { tab: 'contacts', matches: [] },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // With nobody of the company in the network left to link, there is no box,
    // and the list starts the tab.
    const dialog = await dialogNamed(args.job.draft.title)
    const panel = panelOf(dialog)
    await expect(within(panel).queryByRole('group', { name: /در شبکهٔ شما/u })).toBeNull()
    const list = within(panel).getByRole('list', { name: 'افراد مرتبط' })
    await expect(Math.round(list.getBoundingClientRect().top - panel.getBoundingClientRect().top)).toBe(24)
  },
}

export const PeopleInEnglishInTheDark: Story = {
  parameters: FIXED,
  args: {
    tab: 'contacts',
    job: recordIn('en-US'),
    statuses: fixtures('en-US').statusOptions.slice(0, 5),
    sources: sourcesIn('en-US'),
    matches: matchesIn('en-US'),
  },
  globals: { locale: 'en-US', colorScheme: 'dark' },
  play: async ({ args }) => {
    const i18n = english
    const dialog = await dialogNamed(args.job.draft.title)
    const panel = panelOf(dialog)
    const list = within(panel).getByRole('list', { name: i18n._('Related people') })
    await expect(getComputedStyle(list).borderTopColor).toBe(computed(darkSemantic['border/default']))
    await expect(getComputedStyle(list).backgroundColor).toBe(computed(darkSemantic['bg/surface']))
    await expect(
      within(panel).getByRole('group', { name: `1 person from ${args.job.draft.company} is in your network` }),
    ).toBeInTheDocument()
    await expect(within(panel).getByRole('button', { name: i18n._('Add person') })).toBeInTheDocument()
  },
}

export const Files: Story = {
  parameters: FIXED,
  args: { tab: 'files' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // Node 210:275: each file's size, day and kind, its download, and the drop
    // zone, «فایل رو اینجا رها کنید», where a file is dropped or chosen; a
    // cancelled choice adds nothing.
    const dialog = await dialogNamed(args.job.draft.title)
    const panel = panelOf(dialog)
    const [file] = args.job.files
    if (!file) throw new Error('no files')
    await expect(within(panel).getByText('۲۴۰ کیلوبایت · ۱۰ شهریور ۱۴۰۵ · PDF')).toBeInTheDocument()
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
    const zone = within(panel).getByText('فایل رو اینجا رها کنید')
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

// The record with an interview round after its last change of status.
const withARound = (locale: Locale): JobRecord => ({ ...recordIn(locale), rounds: [roundIn(locale)] })

export const History: Story = {
  parameters: FIXED,
  args: { tab: 'history', job: withARound('fa-IR') },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // Node 760:47508: «تاریخ هر مرحله رو می‌تونید ویرایش کنید.» at 12 in
    // text/secondary, 16 over the History List: the interview rounds and the
    // changes of status, newest first, each its History / Row; the job's first
    // entry, when it was saved, locked and last. A row's date asks the page to
    // change it.
    const dialog = await dialogNamed(args.job.draft.title)
    const panel = panelOf(dialog)
    const hint = within(panel).getByText('تاریخ هر مرحله رو می‌تونید ویرایش کنید.')
    const hintStyle = getComputedStyle(hint)
    await expect([px(hintStyle.fontSize), hintStyle.color]).toEqual([12, computed(semantic['text/secondary'])])
    const list = within(panel).getByRole('list', { name: 'تاریخچه' })
    await expect(Math.round(list.getBoundingClientRect().top - hint.getBoundingClientRect().bottom)).toBe(16)
    const rows = within(list).getAllByRole('listitem')
    await expect(rows.map((row) => row.getBoundingClientRect().height)).toEqual([43, 43, 43, 43])
    await expect(rows[0]).toHaveTextContent(fixtures('fa-IR').historyWords.roundTitle)
    await expect(rows[0]).toHaveTextContent(formatDay('fa-IR', ROUND_AT))
    await expect(rows.slice(1).map((row) => row.textContent.startsWith('مصاحبه'))).toEqual([true, false, false])
    await expect(rows[1]).toHaveTextContent('۱۳ شهریور ۱۴۰۵· دستی')
    await expect(rows[3]).toHaveTextContent('ذخیره‌شده')
    await expect(rows[3]).toHaveTextContent('۱۰ شهریور ۱۴۰۵· خودکار')
    // Every row but the saved one asks for its date to be changed.
    await expect(within(rows[3] ?? list).queryByRole('button')).toBeNull()
    await userEvent.click(
      within(rows[2] ?? list).getByRole('button', { name: `تغییر تاریخ ${formatDay('fa-IR', '2026-09-01T12:00:00Z')}` }),
    )
    await expect(args.onEditHistory).toHaveBeenCalledWith('change-2')
    await userEvent.click(within(rows[0] ?? list).getByRole('button', { name: `تغییر تاریخ ${formatDay('fa-IR', ROUND_AT)}` }))
    await expect(args.onEditHistory).toHaveBeenLastCalledWith('round-1')
  },
}

export const HistoryWithoutEdits: Story = {
  parameters: FIXED,
  args: { tab: 'history' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  // A page that does not ask for the dates' edits, the callback left out.
  render: ({ onEditHistory: _edit, ...args }) => <JobModal {...args} />,
  play: async ({ args }) => {
    // A page that changes no dates offers none: no hint and no row's date to
    // press, and the changes of status alone with no rounds, newest first.
    const dialog = await dialogNamed(args.job.draft.title)
    const panel = panelOf(dialog)
    await expect(within(panel).queryByText('تاریخ هر مرحله رو می‌تونید ویرایش کنید.')).toBeNull()
    const list = within(panel).getByRole('list', { name: 'تاریخچه' })
    await expect(within(list).queryByRole('button')).toBeNull()
    await expect(
      within(list)
        .getAllByRole('listitem')
        .map((row) => row.textContent.split('۱')[0]),
    ).toEqual(['مصاحبه', 'درخواست‌شده', 'ذخیره‌شده'])
  },
}

export const HistoryInEnglishInTheDark: Story = {
  parameters: FIXED,
  args: {
    tab: 'history',
    job: withARound('en-US'),
    statuses: fixtures('en-US').statusOptions.slice(0, 5),
    sources: sourcesIn('en-US'),
    matches: matchesIn('en-US'),
  },
  globals: { locale: 'en-US', colorScheme: 'dark' },
  play: async ({ args }) => {
    const i18n = english
    const dialog = await dialogNamed(args.job.draft.title)
    const panel = panelOf(dialog)
    const hint = within(panel).getByText(i18n._('You can change the date of each stage.'))
    await expect(getComputedStyle(hint).color).toBe(computed(darkSemantic['text/secondary']))
    const rows = within(within(panel).getByRole('list', { name: i18n._('History') })).getAllByRole('listitem')
    await expect(rows).toHaveLength(4)
    await expect(rows[0]).toHaveTextContent(fixtures('en-US').historyWords.roundTitle)
  },
}

export const SaveNeedsATitle: Story = {
  parameters: FIXED,
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // Saving without a title says so on the Info tab; with one, it hands the
    // edits over.
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
    // Nothing changed, so leaving asks nothing.
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
    // fields are one column and the tabs scroll; the header's controls stay
    // on its row. The screen is resized by the runner's own browser, which
    // only the runner has, KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const { page } = await import('vitest/browser')
    const before = { width: window.innerWidth, height: window.innerHeight }
    try {
      await page.viewport(390, 844)
      const dialog = await dialogNamed(args.job.draft.title)
      await waitFor(() => expect(dialog.getBoundingClientRect().width).toBe(358))
      const list = within(dialog).getByRole('tablist')
      await expect(list.scrollWidth).toBeGreaterThan(list.clientWidth)
      const box = dialog.getBoundingClientRect()
      const controls = [
        within(dialog).getByRole('button', { name: 'بستن' }),
        within(dialog).getByRole('button', { name: 'کارهای فرصت شغلی' }),
      ]
      await expect(controls.every((control) => control.getBoundingClientRect().left >= box.left)).toBe(true)
    } finally {
      await page.viewport(before.width, before.height)
    }
  },
}

export const InEnglish: Story = {
  parameters: FIXED,
  args: {
    job: recordIn('en-US'),
    statuses: fixtures('en-US').statusOptions.slice(0, 5),
    sources: sourcesIn('en-US'),
    matches: matchesIn('en-US'),
  },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ args }) => {
    const i18n = english
    const dialog = await dialogNamed(args.job.draft.title)
    await expect(
      within(dialog)
        .getAllByRole('tab')
        .map((tab) => tab.textContent),
    ).toEqual([i18n._('Job opportunity info'), i18n._('Note'), i18n._('Related people'), i18n._('Files'), i18n._('History')])
    // The header and the footer in the language's own order.
    const box = dialog.getBoundingClientRect()
    const close = within(dialog)
      .getByRole('button', { name: i18n._('Close') })
      .getBoundingClientRect()
    await expect(Math.round(box.right - close.right)).toBe(24)
    await isTheFooter(
      dialog,
      within(dialog).getByRole('button', { name: i18n._('Save') }),
      within(dialog).getByRole('button', { name: i18n._('Cancel') }),
    )
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
    // The deadline, a day, keeps its picker.
    await expect(within(panelOf(dialog)).getByLabelText('مهلت درخواست')).toHaveAttribute('type', 'date')
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
        sources={sourcesIn('fa-IR')}
        matches={[]}
        onStatusChange={fn()}
        onAddStatus={fn()}
        onSave={onSave}
        onDelete={fn()}
        onClose={fn()}
        onAddContact={fn()}
        onConnectContact={fn()}
        onUnlinkContact={fn()}
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
    // the description are where a reader's work actually is, KN-475. Nothing
    // has changed on it, so «ذخیره» is off until something does.
    await userEvent.click(body.getByRole('tab', { name: 'یادداشت' }))
    const kept = await body.findByRole('textbox', { name: 'یادداشت' })
    await expect(kept).toHaveValue(otherIn('fa-IR').note)
    await expect(body.getByRole('button', { name: 'ذخیره' })).toBeDisabled()
    await userEvent.type(kept, '.')
    await userEvent.click(body.getByRole('button', { name: 'ذخیره' }))
    await expect(args.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ title: set.jobs[1]?.title, note: `${otherIn('fa-IR').note}.`, description: otherIn('fa-IR').description }),
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
// and nothing on the page can measure, so the story reads that scheme; and the
// header's title and the footer's disabled «ذخیره» in the dark colours.
export const InfoInTheDark: Story = {
  parameters: FIXED,
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ args }) => {
    const dialog = await dialogNamed(args.job.draft.title)
    await expect(getComputedStyle(dialog).backgroundColor).toBe(computed(darkSemantic['bg/surface']))
    const title = within(dialog).getByRole('heading', { level: 2, name: args.job.draft.title })
    await expect(getComputedStyle(title).color).toBe(computed(darkSemantic['text/primary']))
    const posted = panelOf(dialog).querySelector('input[type="date"]')
    if (!(posted instanceof HTMLInputElement)) throw new Error('the Info panel draws no date field')
    await expect(getComputedStyle(posted).colorScheme).toBe('dark')
    await expect(within(dialog).getByRole('button', { name: 'ذخیره' })).toBeDisabled()
  },
}

// How many lines a button's label takes, by the line boxes of its own text.
const linesOf = (button: HTMLElement) => {
  const text = [...button.childNodes].find((node) => node.nodeType === Node.TEXT_NODE)
  if (!text) throw new Error('the button has no label of text')
  const range = button.ownerDocument.createRange()
  range.selectNodeContents(text)
  return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size
}

// The footer in English on a phone, KN-514: Cancel and Save keep one line each
// in their fixed height, Save at the inline end.
export const InEnglishOnAPhone: Story = {
  parameters: FIXED,
  args: {
    job: recordIn('en-US'),
    statuses: fixtures('en-US').statusOptions.slice(0, 5),
    sources: sourcesIn('en-US'),
    matches: matchesIn('en-US'),
  },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ args }) => {
    // The screen is resized by the runner's own browser, which only the runner
    // has, KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const { page } = await import('vitest/browser')
    const before = { width: window.innerWidth, height: window.innerHeight }
    try {
      await page.viewport(390, 844)
      const dialog = await dialogNamed(args.job.draft.title)
      await waitFor(() => expect(dialog.getBoundingClientRect().width).toBe(358))
      const i18n = english
      const [cancel, save] = [i18n._('Cancel'), i18n._('Save')].map((name) => within(dialog).getByRole('button', { name }))
      if (!cancel || !save) throw new Error('the footer is missing a button')
      for (const button of [cancel, save]) {
        await expect(linesOf(button)).toBe(1)
        await expect(button.getBoundingClientRect().height).toBe(44)
      }
      await isTheFooter(dialog, save, cancel)
    } finally {
      await page.viewport(before.width, before.height)
    }
  },
}
