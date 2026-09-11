import { setupI18n } from '@lingui/core'
import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import type { Locale } from '../../i18n'
import { messages as en } from '../../i18n/locales/en-US'
import { messages as fa } from '../../i18n/locales/fa-IR'
import { elevation, semantic } from '../../theme/tokens'
import { EMPLOYMENT_TYPES, employmentTypeLabels } from '../job-selects'
import type { StoryMeta } from '../story-docs/story-meta'
import { Select, type SelectProps } from './Select'

// The file's specimen, node 183:26: «نوع همکاری» and the employment types, its
// copy read from the catalog in the language a story pins, so the args hold
// what the canvas draws and the Controls show it.
const specimen = (locale: Locale): Pick<SelectProps, 'label' | 'options'> => {
  const i18n = setupI18n({ locale, messages: { [locale]: locale === 'fa-IR' ? fa : en } })
  const labels = employmentTypeLabels(i18n)
  return { label: i18n._('Employment type'), options: EMPLOYMENT_TYPES.map((type) => ({ value: type, label: labels[type] })) }
}
const FA = specimen('fa-IR')
const EN = specimen('en-US')

const CONTROLLED: (keyof SelectProps)[] = ['label', 'value', 'multiple', 'placeholder', 'disabled']

// The Select fills its container; the file's specimen is 240 wide, so the
// stories give it that, and the menu, as wide as the field, is 240 too.
const SPECIMEN_WIDTH = 240

const meta = {
  title: 'Shared/Select',
  component: Select,
  args: { ...FA, value: [], multiple: false, disabled: false, onChange: fn() },
  parameters: { controls: { include: CONTROLLED } },
  decorators: [
    (Story) => (
      <Box sx={{ width: SPECIMEN_WIDTH }}>
        <Story />
      </Box>
    ),
  ],
} satisfies StoryMeta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A token's colour as the browser computes it, borrowed on the host's own
// inline style and put back in the same tick. Never inside waitFor, KN-014.
const computed = (host: HTMLElement, property: 'color' | 'boxShadow', value: string) => {
  const previous = host.style[property]
  host.style[property] = value
  const result = getComputedStyle(host)[property]
  host.style[property] = previous
  return result
}

// The field is the combobox's parent, MUI's input root, which carries the edge.
const partsOf = (canvasElement: HTMLElement) => {
  const combobox = within(canvasElement).getByRole('combobox')
  const field = combobox.parentElement
  const chevron = field?.querySelector('svg')
  if (!field || !chevron) throw new Error('the select has no field or no chevron')
  return { combobox, field, chevron }
}

// Where an element starts and ends inside the field, from the inline start.
const insetsOf = (field: HTMLElement, element: Element) => {
  const outer = field.getBoundingClientRect()
  const inner = element.getBoundingClientRect()
  return getComputedStyle(field).direction === 'rtl'
    ? [outer.right - inner.right, inner.left - outer.left]
    : [inner.left - outer.left, outer.right - inner.right]
}

// Node 183:7 at rest: the label 12 on 16 at 500 in text/primary, 4 above a
// field 44 tall of radius md with one pixel of border/default inside it, the
// value 16 from the inline start and the chevron, 20 in text/secondary, 16
// from the inline end.
const atRest = async (canvasElement: HTMLElement, { colours }: { colours: boolean }) => {
  const { combobox, field, chevron } = partsOf(canvasElement)
  const label = canvasElement.ownerDocument.getElementById(combobox.getAttribute('aria-labelledby') ?? '')
  if (!label) throw new Error('the combobox is not labelled by an element')
  const labelStyle = getComputedStyle(label)
  await expect([px(labelStyle.fontSize), px(labelStyle.lineHeight), Number(labelStyle.fontWeight)]).toEqual([12, 16, 500])
  await expect(Math.round(field.getBoundingClientRect().top - label.getBoundingClientRect().bottom)).toBe(4)
  const box = field.getBoundingClientRect()
  await expect([box.height, px(getComputedStyle(field).borderTopLeftRadius)]).toEqual([44, 8])
  await expect(px(getComputedStyle(field, '::before').borderTopWidth)).toBe(1)
  await expect(chevron.getBoundingClientRect().width).toBe(20)
  const [start] = insetsOf(field, combobox)
  const [, chevronEnd] = insetsOf(field, chevron)
  await expect([Math.round(start ?? 0), Math.round(chevronEnd ?? 0)]).toEqual([16, 16])
  if (colours) {
    await expect(labelStyle.color).toBe(computed(label, 'color', semantic['text/primary']))
    await expect(getComputedStyle(field, '::before').borderTopColor).toBe(computed(field, 'color', semantic['border/default']))
    await expect(getComputedStyle(chevron).color).toBe(computed(field, 'color', semantic['text/secondary']))
  }
  return { combobox, field, chevron }
}

