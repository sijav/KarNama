import type { StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
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
  return { statuses, jobs: [{ ...job, contacts: withContacts ? contacts : [] }] }
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
    // With nobody kept, the page offers the one thing there is to do.
    await expect(within(canvasElement).getByRole('button', { name: 'افزودن مخاطب' })).toBeInTheDocument()
  },
}
