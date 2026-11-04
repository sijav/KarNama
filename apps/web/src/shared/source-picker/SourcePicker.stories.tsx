import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { elevation, semantic, type SemanticToken } from '../../theme/tokens'
import { quoted } from '../quoted'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { SourcePicker, type SourcePickerProps } from './SourcePicker'

// The reader's sources, the common ones, and what each language types.
const FA = fixtures('fa-IR').sourcePicker
const EN = fixtures('en-US').sourcePicker
const [FIRST, SECOND] = FA.own
if (!FIRST || !SECOND) throw new Error('the story fixtures hold fewer than two of the reader’s sources')

// The frames' 240, and room above for the menu, which opens upward: its 256 and
// the 4 between, and a little more.
const WIDTH = 240
const ROOM = 280

// The field as the add form holds it: the form keeps what is chosen and hears
// of it, and a source chosen by hand is no longer the link's.
const InAForm = ({ value: initial, autoFilled: filled, onChange, ...args }: SourcePickerProps) => {
  const [value, setValue] = useState(initial)
  const [autoFilled, setAutoFilled] = useState(filled)
  return (
    <Box sx={{ width: WIDTH, paddingTop: `${ROOM}px` }}>
      <SourcePicker
        {...args}
        value={value}
        autoFilled={autoFilled}
        onChange={(name) => {
          setValue(name)
          setAutoFilled(false)
          onChange(name)
        }}
      />
    </Box>
  )
}

const meta = {
  title: 'Shared/SourcePicker',
  component: SourcePicker,
  args: { value: FIRST.name, own: FA.own, common: FA.common, autoFilled: true, onChange: fn() },
  // The sources are the reader's and every play reads them, so only the hint is
  // a control.
  parameters: { controls: { include: ['autoFilled'] } },
  render: (args) => <InAForm {...args} />,
} satisfies StoryMeta<typeof SourcePicker>

export default meta
type Story = StoryObj<typeof meta>

type Palette = Record<SemanticToken, string>
const px = (value: string) => Number.parseFloat(value) || 0

// A colour or a shadow as the browser computes it, borrowed on the canvas's own
// inline style, which no transition moves, and put back in the same tick. Never
// inside waitFor, KN-014.
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

// The runner's own pointer, which only the runner has; outside it the story
// shows the field at rest.
const pointAt = async (element: HTMLElement) => {
  if (!('__KARNAMA_STORY_TEST__' in globalThis)) return false
  await (await import('vitest/browser')).userEvent.hover(element)
  return true
}

const fieldOf = (canvasElement: HTMLElement, locale: Locale) => {
  const combobox = within(canvasElement).getByRole('combobox', { name: i18nFor(locale)._('Source') })
  const field = combobox.parentElement
  if (!field) throw new Error('the combobox has no field')
  return { combobox, field }
}

