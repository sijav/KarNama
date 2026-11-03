import { useLingui } from '@lingui/react'
import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { useRef, useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18n } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { elevation, semantic, spacing } from '../../theme/tokens'
import { ActionChip } from '../action-chip'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { InterviewResultPopover, type InterviewResultPopoverProps } from './InterviewResultPopover'

const FA = fixtures('fa-IR')
const EN = fixtures('en-US')

// A stand-in for the interview's card until Card / Kanban is built, 300 wide,
// with «نتیجه گرفتم», Chip / Action, which opens the popover under it.
const CARD = 300

const UnderACard = ({ onClose, ...args }: InterviewResultPopoverProps) => {
  const { i18n } = useLingui()
  const card = useRef<HTMLElement>(null)
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  return (
    // 24 round the card, so nothing it hangs from sits on the canvas's edge.
    <Box sx={{ padding: `${spacing.lg}px` }}>
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
        <ActionChip
          label={i18n._('Got the result')}
          onClick={() => {
            setAnchor(card.current)
          }}
        />
        <InterviewResultPopover
          {...args}
          anchorEl={anchor}
          onClose={() => {
            setAnchor(null)
            onClose()
          }}
        />
      </Box>
    </Box>
  )
}

const meta = {
  title: 'Shared/InterviewResultPopover',
  component: InterviewResultPopover,
  args: { anchorEl: null, choices: FA.interviewResults, onChoose: fn(), onClose: fn() },
  // What it offers is the board's, and every play reads the drawing.
  parameters: { controls: { disable: true } },
  render: (args) => <UnderACard {...args} />,
} satisfies StoryMeta<typeof InterviewResultPopover>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A value as the browser computes it, borrowed on the host's own inline style
// and put back in the same tick. Never inside waitFor, KN-014.
const borrowed = (host: HTMLElement, property: 'color' | 'boxShadow', value: string) => {
  const previous = host.style[property]
  host.style[property] = value
  const result = getComputedStyle(host)[property]
  host.style[property] = previous
  return result
}

// How opaque a computed colour is: rgb() is whole, rgba() says.
const alphaOf = (colour: string) => Number(/rgba\([^)]*,\s*([\d.]+)\)$/.exec(colour)?.[1] ?? 1)

const cardIn = (canvasElement: HTMLElement) => within(canvasElement).getByTestId('card')

// Opens it as a reader does, by a press on «نتیجه گرفتم», and finds the dialog
// its title names.
const open = async (canvasElement: HTMLElement) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: i18n._('Got the result') }))
  const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog', { name: i18n._('What was the result?') })
  await waitFor(() => expect(dialog).toBeVisible())
  return dialog
}

const choicesIn = (dialog: HTMLElement) => within(dialog).getAllByRole('button')

// Each choice's shell, the Status Choice whose ring is its ::after.
const shellOf = (choice: HTMLElement) => {
  const shell = choice.firstElementChild
  if (!(shell instanceof HTMLElement)) throw new Error('the choice has no Status Choice inside')
  return shell
}

