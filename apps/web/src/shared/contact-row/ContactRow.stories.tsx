import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, spyOn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { formatCount } from '../../i18n/formatCount'
import { darkSemantic, darkStatus } from '../../theme/darkMode'
import { semantic, status } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { ContactRow, type ContactRowProps } from './ContactRow'

// The network page's list, 1136 wide, as 1056:2872 is drawn.
const LIST_WIDTH = 1136

// A person with every field, their tag and the first three job opportunities
// the fixtures hold, the first drawn and the other two counted.
const personIn = (locale: Locale) => {
  const set = fixtures(locale)
  const found = set.contacts.find((contact) => contact.company !== null && contact.email !== null && contact.phone !== null && contact.linkedin !== null)
  if (!found) throw new Error('the fixtures hold no person with every field')
  return {
    name: found.fullName,
    role: found.role,
    company: found.company,
    label: set.contactTag,
    jobs: set.jobs.slice(0, 3).map((job) => ({ id: job.id, title: job.title, status: job.status })),
    email: found.email,
    phone: found.phone,
    link: found.linkedin,
  }
}

const InTheList = (args: ContactRowProps) => (
  <Box sx={{ width: LIST_WIDTH }}>
    <ContactRow {...args} />
  </Box>
)

const meta = {
  title: 'Shared/ContactRow',
  component: ContactRow,
  args: { ...personIn('fa-IR'), onOpen: fn(), onSelectedChange: fn(), onCopied: fn() },
  parameters: { controls: { include: ['name', 'role', 'company', 'label', 'email', 'phone', 'link', 'selected', 'selecting'] } },
  render: (args) => <InTheList {...args} />,
} satisfies StoryMeta<typeof ContactRow>

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

type Palette = Record<keyof typeof semantic, string>
type Statuses = typeof status | typeof darkStatus

// The runner's 414 cannot hold a row of 1136, so a story that measures or
// points at it widens the page while it runs and gives back the 414 after.
const wide = async (run: () => Promise<void>) => {
  const testing = '__KARNAMA_STORY_TEST__' in globalThis
  if (testing) await (await import('vitest/browser')).page.viewport(1280, 800)
  try {
    await run()
  } finally {
    if (testing) await (await import('vitest/browser')).page.viewport(414, 896)
  }
}

// The row's parts, from the group its name names.
const partsOf = (canvasElement: HTMLElement, args: ContactRowProps, locale: Locale) => {
  const i18n = i18nFor(locale)
  const row = within(canvasElement).getByRole('group', { name: args.name })
  const check = within(row).getByRole('checkbox', { name: `${i18n._('Select')} ${args.name}` })
  const opener = within(row).getByRole('button', { name: args.name })
  const [checkBox, , labelColumn, jobs, actions] = [...row.children]
  if (!(checkBox instanceof HTMLElement) || !(labelColumn instanceof HTMLElement) || !(jobs instanceof HTMLElement) || !(actions instanceof HTMLElement))
    throw new Error('the row is missing a column')
  return { row, check, checkBox, opener, labelColumn, jobs, actions }
}

