import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, spyOn, userEvent, waitFor, within } from 'storybook/test'
import { i18n } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { RelatedPerson, type RelatedPersonProps } from './RelatedPerson'

// The job modal's people tab is 672 wide, and a phone's detail page 358.
const DESKTOP_WIDTH = 672
const PHONE_WIDTH = 358

const FA = fixtures('fa-IR')
const EN = fixtures('en-US')
// A person with a role, a company, an email and a number.
const person = (set: typeof FA) => {
  const found = set.contacts.find((contact) => contact.role !== '' && contact.company !== null && contact.email !== null && contact.phone !== null)
  if (!found) throw new Error('the fixtures hold no person with every field')
  return { name: found.fullName, role: found.role, company: found.company, email: found.email, phone: found.phone, tag: set.contactTag }
}

const InATab = (args: RelatedPersonProps) => (
  <Box sx={{ width: args.layout === 'mobile' ? PHONE_WIDTH : DESKTOP_WIDTH }}>
    <RelatedPerson {...args} />
  </Box>
)

const meta = {
  title: 'Shared/RelatedPerson',
  component: RelatedPerson,
  args: { ...person(FA), onUnlink: fn(), onCopied: fn() },
  argTypes: { layout: { control: 'radio', options: ['desktop', 'mobile'] } },
  parameters: { controls: { include: ['name', 'role', 'company', 'tag', 'email', 'phone', 'layout'] } },
  render: (args) => <InATab {...args} />,
} satisfies StoryMeta<typeof RelatedPerson>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A colour as the browser computes it, borrowed on the host's own inline style
// and put back in the same tick. Never inside waitFor, KN-014.
const computed = (host: HTMLElement, value: string) => {
  const previous = host.style.color
  host.style.color = value
  const result = getComputedStyle(host).color
  host.style.color = previous
  return result
}

const rowIn = (canvasElement: HTMLElement, name: string) => within(canvasElement).getByRole('group', { name })
const actionsOf = (row: HTMLElement) => {
  const actions = within(row).getAllByRole('button')[0]?.parentElement
  if (!(actions instanceof HTMLElement)) throw new Error('the row has no actions')
  return actions
}

// Node 1096:3109 at rest, State=Default: 672 by 60, 12 above and below and 16 at
// the sides, 12 between, bg/surface; the name in Title, 16 on 24 at Medium in
// text/primary, and «سمت · شرکت» in Label, 12 on 16, in text/secondary, at the
// inline start; the tag 12 after it in a chip of bg/surface-secondary, 4 and 8
// round its Label; and the three Icon Buttons at the inline end, hidden.
const isAtRest = async (canvasElement: HTMLElement, args: RelatedPersonProps, palette: Record<keyof typeof semantic, string>) => {
  const row = rowIn(canvasElement, args.name)
  const box = row.getBoundingClientRect()
  await expect([box.width, box.height]).toEqual([DESKTOP_WIDTH, 60])
  const style = getComputedStyle(row)
  await expect([px(style.paddingTop), px(style.paddingBottom), px(style.paddingInlineStart), px(style.paddingInlineEnd), px(style.columnGap)]).toEqual([12, 12, 16, 16, 12])
  await expect(style.backgroundColor).toBe(computed(row, palette['bg/surface']))
  const name = within(row).getByText(args.name)
  const named = getComputedStyle(name)
  await expect([px(named.fontSize), px(named.lineHeight), named.fontWeight]).toEqual([16, 24, '500'])
  await expect(named.color).toBe(computed(name, palette['text/primary']))
  const described = within(row).getByText(`${args.role ?? ''} · ${args.company ?? ''}`)
  const line = getComputedStyle(described)
  await expect([px(line.fontSize), px(line.lineHeight), line.fontWeight]).toEqual([12, 16, '500'])
  await expect(line.color).toBe(computed(described, palette['text/secondary']))
  const tag = within(row).getByText(args.tag ?? '')
  const chip = getComputedStyle(tag)
  await expect([px(chip.paddingTop), px(chip.paddingInlineStart), px(chip.borderTopLeftRadius) >= 12]).toEqual([4, 8, true])
  await expect(chip.backgroundColor).toBe(computed(tag, palette['bg/surface-secondary']))
  const rtl = style.direction === 'rtl'
  const words = name.parentElement?.getBoundingClientRect()
  if (!words) throw new Error('the name has no text block')
  await expect(Math.round(rtl ? box.right - words.right : words.left - box.left)).toBe(16)
  await expect(Math.round(rtl ? words.left - tag.getBoundingClientRect().right : tag.getBoundingClientRect().left - words.right)).toBe(12)
  const actions = actionsOf(row)
  await expect(getComputedStyle(actions).opacity).toBe('0')
  const end = actions.getBoundingClientRect()
  await expect(Math.round(rtl ? end.left - box.left : box.right - end.right)).toBe(16)
  // From the content outward: the number, the email, and the unlink at the end.
  await expect(within(row).getAllByRole('button').map((button) => button.getAttribute('aria-label'))).toEqual([
    i18n._('Copy number'),
    i18n._('Copy email'),
    i18n._('Remove from this job opportunity'),
  ])
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isAtRest(canvasElement, args, semantic)
  },
}

