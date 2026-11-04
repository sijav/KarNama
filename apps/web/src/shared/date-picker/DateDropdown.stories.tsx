import { useLingui } from '@lingui/react'
import { Box, ButtonBase } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { useRef, useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { usePreferences } from '../../core/preferences'
import { i18nFor, type Locale } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { elevation, semantic, spacing, type SemanticToken } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { DateDropdown, type DateDropdownProps } from './DateDropdown'
import { dayName } from './words'

// The screens' today, 19 Mehr 1405, and the posted date the field holds, 19
// Shahrivar; and 1 Aban, whose yesterday is in the month before.
const TODAY = '2026-10-11'
const POSTED = '2026-09-10'
const FIRST_OF_ABAN = '2026-10-23'
// The field's width, a stand-in for the form's date field, which the dropdown
// hangs from.
const FIELD = 242

// The field the dropdown hangs from: its date in full, or nothing, and a press
// opens the dropdown under it. Its own state keeps the date, as the form does.
const InAForm = ({ value: initial, onConfirm, onClear, onClose, ...args }: DateDropdownProps) => {
  const { i18n } = useLingui()
  const { locale } = usePreferences()
  const field = useRef<HTMLButtonElement>(null)
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [value, setValue] = useState(initial)
  return (
    <Box sx={{ padding: `${spacing.lg}px`, minHeight: 480 }}>
      <ButtonBase
        ref={field}
        data-testid="field"
        aria-label={i18n._('Posted on')}
        onClick={() => {
          setAnchor(field.current)
        }}
        sx={(theme) => ({
          width: FIELD,
          height: 40,
          justifyContent: 'flex-start',
          paddingInline: `${spacing.sm}px`,
          borderRadius: `${theme.karnama.radius.md}px`,
          borderStyle: 'solid',
          borderWidth: 1,
          borderColor: theme.karnama.semantic['border/control'],
          color: theme.karnama.semantic['text/primary'],
        })}
      >
        {value === null ? '' : dayName(locale, value)}
      </ButtonBase>
      <DateDropdown
        {...args}
        label={i18n._('Posted on')}
        anchorEl={anchor}
        value={value}
        onConfirm={(day) => {
          setValue(day)
          setAnchor(null)
          onConfirm(day)
        }}
        onClear={() => {
          setValue(null)
          setAnchor(null)
          onClear()
        }}
        onClose={() => {
          setAnchor(null)
          onClose()
        }}
      />
    </Box>
  )
}

const meta = {
  title: 'Shared/DateDropdown',
  component: DateDropdown,
  args: {
    anchorEl: null,
    label: '',
    value: POSTED,
    today: TODAY,
    min: null,
    max: null,
    shortcuts: true,
    onConfirm: fn(),
    onClear: fn(),
    onClose: fn(),
  },
  // The field's date and the days are each story's own, which its play
  // measures, so a control changing one would fail a play nothing broke.
  parameters: { controls: { disable: true } },
  render: (args) => <InAForm {...args} />,
} satisfies StoryMeta<typeof DateDropdown>

export default meta
type Story = StoryObj<typeof meta>

type Palette = Record<SemanticToken, string>
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

// Opens the dropdown as a reader does, by a press on the field, and finds the
// dialog once its 200 ms fade has drawn it.
const open = async (canvasElement: HTMLElement) => {
  await userEvent.click(within(canvasElement).getByTestId('field'))
  const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog')
  await waitFor(() => expect(getComputedStyle(dialog).opacity).toBe('1'))
  return dialog
}
const fieldIn = (canvasElement: HTMLElement) => within(canvasElement).getByTestId('field')

// Node 774:16896: the redesign's popover panel, 276 wide, bg/surface inside one
// of border/default at radius 10 with elevation.popover, 16 round and 12
// between; the shortcuts, when it has them, 6 apart from the inline start; the
// month filling 242; the footer 36 high, 8 between, the clear link at the
// inline start when the field has a date, Cancel and then Confirm at the inline
// end.
const isTheFrame = async (canvasElement: HTMLElement, dialog: HTMLElement, locale: Locale, palette: Palette) => {
  const i18n = i18nFor(locale)
  const rtl = locale === 'fa-IR'
  const style = getComputedStyle(dialog)
  const box = dialog.getBoundingClientRect()
  await expect(box.width).toBe(276)
  await expect([
    px(style.paddingTop),
    px(style.paddingInlineStart),
    px(style.rowGap),
    px(style.borderTopLeftRadius),
    px(style.borderTopWidth),
  ]).toEqual([16, 16, 12, 10, 1])
  await expect(style.backgroundColor).toBe(computed(canvasElement, palette['bg/surface']))
  await expect(style.borderTopColor).toBe(computed(canvasElement, palette['border/default']))
  await expect(style.boxShadow).toBe(shadowOf(canvasElement, elevation.popover))
  const grid = within(dialog).getByRole('grid')
  const calendar = grid.parentElement
  if (!(calendar instanceof HTMLElement)) throw new Error('no calendar')
  await expect(calendar.getBoundingClientRect().width).toBe(242)
  const confirm = within(dialog)
    .getByRole('button', { name: i18n._('Confirm') })
    .getBoundingClientRect()
  const cancel = within(dialog)
    .getByRole('button', { name: i18n._('Cancel') })
    .getBoundingClientRect()
  await expect([confirm.height, cancel.height]).toEqual([36, 36])
  await expect(Math.round(rtl ? box.left + 17 - confirm.left : confirm.right - (box.right - 17))).toBe(0)
  await expect(Math.round(rtl ? cancel.left - confirm.right : confirm.left - cancel.right)).toBe(8)
  await expect(Math.round(box.bottom - 17 - confirm.bottom)).toBe(0)
  return dialog
}

// The shortcuts in reading order, and each one's place from the inline start.
const shortcutsIn = (dialog: HTMLElement, locale: Locale) => {
  const i18n = i18nFor(locale)
  return [i18n._('Today'), i18n._('Yesterday'), i18n._('Two days ago')].map((name) => within(dialog).queryByRole('button', { name }))
}

export const PostedDate: Story = {
  // As the job modal's posted date draws it: the three shortcuts, the month of
  // the field's date, and the clear link, since the field has a date.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const dialog = await isTheFrame(canvasElement, await open(canvasElement), 'fa-IR', semantic)
    await expect(dialog).toHaveAccessibleName('تاریخ انتشار')
    await expect(within(dialog).getByRole('heading')).toHaveTextContent('شهریور ۱۴۰۵')
    const [today, yesterday, before] = shortcutsIn(dialog, 'fa-IR')
    if (!today || !yesterday || !before) throw new Error('no shortcuts')
    const box = dialog.getBoundingClientRect()
    const [first, second, third] = [today, yesterday, before].map((shortcut) => shortcut.getBoundingClientRect())
    if (!first || !second || !third) throw new Error('no shortcuts')
    await expect([
      Math.round(box.right - 17 - first.right),
      Math.round(first.left - second.right),
      Math.round(second.left - third.right),
    ]).toEqual([0, 6, 6])
    await expect([first.width, second.width, third.width]).toEqual([47, 47, 47])
    await expect([today, yesterday, before].map((shortcut) => shortcut.textContent)).toEqual(['امروز', 'دیروز', 'پریروز'])
    const clear = within(dialog)
      .getByRole('button', { name: i18nFor('fa-IR')._('Clear') })
      .getBoundingClientRect()
    await expect(Math.round(box.right - 17 - clear.right)).toBe(0)
  },
}

