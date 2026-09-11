import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import type { Locale } from '../../i18n'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { ContactCard, type ContactCardContact, type ContactCardProps } from './ContactCard'

// A contact from the story fixtures, as the page would hand it over: the job it
// is linked to written «company — title», as node 248:116 writes it.
const contactIn = (locale: Locale, index: number): ContactCardContact => {
  const set = fixtures(locale)
  const contact = set.contacts[index]
  if (!contact) throw new Error(`the story fixtures have no contact ${String(index)}`)
  const job = set.jobs.find((entry) => entry.id === contact.jobId)
  return {
    name: contact.fullName,
    role: contact.role,
    company: contact.company,
    email: contact.email,
    phone: contact.phone,
    job: job === undefined ? null : `${job.company} — ${job.title}`,
    linkedin: contact.linkedin,
  }
}

const CONTROLLED: (keyof ContactCardProps)[] = ['contact', 'layout', 'selected']
const LAYOUTS: NonNullable<ContactCardProps['layout']>[] = ['full', 'compact']

// The file's full card is 360 wide and its compact one 560; the card fills its
// container, so the stories give it the file's width.
const WIDTHS = { full: 360, compact: 560 } as const

const meta = {
  title: 'Shared/ContactCard',
  component: ContactCard,
  args: { contact: contactIn('fa-IR', 0), layout: 'full', selected: false, onOpen: fn(), onSelectedChange: fn(), onDelete: fn() },
  argTypes: { layout: { control: 'radio', options: LAYOUTS } },
  parameters: { controls: { include: CONTROLLED } },
  decorators: [
    (Story, { args }) => (
      <Box sx={{ width: WIDTHS[args.layout ?? 'full'] }}>
        <Story />
      </Box>
    ),
  ],
} satisfies StoryMeta<typeof ContactCard>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A token's colour as the browser computes it, borrowed on the host's own
// inline style and put back in the same tick. Never inside waitFor, KN-014.
const computedColour = (host: HTMLElement, colour: string) => {
  const previous = host.style.color
  host.style.color = colour
  const value = getComputedStyle(host).color
  host.style.color = previous
  return value
}

const cardOf = (canvasElement: HTMLElement) => {
  const card = canvasElement.querySelector('article')
  if (!card) throw new Error('no card')
  return card
}

// The card's own button is the one named by the contact's name.
const openerOf = (canvasElement: HTMLElement, name: string) => within(canvasElement).getByRole('button', { name })

// Whether the checkbox is seen: its root's, since the native input the role
// sits on is always transparent under the drawn frame.
const seen = (checkbox: HTMLElement) => checkbox.parentElement?.checkVisibility({ opacityProperty: true }) ?? false

// The full card's delete, named in either language.
const deleteOf = (card: HTMLElement) => within(card).getByRole('button', { name: /حذف|Delete/u })

export const Full: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Node 248:54: 24 of padding, 12 between its rows, radius lg, one pixel of
    // border/default; the name at 16 and 600, the role line in text/secondary,
    // a divider, then email, phone, the linked job and LinkedIn, each with its
    // icon; the checkbox and delete folded out of the row at rest, unseen but
    // still in the keyboard's path, KN-341.
    const card = cardOf(canvasElement)
    const style = getComputedStyle(card)
    await expect([
      px(style.paddingTop),
      px(style.rowGap),
      px(style.borderTopLeftRadius),
      px(getComputedStyle(card, '::before').borderTopWidth),
    ]).toEqual([24, 12, 16, 1])
    await expect(style.backgroundColor).toBe(computedColour(card, semantic['bg/surface']))
    const name = openerOf(canvasElement, args.contact.name)
    await expect([px(getComputedStyle(name).fontSize), Number(getComputedStyle(name).fontWeight)]).toEqual([16, 600])
    await expect(seen(within(card).getByRole('checkbox'))).toBe(false)
    await expect(deleteOf(card).getBoundingClientRect().width).toBe(0)
    // Email and phone are links that act: mailto and tel.
    const [email, phone, linkedin] = within(card).getAllByRole('link')
    await expect([email?.getAttribute('href'), phone?.getAttribute('href')]).toEqual([
      `mailto:${args.contact.email ?? ''}`,
      `tel:${args.contact.phone ?? ''}`,
    ])
    // LinkedIn opens in a new tab.
    await expect([linkedin?.getAttribute('href')?.endsWith(args.contact.linkedin ?? 'missing'), linkedin?.getAttribute('target')]).toEqual([
      true,
      '_blank',
    ])
    await expect(card).toHaveTextContent(args.contact.job ?? 'missing')
    // Pressing the card anywhere else opens the contact.
    await userEvent.click(name)
    await expect(args.onOpen).toHaveBeenCalledTimes(1)
  },
}

export const FullHover: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Node 248:84: one and a half of border/focus, the delete at the inline end
    // and the checkbox before the name, which moves over by it; the row stays
    // 30. The browser's own pointer, which only the runner has, KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const browser = await import('vitest/browser')
    const card = cardOf(canvasElement)
    const name = openerOf(canvasElement, args.contact.name)
    const before = name.getBoundingClientRect()
    await browser.userEvent.hover(card)
    const checkbox = await within(card).findByRole('checkbox')
    // The delete joins the name as the card's second button.
    await expect(within(card).getAllByRole('button')).toHaveLength(2)
    await waitFor(() => expect(getComputedStyle(card).boxShadow.endsWith('inset')).toBe(true))
    const after = name.getBoundingClientRect()
    await expect(Math.round(Math.abs(after.right - before.right))).toBe(28)
    await expect(name.parentElement?.parentElement?.getBoundingClientRect().height).toBe(30)
    await userEvent.click(checkbox)
    await expect(args.onSelectedChange).toHaveBeenCalledWith(true)
  },
}

