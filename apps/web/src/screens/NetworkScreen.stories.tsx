import type { StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { formatCount } from '../i18n/formatCount'
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
    // A person's name is record data, never translated: the fixtures' own.
    const NAME = fixtures('fa-IR').contacts[1]?.fullName ?? ''

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
    // The box is named for what THIS page searches, KN-430.
    const search = canvas.getByLabelText('جستجوی مخاطب‌ها')
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

/**
 * A person written in full, changed, and let go of.
 *
 * The fields beyond the name are all optional and all kept the same way: what
 * is typed is kept, what is left empty is kept as nothing rather than as an
 * empty string, so a card does not draw a blank line where a role would be.
 */
export const Editing: Story = {
  parameters: { contacts: false },
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    const set = fixtures('fa-IR')
    // A person's own details are record data, never translated: the fixtures'.
    const person = set.contacts[0]
    const NAME = person?.fullName ?? ''
    const gone = async () => {
      await waitFor(async () => {
        await expect(body.queryByRole('dialog')).toBeNull()
      })
    }

    // The page's own action, in the header, which is the first of the two a
    // page with nobody on it offers.
    await userEvent.click(canvas.getAllByRole('button', { name: 'افزودن مخاطب' })[0] ?? canvasElement)
    const adding = await body.findByRole('dialog')
    await userEvent.type(within(adding).getByLabelText('اسم و فامیل'), NAME)
    await userEvent.type(within(adding).getByLabelText('سمت'), person?.role ?? '')
    await userEvent.type(within(adding).getByLabelText('شرکت'), person?.company ?? '')
    await userEvent.type(within(adding).getByLabelText('ایمیل'), person?.email ?? '')
    await userEvent.type(within(adding).getByLabelText('شماره تماس'), person?.phone ?? '')
    await userEvent.type(within(adding).getByLabelText('لینک شبکه اجتماعی'), person?.linkedin ?? '')

    // And which job opportunity they belong to, which is how a person on this
    // page turns up in that job opportunity's own related people, KN-056.
    await userEvent.click(within(adding).getByRole('combobox', { name: 'فرصت شغلی مربوطه' }))
    const jobs = await body.findByRole('listbox')
    await userEvent.click(within(jobs).getByRole('option', { name: set.jobs[0]?.title ?? '' }))
    await waitFor(async () => {
      await expect(body.queryByRole('listbox')).toBeNull()
    })

    await userEvent.click(within(adding).getByRole('button', { name: 'ذخیره' }))
    await gone()

    // Opened again, what was typed is there, and changing it keeps the same
    // person rather than adding a second one.
    const CHANGED = set.contacts[1]?.role ?? ''
    await userEvent.click(await canvas.findByRole('button', { name: NAME }))
    const editing = await body.findByRole('dialog')
    await expect(within(editing).getByLabelText('شرکت')).toHaveValue(person?.company ?? '')
    await userEvent.clear(within(editing).getByLabelText('سمت'))
    await userEvent.type(within(editing).getByLabelText('سمت'), CHANGED)
    await userEvent.click(within(editing).getByRole('button', { name: 'ذخیره' }))
    await gone()
    await waitFor(async () => {
      await expect(canvas.getAllByRole('button', { name: NAME })).toHaveLength(1)
    })

    // And they can be let go of from inside their own details, where what was
    // changed is read back, and which asks first, as every deletion in the
    // product does.
    await userEvent.click(canvas.getByRole('button', { name: NAME }))
    const open = await body.findByRole('dialog')
    await expect(within(open).getByLabelText('سمت')).toHaveValue(CHANGED)
    await userEvent.click(within(open).getByRole('button', { name: 'حذف مخاطب' }))
    const confirm = await body.findByRole('dialog')
    await userEvent.click(within(confirm).getByRole('button', { name: 'انصراف' }))
    await gone()
    await expect(await canvas.findByRole('button', { name: NAME })).toBeInTheDocument()

    await userEvent.click(canvas.getByRole('button', { name: NAME }))
    const last = await body.findByRole('dialog')
    await userEvent.click(within(last).getByRole('button', { name: 'حذف مخاطب' }))
    const sure = await body.findByRole('dialog')
    await userEvent.click(within(sure).getByRole('button', { name: 'حذف' }))
    await gone()
    await waitFor(async () => {
      await expect(canvas.queryByText(NAME)).toBeNull()
    })
  },
}