// The listbox MUI draws in a portal at the end of the page, and its options,
// which are its list items.
const listboxOf = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body).findByRole('listbox')
const rowsOf = (listbox: HTMLElement) => [...listbox.children].filter((row) => row instanceof HTMLLIElement)

// The lengths in a computed shadow, in the order the browser writes them.
const lengthsOf = (shadow: string) => (shadow.match(/-?[\d.]+(?=px)/g) ?? []).map(Number)

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // Nothing chosen: the placeholder «انتخاب کنید…» in text/secondary.
    const { combobox } = await atRest(canvasElement, { colours: true })
    const shown = combobox.firstElementChild
    if (!(shown instanceof HTMLElement)) throw new Error('no placeholder')
    await expect(shown.textContent).toBe(fa['Choose…'])
    await expect(getComputedStyle(shown).color).toBe(computed(shown, 'color', semantic['text/secondary']))
  },
}

export const Filled: Story = {
  args: { value: ['full-time'] },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Node 183:13: the chosen option's name in text/primary.
    const { combobox } = await atRest(canvasElement, { colours: true })
    await expect(combobox).toHaveTextContent(args.options.find((option) => option.value === 'full-time')?.label ?? 'missing')
    await expect(getComputedStyle(combobox).color).toBe(computed(combobox, 'color', semantic['text/primary']))
  },
}

export const Focused: Story = {
  args: { value: ['full-time'] },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // Node 183:19: focused by the keyboard, two pixels of border/focus inside.
    const { combobox, field } = partsOf(canvasElement)
    await userEvent.tab()
    await expect(combobox).toHaveFocus()
    const edge = getComputedStyle(field, '::before')
    await expect([px(edge.borderTopWidth), edge.borderTopColor]).toEqual([2, computed(field, 'color', semantic['border/focus'])])
  },
}

export const Disabled: Story = {
  args: { disabled: true },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // Node 183:25: bg/surface-secondary, the placeholder and chevron in
    // text/disabled.
    const { combobox, field, chevron } = await atRest(canvasElement, { colours: false })
    await expect(getComputedStyle(field).backgroundColor).toBe(computed(field, 'color', semantic['bg/surface-secondary']))
    await expect(getComputedStyle(chevron).color).toBe(computed(field, 'color', semantic['text/disabled']))
    // Out of the tab order, and announced as unavailable.
    await expect(combobox).toHaveAttribute('aria-disabled', 'true')
    await expect(combobox).not.toHaveAttribute('tabindex')
  },
}

export const Open: Story = {
  args: {
    value: ['full-time'],
    // A disabled option, to show 408:464 beside the others.
    options: FA.options.map((option) => (option.value === 'temporary' ? { ...option, disabled: true } : option)),
  },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const { combobox, field } = partsOf(canvasElement)
    await userEvent.click(combobox)
    const listbox = await listboxOf(canvasElement)
    const paper = listbox.parentElement
    if (!paper) throw new Error('the listbox has no menu round it')
    // Node 448:610: the field's edge one and a half of border/focus while open.
    const shadow = getComputedStyle(field).boxShadow
    await expect([
      shadow.startsWith(computed(field, 'color', semantic['border/focus'])),
      shadow.endsWith('inset'),
      lengthsOf(shadow),
    ]).toEqual([true, true, [0, 0, 0, 1.5]])
    // The menu, 408:487: 4 below the field and as wide, radius md, 4 above and
    // below its rows, its own shadow and an edge of border/default inside.
    const [fieldBox, paperBox] = [field.getBoundingClientRect(), paper.getBoundingClientRect()]
    await expect(Math.round(paperBox.top - fieldBox.bottom)).toBe(4)
    await expect(Math.round(paperBox.width)).toBe(Math.round(fieldBox.width))
    const paperStyle = getComputedStyle(paper)
    await expect([px(paperStyle.borderTopLeftRadius), px(getComputedStyle(listbox).paddingTop)]).toEqual([8, 4])
    await expect(paperStyle.boxShadow).toBe(computed(paper, 'boxShadow', elevation.optionsMenu))
    await expect([paperStyle.outlineStyle, px(paperStyle.outlineWidth), px(paperStyle.outlineOffset)]).toEqual(['solid', 1, -1])
    // The rows, 408:465: 40 tall, 14 on 22 at 500. Selected in
    // bg/brand/container and text/brand with the check at the inline end;
    // disabled in text/disabled; the rest text/primary.
    const rows = rowsOf(listbox)
    await expect(rows).toHaveLength(8)
    for (const row of rows) {
      const style = getComputedStyle(row)
      await expect([row.getBoundingClientRect().height, px(style.fontSize), px(style.lineHeight), Number(style.fontWeight)]).toEqual([
        40, 14, 22, 500,
      ])
    }
    const [selected] = rows
    if (!selected) throw new Error('no rows')
    await expect(selected).toHaveAttribute('aria-selected', 'true')
    await expect([getComputedStyle(selected).backgroundColor, getComputedStyle(selected).color]).toEqual([
      computed(selected, 'color', semantic['bg/brand/container']),
      computed(selected, 'color', semantic['text/brand']),
    ])
    const check = selected.querySelector('svg')
    if (!check) throw new Error('the selected row has no check')
    await expect(check.getBoundingClientRect().width).toBe(16)
    const [, checkEnd] = insetsOf(selected, check)
    await expect(Math.round(checkEnd ?? 0)).toBe(12)
    const disabled = rows.at(-1)
    if (!disabled) throw new Error('no last row')
    await expect(disabled).toHaveAttribute('aria-disabled', 'true')
    await expect(getComputedStyle(disabled).color).toBe(computed(disabled, 'color', semantic['text/disabled']))
    // Hover, 408:454: bg/surface-secondary. It needs the browser's own
    // pointer, which only the runner has, KN-225; MUI eases the fill, so its
    // end is waited for.
    const [, other] = rows
    if (!other) throw new Error('no second row')
    if ('__KARNAMA_STORY_TEST__' in globalThis) {
      const browser = await import('vitest/browser')
      const hover = computed(other, 'color', semantic['bg/surface-secondary'])
      await browser.userEvent.hover(other)
      await waitFor(() => expect(getComputedStyle(other).backgroundColor).toBe(hover))
    }
    await userEvent.keyboard('{Escape}')
  },
}

