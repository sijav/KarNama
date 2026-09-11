import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18n } from '../../i18n'
import { elevation, semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { SORT_ORDERS, sortLabels } from './orders'
import { SortControl, type SortControlProps } from './SortControl'

const CONTROLLED: (keyof SortControlProps)[] = ['value']

const meta = {
  title: 'Shared/SortControl',
  component: SortControl,
  args: { value: 'newest', onChange: fn() },
  argTypes: { value: { control: 'radio', options: SORT_ORDERS } },
  parameters: { controls: { include: CONTROLLED } },
} satisfies StoryMeta<typeof SortControl>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A token's value as the browser computes it, borrowed on the host's own
// inline style and put back in the same tick. Never inside waitFor, KN-014.
const computed = (host: HTMLElement, property: 'color' | 'boxShadow', value: string) => {
  const previous = host.style[property]
  host.style[property] = value
  const result = getComputedStyle(host)[property]
  host.style[property] = previous
  return result
}

// The control is the combobox's parent, MUI's input root, which carries the edge.
const controlOf = (canvasElement: HTMLElement) => {
  const combobox = within(canvasElement).getByRole('combobox')
  const control = combobox.parentElement
  if (!control) throw new Error('the combobox has no control round it')
  return { combobox, control }
}

// Where an element starts inside the control, from the inline start, and where
// it ends, from the inline end.
const insetsOf = (control: HTMLElement, element: Element) => {
  const outer = control.getBoundingClientRect()
  const inner = element.getBoundingClientRect()
  return getComputedStyle(control).direction === 'rtl'
    ? [outer.right - inner.right, inner.left - outer.left]
    : [inner.left - outer.left, outer.right - inner.right]
}

const rowsOf = (listbox: HTMLElement) => [...listbox.children].filter((row) => row instanceof HTMLLIElement)

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Node 408:495: 36 tall, radius md, one pixel of border/default and no
    // fill; the sort icon 12 in from the inline start, «مرتب‌سازی:» in
    // text/secondary, the order at 500 in text/primary, 8 apart, and the
    // chevron 12 in from the inline end, both icons 16 in text/secondary.
    const { combobox, control } = controlOf(canvasElement)
    const box = control.getBoundingClientRect()
    const style = getComputedStyle(control)
    await expect([box.height, px(style.borderTopLeftRadius), px(getComputedStyle(control, '::before').borderTopWidth)]).toEqual([36, 8, 1])
    await expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    // The sort icon is in the combobox; the chevron is MUI's, beside it.
    const sortIcon = combobox.querySelector('svg')
    const chevron = [...control.querySelectorAll('svg')].find((svg) => !combobox.contains(svg))
    if (!sortIcon || !chevron) throw new Error('an icon is missing')
    await expect([sortIcon.getBoundingClientRect().width, chevron.getBoundingClientRect().width]).toEqual([16, 16])
    await expect([Math.round(insetsOf(control, sortIcon)[0] ?? 0), Math.round(insetsOf(control, chevron)[1] ?? 0)]).toEqual([12, 12])
    const prefix = canvasElement.ownerDocument.getElementById(combobox.getAttribute('aria-labelledby') ?? '')
    const order = prefix?.nextElementSibling
    if (!prefix || !(order instanceof HTMLElement)) throw new Error('no prefix or order')
    await expect([prefix.textContent, order.textContent]).toEqual([i18n._('Sort:'), sortLabels(i18n)[args.value]])
    await expect([getComputedStyle(prefix).color, Number(getComputedStyle(prefix).fontWeight)]).toEqual([
      computed(prefix, 'color', semantic['text/secondary']),
      400,
    ])
    await expect([getComputedStyle(order).color, Number(getComputedStyle(order).fontWeight)]).toEqual([
      computed(order, 'color', semantic['text/primary']),
      500,
    ])
    await expect(Math.round(insetsOf(control, prefix)[0] ?? 0) - Math.round(insetsOf(control, sortIcon)[0] ?? 0) - 16).toBe(8)
    // Hover, 408:503: bg/surface-secondary, with the browser's own pointer,
    // which only the runner has, KN-225.
    if ('__KARNAMA_STORY_TEST__' in globalThis) {
      const browser = await import('vitest/browser')
      const hover = computed(control, 'color', semantic['bg/surface-secondary'])
      await browser.userEvent.hover(control)
      await waitFor(() => expect(getComputedStyle(control).backgroundColor).toBe(hover))
      await browser.userEvent.unhover(control)
    }
  },
}

export const Open: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Node 408:511: the hover fill and one and a half of border/focus; the
    // menu, 447:601, 240 wide and 6 below, offering the four orders and only
    // them, the current one checked.
    const { combobox, control } = controlOf(canvasElement)
    await userEvent.click(combobox)
    const listbox = await within(canvasElement.ownerDocument.body).findByRole('listbox')
    const paper = listbox.parentElement
    if (!paper) throw new Error('the listbox has no panel')
    const shadow = getComputedStyle(control).boxShadow
    await expect([shadow.startsWith(computed(control, 'color', semantic['border/focus'])), shadow.endsWith('inset')]).toEqual([true, true])
    await expect(getComputedStyle(control).backgroundColor).toBe(computed(control, 'color', semantic['bg/surface-secondary']))
    await expect(Math.round(paper.getBoundingClientRect().width)).toBe(240)
    await expect(Math.round(paper.getBoundingClientRect().top - control.getBoundingClientRect().bottom)).toBe(6)
    await expect(getComputedStyle(paper).boxShadow).toBe(computed(paper, 'boxShadow', elevation.optionsMenu))
    const labels = sortLabels(i18n)
    const rows = rowsOf(listbox)
    await expect(rows.map((row) => row.textContent)).toEqual(SORT_ORDERS.map((order) => labels[order]))
    await expect(rows.map((row) => row.getAttribute('aria-selected'))).toEqual(SORT_ORDERS.map((order) => String(order === args.value)))
    await userEvent.keyboard('{Escape}')
  },
}

export const ChangedByKeyboard: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // Arrows reach another order, Enter picks it, the menu closes with focus
    // back on the control, and the change is read out.
    const { combobox } = controlOf(canvasElement)
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}')
    await within(canvasElement.ownerDocument.body).findByRole('listbox')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Enter}')
    await expect(args.onChange).toHaveBeenCalledWith(SORT_ORDERS[1])
    await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('listbox')).toBeNull())
    await expect(combobox).toHaveFocus()
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent(`${i18n._('Sorted by')} ${sortLabels(i18n).oldest}`)
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US' },
  play: async ({ canvasElement }) => {
    // Left to right: the sort icon at the left, the chevron at the right.
    const { combobox, control } = controlOf(canvasElement)
    const sortIcon = combobox.querySelector('svg')
    if (!sortIcon) throw new Error('no sort icon')
    await expect(sortIcon.getBoundingClientRect().left - control.getBoundingClientRect().left).toBeLessThan(
      control.getBoundingClientRect().width / 2,
    )
  },
}