// Node 1056:2872 at rest: 72 tall, 12 above and below and 16 at the sides, 16
// between, one pixel of border/default under it; the checkbox and the actions
// hidden; the name in Title over its role and company in Body text/secondary,
// in 280; the label a chip of Label in text/secondary on bg/surface-secondary,
// in 140; the first job opportunity a pill of one pixel of border/default at
// radius 4 with its status's stripe, 3 by 14, and the rest counted, +N.
const isTheFiles = async (canvasElement: HTMLElement, args: ContactRowProps, locale: Locale, palette: Palette, statuses: Statuses) => {
  const { row, checkBox, opener, labelColumn, jobs } = partsOf(canvasElement, args, locale)
  const style = getComputedStyle(row)
  await expect(row.getBoundingClientRect().height).toBe(72)
  await expect([px(style.paddingTop), px(style.paddingInlineStart), px(style.columnGap)]).toEqual([12, 16, 16])
  await expect([px(style.borderBottomWidth), style.borderBottomColor]).toEqual([1, computed(row, palette['border/default'])])
  await expect(getComputedStyle(checkBox).opacity).toBe(args.selecting === true || args.selected === true ? '1' : '0')
  await expect([opener.getBoundingClientRect().width, labelColumn.getBoundingClientRect().width]).toEqual([280, 140])
  const [name, described] = [...opener.children]
  if (!(name instanceof HTMLElement) || !(described instanceof HTMLElement)) throw new Error('the name block is missing a line')
  const [named, roled] = [getComputedStyle(name), getComputedStyle(described)]
  await expect([px(named.fontSize), px(named.lineHeight), named.fontWeight]).toEqual([16, 24, '500'])
  await expect([px(roled.fontSize), px(roled.lineHeight), roled.fontWeight]).toEqual([14, 22, '400'])
  await expect([named.color, roled.color]).toEqual([computed(name, palette['text/primary']), computed(described, palette['text/secondary'])])
  await expect(described.textContent).toBe([args.role, args.company].join(' · '))
  const chip = labelColumn.firstElementChild
  if (!(chip instanceof HTMLElement)) throw new Error('the label has no chip')
  const chipped = getComputedStyle(chip)
  await expect([px(chipped.fontSize), px(chipped.lineHeight), chipped.fontWeight]).toEqual([12, 16, '500'])
  await expect([px(chipped.paddingTop), px(chipped.paddingInlineStart), px(chipped.borderTopLeftRadius) >= 12]).toEqual([4, 8, true])
  await expect(chipped.color).toBe(computed(chip, palette['text/secondary']))
  const [pill, more] = [...jobs.children]
  if (!(pill instanceof HTMLElement) || !(more instanceof HTMLElement)) throw new Error('the jobs are missing')
  const pilled = getComputedStyle(pill)
  await expect([px(pilled.borderTopWidth), px(pilled.borderTopLeftRadius), px(pilled.paddingInlineStart), px(pilled.columnGap)]).toEqual([1, 4, 8, 8])
  await expect(pilled.borderTopColor).toBe(computed(pill, palette['border/default']))
  await expect(pill.getBoundingClientRect().height).toBe(26)
  const [stripe, title] = [...pill.children]
  if (!(stripe instanceof HTMLElement) || !(title instanceof HTMLElement)) throw new Error('the pill is missing a part')
  const firstJob = args.jobs?.[0]
  if (!firstJob) throw new Error('the story gives no job opportunities')
  await expect([stripe.getBoundingClientRect().width, stripe.getBoundingClientRect().height]).toEqual([3, 14])
  await expect(getComputedStyle(stripe).backgroundColor).toBe(computed(stripe, statuses[firstJob.status].base))
  await expect(title.textContent).toBe(firstJob.title)
  await expect(getComputedStyle(title).color).toBe(computed(title, palette['text/primary']))
  await expect(more.textContent).toBe(`+${formatCount(locale, (args.jobs?.length ?? 1) - 1)}`)
  await expect([more.getBoundingClientRect().height, px(getComputedStyle(more).borderTopLeftRadius)]).toEqual([24, 4])
  return { row, chip, more }
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await wide(async () => {
      const { row, chip, more, actions } = { ...(await isTheFiles(canvasElement, args, 'fa-IR', semantic, status)), ...partsOf(canvasElement, args, 'fa-IR') }
      await expect(getComputedStyle(row).backgroundColor).toBe(computed(row, semantic['bg/surface']))
      await expect([getComputedStyle(chip).backgroundColor, getComputedStyle(more).backgroundColor]).toEqual([
        computed(chip, semantic['bg/surface-secondary']),
        computed(more, semantic['bg/surface-secondary']),
      ])
      await expect(getComputedStyle(actions).opacity).toBe('0')
      // From the content outward: the link, the number and the email.
      const i18n = i18nFor('fa-IR')
      await expect([...actions.querySelectorAll('[aria-label]')].map((button) => button.getAttribute('aria-label'))).toEqual([
        i18n._('Open link'),
        i18n._('Copy number'),
        i18n._('Copy email'),
      ])
    })
  },
}

export const Hover: Story = {
  // Under a real pointer: the row fills with bg/surface-secondary, the chips
  // lift to bg/surface and the checkbox and the actions show. Only the test
  // runner has a pointer to move.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    await wide(async () => {
      const { row, checkBox, actions, labelColumn } = partsOf(canvasElement, args, 'fa-IR')
      const browser = await import('vitest/browser')
      await browser.userEvent.hover(row)
      await waitFor(() => expect(getComputedStyle(row).backgroundColor).toBe(computed(row, semantic['bg/surface-secondary'])))
      const chip = labelColumn.firstElementChild
      if (!(chip instanceof HTMLElement)) throw new Error('the label has no chip')
      await expect(getComputedStyle(chip).backgroundColor).toBe(computed(chip, semantic['bg/surface']))
      await expect([getComputedStyle(checkBox).opacity, getComputedStyle(actions).opacity]).toEqual(['1', '1'])
    })
  },
}

