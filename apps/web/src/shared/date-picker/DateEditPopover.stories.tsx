import { useLingui } from '@lingui/react'
import { Box, ButtonBase } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { useRef, useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { elevation, semantic, spacing, type SemanticToken } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { DateEditPopover, type DateEditPopoverProps } from './DateEditPopover'
import { atTime } from './month'
import { dayName } from './words'

// The screens' today, 19 Mehr 1405, the application date the card holds, 24
// Mehr, and an interview on 20 Mehr at ten.
const TODAY = '2026-10-11'
const APPLIED = '2026-10-16'
const INTERVIEW = atTime('2026-10-12', 10 * 60)
// A stand-in for the card it hangs from, the board's 276.
const CARD = 276

// The screens' titles and helpers, in each language.
const FA = fixtures('fa-IR').dateEdit
const EN = fixtures('en-US').dateEdit

type Kind = NonNullable<DateEditPopoverProps['shortcuts']>
const PAST: Kind = 'past'
const FUTURE: Kind = 'future'

// The card the popover hangs from: a press on its pencil opens it under the
// card, and its own state keeps the date, as the board does.
const UnderACard = ({ onClose, onSave, onClear, value: initial, ...args }: DateEditPopoverProps) => {
  const { i18n } = useLingui()
  const card = useRef<HTMLElement>(null)
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [value, setValue] = useState(initial)
  return (
    <Box sx={{ padding: `${spacing.lg}px`, minHeight: 640 }}>
      <Box
        ref={card}
        data-testid="card"
        sx={(theme) => ({
          boxSizing: 'border-box',
          width: CARD,
          padding: `${spacing.md}px`,
          borderRadius: `${theme.karnama.radius.md}px`,
          borderStyle: 'solid',
          borderWidth: 1,
          borderColor: theme.karnama.semantic['border/default'],
          backgroundColor: theme.karnama.semantic['bg/surface'],
        })}
      >
        <ButtonBase
          data-testid="pencil"
          onClick={() => {
            setAnchor(card.current)
          }}
          sx={(theme) => ({ color: theme.karnama.semantic['text/primary'] })}
        >
          {i18n._('Change the application date')}
        </ButtonBase>
        <Box data-testid="value">{value ?? ''}</Box>
      </Box>
      <DateEditPopover
        {...args}
        value={value}
        anchorEl={anchor}
        onSave={(next) => {
          setValue(next)
          setAnchor(null)
          onSave(next)
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
  title: 'Shared/DateEditPopover',
  component: DateEditPopover,
  args: {
    anchorEl: null,
    title: FA.appliedTitle,
    helper: FA.appliedHelper,
    value: APPLIED,
    withTime: false,
    today: TODAY,
    min: null,
    max: null,
    shortcuts: PAST,
    clearable: false,
    beside: false,
    onSave: fn(),
    onClear: fn(),
    onClose: fn(),
  },
  // The title and the helper are the field's, as the screens write them, and
  // every play reads the drawing, so a control changing one would fail a play
  // nothing broke.
  parameters: { controls: { disable: true } },
  render: (args) => <UnderACard {...args} />,
} satisfies StoryMeta<typeof DateEditPopover>

export default meta
type Story = StoryObj<typeof meta>

type Palette = Record<SemanticToken, string>
// The time field's two edges, typed so the lint rule reads them as values.
const REST_EDGE: SemanticToken = 'border/default'
const HOVER_EDGE: SemanticToken = 'text/secondary'
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

// The runner's own pointer, which only the runner has; outside it the story
// shows the field at rest.
const pointAt = async (element: HTMLElement) => {
  if (!('__KARNAMA_STORY_TEST__' in globalThis)) return false
  await (await import('vitest/browser')).userEvent.hover(element)
  return true
}

const bodyOf = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body)

// Opens it as a reader does, by a press on the card's pencil, and finds the
// dialog once its 200 ms fade has drawn it.
const open = async (canvasElement: HTMLElement) => {
  await userEvent.click(within(canvasElement).getByTestId('pencil'))
  const dialog = await bodyOf(canvasElement).findByRole('dialog')
  await waitFor(() => expect(getComputedStyle(dialog).opacity).toBe('1'))
  return dialog
}

// The time field's box, by its name, «ساعت» and the time.
const timeBoxIn = (dialog: HTMLElement, locale: Locale) =>
  within(dialog).getByRole('button', { name: new RegExp(`^${i18nFor(locale)._('Time')} `) })

// Node 774:16705 by its parts: the panel, 276 wide, bg/surface inside one of
// border/default at radius 10 with elevation.popover, 16 round and 12 between;
// the head 22 high, the title 14 on 22 at Medium in text/primary at the inline
// start and Popover / Close at 22 at the inline end; the month filling 242; the
// helper 12 on 19 at Regular in text/secondary; the actions 36 high, Save last
// at the inline end and Cancel 8 before it.
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
  await expect(style.boxShadow).toBe(shadowOf(canvasElement, elevation.popover))
  // The panel's title, ahead of the month's own.
  const [title] = within(dialog).getAllByRole('heading')
  if (!title) throw new Error('no title')
  await expect(dialog).toHaveAccessibleName(title.textContent)
  const titleStyle = getComputedStyle(title)
  await expect([px(titleStyle.fontSize), px(titleStyle.lineHeight), Number(titleStyle.fontWeight)]).toEqual([14, 22, 500])
  await expect(titleStyle.color).toBe(computed(canvasElement, palette['text/primary']))
  const titleBox = title.getBoundingClientRect()
  const close = within(dialog)
    .getByRole('button', { name: i18n._('Close') })
    .getBoundingClientRect()
  await expect([close.width, close.height]).toEqual([22, 22])
  await expect(Math.round(rtl ? box.right - 17 - titleBox.right : titleBox.left - (box.left + 17))).toBe(0)
  await expect(Math.round(rtl ? close.left - (box.left + 17) : box.right - 17 - close.right)).toBe(0)
  await expect(Math.round(titleBox.top - (box.top + 17))).toBe(0)
  const calendar = within(dialog).getByRole('grid').parentElement
  if (!(calendar instanceof HTMLElement)) throw new Error('no calendar')
  await expect(calendar.getBoundingClientRect().width).toBe(242)
  const save = within(dialog)
    .getByRole('button', { name: i18n._('Save') })
    .getBoundingClientRect()
  const cancel = within(dialog)
    .getByRole('button', { name: i18n._('Cancel') })
    .getBoundingClientRect()
  await expect([save.height, cancel.height]).toEqual([36, 36])
  await expect(Math.round(rtl ? save.left - (box.left + 17) : box.right - 17 - save.right)).toBe(0)
  await expect(Math.round(rtl ? cancel.left - save.right : save.left - cancel.right)).toBe(8)
  await expect(Math.round(box.bottom - 17 - save.bottom)).toBe(0)
  return dialog
}

// The helper line, under the month or the time, over the actions.
const helperIs = async (canvasElement: HTMLElement, dialog: HTMLElement, palette: Palette, words: string) => {
  const helper = within(dialog).getByText(words)
  const style = getComputedStyle(helper)
  await expect([px(style.fontSize), px(style.lineHeight), Number(style.fontWeight), helper.getBoundingClientRect().width]).toEqual([
    12, 19, 400, 242,
  ])
  await expect(style.color).toBe(computed(canvasElement, palette['text/secondary']))
}

// The time field, Field / ساعت: «ساعت» 12 on 19 at Regular in text/secondary, 6
// above the box, 242 by 38 at radius 6, 8 and 10 in, bg/surface inside one of
// border/default, or text/secondary under the pointer; the time 13 on 20 at the
// inline start and the 16 clock at the inline end.
const isTheTimeField = async (canvasElement: HTMLElement, dialog: HTMLElement, locale: Locale, palette: Palette, hovered: boolean) => {
  const edge = computed(canvasElement, palette[hovered ? HOVER_EDGE : REST_EDGE])
  const rtl = locale === 'fa-IR'
  const field = timeBoxIn(dialog, locale)
  const style = getComputedStyle(field)
  const box = field.getBoundingClientRect()
  await expect([box.width, box.height, px(style.borderTopLeftRadius), px(style.borderTopWidth)]).toEqual([242, 38, 6, 1])
  await expect([px(style.paddingTop), px(style.paddingInlineStart), px(style.columnGap)]).toEqual([8, 10, 8])
  await expect(style.backgroundColor).toBe(computed(canvasElement, palette['bg/surface']))
  await waitFor(() => expect(getComputedStyle(field).borderTopColor).toBe(edge))
  const i18n = i18nFor(locale)
  const label = within(dialog).getByText(i18n._('Time'))
  const labelStyle = getComputedStyle(label)
  await expect([px(labelStyle.fontSize), px(labelStyle.lineHeight), Math.round(box.top - label.getBoundingClientRect().bottom)]).toEqual([
    12, 19, 6,
  ])
  await expect(labelStyle.color).toBe(computed(canvasElement, palette['text/secondary']))
  const [value, glyph] = [field.querySelector('span'), field.querySelector('svg')]
  if (value === null || glyph === null) throw new Error('no time or clock')
  const valueStyle = getComputedStyle(value)
  await expect([px(valueStyle.fontSize), px(valueStyle.lineHeight)]).toEqual([13, 20])
  await expect(valueStyle.color).toBe(computed(canvasElement, palette['text/primary']))
  const [valueBox, glyphBox] = [value.getBoundingClientRect(), glyph.getBoundingClientRect()]
  await expect([glyphBox.width, glyphBox.height]).toEqual([16, 16])
  await expect(Math.round(rtl ? box.right - 11 - valueBox.right : valueBox.left - (box.left + 11))).toBe(0)
  await expect(Math.round(rtl ? glyphBox.left - (box.left + 11) : box.right - 11 - glyphBox.right)).toBe(0)
  return field
}

export const DateOnly: Story = {
  // Type تاریخ, as the card's application date draws it: the past shortcuts and
  // the helper.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const dialog = await isTheFrame(canvasElement, await open(canvasElement), 'fa-IR', semantic)
    await expect(dialog).toHaveAccessibleName(FA.appliedTitle)
    await helperIs(canvasElement, dialog, semantic, args.helper ?? '')
    await expect(within(dialog).getByRole('button', { name: 'امروز' })).toBeVisible()
    await expect(within(dialog).getByRole('button', { name: 'دیروز' })).toBeVisible()
    await expect(within(dialog).getByRole('button', { name: 'پریروز' })).toBeVisible()
    await expect(within(dialog).queryByRole('button', { name: new RegExp(`^${i18nFor('fa-IR')._('Time')} `) })).toBeNull()
  },
}

// The interview's, Type تاریخ و ساعت: the future shortcuts, the time, and the
// screens' helper.
const interview = {
  title: FA.interviewTitle,
  helper: FA.interviewHelper,
  value: INTERVIEW,
  withTime: true,
  shortcuts: FUTURE,
}

export const DateAndTime: Story = {
  args: interview,
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const dialog = await isTheFrame(canvasElement, await open(canvasElement), 'fa-IR', semantic)
    await expect(within(dialog).getByRole('button', { name: 'امروز' })).toBeVisible()
    await expect(within(dialog).getByRole('button', { name: 'فردا' })).toBeVisible()
    await expect(within(dialog).getByRole('button', { name: 'پس‌فردا' })).toBeVisible()
    const field = await isTheTimeField(canvasElement, dialog, 'fa-IR', semantic, false)
    await expect(field).toHaveTextContent('۱۰:۰۰')
    await helperIs(canvasElement, dialog, semantic, interview.helper)
  },
}

