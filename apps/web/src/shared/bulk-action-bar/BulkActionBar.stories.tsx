import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { i18n } from '../../i18n'
import { formatCount } from '../../i18n/formatCount'
import { elevation, semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { BulkActionBar, type BulkActionBarProps, type BulkActionBarType } from './BulkActionBar'

const TYPES: readonly BulkActionBarType[] = ['jobs', 'contacts']
const CONTROLLED: (keyof BulkActionBarProps)[] = ['type', 'count']

const meta = {
  title: 'Shared/BulkActionBar',
  component: BulkActionBar,
  args: { type: 'jobs', count: 2, onClear: fn(), onDelete: fn(), onChangeStatus: fn(), onSelectAll: fn() },
  argTypes: { type: { control: 'radio', options: TYPES }, count: { control: { type: 'number', min: 0, step: 1 } } },
  parameters: { controls: { include: CONTROLLED } },
} satisfies StoryMeta<typeof BulkActionBar>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A token's value as the browser computes it, borrowed on the host's own
// inline style and put back in the same tick.
const computed = (host: HTMLElement, property: 'color' | 'boxShadow', value: string) => {
  const previous = host.style[property]
  host.style[property] = value
  const result = getComputedStyle(host)[property]
  host.style[property] = previous
  return result
}

const barOf = (canvasElement: HTMLElement) => within(canvasElement).getByRole('region', { name: i18n._('Bulk actions') })

// The count in the language on screen, as the status region reads it out.
const countFor = (type: BulkActionBarType, count: number, locale: 'fa-IR' | 'en-US') => {
  const one = new Intl.PluralRules(locale).select(count) === 'one'
  const noun =
    type === 'jobs'
      ? one
        ? i18n._('job opportunity selected')
        : i18n._('job opportunities selected')
      : one
        ? i18n._('contact selected')
        : i18n._('contacts selected')
  return `${formatCount(locale, count)} ${noun}`
}

// Each control's name, in order from the inline start.
const namesOf = (bar: HTMLElement) =>
  within(bar)
    .getAllByRole('button')
    .map((button) => button.textContent || button.getAttribute('aria-label'))

// Under the test runner the width is the runner's own; in the published
// Storybook there is none to set, so the measures are the reader's to see.
const atWidth = async (width: number, height: number) => {
  if (!('__KARNAMA_STORY_TEST__' in globalThis)) {
    if ('__STORYBOOK_PREVIEW__' in globalThis) return false
    throw new Error('the bar is measured outside Storybook without the story-test flag that .storybook/vitest.setup.ts sets')
  }
  const browser = await import('vitest/browser')
  await browser.page.viewport(width, height)
  return true
}
const backToTheRunnersWidth = async () => {
  if ('__KARNAMA_STORY_TEST__' in globalThis) await (await import('vitest/browser')).page.viewport(414, 896)
}

// Node 401:436 on a desktop screen, 243:595: one row 60 tall, 16 and 12 of
// padding, 12 apart, radius lg, 24 above the bottom and centred, with the
// bar's own shadow; the count at the inline start in 14 on 22 at 500, the
// divider 1 by 24, and the close a 32 square round a 20 icon at the end.
const drawsTheRow = async (bar: HTMLElement, { colours }: { colours: boolean }) => {
  const style = getComputedStyle(bar)
  const box = bar.getBoundingClientRect()
  const view = bar.ownerDocument.documentElement
  await expect(box.height).toBe(60)
  await expect([style.paddingTop, style.paddingInlineStart, style.paddingBottom, style.paddingInlineEnd].map(px)).toEqual([12, 16, 12, 16])
  await expect([px(style.columnGap), px(style.borderTopLeftRadius)]).toEqual([12, 16])
  await expect(Math.round(view.clientHeight - box.bottom)).toBe(24)
  await expect(Math.abs(box.left - (view.clientWidth - box.right))).toBeLessThanOrEqual(1)
  await expect(style.boxShadow).toBe(computed(bar, 'boxShadow', elevation.bulkBar))
  const [count, ...rest] = [...bar.children].filter((child) => child instanceof HTMLElement)
  if (!count) throw new Error('the bar has no count')
  const countStyle = getComputedStyle(count)
  await expect([px(countStyle.fontSize), px(countStyle.lineHeight), Number(countStyle.fontWeight)]).toEqual([14, 22, 500])
  const rtl = style.direction === 'rtl'
  const startOf = (element: Element) =>
    rtl ? box.right - element.getBoundingClientRect().right : element.getBoundingClientRect().left - box.left
  await expect(Math.round(startOf(count))).toBe(16)
  const close = within(bar).getByRole('button', { name: i18n._('Clear selection') })
  const closeBox = close.getBoundingClientRect()
  await expect([closeBox.width, closeBox.height, close.querySelector('svg')?.getBoundingClientRect().width]).toEqual([32, 32, 20])
  await expect(Math.round(box.width - startOf(close) - closeBox.width)).toBe(16)
  const divider = rest.find((child) => child.getBoundingClientRect().width === 1)
  await expect(divider?.getBoundingClientRect().height).toBe(24)
  for (const button of within(bar)
    .getAllByRole('button')
    .filter((button) => button !== close))
    await expect(button.getBoundingClientRect().height).toBe(36)
  if (colours) {
    await expect(countStyle.color).toBe(computed(count, 'color', semantic['text/primary']))
    await expect(getComputedStyle(bar, '::before').borderTopColor).toBe(computed(bar, 'color', semantic['border/default']))
    await expect(px(getComputedStyle(bar, '::before').borderTopWidth)).toBe(1)
  }
}

export const Jobs: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const bar = barOf(canvasElement)
    // From the inline start: Select all, Change status, Delete, and the close.
    await expect(namesOf(bar)).toEqual([i18n._('Select all'), i18n._('Change status'), i18n._('Delete'), i18n._('Clear selection')])
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent(countFor('jobs', args.count, 'fa-IR'))
    for (const [name, spy] of [
      [i18n._('Select all'), args.onSelectAll],
      [i18n._('Change status'), args.onChangeStatus],
      [i18n._('Delete'), args.onDelete],
      [i18n._('Clear selection'), args.onClear],
    ] as const) {
      await userEvent.click(within(bar).getByRole('button', { name }))
      await expect(spy).toHaveBeenCalledTimes(1)
    }
    if (!(await atWidth(1440, 900))) return
    await drawsTheRow(barOf(canvasElement), { colours: true })
    await backToTheRunnersWidth()
  },
}