export const Hover: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // State=Hover, 1096:3089: the row on bg/surface-secondary, the tag lifted to
    // bg/surface and the buttons shown, by the runner's real pointer, since
    // :hover is the browser's hit-testing, KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) {
      if (import.meta.env.MODE !== 'test') return
      throw new Error('Hover is running outside Storybook without the story-test flag that .storybook/vitest.setup.ts sets')
    }
    const browser = await import('vitest/browser')
    const row = rowIn(canvasElement, args.name)
    const tag = within(row).getByText(args.tag ?? '')
    const [fill, lifted] = [computed(row, semantic['bg/surface-secondary']), computed(tag, semantic['bg/surface'])]
    await browser.userEvent.hover(within(row).getByText(args.name))
    await waitFor(() => expect(getComputedStyle(row).backgroundColor).toBe(fill))
    await expect(getComputedStyle(tag).backgroundColor).toBe(lifted)
    await expect(getComputedStyle(actionsOf(row)).opacity).toBe('1')
  },
}

export const KeyboardFocus: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Reached by Tab, the buttons show as they do on hover, so a keyboard
    // reader sees what they reach.
    const row = rowIn(canvasElement, args.name)
    await userEvent.tab()
    await expect(within(row).getByRole('button', { name: i18n._('Copy number') })).toHaveFocus()
    await expect(getComputedStyle(actionsOf(row)).opacity).toBe('1')
    await expect(getComputedStyle(row).backgroundColor).toBe(computed(row, semantic['bg/surface-secondary']))
  },
}

export const Unlink: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // A press unlinks the person, who stays in the network.
    await userEvent.click(within(rowIn(canvasElement, args.name)).getByRole('button', { name: i18n._('Remove from this job opportunity') }))
    await expect(args.onUnlink).toHaveBeenCalledOnce()
  },
}

export const CopyEmail: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // The email goes to the clipboard and the caller is told, for its message.
    const written = spyOn(window.navigator.clipboard, 'writeText').mockResolvedValue()
    try {
      await userEvent.click(within(rowIn(canvasElement, args.name)).getByRole('button', { name: i18n._('Copy email') }))
      await waitFor(() => expect(args.onCopied).toHaveBeenCalledWith('email'))
      await expect(written).toHaveBeenCalledWith(args.email)
    } finally {
      written.mockRestore()
    }
  },
}

export const CopyNumber: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const written = spyOn(window.navigator.clipboard, 'writeText').mockResolvedValue()
    try {
      await userEvent.click(within(rowIn(canvasElement, args.name)).getByRole('button', { name: i18n._('Copy number') }))
      await waitFor(() => expect(args.onCopied).toHaveBeenCalledWith('phone'))
      await expect(written).toHaveBeenCalledWith(args.phone)
    } finally {
      written.mockRestore()
    }
  },
}

export const CopyRefused: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // A browser that refuses the clipboard copies nothing, so nothing is said.
    const written = spyOn(window.navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'))
    try {
      await userEvent.click(within(rowIn(canvasElement, args.name)).getByRole('button', { name: i18n._('Copy email') }))
      await waitFor(() => expect(written).toHaveBeenCalled())
      await expect(args.onCopied).not.toHaveBeenCalled()
    } finally {
      written.mockRestore()
    }
  },
}

export const WithNothingToCopy: Story = {
  // No email and no number: only the unlink, and no chip without a tag.
  args: { email: null, phone: null, tag: null },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const row = rowIn(canvasElement, args.name)
    await expect(within(row).getAllByRole('button').map((button) => button.getAttribute('aria-label'))).toEqual([i18n._('Remove from this job opportunity')])
    await expect(row.getBoundingClientRect().height).toBe(60)
  },
}

export const Mobile: Story = {
  // Related Person / Mobile, 1313:3295: 358 wide, the buttons always shown,
  // since a phone has no hover, and the tag 4 under the role.
  args: { layout: 'mobile' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const row = rowIn(canvasElement, args.name)
    const box = row.getBoundingClientRect()
    await expect([box.width, box.height]).toEqual([PHONE_WIDTH, 96])
    await expect(getComputedStyle(actionsOf(row)).opacity).toBe('1')
    const described = within(row).getByText(`${args.role ?? ''} · ${args.company ?? ''}`)
    const tag = within(row).getByText(args.tag ?? '')
    await expect(Math.round(tag.getBoundingClientRect().top - described.getBoundingClientRect().bottom)).toBe(4)
    const actions = actionsOf(row).getBoundingClientRect()
    await expect(Math.round(actions.top - box.top)).toBe(12)
  },
}

export const InEnglish: Story = {
  args: person(EN),
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Left to right it mirrors: the name at the left, the buttons at the right.
    await isAtRest(canvasElement, args, semantic)
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ args, canvasElement }) => {
    await isAtRest(canvasElement, args, darkSemantic)
  },
}
