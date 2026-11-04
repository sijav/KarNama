import { useLingui } from '@lingui/react'
import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { elevation, semantic, spacing } from '../../theme/tokens'
import { Button } from '../button'
import { quoted } from '../quoted'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { PersonPicker, type PersonPickerProps, type PickerPerson } from './PersonPicker'

// The reader's network, as the picker offers it.
const peopleIn = (locale: Locale): readonly PickerPerson[] =>
  fixtures(locale).contacts.map((contact) => ({ id: contact.id, name: contact.fullName, role: contact.role, company: contact.company }))

const FA_PEOPLE = peopleIn('fa-IR')

// The picker under the tab's «+ افزودن نفر», which opens it; every answer closes
// it and calls the args.
const UnderTheButton = ({ onPick, onCreate, onClose, ...args }: PersonPickerProps) => {
  const { i18n } = useLingui()
  const [holder, setHolder] = useState<HTMLElement | null>(null)
  const [open, setOpen] = useState(false)
  return (
    // Inside the tab's padding: MUI's Popover keeps 16 from the window's edge.
    <Box sx={{ paddingInline: `${spacing.lg}px` }}>
      <Box ref={setHolder} sx={{ display: 'inline-flex' }}>
        <Button
          variant="text"
          size="S"
          startIcon="plus"
          onClick={() => {
            setOpen(true)
          }}
        >
          {i18n._('Add person')}
        </Button>
      </Box>
      <PersonPicker
        {...args}
        anchorEl={open ? holder : null}
        onPick={onPick}
        onCreate={onCreate}
        onClose={() => {
          setOpen(false)
          onClose()
        }}
      />
    </Box>
  )
}

const meta = {
  title: 'Shared/PersonPicker',
  component: PersonPicker,
  args: { anchorEl: null, people: FA_PEOPLE, linkedIds: [FA_PEOPLE[0]?.id ?? ''], onPick: fn(), onCreate: fn(), onClose: fn() },
  parameters: { controls: { include: [] } },
  render: (args) => <UnderTheButton {...args} />,
} satisfies StoryMeta<typeof PersonPicker>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A colour, or a shadow, as the browser computes it, borrowed on the host's own
// inline style and put back in the same tick. Never inside waitFor, KN-014.
const computed = (host: HTMLElement, value: string) => {
  const previous = host.style.color
  host.style.color = value
  const result = getComputedStyle(host).color
  host.style.color = previous
  return result
}
const shadowOf = (host: HTMLElement, value: string) => {
  const previous = host.style.boxShadow
  host.style.boxShadow = value
  const result = getComputedStyle(host).boxShadow
  host.style.boxShadow = previous
  return result
}

type Palette = Record<keyof typeof semantic, string>

// The runner's 414 cannot hold the 400 picker beside the window's 16, so a
// story that measures or points at it widens the page while it runs.
const wide = async (run: () => Promise<void>) => {
  const testing = '__KARNAMA_STORY_TEST__' in globalThis
  if (testing) await (await import('vitest/browser')).page.viewport(1280, 800)
  try {
    await run()
  } finally {
    if (testing) await (await import('vitest/browser')).page.viewport(414, 896)
  }
}

// Opens the picker from its button and returns its parts.
const openPicker = async (canvasElement: HTMLElement, locale: Locale) => {
  const i18n = i18nFor(locale)
  const button = within(canvasElement).getByRole('button', { name: i18n._('Add person') })
  await userEvent.click(button)
  const search = await within(canvasElement.ownerDocument.body).findByRole('combobox', { name: i18n._('Search your network') })
  await waitFor(() => expect(search).toHaveFocus())
  const listbox = within(canvasElement.ownerDocument.body).getByRole('listbox', { name: i18n._('From your network') })
  const paper = listbox.parentElement
  if (!(paper instanceof HTMLElement)) throw new Error('the picker has no panel')
  return { button, search, listbox, paper }
}

const createName = (locale: Locale, name: string) => {
  const i18n = i18nFor(locale)
  return `${i18n._('Add')} ${quoted(i18n, name)} ${i18n._('to the network as a new person')}`
}

