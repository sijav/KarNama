import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { darkSemantic, darkStatus } from '../../theme/darkMode'
import { semantic, status } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { LinkedJob, type LinkedJobProps } from './LinkedJob'

// The person modal's field is 512 wide, its list's rows 510 inside its edge.
const ROW_WIDTH = 510

// The fixtures' first job opportunity, with its status's name.
const jobIn = (locale: Locale) => {
  const set = fixtures(locale)
  const job = set.jobs[0]
  const option = set.statusOptions.find((entry) => entry.token === job?.status)
  if (!job || !option) throw new Error('the fixtures hold no job opportunity with a status')
  return { title: job.title, company: job.company, status: { token: option.token, name: option.name } }
}

const InTheList = (args: LinkedJobProps) => (
  <Box sx={{ width: ROW_WIDTH }}>
    <LinkedJob {...args} />
  </Box>
)

const meta = {
  title: 'Shared/LinkedJob',
  component: LinkedJob,
  args: { ...jobIn('fa-IR'), onUnlink: fn() },
  parameters: { controls: { include: ['title', 'company'] } },
  render: (args) => <InTheList {...args} />,
} satisfies StoryMeta<typeof LinkedJob>

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

const partsOf = (canvasElement: HTMLElement, args: LinkedJobProps, locale: Locale) => {
  const row = within(canvasElement).getByRole('group', { name: args.title })
  const [stripe, text, , actions] = [...row.children]
  const unlink = within(row).getByRole('button', { name: i18nFor(locale)._('Unlink') })
  if (!(stripe instanceof HTMLElement) || !(text instanceof HTMLElement) || !(actions instanceof HTMLElement)) throw new Error('the row is missing a part')
  return { row, stripe, text, actions, unlink }
}

// Node 1092:2997 at rest: 56 tall, 8 above and below and 12 at the sides, 12
// between; the stripe 3 by 32 in the status's base at the inline start; the
// title in Body text/primary over the company in Label text/secondary; the
// status's small chip; the unlink button hidden.
const isTheFiles = async (canvasElement: HTMLElement, args: LinkedJobProps, locale: Locale, palette: Palette, statuses: Statuses) => {
  const { row, stripe, text, actions } = partsOf(canvasElement, args, locale)
  const style = getComputedStyle(row)
  await expect(row.getBoundingClientRect().height).toBe(56)
  await expect([px(style.paddingTop), px(style.paddingInlineStart), px(style.columnGap)]).toEqual([8, 12, 12])
  await expect(style.backgroundColor).toBe(computed(row, palette['bg/surface']))
  await expect([stripe.getBoundingClientRect().width, stripe.getBoundingClientRect().height]).toEqual([3, 32])
  await expect(getComputedStyle(stripe).backgroundColor).toBe(computed(stripe, statuses[args.status.token].base))
  const box = row.getBoundingClientRect()
  await expect(Math.round(locale === 'fa-IR' ? box.right - stripe.getBoundingClientRect().right : stripe.getBoundingClientRect().left - box.left)).toBe(12)
  const [title, company] = [...text.children]
  if (!(title instanceof HTMLElement) || !(company instanceof HTMLElement)) throw new Error('the text is missing a line')
  const [titled, named] = [getComputedStyle(title), getComputedStyle(company)]
  await expect([px(titled.fontSize), px(titled.lineHeight), titled.fontWeight]).toEqual([14, 22, '400'])
  await expect([px(named.fontSize), px(named.lineHeight), named.fontWeight]).toEqual([12, 16, '500'])
  await expect([titled.color, named.color]).toEqual([computed(title, palette['text/primary']), computed(company, palette['text/secondary'])])
  await expect(within(row).getByText(args.status.name)).toBeVisible()
  await expect(getComputedStyle(actions).opacity).toBe('0')
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, 'fa-IR', semantic, status)
  },
}

export const Hover: Story = {
  // Under a real pointer the row fills with bg/surface-secondary and the unlink
  // button shows. Only the test runner has a pointer to move.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const { row, actions } = partsOf(canvasElement, args, 'fa-IR')
    const browser = await import('vitest/browser')
    await browser.userEvent.hover(row)
    await waitFor(() => expect(getComputedStyle(row).backgroundColor).toBe(computed(row, semantic['bg/surface-secondary'])))
    await expect(getComputedStyle(actions).opacity).toBe('1')
  },
}

export const KeyboardFocus: Story = {
  // Tab reaches the unlink button, focus inside draws the hover look, and Enter
  // unlinks.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const { row, actions, unlink } = partsOf(canvasElement, args, 'fa-IR')
    await userEvent.tab()
    await expect(unlink).toHaveFocus()
    await waitFor(() => expect(getComputedStyle(row).backgroundColor).toBe(computed(row, semantic['bg/surface-secondary'])))
    await expect(getComputedStyle(actions).opacity).toBe('1')
    await userEvent.keyboard('{Enter}')
    await expect(args.onUnlink).toHaveBeenCalledOnce()
  },
}

export const InEnglish: Story = {
  args: jobIn('en-US'),
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, 'en-US', semantic, status)
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, 'fa-IR', darkSemantic, darkStatus)
  },
}