export const TimeListOpen: Story = {
  // A press on the time opens the time list 4 under it at its width, the chosen
  // time focused; another press closes it.
  args: interview,
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const dialog = await open(canvasElement)
    const field = timeBoxIn(dialog, 'fa-IR')
    await expect(field).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(field)
    const list = await bodyOf(canvasElement).findByRole('listbox')
    const surface = list.parentElement
    if (!(surface instanceof HTMLElement)) throw new Error('no surface')
    await waitFor(() => expect(Number(getComputedStyle(surface.parentElement ?? surface).opacity)).toBe(1))
    await expect(field).toHaveAttribute('aria-expanded', 'true')
    const [fieldBox, listBox] = [field.getBoundingClientRect(), surface.getBoundingClientRect()]
    await expect([listBox.width, Math.round(listBox.right - fieldBox.right)]).toEqual([242, 0])
    // 4 under the field where the window has room for it, as the frame draws it;
    // in a shorter one, as the published Storybook's 720 high page is, MUI
    // lifts it to stay in the window, overlapping the field.
    if (window.innerHeight - fieldBox.bottom >= listBox.height + 4 + 16) await expect(Math.round(listBox.top - fieldBox.bottom)).toBe(4)
    else await expect(listBox.bottom).toBeLessThanOrEqual(window.innerHeight)
    await waitFor(() => expect(within(list).getByRole('option', { name: '۱۰:۰۰' })).toHaveFocus())
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(bodyOf(canvasElement).queryByRole('listbox')).toBeNull())
    await expect(dialog).toBeVisible()
    await waitFor(() => expect(field).toHaveFocus())
  },
}