export const LettingGoOfASelection: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const set = fixtures('fa-IR')
    // Folded away until the card is hovered or has focus inside it, KN-341;
    // focus is the road a keyboard takes and the one a story can rely on. The
    // checkbox should be named for whoever it selects and is not, KN-423.
    const boxes = canvas.getAllByRole('checkbox')
    const first = boxes[0]
    const second = boxes[1]
    if (!first || !second) throw new Error('the cards have no checkboxes')
    first.focus()
    await userEvent.click(first)
    second.focus()
    await userEvent.click(second)

    // Two chosen, counted in the reader's own digits, then one taken back out
    // again, which is the other half of choosing.
    const bar = await canvas.findByRole('region', { name: 'کارهای گروهی' })
    await waitFor(async () => {
      await expect(bar).toHaveTextContent(formatCount('fa-IR', 2))
    })
    second.focus()
    await userEvent.click(second)
    await waitFor(async () => {
      await expect(bar).toHaveTextContent(formatCount('fa-IR', 1))
    })

    // And then let go of altogether, which takes the bar with it and leaves
    // everybody where they were.
    await userEvent.click(within(bar).getByRole('button', { name: 'لغو انتخاب' }))
    await waitFor(async () => {
      await expect(canvas.queryByRole('region', { name: 'کارهای گروهی' })).toBeNull()
    })
    await expect(canvas.getByText(set.contacts[0]?.fullName ?? '')).toBeInTheDocument()

    // A card lets go of its own person too, with the same confirmation the
    // bulk bar asks for. The control is folded away until the card is hovered
    // or has focus inside it, KN-341.
    const body = within(canvasElement.ownerDocument.body)
    const going = set.contacts[0]?.fullName ?? ''
    const card = canvas.getByRole('button', { name: going }).closest('article')
    if (!card) throw new Error('the person has no card around them')
    const bin = within(card).getByRole('button', { name: 'حذف مخاطب' })
    bin.focus()
    await userEvent.click(bin)
    const confirm = await body.findByRole('dialog')
    await userEvent.click(within(confirm).getByRole('button', { name: 'حذف' }))
    await waitFor(async () => {
      await expect(canvas.queryByText(going)).toBeNull()
    })
  },
}

// A phone's screen, the file's 390 by 844.
const PHONE = { width: 390, height: 844 }

// What the contacts toolbar's own instance is on the desktop, `252:48`.
const DESKTOP_BAR = 320

export const ItsOwnSearch: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // The bar is shared with the board, and a screen reader here used to be
    // told the box searched job opportunities, KN-430. It is named and
    // described for what THIS page holds, and the board's name is not on it.
    const canvas = within(canvasElement)
    const box = canvas.getByRole('searchbox')
    await expect(box).toHaveAccessibleName('جستجوی مخاطب‌ها')
    await expect(canvas.queryByLabelText('جستجوی فرصت‌های شغلی')).toBeNull()
    await expect(box).toHaveAttribute('placeholder', 'جستجو در اسم، سمت یا شرکت')
  },
}

export const ItsOwnSearchInEnglish: Story = {
  globals: { locale: 'en-US' },
  play: async ({ canvasElement }) => {
    // The English catalog is an identity map, so the id IS the rendered text.
    const box = within(canvasElement).getByRole('searchbox')
    await expect(box).toHaveAccessibleName('Search contacts')
    await expect(box).toHaveAttribute('placeholder', 'Search in name, role or company')
  },
}

export const OnAPhone: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // The search bar takes the desktop toolbar's 320 only from md up: below it
    // the bar is the page's, node 252:421, and a cap at every width left a
    // phone's row two thirds full, KN-443. What the page's own width is comes
    // from the shell's gutters, so what is read here is that the screen stops
    // capping. The screen is resized by the runner's own browser, which only
    // the runner has, KN-225, and put back after.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const { page } = await import('vitest/browser')
    const canvas = within(canvasElement)
    const barOf = () => {
      const bar = canvas.getByRole('searchbox').closest('div')?.parentElement
      if (!bar) throw new Error('the field has no bar round it')
      return bar.getBoundingClientRect()
    }
    const before = { width: window.innerWidth, height: window.innerHeight }
    try {
      // Wide: capped at the toolbar's width however wide the page is.
      await waitFor(async () => {
        await expect(Math.round(barOf().width)).toBe(DESKTOP_BAR)
      })

      // A phone: the whole page, and the taller bar with it.
      await page.viewport(PHONE.width, PHONE.height)
      await waitFor(async () => {
        const box = barOf()
        await expect(Math.round(box.width)).toBe(Math.round(canvasElement.getBoundingClientRect().width))
        await expect(box.height).toBe(44)
      })
    } finally {
      await page.viewport(before.width, before.height)
    }
  },
}

export const FocusAfterDeletingFromTheModal: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // KN-344, and the route that makes the opener impossible to read later: the
    // Delete inside the contact modal closes that modal in the same breath, so
    // by the time the confirmation is up, the control that asked is already
    // gone. It is captured when it asks, not when the confirmation opens.
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    const person = fixtures('fa-IR').contacts[0]?.fullName ?? ''

    await userEvent.click(canvas.getByRole('button', { name: person }))
    const editing = await body.findByRole('dialog')
    await userEvent.click(within(editing).getByRole('button', { name: 'حذف مخاطب' }))
    const confirm = await body.findByRole('dialog')
    await userEvent.click(within(confirm).getByRole('button', { name: 'حذف' }))

    await waitFor(async () => {
      const landed = canvasElement.ownerDocument.activeElement
      await expect(landed).not.toBe(canvasElement.ownerDocument.body)
      await expect(canvasElement.contains(landed)).toBe(true)
    })
    await expect(canvas.queryByText(person)).toBeNull()
  },
}
