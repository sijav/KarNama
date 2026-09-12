import type { StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { defaultStatuses, jobFrom, RecordsProvider, type Records } from '../core/records'
import { emptyDraft } from '../shared/add-job'
import type { StoryMeta } from '../shared/story-docs/story-meta'
import { fixtures } from '../shared/story-fixtures'
import { NetworkScreen } from './NetworkScreen'

// A job opportunity holding the fixtures' contacts, which is where the network
// page reads its people from until it keeps its own, KN-415.
const seeded = (withContacts: boolean): Records => {
  const set = fixtures('fa-IR')
  const statuses = defaultStatuses((token) => set.names[token])
  const job = jobFrom(
    { ...emptyDraft(statuses[0]?.id ?? ''), title: set.jobs[0]?.title ?? '' },
    new Date(Date.UTC(2026, 8, 1, 9)).toISOString(),
  )
  const contacts = set.contacts.slice(0, 3).map((contact) => ({
    id: contact.id,
    contact: {
      name: contact.fullName,
      role: contact.role,
      company: contact.company,
      email: contact.email,
      phone: contact.phone,
      linkedin: contact.linkedin,
      job: null,
    },
  }))
  return { statuses, jobs: [job], contacts: withContacts ? contacts.map((held) => ({ ...held, jobId: job.id })) : [] }
}

// No `component`: the page takes no props, so react-docgen reports nothing for
// it and there is no Controls table to key off one. The story renders it
// directly, which is what a page is: a composition, not a component.
const meta = {
  title: 'Screens/Network',
  render: () => <NetworkScreen />,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story, context) => (
      <RecordsProvider initial={seeded(context.parameters.contacts !== false)}>
        <Story />
      </RecordsProvider>
    ),
  ],
} satisfies StoryMeta<typeof NetworkScreen>

export default meta
type Story = StoryObj<typeof meta>

export const People: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(fixtures('fa-IR').contacts[0]?.fullName ?? '')).toBeInTheDocument()
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US' },
}

export const NobodyYet: Story = {
  parameters: { contacts: false },
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // With nobody kept, the page offers the one thing there is to do, in the
    // header and in the empty state itself.
    await expect(within(canvasElement).getAllByRole('button', { name: 'افزودن مخاطب' })).toHaveLength(2)
    await expect(within(canvasElement).getByText('هنوز کسی رو به شبکه‌ت اضافه نکردی')).toBeInTheDocument()
  },
}

export const Keeping: Story = {
  parameters: { contacts: false },
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    const NAME = 'مینا رضایی'

    // Somebody is added from the empty state, and the page shows them.
    await userEvent.click(canvas.getAllByRole('button', { name: 'افزودن مخاطب' })[1] ?? canvasElement)
    const adding = await body.findByRole('dialog')
    await userEvent.type(within(adding).getByLabelText('اسم و فامیل'), NAME)
    await userEvent.click(within(adding).getByRole('button', { name: 'ذخیره' }))
    await waitFor(async () => {
      await expect(body.queryByRole('dialog')).toBeNull()
      await expect(canvas.getByText(NAME)).toBeInTheDocument()
    })

    // A search that matches nobody says so, and clearing it brings them back.
    // The bar's own accessible name, which the component fixes.
    const search = canvas.getByLabelText('جستجوی فرصت‌های شغلی')
    await userEvent.type(search, 'کسی که نیست')
    await waitFor(async () => {
      await expect(canvas.getByText('نتیجه‌ای پیدا نشد')).toBeInTheDocument()
    })
    await userEvent.clear(search)
    await waitFor(async () => {
      await expect(canvas.getByText(NAME)).toBeInTheDocument()
    })

    // Opening them offers their details; cancelling changes nothing. The name
    // itself is the control, a ButtonBase rather than a named button.
    await userEvent.click(canvas.getByText(NAME))
    const open = await body.findByRole('dialog')
    await userEvent.click(within(open).getByRole('button', { name: 'انصراف' }))
    // While a modal is open MUI hides the rest of the page from the
    // accessibility tree, so nothing behind it can be found until it is gone.
    await waitFor(async () => {
      await expect(body.queryByRole('dialog')).toBeNull()
    })

    // Selecting them raises the bar, and deleting asks first.
    // The card's one checkbox. It should be named for whoever it selects and is
    // not, KN-423, so it is found by role until that is fixed. It is folded
    // away until the card is hovered or selected, KN-341.
    const check = canvas.getByRole('checkbox')
    await userEvent.hover(check)
    await userEvent.click(check)
    const bar = await canvas.findByRole('region', { name: 'کارهای گروهی' })
    await userEvent.click(within(bar).getByRole('button', { name: 'حذف' }))
    const confirm = await body.findByRole('dialog')
    await userEvent.click(within(confirm).getByRole('button', { name: 'حذف' }))
    await waitFor(async () => {
      await expect(canvas.getByText('هنوز کسی رو به شبکه‌ت اضافه نکردی')).toBeInTheDocument()
    })
  },
}
