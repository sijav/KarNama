import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { elevation, semantic, type SemanticToken } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { LabelPicker, type LabelPickerProps } from './LabelPicker'
import type { DefaultLabel, PersonLabel } from './labels'

// The person modal's field, 512 wide.
const WIDTH = 512
// The reader's own labels and what each language types to find them.
const FA = fixtures('fa-IR').labelPicker
const EN = fixtures('en-US').labelPicker
const RECRUITMENT: DefaultLabel = 'recruitment'
const ACQUAINTANCE: DefaultLabel = 'acquaintance'
// The reader's first label, which the menu's stories manage.
const CLASSMATE = FA.labels[0]?.name ?? ''

// The field as the person modal holds it: its own state keeps the chosen label
// and the reader's labels, as the network does, and hands each act to its spy.
const InAModal = ({ value: initial, labels: given, onChange, onCreate, onRename, onDelete }: LabelPickerProps) => {
  const [value, setValue] = useState(initial)
  const [labels, setLabels] = useState<readonly PersonLabel[]>(given)
  return (
    <Box sx={{ width: WIDTH, minHeight: 360 }}>
      <LabelPicker
        value={value}
        labels={labels}
        onChange={(id) => {
          setValue(id)
          onChange(id)
        }}
        onCreate={(name) => {
          const id = `own-${String(labels.length + 1)}`
          setLabels([...labels, { id, name, people: 0 }])
          setValue(id)
          onCreate(name)
        }}
        onRename={(id, name) => {
          setLabels(labels.map((label) => (label.id === id ? { ...label, name } : label)))
          onRename(id, name)
        }}
        onDelete={(id) => {
          setLabels(labels.filter((label) => label.id !== id))
          if (value === id) setValue(null)
          onDelete(id)
        }}
      />
    </Box>
  )
}

const meta = {
  title: 'Shared/LabelPicker',
  component: LabelPicker,
  args: { value: null, labels: FA.labels, onChange: fn(), onCreate: fn(), onRename: fn(), onDelete: fn() },
  // The labels are the reader's and every play reads them, so a control
  // changing one would fail a play nothing broke.
  parameters: { controls: { disable: true } },
  render: (args) => <InAModal {...args} />,
} satisfies StoryMeta<typeof LabelPicker>

export default meta
type Story = StoryObj<typeof meta>

type Palette = Record<SemanticToken, string>
type Clear = 'rgba(0, 0, 0, 0)'
const CLEAR: Clear = 'rgba(0, 0, 0, 0)'
const px = (value: string) => Number.parseFloat(value) || 0

// A colour or a shadow as the browser computes it, borrowed on the canvas's own
// inline style, which no transition moves, and put back in the same tick.
// Never inside waitFor, KN-014.
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

// The four defaults in reading order, then Add.
const defaultsIn = (locale: Locale) => {
  const i18n = i18nFor(locale)
  return [i18n._('Acquaintance'), i18n._('Former colleague'), i18n._('Recruitment specialist'), i18n._('Interviewer')]
}
const groupIn = (canvasElement: HTMLElement) => within(canvasElement).getByRole('group')

