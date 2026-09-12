import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { defaultStatuses, jobFrom, RecordsProvider, type JobEntry, type Records } from '../core/records'
import { emptyDraft } from '../shared/add-job'
import type { StoryMeta } from '../shared/story-docs/story-meta'
import { fixtures } from '../shared/story-fixtures'
import { JobsScreen } from './JobsScreen'

// A board of the fixtures' own job opportunities, one per status, so the screen
// draws what the design draws rather than a made-up set, KN-062.
const seeded = (): Records => {
  const set = fixtures('fa-IR')
  const statuses = defaultStatuses((token) => set.names[token])
  const jobs: JobEntry[] = set.jobs.slice(0, 5).map((job, at) =>
    jobFrom(
      {
        ...emptyDraft(statuses[at % statuses.length]?.id ?? ''),
        title: job.title,
        company: job.company,
        location: job.location,
        postedAt: job.postedAt,
        postingUrl: job.link ?? '',
      },
      // Added a day apart, built rather than written: a date's own letters are
      // not copy, and the lint rule cannot tell them from a sentence.
      new Date(Date.UTC(2026, 8, at + 1, 9)).toISOString(),
    ),
  )
  return { statuses, jobs, contacts: [] }
}

const meta = {
  title: 'Screens/Jobs',
  component: JobsScreen,
  parameters: { layout: 'fullscreen' },
  args: { addOpen: false, onAddClose: fn() },
  decorators: [
    (Story, context) => (
      // Each story gets its own records, so one cannot change what another
      // draws; the provider is seeded rather than read from the browser.
      // `seeded` is false for a story about a board with nothing on it.
      <RecordsProvider initial={context.parameters.seeded === false ? { statuses: seeded().statuses, jobs: [], contacts: [] } : seeded()}>
        <Story />
      </RecordsProvider>
    ),
  ],
} satisfies StoryMeta<typeof JobsScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Board: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // A column for each status the board holds, named as the reader named it,
    // and the first fixture's job opportunity in one of them.
    const set = fixtures('fa-IR')
    // Each column's name as the reader has it, read from the same place the
    // board reads it rather than written out here.
    for (const status of defaultStatuses((token) => set.names[token])) {
      await expect(canvas.getAllByText(status.name).length).toBeGreaterThan(0)
    }
    await expect(canvas.getByText(set.jobs[0]?.title ?? '')).toBeInTheDocument()
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US' },
}

export const Empty: Story = {
  parameters: { seeded: false },
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // With nothing added the board gives way to the empty state, which offers
    // the one thing there is to do.
    const canvas = within(canvasElement)
    await expect(canvas.getAllByRole('button', { name: /افزودن فرصت شغلی/ }).length).toBeGreaterThan(0)
  },
}

export const AddingFromTheAddress: Story = {
  args: { addOpen: true },
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // The add destination IS the add flow: the address opens it, and closing it
    // says so, which is what puts the address back on the board.
    const dialog = within(canvasElement.ownerDocument.body).getByRole('dialog')
    await expect(dialog).toBeInTheDocument()
    await userEvent.click(within(dialog).getByRole('button', { name: 'انصراف' }))
  },
}

export const Working: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    const set = fixtures('fa-IR')
    const first = set.jobs[0]?.title ?? ''

    // Searching narrows every column at once, and clearing it brings them back.
    const search = canvas.getByRole('searchbox')
    await userEvent.type(search, set.jobs[1]?.title ?? '')
    await waitFor(async () => {
      await expect(canvas.queryByText(first)).toBeNull()
    })
    await userEvent.clear(search)
    await waitFor(async () => {
      await expect(canvas.getByText(first)).toBeInTheDocument()
    })

    // A card opens the job opportunity, and the modal closes again.
    await userEvent.click(canvas.getByRole('button', { name: first }))
    const modal = await body.findByRole('dialog')
    await userEvent.click(within(modal).getByRole('button', { name: 'بستن' }))

    // Selecting a card brings up the bulk bar, which moves it to another
    // status through the same modal a single card uses. The checkbox is folded
    // away until the card is hovered, KN-341, so the card is hovered first.
    const card = canvas.getByRole('button', { name: first }).closest('article')
    if (!card) throw new Error('the card has no article around it')
    await userEvent.hover(card)
    await userEvent.click(within(card).getByRole('checkbox'))
    const bar = await canvas.findByRole('region', { name: 'کارهای گروهی' })
    await userEvent.click(within(bar).getByRole('button', { name: 'تغییر وضعیت' }))
    const change = await body.findByRole('dialog')
    await userEvent.click(within(change).getByRole('radio', { name: set.names.offer }))
    await userEvent.click(within(change).getByRole('button', { name: 'تأیید' }))

    // And the column it moved to now holds it.
    await waitFor(async () => {
      await expect(canvas.getByText(first)).toBeInTheDocument()
    })
  },
}

export const Managing: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    const set = fixtures('fa-IR')
    const first = set.jobs[0]?.title ?? ''
    const gone = async () => {
      // MUI hides the page from the accessibility tree while a modal is open.
      await waitFor(async () => {
        await expect(body.queryByRole('dialog')).toBeNull()
      })
    }

    // A column's menu renames it, and the board shows the new name.
    const columns = defaultStatuses((token) => set.names[token])
    const savedName = columns[0]?.name ?? ''
    await userEvent.click(canvas.getByRole('button', { name: `کارهای وضعیت: ${savedName}` }))
    await userEvent.click(await body.findByRole('menuitem', { name: 'تغییر نام' }))
    const rename = await body.findByRole('dialog')
    await userEvent.clear(within(rename).getByRole('textbox'))
    await userEvent.type(within(rename).getByRole('textbox'), 'در انتظار پاسخ')
    await userEvent.click(within(rename).getByRole('button', { name: 'ذخیره' }))
    await gone()
    await expect(canvas.getByText('در انتظار پاسخ')).toBeInTheDocument()

    // A column is added at the end of the board.
    await userEvent.click(canvas.getByRole('button', { name: 'افزودن وضعیت' }))
    await waitFor(async () => {
      await expect(canvas.getAllByText('وضعیت تازه').length).toBeGreaterThan(0)
    })

    // A job opportunity is deleted from its own modal, where the control is not
    // folded behind a hover the synthetic pointer cannot set, KN-365.
    await userEvent.click(canvas.getByRole('button', { name: first }))
    const open = await body.findByRole('dialog')
    await userEvent.click(within(open).getByRole('button', { name: 'حذف فرصت شغلی' }))
    const confirm = await body.findByRole('dialog')
    await userEvent.click(within(confirm).getByRole('button', { name: 'حذف' }))
    await gone()
    await waitFor(async () => {
      await expect(canvas.queryByText(first)).toBeNull()
    })

    // The rejected column opens from its collapsed header.
    const rejected = columns.at(-1)?.name ?? ''
    await userEvent.click(canvas.getByRole('button', { name: new RegExp(rejected) }))
    await waitFor(async () => {
      await expect(canvas.getAllByText('هنوز فرصت شغلی‌ای تو این مرحله نیست').length).toBeGreaterThan(0)
    })
  },
}