export const Contacts: Story = {
  args: { type: 'contacts' },
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // Delete and the close only, node 401:428.
    const bar = barOf(canvasElement)
    await expect(namesOf(bar)).toEqual([i18n._('Delete'), i18n._('Clear selection')])
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent(countFor('contacts', args.count, 'fa-IR'))
    if (!(await atWidth(1440, 900))) return
    await drawsTheRow(barOf(canvasElement), { colours: false })
    await backToTheRunnersWidth()
  },
}

export const NothingSelected: Story = {
  args: { count: 0 },
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // No bar while nothing is selected, but the status region waits, empty,
    // so the first selection is a change it reads out.
    await expect(within(canvasElement).queryByRole('region')).toBeNull()
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent('')
  },
}

export const InEnglish: Story = {
  args: { count: 1 },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // One is singular in English; the count starts at the left.
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent(countFor('jobs', args.count, 'en-US'))
    if (!(await atWidth(1440, 900))) return
    await drawsTheRow(barOf(canvasElement), { colours: true })
    await backToTheRunnersWidth()
  },
}

export const OnANarrowScreen: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // A phone of 390: the bar keeps 16 from each side and wraps what does not
    // fit, where the file's mobile bar, 243:408, lets it hang outside.
    if (!(await atWidth(390, 844))) return
    const bar = barOf(canvasElement)
    const box = bar.getBoundingClientRect()
    await expect(box.width).toBeLessThanOrEqual(358)
    for (const control of within(bar).getAllByRole('button')) {
      const inner = control.getBoundingClientRect()
      await expect(inner.left >= box.left && inner.right <= box.right).toBe(true)
    }
    await backToTheRunnersWidth()
  },
}

export const ReachedBeforeTheList: Story = {
  globals: { locale: 'fa-IR' },
  // The host's side of the contract: the bar comes before the list in the
  // page's order, and floats at the bottom of the screen all the same.
  render: (args) => (
    <Box>
      <BulkActionBar {...args} />
      <Box component="ul" sx={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {fixtures('fa-IR').jobs.map((job) => (
          <li key={job.id}>
            <button type="button">{job.title}</button>
          </li>
        ))}
      </Box>
    </Box>
  ),
  play: async ({ canvasElement }) => {
    // Tab from the top reaches the bar's first control before any row.
    const bar = barOf(canvasElement)
    await userEvent.tab()
    await expect(bar.contains(canvasElement.ownerDocument.activeElement)).toBe(true)
  },
}