export const TimeFieldHover: Story = {
  // Under the pointer the time's edge turns text/secondary.
  args: interview,
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const dialog = await open(canvasElement)
    if (!(await pointAt(timeBoxIn(dialog, 'fa-IR')))) return
    await isTheTimeField(canvasElement, dialog, 'fa-IR', semantic, true)
  },
}

export const ChoosingATime: Story = {
  // A time chosen in the list goes in the field and the list closes; Save gives
  // the day at that time.
  args: interview,
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const dialog = await open(canvasElement)
    const field = timeBoxIn(dialog, 'fa-IR')
    await userEvent.click(field)
    const list = await bodyOf(canvasElement).findByRole('listbox')
    await userEvent.click(within(list).getByRole('option', { name: '۱۱:۳۰' }))
    await waitFor(() => expect(bodyOf(canvasElement).queryByRole('listbox')).toBeNull())
    await expect(field).toHaveTextContent('۱۱:۳۰')
    await userEvent.click(within(dialog).getByRole('button', { name: 'فردا' }))
    await userEvent.click(within(dialog).getByRole('button', { name: i18nFor('fa-IR')._('Save') }))
    await expect(args.onSave).toHaveBeenCalledWith('2026-10-12T11:30')
  },
}

export const NoTimeYet: Story = {
  // An interview with a day and no time says «—» for the time, and Save keeps
  // it a day alone.
  args: { ...interview, value: '2026-10-12', helper: null },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const dialog = await open(canvasElement)
    await expect(timeBoxIn(dialog, 'fa-IR')).toHaveTextContent('—')
    await userEvent.click(within(dialog).getByRole('button', { name: dayName('fa-IR', '2026-10-14') }))
    await userEvent.click(within(dialog).getByRole('button', { name: i18nFor('fa-IR')._('Save') }))
    await expect(args.onSave).toHaveBeenCalledWith('2026-10-14')
  },
}