// What every variant of 1223:96580 draws round its value: «منبع», 12 on 19 at
// Medium in text/primary, 4 above the field; the field 240 by 44 at radius 8, 16
// in and 8 between, bg/surface inside one pixel of border/control; the 20
// chevron in text/secondary 16 from the inline end; the value Body in
// text/primary, or the placeholder in text/secondary; and, when the link filled
// it, the hint 4 under the field, Label in text/secondary.
const isTheField = async (canvasElement: HTMLElement, locale: Locale, palette: Palette, value: string, hint: boolean) => {
  const i18n = i18nFor(locale)
  const rtl = locale === 'fa-IR'
  const { combobox, field } = fieldOf(canvasElement, locale)
  const label = within(canvasElement).getByText(i18n._('Source'))
  const labelStyle = getComputedStyle(label)
  await expect([px(labelStyle.fontSize), px(labelStyle.lineHeight), Number(labelStyle.fontWeight), px(labelStyle.letterSpacing)]).toEqual([
    12, 19, 500, 0,
  ])
  await expect(labelStyle.color).toBe(computed(canvasElement, palette['text/primary']))
  const box = field.getBoundingClientRect()
  await expect([box.width, box.height]).toEqual([240, 44])
  await expect(Math.round(box.top - label.getBoundingClientRect().bottom)).toBe(4)
  const style = getComputedStyle(field)
  await expect([px(style.paddingInlineStart), px(style.paddingInlineEnd), px(style.columnGap), px(style.borderTopLeftRadius)]).toEqual([
    16, 16, 8, 8,
  ])
  await expect(style.backgroundColor).toBe(computed(canvasElement, palette['bg/surface']))
  const edge = getComputedStyle(field, '::before')
  await expect([px(edge.borderTopWidth), edge.borderTopColor]).toEqual([1, computed(canvasElement, palette['border/control'])])
  const chevron = field.querySelector('svg')
  if (!chevron) throw new Error('no chevron')
  const chevronBox = chevron.getBoundingClientRect()
  await expect([chevronBox.width, chevronBox.height]).toEqual([20, 20])
  await expect(Math.round(rtl ? chevronBox.left - box.left : box.right - chevronBox.right)).toBe(16)
  await expect(getComputedStyle(chevron).color).toBe(computed(canvasElement, palette['text/secondary']))
  const text = getComputedStyle(combobox)
  await expect([px(text.fontSize), px(text.lineHeight), Number(text.fontWeight)]).toEqual([14, 22, 400])
  if (value === '') {
    await expect(combobox).toHaveValue('')
    await expect(combobox).toHaveAttribute('placeholder', i18n._('Choose or type a source'))
    await expect(getComputedStyle(combobox, '::placeholder').color).toBe(computed(canvasElement, palette['text/secondary']))
  } else {
    await expect(combobox).toHaveValue(value)
    await expect(text.color).toBe(computed(canvasElement, palette['text/primary']))
  }
  const hinted = within(canvasElement).queryByText(i18n._('Filled in from the posting link.'))
  if (!hint) await expect(hinted).toBeNull()
  else {
    if (!hinted) throw new Error('no hint')
    const hintStyle = getComputedStyle(hinted)
    await expect([px(hintStyle.fontSize), px(hintStyle.lineHeight), Number(hintStyle.fontWeight), px(hintStyle.letterSpacing)]).toEqual([
      12, 16, 500, 0.2,
    ])
    await expect(hintStyle.color).toBe(computed(canvasElement, palette['text/secondary']))
    await expect(Math.round(hinted.getBoundingClientRect().top - box.bottom)).toBe(4)
  }
  return { combobox, field }
}

// What the menu draws, Open 1223:96591 and Typing 1223:96635: 4 above the field
// and as wide, bg/surface inside one pixel of border/default at radius 8, 4
// above and below its rows, elevation.optionsMenu; its headers 24 tall, 12 and 4
// in, Label in text/secondary; its Option Rows 40 tall, the chosen one on
// bg/brand/container in text/brand with its 16 check; a divider of
// border/default before the create row, 38 tall, its 16 plus in text/brand
// leading «ساختن منبع «…»» in Body; and the field's edge one and a half of
// border/focus while it is open.
interface MenuFrame {
  height: number
  headers: readonly string[]
  rows: readonly string[]
  chosen: string | null
  create: string | null
}
const isTheMenu = async (canvasElement: HTMLElement, locale: Locale, palette: Palette, frame: MenuFrame) => {
  const rtl = locale === 'fa-IR'
  const { field } = fieldOf(canvasElement, locale)
  const listbox = within(canvasElement).getByRole('listbox')
  const panel = listbox.parentElement
  if (!panel) throw new Error('the listbox has no panel')
  const box = panel.getBoundingClientRect()
  const fieldBox = field.getBoundingClientRect()
  await expect([box.width, Math.round(fieldBox.top - box.bottom), box.height]).toEqual([240, 4, frame.height])
  const style = getComputedStyle(panel)
  await expect([px(style.paddingTop), px(style.paddingBottom), px(style.borderTopLeftRadius), px(style.outlineWidth)]).toEqual([4, 4, 8, 1])
  await expect([style.backgroundColor, style.outlineColor]).toEqual([
    computed(canvasElement, palette['bg/surface']),
    computed(canvasElement, palette['border/default']),
  ])
  await expect(style.boxShadow).toBe(shadowOf(canvasElement, elevation.optionsMenu))
  // The field's edge while open: one and a half of border/focus, inside.
  const edge = getComputedStyle(field).boxShadow
  await expect([edge.startsWith(computed(canvasElement, palette['border/focus'])), edge.endsWith('inset'), lengthsOf(edge)]).toEqual([
    true,
    true,
    [0, 0, 0, 1.5],
  ])
  const groups = within(listbox).queryAllByRole('group')
  await expect(groups.map((group) => group.querySelector('[role="presentation"]')?.textContent)).toEqual(frame.headers)
  for (const group of groups) {
    const header = group.querySelector('[role="presentation"]')
    if (!(header instanceof HTMLElement)) throw new Error('a group has no header')
    const headerStyle = getComputedStyle(header)
    await expect([header.getBoundingClientRect().height, px(headerStyle.paddingInlineStart), px(headerStyle.paddingTop)]).toEqual([
      24, 12, 4,
    ])
    await expect(headerStyle.color).toBe(computed(canvasElement, palette['text/secondary']))
    await expect(group).toHaveAccessibleName(header.textContent)
  }
  const options = within(listbox).getAllByRole('option')
  await expect(options.map((option) => option.textContent)).toEqual([...frame.rows, ...(frame.create === null ? [] : [frame.create])])
  for (const option of options.slice(0, frame.rows.length)) {
    const chosen = option.textContent === frame.chosen
    await expect(option.getBoundingClientRect().height).toBe(40)
    await expect(option).toHaveAttribute('aria-selected', String(chosen))
    await expect(option.querySelector('svg') !== null).toBe(chosen)
    if (chosen) {
      await waitFor(() => expect(getComputedStyle(option).backgroundColor).toBe(computed(canvasElement, palette['bg/brand/container'])))
      await expect(getComputedStyle(option).color).toBe(computed(canvasElement, palette['text/brand']))
    }
  }
  const create = options.at(-1)
  if (frame.create !== null && create) {
    await expect(create.getBoundingClientRect().height).toBe(38)
    await expect(getComputedStyle(create).color).toBe(computed(canvasElement, palette['text/brand']))
    const plus = create.querySelector('svg')
    const words = create.querySelector('span')
    if (!plus || !words) throw new Error('the create row has no plus or words')
    await expect(plus.getBoundingClientRect().width).toBe(16)
    // The plus leads the words from the inline start.
    const [plusBox, wordsBox] = [plus.getBoundingClientRect(), words.getBoundingClientRect()]
    await expect(Math.round(rtl ? plusBox.left - wordsBox.right : wordsBox.left - plusBox.right)).toBe(8)
    const divider = create.previousElementSibling
    if (frame.headers.length > 0) {
      if (!(divider instanceof HTMLElement)) throw new Error('no divider before the create row')
      await expect(divider.getBoundingClientRect().height).toBe(1)
      await expect(getComputedStyle(divider).backgroundColor).toBe(computed(canvasElement, palette['border/default']))
    }
  }
  return { listbox, options }
}

