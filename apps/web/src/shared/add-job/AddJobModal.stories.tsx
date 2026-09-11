import { setupI18n } from '@lingui/core'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import type { Locale } from '../../i18n'
import { messages as en } from '../../i18n/locales/en-US'
import type { JobLevel } from '../job-selects'
import type { StatusOption } from '../status-picker'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { AddJobModal, type AddJobModalProps, type AddJobStep } from './AddJobModal'
import type { JobDraft } from './draft'

// The board's five first statuses as the picker offers them, from the story
// fixtures; a new job opportunity starts in the first, «ذخیره‌شده».
const statusesIn = (locale: Locale): StatusOption[] =>
  fixtures(locale)
    .statuses.slice(0, 5)
    .map((entry) => ({ id: entry.token, token: entry.token, name: entry.name }))

// What reading the posting finds, the Review step of node 150:94: the title and
// company of a fixture job, full-time, a senior specialist, and the rest of
// the posting's details.
const LEVEL: JobLevel = 'senior-specialist'
const foundIn = (locale: Locale): Partial<JobDraft> => {
  const [job] = fixtures(locale).jobs
  return {
    title: job?.title ?? '',
    company: job?.company ?? '',
    employmentTypes: ['full-time'],
    jobLevel: LEVEL,
    ...fixtures(locale).extraction,
  }
}
const LINK = fixtures('fa-IR').extraction.postingUrl

const STEPS: Exclude<AddJobStep, 'loading'>[] = ['paste', 'review', 'manual', 'error']
const CONTROLLED: (keyof AddJobModalProps)[] = ['open', 'step', 'source']

// The English copy, read from its catalog, so the story says what the canvas
// draws.
const english = setupI18n({ locale: 'en-US', messages: { 'en-US': en } })

const meta = {
  title: 'Shared/AddJobModal',
  component: AddJobModal,
  args: {
    open: true,
    statuses: statusesIn('fa-IR'),
    status: 'new',
    step: 'paste',
    source: '',
    onExtract: fn(() => Promise.resolve(foundIn('fa-IR'))),
    onSave: fn(),
    onAddStatus: fn(),
    onClose: fn(),
  },
  argTypes: { step: { control: 'select', options: STEPS } },
  parameters: { controls: { include: CONTROLLED } },
} satisfies StoryMeta<typeof AddJobModal>

export default meta
type Story = StoryObj<typeof meta>

// The dialog, once its dissolve has brought it into view.
const dialogNamed = async (name: string) => {
  const dialog = await within(document.body).findByRole('dialog', { name })
  await waitFor(() => expect(dialog).toBeVisible())
  return dialog
}

export const Paste: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // Node 166:62: 560 wide, the paste field 140 tall under its label with its
    // helper, the way round to the form, and Extract waiting for the field.
    // Leaving an empty flow asks nothing.
    const dialog = await dialogNamed('افزودن فرصت شغلی')
    await expect(dialog.getBoundingClientRect().width).toBe(560)
    const field = within(dialog).getByRole('textbox', { name: 'لینک آگهی یا متن کامل آگهی' })
    await expect(field.parentElement?.getBoundingClientRect().height).toBe(140)
    await expect(field).toHaveAccessibleDescription('هم لینک را می‌پذیرد، هم متن کامل آگهی را — لازم نیست چیزی را جدا کنی.')
    await expect(within(dialog).getByRole('button', { name: 'خودت دستی وارد کن' })).toBeInTheDocument()
    await expect(within(dialog).getByRole('button', { name: 'استخراج اطلاعات' })).toBeDisabled()
    await userEvent.click(within(dialog).getByRole('button', { name: 'انصراف' }))
    await expect(args.onClose).toHaveBeenCalledTimes(1)
  },
}

export const PasteFilled: Story = {
  args: { source: LINK },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async () => {
    // Node 371:422: the field holds a link, and Extract waits until the field
    // has been touched as well as filled, the critical path's «click into the
    // field».
    const dialog = await dialogNamed('افزودن فرصت شغلی')
    const extract = within(dialog).getByRole('button', { name: 'استخراج اطلاعات' })
    await expect(extract).toBeDisabled()
    await userEvent.click(within(dialog).getByRole('textbox', { name: 'لینک آگهی یا متن کامل آگهی' }))
    await expect(extract).toBeEnabled()
  },
}