export const Deadline: Story = {
  // A deadline has no shortcuts.
  args: { shortcuts: false },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const dialog = await isTheFrame(canvasElement, await open(canvasElement), 'fa-IR', semantic)
    await expect(shortcutsIn(dialog, 'fa-IR')).toEqual([null, null, null])
  },
}

export const NoDateYet: Story = {
  // With the field empty there is nothing to clear, and the month is today's.
  args: { value: null },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const dialog = await isTheFrame(canvasElement, await open(canvasElement), 'fa-IR', semantic)
    await expect(within(dialog).queryByRole('button', { name: i18nFor('fa-IR')._('Clear') })).toBeNull()
    await expect(within(dialog).getByRole('heading')).toHaveTextContent('مهر ۱۴۰۵')
  },
}

export const ChoosingAndConfirming: Story = {
  // A press on a day only chooses it and the calendar stays open; Confirm puts
  // it in the field and closes.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const dialog = await open(canvasElement)
    const day = '2026-09-15'
    await userEvent.click(within(dialog).getByRole('button', { name: dayName('fa-IR', day) }))
    await expect(
      within(dialog)
        .getByRole('button', { name: dayName('fa-IR', day) })
        .closest('[role="gridcell"]'),
    ).toHaveAttribute('aria-selected', 'true')
    await expect(dialog).toBeInTheDocument()
    await expect(args.onConfirm).not.toHaveBeenCalled()
    await userEvent.click(within(dialog).getByRole('button', { name: i18nFor('fa-IR')._('Confirm') }))
    await expect(args.onConfirm).toHaveBeenCalledWith(day)
    await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('dialog')).toBeNull())
    await expect(fieldIn(canvasElement)).toHaveTextContent(dayName('fa-IR', day))
  },
}