// The lengths a computed shadow is made of, in pixels.
const lengthsOf = (shadow: string) => [...shadow.matchAll(/(-?[\d.]+)px/gu)].map((match) => Number(match[1]))

// Opens the menu with a press on the field, which selects what it shows, so
// what is typed next takes its place.
const openIt = async (canvasElement: HTMLElement, locale: Locale) => {
  const { combobox } = fieldOf(canvasElement, locale)
  await userEvent.click(combobox)
  await expect(combobox).toHaveAttribute('aria-expanded', 'true')
  return combobox
}

const createRow = (locale: Locale, name: string) => {
  const i18n = i18nFor(locale)
  return `${i18n._('Create the source')} ${quoted(i18n, name)}`
}

export const Default: Story = {
  // State=Default with Auto Hint, 1223:96581: filled from the link.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const { combobox } = await isTheField(canvasElement, 'fa-IR', semantic, FIRST.name, true)
    await expect(combobox).toHaveAttribute('aria-expanded', 'false')
    await expect(within(canvasElement).queryByRole('listbox')).toBeNull()
  },
}

export const Empty: Story = {
  // State=Empty, 1223:96673: «انتخاب یا نوشتن منبع», and no hint.
  args: { value: '', autoFilled: false },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await isTheField(canvasElement, 'fa-IR', semantic, '', false)
  },
}

export const Hover: Story = {
  // State=Hover, 1223:96599: the edge text/secondary under the pointer.
  args: { autoFilled: false },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const { field } = fieldOf(canvasElement, 'fa-IR')
    if (!(await pointAt(field))) return
    await waitFor(() =>
      expect(getComputedStyle(field, '::before').borderTopColor).toBe(computed(canvasElement, semantic['text/secondary'])),
    )
  },
}

export const Open: Story = {
  // State=Open, 1223:96586: «منبع‌های شما» and «منبع‌های رایج», the chosen source
  // checked, the menu 256 tall over the field, no row picked out; a second press
  // keeps it open, and Enter with nothing typed only closes it.
  args: { autoFilled: false },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const combobox = await openIt(canvasElement, 'fa-IR')
    const { options } = await isTheMenu(canvasElement, 'fa-IR', semantic, {
      height: 256,
      headers: [i18n._('Your sources'), i18n._('Common sources')],
      rows: [...FA.own, ...FA.common].map((source) => source.name),
      chosen: FIRST.name,
      create: null,
    })
    await expect(options.every((option) => getComputedStyle(option, '::after').content === 'none')).toBe(true)
    await expect(combobox).not.toHaveAttribute('aria-activedescendant')
    await userEvent.click(combobox)
    await expect(combobox).toHaveAttribute('aria-expanded', 'true')
    await userEvent.keyboard('{Enter}')
    await expect(combobox).toHaveAttribute('aria-expanded', 'false')
    await expect(args.onChange).not.toHaveBeenCalled()
  },
}