export const FullTabOrder: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Tab from before the card meets its controls in the order they are
    // drawn, KN-341: the checkbox, folded at rest and unfolding as it takes
    // focus, then the name, then the delete; the row keeps its 30 and the name
    // has moved over by 28. The browser's own Tab, which only the runner has,
    // KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const browser = await import('vitest/browser')
    const card = cardOf(canvasElement)
    const name = openerOf(canvasElement, args.contact.name)
    const before = name.getBoundingClientRect()
    const checkbox = within(card).getByRole('checkbox')
    // Focus starts just before the card.
    canvasElement.tabIndex = -1
    canvasElement.focus()
    for (const control of [checkbox, name, deleteOf(card)]) {
      await browser.userEvent.tab()
      await expect(control).toHaveFocus()
    }
    canvasElement.removeAttribute('tabindex')
    await expect(seen(checkbox)).toBe(true)
    await expect(Math.round(Math.abs(name.getBoundingClientRect().right - before.right))).toBe(28)
    await expect(name.parentElement?.parentElement?.getBoundingClientRect().height).toBe(30)
  },
}

export const FullSelected: Story = {
  args: { selected: true },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Node 248:115: bg/brand/container and the edge of border/focus, the
    // checkbox checked and the delete in view.
    const card = cardOf(canvasElement)
    await expect(getComputedStyle(card).backgroundColor).toBe(computedColour(card, semantic['bg/brand/container']))
    await expect(within(card).getByRole('checkbox')).toBeChecked()
    await userEvent.click(deleteOf(card))
    await expect(args.onDelete).toHaveBeenCalledTimes(1)
  },
}

export const CheckboxRingIsWhole: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // The Title Group's host contract, KN-293: the checkbox, focused by the
    // keyboard where the file draws it, flush at the group's inline start and
    // 8 from the name, and every ancestor that clips holds its whole 28 by 28
    // root, the ring's room included. From the name, which brings it into
    // the row, Shift+Tab reaches it, whatever had focus before the story.
    const card = cardOf(canvasElement)
    openerOf(canvasElement, args.contact.name).focus()
    await userEvent.tab({ shift: true })
    const checkbox = within(card).getByRole('checkbox')
    await expect(checkbox).toHaveFocus()
    const root = checkbox.parentElement
    if (!root) throw new Error('the checkbox has no root')
    const ring = root.getBoundingClientRect()
    await expect([Math.round(ring.width), Math.round(ring.height)]).toEqual([28, 28])
    for (let node = root.parentElement; node && node !== canvasElement; node = node.parentElement) {
      const clip = getComputedStyle(node)
      if (clip.overflowX === 'visible' && clip.overflowY === 'visible') continue
      const box = node.getBoundingClientRect()
      await expect(ring.left >= box.left && ring.right <= box.right && ring.top >= box.top && ring.bottom <= box.bottom).toBe(true)
    }
  },
}

export const LongValues: Story = {
  args: { contact: contactIn('fa-IR', 1) },
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // A long name, role and email are cut with an ellipsis on one line; the
    // card keeps its width and every row its height.
    const card = cardOf(canvasElement)
    await expect(Math.round(card.getBoundingClientRect().width)).toBe(360)
    for (const element of [...card.querySelectorAll('*')]) {
      if (!(element instanceof HTMLElement) || getComputedStyle(element).textOverflow !== 'ellipsis') continue
      await expect(element.scrollWidth).toBeGreaterThanOrEqual(element.clientWidth)
      await expect(element.getBoundingClientRect().height).toBeLessThanOrEqual(24)
    }
  },
}

export const Compact: Story = {
  args: { layout: 'compact' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Node 463:684: 12 of padding and gap, radius md, the 40 avatar in
    // bg/brand/container, the name at 14 and 500 over the role at 12, and the
    // mail and delete Icon Buttons at the inline end.
    const card = cardOf(canvasElement)
    const style = getComputedStyle(card)
    await expect([px(style.paddingTop), px(style.columnGap), px(style.borderTopLeftRadius)]).toEqual([12, 12, 8])
    const name = openerOf(canvasElement, args.contact.name)
    await expect([px(getComputedStyle(name).fontSize), Number(getComputedStyle(name).fontWeight)]).toEqual([14, 500])
    const buttons = within(card)
      .getAllByRole('button')
      .filter((button) => button !== name)
    await expect(buttons).toHaveLength(2)
    await userEvent.click(buttons.at(-1) ?? card)
    await expect(args.onDelete).toHaveBeenCalledTimes(1)
  },
}

export const CompactSelected: Story = {
  args: { layout: 'compact', selected: true },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const card = cardOf(canvasElement)
    await expect(getComputedStyle(card).backgroundColor).toBe(computedColour(card, semantic['bg/brand/container']))
  },
}

export const WithoutEmailOrPhone: Story = {
  args: { contact: contactIn('fa-IR', 2) },
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // A contact with no email, phone, job or LinkedIn, which the owner allowed,
    // KN-071: the card draws no empty rows.
    await expect(within(cardOf(canvasElement)).queryAllByRole('link')).toHaveLength(0)
  },
}

export const InEnglish: Story = {
  args: { contact: contactIn('en-US', 0) },
  globals: { locale: 'en-US' },
  play: async ({ args, canvasElement }) => {
    await expect(openerOf(canvasElement, args.contact.name)).toBeVisible()
  },
}