// Node 844:85811: 369 wide and hugging its height, bg/surface with one pixel of
// border/default inside and counted in the layout, radius 10 and its own
// shadow; the title 17 in from the top and the inline start, 14 on 22 at
// Medium in text/primary; the choices 12 under it, from the inline start, 8
// apart and 36 tall, in the order given. Under the card, 4 below it, from the
// card's inline start.
const isTheFiles = async (
  canvasElement: HTMLElement,
  dialog: HTMLElement,
  palette: Record<keyof typeof semantic, string>,
  height: number | null,
  rtl: boolean,
) => {
  const box = dialog.getBoundingClientRect()
  await expect(box.width).toBe(369)
  if (height !== null) await expect(box.height).toBe(height)
  const card = cardIn(canvasElement).getBoundingClientRect()
  await expect(Math.round(box.top - card.bottom)).toBe(4)
  await expect(Math.round(rtl ? box.right : box.left)).toBe(Math.round(rtl ? card.right : card.left))
  const style = getComputedStyle(dialog)
  await expect(px(style.borderTopLeftRadius)).toBe(10)
  await expect([style.borderTopStyle, px(style.borderTopWidth)]).toEqual(['solid', 1])
  await expect(style.borderTopColor).toBe(borrowed(dialog, 'color', palette['border/default']))
  await expect(style.backgroundColor).toBe(borrowed(dialog, 'color', palette['bg/surface']))
  await expect(style.boxShadow).toBe(borrowed(dialog, 'boxShadow', elevation.popover))
  const title = within(dialog).getByRole('heading', { name: i18n._('What was the result?') })
  const words = title.getBoundingClientRect()
  const text = getComputedStyle(title)
  await expect([px(text.fontSize), px(text.lineHeight), text.fontWeight, px(text.letterSpacing)]).toEqual([14, 22, '500', 0])
  await expect(text.color).toBe(borrowed(title, 'color', palette['text/primary']))
  await expect([words.top - box.top, words.height]).toEqual([17, 22])
  await expect(rtl ? box.right - words.right : words.left - box.left).toBe(17)
  const choices = choicesIn(dialog)
  const [first] = choices
  if (!first) throw new Error('the popover offers nothing')
  await expect(first.getBoundingClientRect().top - box.top).toBe(51)
  await expect(rtl ? box.right - first.getBoundingClientRect().right : first.getBoundingClientRect().left - box.left).toBe(17)
  for (const choice of choices) await expect(choice.getBoundingClientRect().height).toBe(36)
}

// The row's rule: each choice 8 after the one before it on its line, or, where
// it does not fit, at the inline start of a line 8 under it.
const isARow = async (choices: readonly HTMLElement[], rtl: boolean) => {
  const [first] = choices
  if (!first) throw new Error('the popover offers nothing')
  const start = rtl ? first.getBoundingClientRect().right : first.getBoundingClientRect().left
  for (const [index, choice] of choices.entries()) {
    const next = choices[index + 1]
    if (!next) break
    const [here, there] = [choice.getBoundingClientRect(), next.getBoundingClientRect()]
    if (there.top === here.top) await expect(rtl ? here.left - there.right : there.left - here.right).toBe(8)
    else await expect([there.top - here.bottom, rtl ? there.right : there.left]).toEqual([8, start])
  }
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const dialog = await open(canvasElement)
    await isTheFiles(canvasElement, dialog, semantic, 104, true)
    const choices = choicesIn(dialog)
    await expect(choices.map((choice) => choice.textContent)).toEqual(FA.interviewResults.map((option) => option.name))
    // The file's پیشنهاد کار is 89, پذیرفته‌شده 92, رد شده 65 and انصراف 65,
    // which fill the 335 inside the panel exactly. Figma tracks the chips' Persian
    // 0.2 a letter, which a browser does not do to a joined script, so each is
    // drawn up to 3 narrower, and the four stay on one line.
    const drawn = choices.map((choice) => choice.getBoundingClientRect().width)
    for (const [index, file] of [89, 92, 65, 65].entries()) {
      const width = drawn[index] ?? 0
      await expect(width).toBeLessThanOrEqual(file)
      await expect(width).toBeGreaterThan(file - 3)
    }
    await expect(new Set(choices.map((choice) => choice.getBoundingClientRect().top)).size).toBe(1)
    await isARow(choices, true)
    // Focus starts on the panel, so no choice wears the keyboard's ring.
    await waitFor(() => expect(dialog).toHaveFocus())
    for (const choice of choices) await expect(px(getComputedStyle(shellOf(choice), '::after').borderTopWidth)).toBe(2)
  },
}

export const Choose: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // One press applies a choice: the popover closes and hands it over.
    const dialog = await open(canvasElement)
    await userEvent.click(within(dialog).getByRole('button', { name: FA.interviewResults[2]?.name ?? '' }))
    await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('dialog')).toBeNull())
    await expect(args.onClose).toHaveBeenCalledOnce()
    await expect(args.onChoose).toHaveBeenCalledOnce()
    await expect(args.onChoose).toHaveBeenCalledWith(FA.interviewResults[2]?.id)
  },
}