export const Typing: Story = {
  // State=Typing, 1223:96630: a name one letter from one of the reader's offers
  // it under «منظور شما این بود؟», then the divider and «ساختن منبع «…»».
  args: { value: '', autoFilled: false },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const combobox = await openIt(canvasElement, 'fa-IR')
    await userEvent.keyboard(FA.near)
    await expect(combobox).toHaveValue(FA.near)
    await isTheMenu(canvasElement, 'fa-IR', semantic, {
      height: 111,
      headers: [i18n._('Did you mean?')],
      rows: [FIRST.name],
      chosen: null,
      create: createRow('fa-IR', FA.near),
    })
  },
}

export const Choosing: Story = {
  // A press on a source chooses it and closes the menu; the hint goes, since
  // the source is no longer the link's.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const combobox = await openIt(canvasElement, 'fa-IR')
    await userEvent.click(within(within(canvasElement).getByRole('listbox')).getByRole('option', { name: SECOND.name }))
    await expect(args.onChange).toHaveBeenCalledWith(SECOND.name)
    await expect(within(canvasElement).queryByRole('listbox')).toBeNull()
    await expect(combobox).toHaveValue(SECOND.name)
    await expect(combobox).toHaveFocus()
    const i18n = i18nFor('fa-IR')
    await expect(within(canvasElement).queryByText(i18n._('Filled in from the posting link.'))).toBeNull()
  },
}

export const Creating: Story = {
  // A name nobody has yet offers only its making, with no divider over it, and
  // Enter makes it the source.
  args: { autoFilled: false },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const combobox = await openIt(canvasElement, 'fa-IR')
    await userEvent.keyboard(FA.newName)
    await isTheMenu(canvasElement, 'fa-IR', semantic, {
      height: 4 + 38 + 4,
      headers: [],
      rows: [],
      chosen: null,
      create: createRow('fa-IR', FA.newName),
    })
    await userEvent.keyboard('{Enter}')
    await expect(args.onChange).toHaveBeenCalledWith(FA.newName)
    await expect(combobox).toHaveValue(FA.newName)
  },
}

export const QuietNormalisation: Story = {
  // The reader's source typed with the Arabic yeh is that source: it is offered
  // under its header with nothing to make, and Enter keeps its one spelling.
  args: { autoFilled: false },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    await openIt(canvasElement, 'fa-IR')
    await userEvent.keyboard(FA.folded)
    await isTheMenu(canvasElement, 'fa-IR', semantic, {
      height: 4 + 24 + 40 + 4,
      headers: [i18n._('Your sources')],
      rows: [FIRST.name],
      chosen: FIRST.name,
      create: null,
    })
    await userEvent.keyboard('{Enter}')
    await expect(args.onChange).toHaveBeenCalledWith(FIRST.name)
  },
}

export const TheOtherName: Story = {
  // A common source typed by its English name is that source, under «منبع‌های رایج».
  args: { value: '', autoFilled: false },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const [common] = FA.common
    if (!common) throw new Error('the fixtures hold no common source')
    await openIt(canvasElement, 'fa-IR')
    await userEvent.keyboard(FA.otherName)
    await isTheMenu(canvasElement, 'fa-IR', semantic, {
      height: 4 + 24 + 40 + 4,
      headers: [i18n._('Common sources')],
      rows: [common.name],
      chosen: null,
      create: null,
    })
    await userEvent.keyboard('{Enter}')
    await expect(args.onChange).toHaveBeenCalledWith(common.name)
  },
}