export const DeadlineWithClear: Story = {
  // As the card's deadline draws it: no shortcuts, the screens' helper, and the
  // clear link at the inline start, which empties it.
  args: {
    title: FA.deadlineTitle,
    helper: FA.deadlineHelper,
    value: '2026-10-20',
    shortcuts: null,
    clearable: true,
  },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const dialog = await isTheFrame(canvasElement, await open(canvasElement), 'fa-IR', semantic)
    await expect(within(dialog).queryByRole('button', { name: 'امروز' })).toBeNull()
    const clear = within(dialog).getByRole('button', { name: i18nFor('fa-IR')._('Clear') })
    await expect(Math.round(dialog.getBoundingClientRect().right - 17 - clear.getBoundingClientRect().right)).toBe(0)
    await userEvent.click(clear)
    await expect(args.onClear).toHaveBeenCalledTimes(1)
    await expect(within(canvasElement).getByTestId('value')).toHaveTextContent('')
  },
}

export const Closing: Story = {
  // Popover / Close, Cancel and Escape each close it with no change.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const gone = () => waitFor(() => expect(bodyOf(canvasElement).queryByRole('dialog')).toBeNull())
    let dialog = await open(canvasElement)
    await userEvent.click(within(dialog).getByRole('button', { name: dayName('fa-IR', '2026-10-15') }))
    await userEvent.click(within(dialog).getByRole('button', { name: i18n._('Close') }))
    await gone()
    dialog = await open(canvasElement)
    await userEvent.click(within(dialog).getByRole('button', { name: i18n._('Cancel') }))
    await gone()
    await open(canvasElement)
    await userEvent.keyboard('{Escape}')
    await gone()
    await expect(args.onClose).toHaveBeenCalledTimes(3)
    await expect(args.onSave).not.toHaveBeenCalled()
    await expect(within(canvasElement).getByTestId('value')).toHaveTextContent(APPLIED)
  },
}

export const Beside: Story = {
  // Beside the card at its inline end, 4 from it and level with its top, as
  // the history's row and a card with no room under it take it.
  args: { beside: true },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const dialog = await open(canvasElement)
    const [card, box] = [within(canvasElement).getByTestId('card').getBoundingClientRect(), dialog.getBoundingClientRect()]
    await expect([Math.round(card.left - box.right), Math.round(box.top - card.top)]).toEqual([4, 0])
  },
}

export const InEnglish: Story = {
  // The interview's in English: the Gregorian month, the shortcuts and the time
  // in English, the head and the actions mirrored.
  args: { ...interview, title: EN.interviewTitle, helper: EN.interviewHelper },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const dialog = await isTheFrame(canvasElement, await open(canvasElement), 'en-US', semantic)
    await expect(within(dialog).getByRole('heading', { level: 2, name: EN.interviewTitle })).toBeVisible()
    await expect(await isTheTimeField(canvasElement, dialog, 'en-US', semantic, false)).toHaveTextContent('10:00')
    await expect(within(dialog).getByRole('button', { name: 'Today' })).toBeVisible()
    await expect(within(dialog).getByRole('button', { name: 'Tomorrow' })).toBeVisible()
    await expect(within(dialog).getByRole('button', { name: 'In two days' })).toBeVisible()
  },
}

export const Dark: Story = {
  args: interview,
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    const dialog = await isTheFrame(canvasElement, await open(canvasElement), 'fa-IR', darkSemantic)
    await isTheTimeField(canvasElement, dialog, 'fa-IR', darkSemantic, false)
  },
}