export const Selectable: Story = {
  // While the page selects, the checkbox shows and the actions stay hidden; a
  // press on the name chooses the person rather than opening them.
  args: { selecting: true },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await wide(async () => {
      await isTheFiles(canvasElement, args, 'fa-IR', semantic, status)
      const { opener, actions } = partsOf(canvasElement, args, 'fa-IR')
      await expect(getComputedStyle(actions).opacity).toBe('0')
      await userEvent.click(opener)
      await expect(args.onSelectedChange).toHaveBeenCalledWith(true)
      await expect(args.onOpen).not.toHaveBeenCalled()
    })
  },
}

export const Selected: Story = {
  // Selected: the row fills with bg/brand/container, the checkbox ticked, the
  // chips on bg/surface.
  args: { selected: true, selecting: true },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await wide(async () => {
      const { row, chip, more } = await isTheFiles(canvasElement, args, 'fa-IR', semantic, status)
      await expect(getComputedStyle(row).backgroundColor).toBe(computed(row, semantic['bg/brand/container']))
      await expect(partsOf(canvasElement, args, 'fa-IR').check).toBeChecked()
      await expect([getComputedStyle(chip).backgroundColor, getComputedStyle(more).backgroundColor]).toEqual([
        computed(chip, semantic['bg/surface']),
        computed(more, semantic['bg/surface']),
      ])
    })
  },
}

export const Opening: Story = {
  // A press on the name opens the person; the checkbox chooses them.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await wide(async () => {
      const { opener, check } = partsOf(canvasElement, args, 'fa-IR')
      await userEvent.click(opener)
      await expect(args.onOpen).toHaveBeenCalledOnce()
      await userEvent.click(check)
      await expect(args.onSelectedChange).toHaveBeenCalledWith(true)
    })
  },
}

export const KeyboardFocus: Story = {
  // Tab reaches the checkbox first, and focus inside draws the hover look with
  // the actions, which Tab then reaches too.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await wide(async () => {
      const { row, check, opener, actions } = partsOf(canvasElement, args, 'fa-IR')
      await userEvent.tab()
      await expect(check).toHaveFocus()
      await waitFor(() => expect(getComputedStyle(row).backgroundColor).toBe(computed(row, semantic['bg/surface-secondary'])))
      await expect(getComputedStyle(actions).opacity).toBe('1')
      await userEvent.tab()
      await expect(opener).toHaveFocus()
      await userEvent.tab()
      await expect(within(actions).getByRole('link', { name: i18nFor('fa-IR')._('Open link') })).toHaveFocus()
    })
  },
}

export const CopyEmail: Story = {
  // The email goes to the clipboard and the caller is told, for its message;
  // the link opens the person's page in a new tab.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await wide(async () => {
      const i18n = i18nFor('fa-IR')
      const { actions } = partsOf(canvasElement, args, 'fa-IR')
      const written = spyOn(window.navigator.clipboard, 'writeText').mockResolvedValue()
      try {
        await userEvent.click(within(actions).getByRole('button', { name: i18n._('Copy email') }))
        await waitFor(() => expect(args.onCopied).toHaveBeenCalledWith('email'))
        await expect(written).toHaveBeenCalledWith(args.email)
      } finally {
        written.mockRestore()
      }
      const link = within(actions).getByRole('link', { name: i18n._('Open link') })
      await expect([link.getAttribute('href'), link.getAttribute('target'), link.getAttribute('rel')]).toEqual([
        `https://${args.link ?? ''}`,
        '_blank',
        'noopener noreferrer',
      ])
    })
  },
}

export const NoLabelNoJobs: Story = {
  // A person with no label, no job opportunity and nothing to copy: the label's
  // column and the jobs' room stay, empty, and no action is drawn.
  args: { label: null, jobs: [], email: null, phone: null, link: null },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await wide(async () => {
      const { labelColumn, jobs, actions } = partsOf(canvasElement, args, 'fa-IR')
      await expect([labelColumn.children.length, jobs.children.length, actions.children.length]).toEqual([0, 0, 0])
      await expect(labelColumn.getBoundingClientRect().width).toBe(140)
    })
  },
}

export const InEnglish: Story = {
  args: personIn('en-US'),
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await wide(async () => {
      const { row } = await isTheFiles(canvasElement, args, 'en-US', semantic, status)
      // The checkbox leads at the left in English.
      const { checkBox } = partsOf(canvasElement, args, 'en-US')
      await expect(Math.round(checkBox.getBoundingClientRect().left - row.getBoundingClientRect().left)).toBe(16)
    })
  },
}

export const Dark: Story = {
  args: { selected: true, selecting: true },
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ args, canvasElement }) => {
    await wide(async () => {
      const { row } = await isTheFiles(canvasElement, args, 'fa-IR', darkSemantic, darkStatus)
      await expect(getComputedStyle(row).backgroundColor).toBe(computed(row, darkSemantic['bg/brand/container']))
    })
  },
}