export const ExtractsToReview: Story = {
  args: { source: LINK },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // Extracting reads what was pasted and lands on Review with what it found.
    const dialog = await dialogNamed('افزودن فرصت شغلی')
    await userEvent.click(within(dialog).getByRole('textbox', { name: 'لینک آگهی یا متن کامل آگهی' }))
    await userEvent.click(within(dialog).getByRole('button', { name: 'استخراج اطلاعات' }))
    await expect(args.onExtract).toHaveBeenCalledWith(LINK)
    const title = await within(dialog).findByRole('textbox', { name: 'عنوان شغلی' })
    await expect(title).toHaveValue(foundIn('fa-IR').title)
  },
}

export const Loading: Story = {
  args: { source: LINK, onExtract: fn(() => new Promise<Partial<JobDraft>>(() => undefined)) },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async () => {
    // Node 243:899: while the posting is read, the panel of 243:964, 360 wide,
    // holds the Loading State and nothing else.
    const dialog = await dialogNamed('افزودن فرصت شغلی')
    await userEvent.click(within(dialog).getByRole('textbox', { name: 'لینک آگهی یا متن کامل آگهی' }))
    await userEvent.click(within(dialog).getByRole('button', { name: 'استخراج اطلاعات' }))
    const status = await within(dialog).findByRole('status')
    await expect(status).toHaveTextContent('داره آگهی رو می‌خونه')
    await waitFor(() => expect(dialog.getBoundingClientRect().width).toBe(360))
    await expect(within(dialog).queryByRole('button')).toBeNull()
  },
}

export const LeaveWhileReading: Story = {
  args: { source: LINK, onExtract: fn(() => new Promise<Partial<JobDraft>>(() => undefined)) },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // Escape while reading goes back to the paste field with the link kept, and
    // closes nothing.
    const dialog = await dialogNamed('افزودن فرصت شغلی')
    await userEvent.click(within(dialog).getByRole('textbox', { name: 'لینک آگهی یا متن کامل آگهی' }))
    await userEvent.click(within(dialog).getByRole('button', { name: 'استخراج اطلاعات' }))
    await within(dialog).findByRole('status')
    await userEvent.keyboard('{Escape}')
    const field = await within(dialog).findByRole('textbox', { name: 'لینک آگهی یا متن کامل آگهی' })
    await expect(field).toHaveValue(LINK)
    await expect(args.onClose).not.toHaveBeenCalled()
  },
}

export const Review: Story = {
  args: { step: 'review', source: LINK, draft: foundIn('fa-IR') },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // Node 150:94: 560 by 606, the form filled and open to correction, the
    // title and the company marked required, in 420 that scroll; Save hands
    // the draft over, in its status.
    const dialog = await dialogNamed('افزودن فرصت شغلی')
    await expect([dialog.getBoundingClientRect().width, dialog.getBoundingClientRect().height]).toEqual([560, 606])
    const title = within(dialog).getByRole('textbox', { name: 'عنوان شغلی' })
    await expect(title).toHaveValue(args.draft?.title ?? 'missing')
    await expect(title).toBeRequired()
    await expect(within(dialog).getByRole('textbox', { name: 'نام شرکت' })).toBeRequired()
    await expect(within(dialog).getByRole('textbox', { name: 'لینک آگهی' })).toHaveValue(LINK)
    await userEvent.clear(title)
    await userEvent.type(title, 'مهندس نرم‌افزار')
    await userEvent.click(within(dialog).getByRole('button', { name: 'ذخیره' }))
    await expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({ title: 'مهندس نرم‌افزار', status: 'new', postingUrl: LINK }))
  },
}

export const Manual: Story = {
  args: { step: 'manual' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // Node 254:2: the same form, empty. Saving without a title and a company
    // says what is missing and saves nothing; with them, it saves.
    const dialog = await dialogNamed('افزودن فرصت شغلی')
    const save = within(dialog).getByRole('button', { name: 'ذخیره' })
    await userEvent.click(save)
    await expect(args.onSave).not.toHaveBeenCalled()
    await expect(within(dialog).getByRole('textbox', { name: 'عنوان شغلی' })).toHaveAccessibleDescription('عنوان شغلی را بنویس')
    await expect(within(dialog).getByRole('textbox', { name: 'نام شرکت' })).toHaveAccessibleDescription('نام شرکت را بنویس')
    await userEvent.type(within(dialog).getByRole('textbox', { name: 'عنوان شغلی' }), 'طراح محصول')
    await userEvent.type(within(dialog).getByRole('textbox', { name: 'نام شرکت' }), 'اسنپ')
    await userEvent.click(save)
    await expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({ title: 'طراح محصول', company: 'اسنپ', status: 'new' }))
  },
}