export const PressOutside: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // A press outside closes it and applies nothing; focus is back on the chip
    // that opened it.
    const dialog = await open(canvasElement)
    // MUI's invisible backdrop fills the page: the first child of the modal
    // round the panel.
    const backdrop = dialog.parentElement?.firstElementChild
    if (!(backdrop instanceof HTMLElement) || backdrop.getAttribute('aria-hidden') !== 'true')
      throw new Error('the popover has no backdrop to press')
    await userEvent.click(backdrop)
    await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('dialog')).toBeNull())
    await expect(args.onClose).toHaveBeenCalledOnce()
    await expect(args.onChoose).not.toHaveBeenCalled()
    await expect(within(canvasElement).getByRole('button', { name: i18n._('Got the result') })).toHaveFocus()
  },
}

export const Escape: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await open(canvasElement)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('dialog')).toBeNull())
    await expect(args.onClose).toHaveBeenCalledOnce()
    await expect(args.onChoose).not.toHaveBeenCalled()
  },
}

export const Hover: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // Status Choice's Hover, 427:562: its two pixel ring in border/default, by
    // the runner's real pointer, since :hover is the browser's hit-testing,
    // KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) {
      if (import.meta.env.MODE !== 'test') return
      throw new Error('Hover is running outside Storybook without the story-test flag that .storybook/vitest.setup.ts sets')
    }
    const browser = await import('vitest/browser')
    const dialog = await open(canvasElement)
    const [, second] = choicesIn(dialog)
    if (!second) throw new Error('the popover offers one choice')
    const ring = borrowed(second, 'color', semantic['border/default'])
    await expect(alphaOf(getComputedStyle(shellOf(second), '::after').borderTopColor)).toBe(0)
    await browser.userEvent.hover(second)
    await waitFor(() => expect(getComputedStyle(shellOf(second), '::after').borderTopColor).toBe(ring))
    await expect(px(getComputedStyle(shellOf(second), '::after').borderTopWidth)).toBe(2)
  },
}

export const KeyboardFocus: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // Opened from the keyboard, focus starts on the panel; Tab reaches the
    // choices one by one, each wearing the keyboard's three pixel ring in
    // border/focus, and from the last goes back to the first, since focus
    // stays inside.
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog', { name: i18n._('What was the result?') })
    const choices = choicesIn(dialog)
    const ring = borrowed(dialog, 'color', semantic['border/focus'])
    await waitFor(() => expect(dialog).toHaveFocus())
    for (const choice of [...choices, ...choices.slice(0, 1)]) {
      await userEvent.tab()
      await expect(choice).toHaveFocus()
      const after = getComputedStyle(shellOf(choice), '::after')
      await expect([px(after.borderTopWidth), after.borderTopColor]).toEqual([3, ring])
    }
    await userEvent.keyboard('{Escape}')
  },
}

export const AfterACustomStage: Story = {
  // A stage the reader made after interview is offered too, KN-731; five do
  // not fit one line, so the fifth wraps 8 under the first, from the inline
  // start.
  args: { choices: [...FA.interviewResults, FA.stageAfterInterview] },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const dialog = await open(canvasElement)
    await isTheFiles(canvasElement, dialog, semantic, 148, true)
    const choices = choicesIn(dialog)
    const [first] = choices
    const last = choices.at(-1)
    if (!first || !last) throw new Error('the popover offers nothing')
    await expect(last.textContent).toBe(FA.stageAfterInterview.name)
    await expect(last.getBoundingClientRect().top - first.getBoundingClientRect().bottom).toBe(8)
    await expect(last.getBoundingClientRect().right).toBe(first.getBoundingClientRect().right)
    await userEvent.keyboard('{Escape}')
  },
}

export const InEnglish: Story = {
  args: { choices: EN.interviewResults },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // Left to right it mirrors: the title and Offer at the left, and the
    // panel hangs from the card's left edge.
    const dialog = await open(canvasElement)
    await isTheFiles(canvasElement, dialog, semantic, null, false)
    const choices = choicesIn(dialog)
    await expect(choices.map((choice) => choice.textContent)).toEqual(EN.interviewResults.map((option) => option.name))
    await isARow(choices, false)
    await userEvent.keyboard('{Escape}')
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    const dialog = await open(canvasElement)
    await isTheFiles(canvasElement, dialog, darkSemantic, 104, true)
    await userEvent.keyboard('{Escape}')
  },
}
