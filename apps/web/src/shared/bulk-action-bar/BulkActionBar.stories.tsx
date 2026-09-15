import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18n } from '../../i18n'
import { formatCount } from '../../i18n/formatCount'
import { elevation, semantic } from '../../theme/tokens'
import { ConfirmModal } from '../modal'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { BulkActionBar, type BulkActionBarProps, type BulkActionBarType } from './BulkActionBar'

const TYPES: readonly BulkActionBarType[] = ['jobs', 'contacts']
const CONTROLLED: (keyof BulkActionBarProps)[] = ['type', 'count']

// What a story's render is handed: the meta's args, which give every callback so the Actions
// panel records each, KN-207, with the story's own over them. A story of the network's type
// therefore still holds the job list's two callbacks, which the bar's own props refuse.
type Args =
  Extract<BulkActionBarProps, { type: 'jobs' }> | Omit<Extract<BulkActionBarProps, { type: 'contacts' }>, 'onChangeStatus' | 'onSelectAll'>

// The bar a caller could write for the type the args hold, KN-331: the job list's with all four
// callbacks, the network's with its own two. Every story draws its bar through this, so neither
// the Contacts story nor a reader who switches the type in Controls hands the bar what its props
// refuse, and Show code offers a call that compiles.
const barFor = (args: Args) =>
  args.type === 'jobs' ? (
    <BulkActionBar {...args} />
  ) : (
    <BulkActionBar type="contacts" count={args.count} onClear={args.onClear} onDelete={args.onDelete} />
  )

const meta = {
  title: 'Shared/BulkActionBar',
  component: BulkActionBar,
  args: { type: 'jobs', count: 2, onClear: fn(), onDelete: fn(), onChangeStatus: fn(), onSelectAll: fn() },
  argTypes: { type: { control: 'radio', options: TYPES }, count: { control: { type: 'number', min: 0, step: 1 } } },
  parameters: { controls: { include: CONTROLLED } },
  render: barFor,
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
    if (import.meta.env.MODE !== 'test') return false
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
      {barFor(args)}
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

export const ReachedFromInsideTheList: Story = {
  globals: { locale: 'fa-IR' },
  // The bar AFTER the list, which is what both screens actually render, and a
  // reader standing on a row in the middle of it.
  render: (args) => (
    <Box>
      <Box component="ul" sx={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {fixtures('fa-IR').jobs.map((job) => (
          <li key={job.id}>
            <button type="button">{job.title}</button>
          </li>
        ))}
      </Box>
      {barFor(args)}
    </Box>
  ),
  play: async ({ canvasElement }) => {
    // KN-330: a keyboard reader selects while standing ON a row, deep in the
    // list, so every forward Tab walks the rest of the cards before the bar.
    // The bar answers F6, and says so where a screen reader hears it.
    // The LIST's own rows: a query over the canvas would sweep in the bar's
    // actions, which are buttons too, and then "focus is not on a row" would be
    // true of the bar itself.
    const list = within(canvasElement).getByRole('list')
    const rows = within(list).getAllByRole('button')
    const middle = rows[2]
    if (!middle) throw new Error('the list has too few rows')
    middle.focus()
    await expect(middle).toHaveFocus()

    // The announcement names the key, at the moment the bar is there to reach.
    await expect(canvasElement.ownerDocument.body).toHaveTextContent('برای کارهای گروهی F6 را بزن')

    // The runner's own keyboard, KN-225. It shows what the bar does once the page
    // has a key, and nothing about the browser: the runner's Chromium is
    // headless, with no panes of its own to take F6 first. What a browser does
    // with F6 was measured apart, KN-469, and the docs record it: the page hears
    // F6 first, and a page that prevents its default keeps the focus.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const browser = await import('vitest/browser')
    const bar = barOf(canvasElement)
    // Whether each F6's default was prevented, read on the window, which hears a
    // key after the document, where the bar listens.
    const prevented: boolean[] = []
    const record = (event: KeyboardEvent) => {
      if (event.key === 'F6') prevented.push(event.defaultPrevented)
    }
    window.addEventListener('keydown', record)
    try {
      // Shift+F6 is how the browsers go back through their panes and frames, so
      // the bar leaves it alone: focus stays on the row, its default stands.
      await browser.userEvent.keyboard('{Shift>}{F6}{/Shift}')
      await expect(middle).toHaveFocus()

      // F6 brings the reader to the bar, its default prevented, which is what
      // keeps a browser from taking focus out of the page.
      await browser.userEvent.keyboard('{F6}')
      await waitFor(async () => {
        await expect(bar.contains(canvasElement.ownerDocument.activeElement)).toBe(true)
      })
      await expect(prevented).toEqual([false, true])
    } finally {
      window.removeEventListener('keydown', record)
    }

    // And it got there without walking the list: no row took focus on the way.
    await expect(rows.some((row) => row === canvasElement.ownerDocument.activeElement)).toBe(false)
    await expect(bar).toHaveAttribute('aria-keyshortcuts', 'F6')
  },
}

// A modal over a live selection, as a screen raises one from the bar, KN-470.
const OverAModal = (args: Args) => (
  <Box>
    {barFor(args)}
    <ConfirmModal
      open
      title={i18n._('Delete these job opportunities?')}
      body={i18n._('job opportunities are deleted for good and cannot be brought back.')}
      confirmLabel={i18n._('Delete')}
      onConfirm={() => undefined}
      onCancel={() => undefined}
    />
  </Box>
)

export const QuietWhileAModalIsOpen: Story = {
  globals: { locale: 'fa-IR' },
  // A fixed modal over the bar, so no control applies.
  parameters: { controls: { disable: true } },
  render: (args) => <OverAModal {...args} />,
  play: async ({ canvasElement }) => {
    // KN-470: a modal owns the page while it is up, so F6 there neither takes
    // focus to the bar behind the scrim nor keeps the key from the browser.
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog')
    const cancel = within(dialog).getByRole('button', { name: i18n._('Cancel') })
    await waitFor(async () => {
      await expect(cancel).toHaveFocus()
    })

    // The runner's own keyboard, as ReachedFromInsideTheList's, KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const browser = await import('vitest/browser')
    // By CSS, since the open modal hides the rest of the page from roles.
    const bar = canvasElement.querySelector('[aria-keyshortcuts]')
    if (!(bar instanceof HTMLElement)) throw new Error('the bar is not in the page')
    // What inside the bar took focus, and whether each F6 had its default
    // prevented, read on the window, which hears a key after the document.
    const reached: EventTarget[] = []
    const took = (event: FocusEvent) => {
      if (event.target) reached.push(event.target)
    }
    const prevented: boolean[] = []
    const record = (event: KeyboardEvent) => {
      if (event.key === 'F6') prevented.push(event.defaultPrevented)
    }
    bar.addEventListener('focusin', took)
    window.addEventListener('keydown', record)
    try {
      await browser.userEvent.keyboard('{F6}')
      await expect(prevented).toEqual([false])
      await expect(reached).toEqual([])
      await expect(cancel).toHaveFocus()
    } finally {
      bar.removeEventListener('focusin', took)
      window.removeEventListener('keydown', record)
    }
  },
}