export const ManualPath: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async () => {
    // «خودت دستی وارد کن» goes to the empty form.
    const dialog = await dialogNamed('افزودن فرصت شغلی')
    await userEvent.click(within(dialog).getByRole('button', { name: 'خودت دستی وارد کن' }))
    await expect(await within(dialog).findByRole('textbox', { name: 'عنوان شغلی' })).toHaveValue('')
  },
}

export const ErrorStep: Story = {
  args: { step: 'error', source: LINK, onExtract: fn(() => Promise.reject(new Error('unreadable'))) },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // Node 304:2: the title says reading failed, the field keeps the link and
    // says why in text/error, the way round stays, and «دوباره امتحان کن»
    // reads it again; failing again, it stays here.
    const dialog = await dialogNamed('نشد آگهی را بخوانیم')
    const field = within(dialog).getByRole('textbox', { name: 'لینک آگهی یا متن کامل آگهی' })
    await expect(field).toHaveValue(LINK)
    await expect(field).toHaveAccessibleDescription(
      'نتوانستیم اطلاعات این لینک را بخوانیم. شاید آگهی حذف شده یا سایت اجازه‌ی خواندن نمی‌دهد. دوباره تلاش کن، یا اطلاعات را دستی وارد کن.',
    )
    await expect(within(dialog).getByRole('button', { name: 'خودت دستی وارد کن' })).toBeInTheDocument()
    await userEvent.click(within(dialog).getByRole('button', { name: 'دوباره امتحان کن' }))
    await expect(args.onExtract).toHaveBeenCalledWith(LINK)
    await expect(await dialogNamed('نشد آگهی را بخوانیم')).toBeInTheDocument()
  },
}

export const LeavingAsks: Story = {
  args: { step: 'review', source: LINK, draft: foundIn('fa-IR') },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // Leaving with something entered asks first; keeping it goes back, and
    // closing for good closes.
    const dialog = await dialogNamed('افزودن فرصت شغلی')
    await userEvent.click(within(dialog).getByRole('button', { name: 'انصراف' }))
    const ask = await dialogNamed('بدون ذخیره بسته شود؟')
    await userEvent.click(within(ask).getByRole('button', { name: 'انصراف' }))
    await waitFor(() => expect(within(document.body).queryByRole('dialog', { name: 'بدون ذخیره بسته شود؟' })).toBeNull())
    await expect(args.onClose).not.toHaveBeenCalled()
    await userEvent.click(within(dialog).getByRole('button', { name: 'بستن' }))
    // The ask's own close is named «بستن» too; its action comes last.
    const close = within(await dialogNamed('بدون ذخیره بسته شود؟'))
      .getAllByRole('button', { name: 'بستن' })
      .at(-1)
    if (!close) throw new Error('the ask has no close')
    await userEvent.click(close)
    await expect(args.onClose).toHaveBeenCalledTimes(1)
  },
}

export const Phone: Story = {
  args: { step: 'review', source: LINK, draft: foundIn('fa-IR') },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async () => {
    // On a phone's width, 243:726, the modal sits 16 from the edges and the
    // fields are one column. The screen is resized by the runner's own
    // browser, which only the runner has, KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const { page } = await import('vitest/browser')
    const before = { width: window.innerWidth, height: window.innerHeight }
    try {
      await page.viewport(390, 844)
      const dialog = await dialogNamed('افزودن فرصت شغلی')
      await waitFor(() => expect(dialog.getBoundingClientRect().width).toBe(358))
      const title = within(dialog).getByRole('textbox', { name: 'عنوان شغلی' }).getBoundingClientRect()
      const company = within(dialog).getByRole('textbox', { name: 'نام شرکت' }).getBoundingClientRect()
      await expect([Math.round(company.right), company.top > title.bottom]).toEqual([Math.round(title.right), true])
    } finally {
      await page.viewport(before.width, before.height)
    }
  },
}

export const InEnglish: Story = {
  args: { statuses: statusesIn('en-US') },
  globals: { locale: 'en-US' },
  play: async () => {
    const i18n = english
    const dialog = await dialogNamed(i18n._('Add job opportunity'))
    await expect(within(dialog).getByRole('textbox', { name: i18n._('Posting link or full text') })).toBeInTheDocument()
    await expect(within(dialog).getByRole('button', { name: i18n._('Extract details') })).toBeDisabled()
  },
}