// Node 1086:3004 at rest: «برچسب», Label at Medium in text/primary, 8 above the
// choices, which wrap 8 apart from the inline start, the four defaults and then
// Add.
const isTheFrame = async (canvasElement: HTMLElement, locale: Locale, palette: Palette) => {
  const i18n = i18nFor(locale)
  const rtl = locale === 'fa-IR'
  const group = groupIn(canvasElement)
  await expect(group).toHaveAccessibleName(i18n._('Label'))
  const title = within(canvasElement).getByText(i18n._('Label'))
  const style = getComputedStyle(title)
  await expect([px(style.fontSize), px(style.lineHeight), Number(style.fontWeight)]).toEqual([12, 16, 500])
  await expect(style.color).toBe(computed(canvasElement, palette['text/primary']))
  await expect(Math.round(group.getBoundingClientRect().top - title.getBoundingClientRect().bottom)).toBe(8)
  const choices = within(group).getAllByRole('button')
  await expect(choices.map((choice) => choice.textContent)).toEqual([...defaultsIn(locale), i18n._('New label')])
  const boxes = choices.map((choice) => choice.getBoundingClientRect())
  const area = group.getBoundingClientRect()
  const [first] = boxes
  if (!first) throw new Error('no choices')
  await expect(Math.round(rtl ? area.right - first.right : first.left - area.left)).toBe(0)
  for (const [index, box] of boxes.slice(1).entries()) {
    const before = boxes[index]
    if (before?.top !== box.top) continue
    await expect(Math.round(rtl ? before.left - box.right : box.left - before.right)).toBe(8)
  }
  return group
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const group = await isTheFrame(canvasElement, 'fa-IR', semantic)
    for (const choice of within(group).getAllByRole('button', { pressed: false }))
      await expect(choice).toHaveAttribute('aria-pressed', 'false')
    await expect(within(group).queryByRole('button', { pressed: true })).toBeNull()
  },
}

export const Selected: Story = {
  args: { value: RECRUITMENT },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await isTheFrame(canvasElement, 'fa-IR', semantic)
    await expect(within(groupIn(canvasElement)).getByRole('button', { pressed: true })).toHaveTextContent('کارشناس جذب')
  },
}

export const ChoosingAndTakingOff: Story = {
  // A press chooses a label, and another takes it off, since it is optional.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const choice = within(groupIn(canvasElement)).getByRole('button', { name: 'آشنا' })
    await userEvent.click(choice)
    await expect(args.onChange).toHaveBeenLastCalledWith(ACQUAINTANCE)
    await expect(choice).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(choice)
    await expect(args.onChange).toHaveBeenLastCalledWith(null)
  },
}

// Starts a new label as a reader does: a press on «برچسب تازه» and the query typed.
const startTyping = async (canvasElement: HTMLElement, locale: Locale, query: string) => {
  const i18n = i18nFor(locale)
  await userEvent.click(within(groupIn(canvasElement)).getByRole('button', { name: i18n._('New label') }))
  const input = within(groupIn(canvasElement)).getByRole('combobox', { name: i18n._('New label') })
  await expect(input).toHaveFocus()
  if (query !== '') await userEvent.type(input, query)
  return input
}
const listIn = (canvasElement: HTMLElement) => within(canvasElement).getByRole('listbox')

// The suggestions as Typing draws them: 4 under the choices, 240 wide, 4 in, at
// radius 8, bg/surface inside border/default with their shadow; «برچسب‌های
// شما», the matching labels, 38 high, the first under the keyboard on
// bg/surface-secondary, a divider, and the create row in text/brand.
const isTheList = async (canvasElement: HTMLElement, palette: Palette, input: HTMLElement) => {
  const pill = input.parentElement
  if (!(pill instanceof HTMLElement)) throw new Error('no pill')
  const list = listIn(canvasElement)
  const panel = list.parentElement
  if (!(panel instanceof HTMLElement)) throw new Error('no panel')
  const style = getComputedStyle(panel)
  const box = panel.getBoundingClientRect()
  await expect([box.width, Math.round(box.top - pill.getBoundingClientRect().bottom)]).toEqual([240, 4])
  await expect([px(style.paddingTop), px(style.borderTopLeftRadius), px(style.borderTopWidth)]).toEqual([4, 8, 1])
  await expect(style.backgroundColor).toBe(computed(canvasElement, palette['bg/surface']))
  await expect(style.boxShadow).toBe(shadowOf(canvasElement, elevation.labelSuggestions))
  const options = within(list).getAllByRole('option')
  const [first] = options
  if (!first) throw new Error('no options')
  await expect(input).toHaveAttribute('aria-activedescendant', first.id)
  await expect(getComputedStyle(first).backgroundColor).toBe(computed(canvasElement, palette['bg/surface-secondary']))
  await expect(first.getBoundingClientRect().height).toBe(38)
  const second = options[1]
  if (second) await expect(getComputedStyle(second).backgroundColor).toBe(CLEAR)
  return { list, options }
}