// Node 1096:3129: 400 wide at radius 8, 8 round its parts and 4 between, its
// shadow; the heading «از شبکهٔ شما» in Label text/secondary, 4 above and below
// and 12 at the sides; each person 54 tall, the linked one muted with «وصل
// است» in text/brand at the inline end.
const isTheFiles = async (canvasElement: HTMLElement, args: PersonPickerProps, locale: Locale, palette: Palette) => {
  const i18n = i18nFor(locale)
  const { button, listbox, paper } = await openPicker(canvasElement, locale)
  const style = getComputedStyle(paper)
  await expect([paper.getBoundingClientRect().width, px(style.borderTopLeftRadius), px(style.paddingTop), px(style.rowGap)]).toEqual([
    400, 8, 8, 4,
  ])
  await expect(style.boxShadow).toBe(shadowOf(paper, elevation.picker))
  await expect(style.backgroundColor).toBe(computed(paper, palette['bg/surface']))
  await expect(Math.round(paper.getBoundingClientRect().top - button.getBoundingClientRect().bottom)).toBe(4)
  const heading = within(paper).getByText(i18n._('From your network'))
  const headed = getComputedStyle(heading)
  await expect([px(headed.fontSize), px(headed.lineHeight), px(headed.paddingTop), px(headed.paddingInlineStart)]).toEqual([12, 16, 4, 12])
  await expect(headed.color).toBe(computed(heading, palette['text/secondary']))
  const options = within(listbox).getAllByRole('option')
  await expect(options.map((option) => option.getBoundingClientRect().height)).toEqual(args.people.map(() => 54))
  for (const [index, person] of args.people.entries()) {
    const option = options[index]
    if (!option) throw new Error('an option is missing')
    const linked = args.linkedIds.includes(person.id)
    await expect(option.getAttribute('aria-disabled')).toBe(String(linked))
    const name = within(option).getByText(person.name)
    await expect(getComputedStyle(name).color).toBe(computed(name, linked ? palette['text/secondary'] : palette['text/primary']))
    if (linked) {
      const mark = within(option).getByText(i18n._('Linked'))
      await expect(getComputedStyle(mark).color).toBe(computed(mark, palette['text/brand']))
    }
  }
  // With nothing typed there is nothing to add.
  await expect(within(paper).queryByRole('button')).toBeNull()
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await wide(async () => {
      await isTheFiles(canvasElement, args, 'fa-IR', semantic)
    })
  },
}

export const Searching: Story = {
  // What is typed narrows the network by name, role or company, and a divider
  // and the add row follow, in Body text/brand after its plus.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await wide(async () => {
      const { search, listbox, paper } = await openPicker(canvasElement, 'fa-IR')
      const first = args.people[0]
      if (!first) throw new Error('the fixtures hold no people')
      const query = first.name.slice(0, 2)
      await userEvent.type(search, query)
      const shown = within(listbox).getAllByRole('option')
      await expect(shown.every((option) => option.textContent.includes(query))).toBe(true)
      const add = within(paper).getByRole('button', { name: createName('fa-IR', query) })
      const style = getComputedStyle(add)
      await expect([px(style.fontSize), px(style.lineHeight), px(style.paddingTop), px(style.paddingInlineStart)]).toEqual([14, 22, 8, 12])
      await expect(style.color).toBe(computed(add, semantic['text/brand']))
      await expect(add.getBoundingClientRect().height).toBe(38)
    })
  },
}

export const Choosing: Story = {
  // A press on someone not linked yet links them and closes the picker.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await wide(async () => {
      const { listbox } = await openPicker(canvasElement, 'fa-IR')
      const target = args.people[2]
      if (!target) throw new Error('the fixtures hold too few people')
      await userEvent.click(within(listbox).getByText(target.name))
      await expect(args.onPick).toHaveBeenCalledWith(target.id)
      await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('listbox')).toBeNull())
    })
  },
}

export const Creating: Story = {
  // A name no one in the network has: nothing found, and the add row asks for
  // the add form with the name filled, as Enter does.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await wide(async () => {
      const i18n = i18nFor('fa-IR')
      // A status's name, which no one's name, role or company holds.
      const name = fixtures('fa-IR').statusOptions[1]?.name ?? ''
      const first = await openPicker(canvasElement, 'fa-IR')
      await userEvent.type(first.search, name)
      await expect(within(first.listbox).getByText(i18n._('No results found'))).toBeVisible()
      await userEvent.click(within(first.paper).getByRole('button', { name: createName('fa-IR', name) }))
      await expect(args.onCreate).toHaveBeenCalledWith(name)
      await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('listbox')).toBeNull())
      const second = await openPicker(canvasElement, 'fa-IR')
      await expect(second.search).toHaveValue('')
      await userEvent.type(second.search, ` ${name} {Enter}`)
      await expect(args.onCreate).toHaveBeenLastCalledWith(name)
    })
  },
}

export const Keyboard: Story = {
  // The arrows move through the people who can be chosen, Enter links one, and
  // Escape closes.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await wide(async () => {
      const { search } = await openPicker(canvasElement, 'fa-IR')
      const choosable = args.people.filter((person) => !args.linkedIds.includes(person.id))
      const [, second] = choosable
      if (!second) throw new Error('the fixtures hold too few people')
      await userEvent.keyboard('{ArrowDown}')
      const active = search.ownerDocument.getElementById(search.getAttribute('aria-activedescendant') ?? '')
      await expect(active?.textContent).toContain(second.name)
      await userEvent.keyboard('{Enter}')
      await expect(args.onPick).toHaveBeenCalledWith(second.id)
      await openPicker(canvasElement, 'fa-IR')
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('listbox')).toBeNull())
      await expect(args.onClose).toHaveBeenCalledTimes(2)
    })
  },
}

export const InEnglish: Story = {
  args: { people: peopleIn('en-US'), linkedIds: [peopleIn('en-US')[0]?.id ?? ''] },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await wide(async () => {
      await isTheFiles(canvasElement, args, 'en-US', semantic)
    })
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ args, canvasElement }) => {
    await wide(async () => {
      await isTheFiles(canvasElement, args, 'fa-IR', darkSemantic)
    })
  },
}