export const AShortcut: Story = {
  // A shortcut chooses its day, turning the month to it: on 1 Aban yesterday is
  // 30 Mehr.
  args: { value: null, today: FIRST_OF_ABAN },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const dialog = await open(canvasElement)
    await expect(within(dialog).getByRole('heading')).toHaveTextContent('آبان ۱۴۰۵')
    await userEvent.click(within(dialog).getByRole('button', { name: i18n._('Yesterday') }))
    await expect(within(dialog).getByRole('heading')).toHaveTextContent('مهر ۱۴۰۵')
    await userEvent.click(within(dialog).getByRole('button', { name: i18n._('Confirm') }))
    await expect(args.onConfirm).toHaveBeenCalledWith('2026-10-22')
  },
}

export const ShortcutsTheFieldDoesNotAllow: Story = {
  // A shortcut whose day the field does not allow is hidden: from yesterday on,
  // the day before is gone.
  args: { min: '2026-10-10' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const [today, yesterday, before] = shortcutsIn(await open(canvasElement), 'fa-IR')
    await expect([today === null, yesterday === null, before === null]).toEqual([false, false, true])
  },
}

export const Cancelling: Story = {
  // Cancel closes with no change, and so does Escape.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)
    let dialog = await open(canvasElement)
    await userEvent.click(within(dialog).getByRole('button', { name: dayName('fa-IR', '2026-09-15') }))
    await userEvent.click(within(dialog).getByRole('button', { name: i18nFor('fa-IR')._('Cancel') }))
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
    await expect(args.onClose).toHaveBeenCalledTimes(1)
    await expect(fieldIn(canvasElement)).toHaveTextContent(dayName('fa-IR', POSTED))
    dialog = await open(canvasElement)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
    await expect(args.onClose).toHaveBeenCalledTimes(2)
    await expect(args.onConfirm).not.toHaveBeenCalled()
    // Gone once its 150 ms fade has ended.
    await waitFor(() => expect(dialog).not.toBeInTheDocument())
  },
}

export const Clearing: Story = {
  // The clear link empties the field and closes.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const dialog = await open(canvasElement)
    await userEvent.click(within(dialog).getByRole('button', { name: i18nFor('fa-IR')._('Clear') }))
    await expect(args.onClear).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('dialog')).toBeNull())
    await expect(fieldIn(canvasElement)).toHaveTextContent('')
  },
}

export const InEnglish: Story = {
  // In English: the Gregorian month, the shortcuts in English, the footer
  // mirrored.
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const dialog = await isTheFrame(canvasElement, await open(canvasElement), 'en-US', semantic)
    await expect(within(dialog).getByRole('heading')).toHaveTextContent('September 2026')
    await expect(shortcutsIn(dialog, 'en-US').map((shortcut) => shortcut?.textContent)).toEqual(['Today', 'Yesterday', 'Two days ago'])
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    await isTheFrame(canvasElement, await open(canvasElement), 'fa-IR', darkSemantic)
  },
}