export const Typing: Story = {
  // Add becomes the input, and what is typed finds the reader's own labels,
  // with the row that makes it a new one last.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const input = await startTyping(canvasElement, 'fa-IR', FA.query)
    // The pill round the input: 4 above and below, one and a half of edge.
    await expect(input.parentElement?.getBoundingClientRect().height).toBe(33)
    const { list, options } = await isTheList(canvasElement, semantic, input)
    await expect(within(list).getByText('برچسب‌های شما')).toBeVisible()
    await expect(options.map((option) => option.textContent)).toEqual(['هم‌دوره‌ای دانشگاه', 'هم‌تیمی قبلی', 'ساختن برچسب «هم»'])
    const create = options[2]
    if (!create) throw new Error('no create row')
    await expect(getComputedStyle(create).color).toBe(computed(canvasElement, semantic['text/brand']))
    // One pixel of border/default between the labels and the create row.
    const divider = create.parentElement?.previousElementSibling
    if (!(divider instanceof HTMLElement)) throw new Error('no divider')
    await expect(divider.getBoundingClientRect().height).toBe(1)
    await expect(getComputedStyle(divider).backgroundColor).toBe(computed(canvasElement, semantic['border/default']))
  },
}

export const ChoosingYourOwn: Story = {
  // Enter chooses the label under the keyboard, which the choices then show.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await startTyping(canvasElement, 'fa-IR', FA.query)
    await userEvent.keyboard('{ArrowDown}{Enter}')
    await expect(args.onChange).toHaveBeenLastCalledWith('own-teammate')
    await waitFor(() => expect(within(canvasElement).queryByRole('listbox')).toBeNull())
    await expect(within(groupIn(canvasElement)).getByRole('button', { pressed: true })).toHaveTextContent('هم‌تیمی قبلی')
  },
}

export const Creating: Story = {
  // A name the reader has none of offers only its making, and Enter makes it.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await startTyping(canvasElement, 'fa-IR', FA.newName)
    await expect(
      within(listIn(canvasElement))
        .getAllByRole('option')
        .map((option) => option.textContent),
    ).toEqual([`ساختن برچسب «${FA.newName}»`])
    await userEvent.keyboard('{Enter}')
    await expect(args.onCreate).toHaveBeenCalledWith(FA.newName)
    await expect(within(groupIn(canvasElement)).getByRole('button', { pressed: true })).toHaveTextContent(FA.newName)
  },
}

export const Escaping: Story = {
  // Escape leaves the new label unmade, and «برچسب تازه» comes back.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await startTyping(canvasElement, 'fa-IR', FA.query)
    await userEvent.keyboard('{Escape}')
    await expect(within(canvasElement).queryByRole('listbox')).toBeNull()
    await expect(within(groupIn(canvasElement)).getByRole('button', { name: 'برچسب تازه' })).toHaveFocus()
    await expect(args.onCreate).not.toHaveBeenCalled()
  },
}

// Opens a label's «⋯» and finds its menu.
const openMenu = async (canvasElement: HTMLElement, name: string) => {
  const i18n = i18nFor('fa-IR')
  await userEvent.click(within(listIn(canvasElement)).getByRole('button', { name: `${i18n._('Manage the label')} «${name}»` }))
  return within(canvasElement.ownerDocument.body).findByRole('menu')
}