export const ByKeyboard: Story = {
  args: { value: ['full-time'] },
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // Arrows, Home, End and type-ahead move through the options; Enter picks
    // one and closes; Escape and Tab close; each time focus goes back to the
    // field.
    const { combobox } = partsOf(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    const active = () => canvasElement.ownerDocument.activeElement
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}')
    const listbox = await listboxOf(canvasElement)
    const rows = rowsOf(listbox)
    // The chosen option takes focus when the list opens.
    await waitFor(() => expect(active()).toBe(rows[0]))
    await userEvent.keyboard('{ArrowDown}')
    await expect(active()).toBe(rows[1])
    await userEvent.keyboard('{End}')
    await expect(active()).toBe(rows.at(-1))
    await userEvent.keyboard('{Home}')
    await expect(active()).toBe(rows[0])
    // Type-ahead: the first letter of «دورکاری» reaches it.
    const remote = rows.find((row) => row.textContent === args.options.find((option) => option.value === 'remote')?.label)
    if (!remote) throw new Error('no remote option')
    await userEvent.keyboard(remote.textContent.charAt(0))
    await expect(active()).toBe(remote)
    await userEvent.keyboard('{Enter}')
    await expect(args.onChange).toHaveBeenLastCalledWith(['remote'])
    await waitFor(() => expect(body.queryByRole('listbox')).toBeNull())
    await expect(combobox).toHaveFocus()
    // Escape closes without choosing.
    await userEvent.keyboard('{ArrowDown}')
    await listboxOf(canvasElement)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(body.queryByRole('listbox')).toBeNull())
    await expect(combobox).toHaveFocus()
    // Tab closes too, and focus stays with the field rather than leaving the
    // page behind the menu.
    await userEvent.keyboard('{ArrowDown}')
    await listboxOf(canvasElement)
    await userEvent.tab()
    await waitFor(() => expect(body.queryByRole('listbox')).toBeNull())
    await expect(combobox).toHaveFocus()
    await expect(args.onChange).toHaveBeenCalledTimes(1)
  },
}

export const Multiple: Story = {
  args: { value: ['full-time', 'remote'], multiple: true },
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // More than one, as the employment type holds: the names listed in the
    // reader's way, each chosen row checked, and the menu open for the next.
    const { combobox } = partsOf(canvasElement)
    const names = args.value.map((value) => args.options.find((option) => option.value === value)?.label ?? value)
    await expect(combobox).toHaveTextContent(new Intl.ListFormat('fa-IR', { style: 'short', type: 'unit' }).format(names))
    await userEvent.click(combobox)
    const listbox = await listboxOf(canvasElement)
    await expect(listbox).toHaveAttribute('aria-multiselectable', 'true')
    const checked = rowsOf(listbox).filter((row) => row.getAttribute('aria-selected') === 'true')
    await expect(checked.map((row) => row.textContent)).toEqual(names)
    await userEvent.click(rowsOf(listbox)[1] ?? listbox)
    await expect(args.onChange).toHaveBeenLastCalledWith([...args.value, EMPLOYMENT_TYPES[1]])
    await expect(within(canvasElement.ownerDocument.body).getByRole('listbox')).toBeVisible()
    await userEvent.keyboard('{Escape}')
  },
}

export const InEnglish: Story = {
  args: { ...EN, value: ['full-time'] },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // Left to right: the value from the left, the chevron at the right.
    const { chevron, field } = await atRest(canvasElement, { colours: true })
    await expect(chevron.getBoundingClientRect().left).toBeGreaterThan(
      field.getBoundingClientRect().left + field.getBoundingClientRect().width / 2,
    )
  },
}