export const Keyboard: Story = {
  // Tab focuses the field with two pixels of border/focus and leaves it shut;
  // an arrow opens it on the chosen source, the arrows move and say where, and
  // Escape shuts it again, nothing chosen and focus kept; then up from no row
  // is the last, and Enter chooses it.
  args: { autoFilled: false },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const { combobox, field } = fieldOf(canvasElement, 'fa-IR')
    await userEvent.tab()
    await expect(combobox).toHaveFocus()
    await expect(combobox).toHaveAttribute('aria-expanded', 'false')
    const focused = getComputedStyle(field, '::before')
    await expect([px(focused.borderTopWidth), focused.borderTopColor]).toEqual([2, computed(canvasElement, semantic['border/focus'])])
    const activeName = () => canvasElement.ownerDocument.getElementById(combobox.getAttribute('aria-activedescendant') ?? '')?.textContent
    await userEvent.keyboard('{ArrowDown}')
    await expect(combobox).toHaveAttribute('aria-expanded', 'true')
    await expect(activeName()).toBe(FIRST.name)
    await userEvent.keyboard('{ArrowDown}')
    await expect(activeName()).toBe(SECOND.name)
    await userEvent.keyboard('{ArrowUp}')
    await expect(activeName()).toBe(FIRST.name)
    await userEvent.keyboard('{Escape}')
    await expect(combobox).toHaveAttribute('aria-expanded', 'false')
    await expect(combobox).toHaveFocus()
    await expect(combobox).toHaveValue(FIRST.name)
    await expect(args.onChange).not.toHaveBeenCalled()
    // A press opens it on no row; up is then the last, in the keyboard's ring,
    // three inside, and Enter chooses it.
    const last = FA.common.at(-1)
    if (!last) throw new Error('the fixtures hold no common source')
    await userEvent.click(combobox)
    await expect(combobox).not.toHaveAttribute('aria-activedescendant')
    await userEvent.keyboard('{ArrowUp}')
    await expect(activeName()).toBe(last.name)
    const row = canvasElement.ownerDocument.getElementById(combobox.getAttribute('aria-activedescendant') ?? '')
    if (!row) throw new Error('no row under the keyboard')
    await expect(px(getComputedStyle(row, '::after').borderTopWidth)).toBe(3)
    await userEvent.keyboard('{Enter}')
    await expect(args.onChange).toHaveBeenCalledWith(last.name)
  },
}

export const LeavingPutsItBack: Story = {
  // What is typed and left unchosen goes when the field loses focus.
  args: { autoFilled: false },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const combobox = await openIt(canvasElement, 'fa-IR')
    await userEvent.keyboard(FA.near)
    await userEvent.tab()
    await expect(combobox).toHaveValue(FIRST.name)
    await expect(within(canvasElement).queryByRole('listbox')).toBeNull()
    await expect(args.onChange).not.toHaveBeenCalled()
  },
}

export const NothingToOfferYet: Story = {
  // A reader with no sources of their own and no common ones handed over: a
  // press opens nothing, and what is typed offers only its making.
  args: { value: '', own: [], common: [], autoFilled: false },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const { combobox } = fieldOf(canvasElement, 'fa-IR')
    await userEvent.click(combobox)
    await expect(combobox).toHaveAttribute('aria-expanded', 'false')
    await expect(within(canvasElement).queryByRole('listbox')).toBeNull()
    await userEvent.keyboard(FA.newName)
    await expect(combobox).toHaveAttribute('aria-expanded', 'true')
    await isTheMenu(canvasElement, 'fa-IR', semantic, {
      height: 4 + 38 + 4,
      headers: [],
      rows: [],
      chosen: null,
      create: createRow('fa-IR', FA.newName),
    })
    await userEvent.keyboard('{Enter}')
    await expect(args.onChange).toHaveBeenCalledWith(FA.newName)
  },
}

export const InEnglish: Story = {
  // Typing in English: a name one letter off, and its making.
  args: { value: EN.own[0]?.name ?? '', own: EN.own, common: EN.common, autoFilled: true },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const i18n = i18nFor('en-US')
    const [first] = EN.own
    if (!first) throw new Error('the English fixtures hold no source')
    await isTheField(canvasElement, 'en-US', semantic, first.name, true)
    await openIt(canvasElement, 'en-US')
    await userEvent.keyboard(EN.near)
    await isTheMenu(canvasElement, 'en-US', semantic, {
      height: 111,
      headers: [i18n._('Did you mean?')],
      rows: [first.name],
      chosen: first.name,
      create: createRow('en-US', EN.near),
    })
  },
}

export const Dark: Story = {
  // Open in the dark theme, in the theme's dark colours.
  args: { autoFilled: true },
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    await isTheField(canvasElement, 'fa-IR', darkSemantic, FIRST.name, true)
    await openIt(canvasElement, 'fa-IR')
    await isTheMenu(canvasElement, 'fa-IR', darkSemantic, {
      height: 256,
      headers: [i18n._('Your sources'), i18n._('Common sources')],
      rows: [...FA.own, ...FA.common].map((source) => source.name),
      chosen: FIRST.name,
      create: null,
    })
  },
}