export const OptionMenu: Story = {
  // «⋯» beside the reader's own label opens «تغییر نام» and «حذف برچسب», 160
  // wide; the four defaults have none.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await startTyping(canvasElement, 'fa-IR', FA.query)
    const menu = await openMenu(canvasElement, CLASSMATE)
    await expect(menu.getBoundingClientRect().width).toBe(160)
    const items = within(menu).getAllByRole('menuitem')
    await expect(items.map((item) => item.textContent)).toEqual(['تغییر نام', 'حذف برچسب'])
    await expect(getComputedStyle(items[1] ?? menu).color).toBe(computed(canvasElement, semantic['text/error']))
  },
}

export const Rename: Story = {
  // Rename turns the row into its name to edit, with a tick that keeps it.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    await startTyping(canvasElement, 'fa-IR', FA.query)
    const menu = await openMenu(canvasElement, CLASSMATE)
    await userEvent.click(within(menu).getByRole('menuitem', { name: 'تغییر نام' }))
    const rename = await within(listIn(canvasElement)).findByRole('textbox', { name: i18n._('New name') })
    await waitFor(() => expect(rename).toHaveFocus())
    await expect(rename).toHaveValue('هم‌دوره‌ای دانشگاه')
    await userEvent.clear(rename)
    await userEvent.type(rename, FA.newName)
    await userEvent.click(within(listIn(canvasElement)).getByRole('button', { name: i18n._('Confirm the new name') }))
    await expect(args.onRename).toHaveBeenCalledWith('own-classmate', FA.newName)
  },
}

export const DeleteConfirm: Story = {
  // Delete asks inside the list, never a modal on the modal: what it does to
  // the people who carry it, and Keep or Delete.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await startTyping(canvasElement, 'fa-IR', FA.query)
    const menu = await openMenu(canvasElement, CLASSMATE)
    await userEvent.click(within(menu).getByRole('menuitem', { name: 'حذف برچسب' }))
    const list = listIn(canvasElement)
    await expect(await within(list).findByText('حذف برچسب «هم‌دوره‌ای دانشگاه»؟')).toBeVisible()
    await expect(within(list).getByText('از روی ۲ نفر برداشته می‌شود. خود افراد حذف نمی‌شوند.')).toBeVisible()
    const [keep, remove] = [within(list).getByRole('button', { name: 'نگه داشتن' }), within(list).getByRole('button', { name: 'حذف' })]
    await expect(Math.round(keep.getBoundingClientRect().left - remove.getBoundingClientRect().right)).toBe(8)
    await userEvent.click(keep)
    await expect(within(list).queryByText('حذف برچسب «هم‌دوره‌ای دانشگاه»؟')).toBeNull()
    await expect(args.onDelete).not.toHaveBeenCalled()
  },
}

export const AfterDelete: Story = {
  // Delete takes the label off the list, and the people stay.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await startTyping(canvasElement, 'fa-IR', FA.query)
    const menu = await openMenu(canvasElement, CLASSMATE)
    await userEvent.click(within(menu).getByRole('menuitem', { name: 'حذف برچسب' }))
    await userEvent.click(await within(listIn(canvasElement)).findByRole('button', { name: 'حذف' }))
    await expect(args.onDelete).toHaveBeenCalledWith('own-classmate')
    await expect(
      within(listIn(canvasElement))
        .getAllByRole('option')
        .map((option) => option.textContent),
    ).toEqual(['هم‌تیمی قبلی', 'ساختن برچسب «هم»'])
  },
}

export const InEnglish: Story = {
  args: { labels: EN.labels },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await isTheFrame(canvasElement, 'en-US', semantic)
    const input = await startTyping(canvasElement, 'en-US', EN.query)
    const { options } = await isTheList(canvasElement, semantic, input)
    await expect(options.map((option) => option.textContent)).toEqual(['Former teammate', 'Create the label “Former”'])
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    await isTheFrame(canvasElement, 'fa-IR', darkSemantic)
    await isTheList(canvasElement, darkSemantic, await startTyping(canvasElement, 'fa-IR', FA.query))
  },
}
