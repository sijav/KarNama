import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { useRef, useState } from 'react'
import { useArgs } from 'storybook/preview-api'
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { formatCount } from '../../i18n/formatCount'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { keyboardOf, type Keyboard } from '../story-fixtures/keyboard'
import { CodeInput, type CodeInputProps } from './CodeInput'

// The field's name and the refusal the sign-in step gives, in a language's catalog.
const labelIn = (locale: Locale) => {
  const i18n = i18nFor(locale)
  return i18n._('Five digit code')
}
const refusalIn = (locale: Locale) => {
  const i18n = i18nFor(locale)
  return i18n._('That code is not right. Try again.')
}

// The code the file draws, «۴۷۲», and a whole one.
const DRAWN = '472'
const WHOLE = '47219'

// The width the desktop's card gives the row, 407:6981.
const ROW_WIDTH = 376

// What the sign-in field tells a phone, typed so it reads as values.
const SIGN_IN_KEYBOARD: Keyboard = { type: 'text', inputMode: 'numeric', enterKeyHint: 'go', autoComplete: 'one-time-code' }

// What the bound field holds, as the Input's stories keep it, KN-253 and KN-280:
// the value it shows, what it has sent to the args and not yet seen come back,
// and the value and revision it last saw.
interface BoundArgs extends CodeInputProps {
  revision?: number
}
interface Sent {
  revision: number
  value: string
}
interface Held {
  value: string
  sent: Sent[]
  seen: { value: string; revision: number | undefined }
}

// The field the meta's render draws: an edit shows at once and goes to the args
// with a revision, so an arg that comes back at a revision this field sent, with the
// value it sent there, is an echo and changes nothing, and anything else was set in
// Controls and is taken, as the Input's Bound does.
const Bound = ({ args: given, updateArgs }: { args: BoundArgs; updateArgs: (update: Partial<BoundArgs>) => void }) => {
  const { revision, ...args } = given
  const [held, setHeld] = useState<Held>({ value: args.value, sent: [], seen: { value: args.value, revision } })
  const counter = useRef(revision ?? 0)
  if (args.value !== held.seen.value || revision !== held.seen.revision) {
    const seen = { value: args.value, revision }
    const echo = revision !== undefined && held.sent.some((sent) => sent.revision === revision && sent.value === args.value)
    setHeld(
      echo
        ? { value: held.value, sent: held.sent.filter((sent) => sent.revision > revision), seen }
        : { value: args.value, sent: [], seen },
    )
  }
  const onChange = (value: string) => {
    const at = Math.max(counter.current, revision ?? 0) + 1
    counter.current = at
    setHeld((current) => ({ ...current, value, sent: [...current.sent, { revision: at, value }] }))
    updateArgs({ value, revision: at })
    args.onChange(value)
  }
  return <CodeInput {...args} value={held.value} onChange={onChange} />
}

const meta = {
  title: 'Shared/CodeInput',
  component: CodeInput,
  args: { label: labelIn('fa-IR'), value: '', onChange: fn(), revision: 0 },
  argTypes: { revision: { table: { disable: true } } },
  decorators: [
    // The row at the width the desktop's card gives it, inside some room.
    (Story) => (
      <Box sx={{ padding: 2 }}>
        <Box sx={{ width: ROW_WIDTH }}>
          <Story />
        </Box>
      </Box>
    ),
  ],
  render: function Render(args) {
    const [, updateArgs] = useArgs<BoundArgs>()
    return <Bound args={args} updateArgs={updateArgs} />
  },
} satisfies StoryMeta<BoundArgs>

export default meta
type Story = StoryObj<typeof meta>

// A play about one state offers no control that would change it, KN-255.
const FIXED = { controls: { disable: true } }

const px = (value: string) => Number.parseFloat(value) || 0

// A token as the browser computes it, borrowed on the host's own inline style and
// put back in the same tick, on an element with no transition, KN-365.
const computed = (host: HTMLElement, value: string) => {
  const previous = host.style.borderLeftColor
  host.style.borderLeftColor = value
  const result = getComputedStyle(host).borderLeftColor
  host.style.borderLeftColor = previous
  return result
}

// The one field, and the five boxes drawn for the eye, left to right.
const fieldOf = (canvasElement: HTMLElement) => {
  const field = within(canvasElement).getByRole('textbox')
  if (!(field instanceof HTMLInputElement)) throw new Error('the code input has no text field')
  return field
}
const boxesOf = (canvasElement: HTMLElement) => {
  const row = fieldOf(canvasElement).previousElementSibling
  if (!(row instanceof HTMLElement)) throw new Error('the code input has no row of boxes')
  return [...row.children].filter((box): box is HTMLElement => box instanceof HTMLElement)
}
const edgeOf = (box: HTMLElement) => getComputedStyle(box, '::before')
// What each box shows.
const shown = (canvasElement: HTMLElement) => boxesOf(canvasElement).map((box) => box.textContent)
// The digits a reader of a language sees for a code, one a box, the rest empty.
const drawnAs = (locale: Locale, code: string) =>
  Array.from({ length: 5 }, (_, at) => (at < code.length ? formatCount(locale, Number(code.charAt(at))) : ''))
// Which box draws the focus edge, or -1 for none.
const currentBox = (canvasElement: HTMLElement) => boxesOf(canvasElement).findIndex((box) => px(edgeOf(box).borderTopWidth) === 2)
// A press at the middle of a box, as the field receives it.
const pressOn = async (canvasElement: HTMLElement, at: number, detail: number) => {
  const box = boxesOf(canvasElement)[at]
  if (!box) throw new Error(`the row has no box ${String(at)}`)
  const { left, top, width, height } = box.getBoundingClientRect()
  await fireEvent.click(fieldOf(canvasElement), { clientX: left + width / 2, clientY: top + height / 2, detail })
}

export const Playground: Story = {
  globals: { locale: 'fa-IR' },
}

export const AsTheFrame: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  parameters: FIXED,
  play: async ({ canvasElement }) => {
    // Node 407:6981 in the desktop's card: five boxes filling the row 8 apart, 56
    // tall, radius md, bg/surface, one pixel of border/default inside, and with three
    // digits typed the fourth box two pixels of border/focus; each digit 20 at
    // SemiBold on a line of 32 in text/primary, centred, «۴۷۲» from the left.
    const field = fieldOf(canvasElement)
    await userEvent.click(field)
    await userEvent.type(field, DRAWN)
    const boxes = boxesOf(canvasElement)
    await expect(boxes).toHaveLength(5)
    const [first, second, , fourth] = boxes
    if (!first || !second || !fourth) throw new Error('the row has too few boxes')
    await expect(boxes.map((box) => Math.round(box.getBoundingClientRect().width * 10) / 10)).toEqual([68.8, 68.8, 68.8, 68.8, 68.8])
    await expect(boxes.map((box) => box.getBoundingClientRect().height)).toEqual([56, 56, 56, 56, 56])
    await expect(Math.round(second.getBoundingClientRect().left - first.getBoundingClientRect().right)).toBe(8)
    await expect(first.getBoundingClientRect().left).toBeLessThan(second.getBoundingClientRect().left)
    const style = getComputedStyle(first)
    await expect([px(style.borderTopLeftRadius), px(style.fontSize), style.fontWeight, px(style.lineHeight)]).toEqual([8, 20, '600', 32])
    await expect(style.backgroundColor).toBe(computed(first, semantic['bg/surface']))
    await expect(style.color).toBe(computed(first, semantic['text/primary']))
    await expect(px(edgeOf(first).borderTopWidth)).toBe(1)
    await expect(edgeOf(first).borderTopColor).toBe(computed(first, semantic['border/default']))
    await expect(currentBox(canvasElement)).toBe(3)
    await expect(edgeOf(fourth).borderTopColor).toBe(computed(fourth, semantic['border/focus']))
    await expect(shown(canvasElement)).toEqual(drawnAs('fa-IR', DRAWN))

    // Without focus no box is current, as the file's fifth box beside its focused
    // fourth shows at rest.
    field.blur()
    await waitFor(async () => {
      await expect(currentBox(canvasElement)).toBe(-1)
    })
  },
}

export const Typing: Story = {
  globals: { locale: 'fa-IR' },
  parameters: FIXED,
  play: async ({ args, canvasElement }) => {
    // Typed digit by digit, each lands in the next box and the code goes back with
    // it; a sixth digit is not taken.
    const field = fieldOf(canvasElement)
    await userEvent.click(field)
    await userEvent.type(field, `${WHOLE}8`)
    await expect(shown(canvasElement)).toEqual(drawnAs('fa-IR', WHOLE))
    await expect(args.onChange).toHaveBeenLastCalledWith(WHOLE)
    await expect(field).toHaveValue(WHOLE)
    await expect(currentBox(canvasElement)).toBe(4)
  },
}

export const Pasting: Story = {
  globals: { locale: 'fa-IR' },
  parameters: FIXED,
  play: async ({ args, canvasElement }) => {
    // A whole code pasted with words around it, in Persian digits, as a message
    // writes it: the digits are the code, read as Latin, and nothing else is kept,
    // which a native maxLength would have cut before the digits arrived.
    const field = fieldOf(canvasElement)
    await userEvent.click(field)
    await userEvent.paste(`${labelIn('fa-IR')}: ${drawnAs('fa-IR', WHOLE).join('')}`)
    await expect(args.onChange).toHaveBeenLastCalledWith(WHOLE)
    await expect(field).toHaveValue(WHOLE)
    await expect(shown(canvasElement)).toEqual(drawnAs('fa-IR', WHOLE))
  },
}

export const Backspace: Story = {
  globals: { locale: 'fa-IR' },
  parameters: FIXED,
  play: async ({ args, canvasElement }) => {
    // Backspace takes the digits back one at a time, and the focus edge moves back
    // with the caret.
    const field = fieldOf(canvasElement)
    await userEvent.click(field)
    await userEvent.type(field, WHOLE)
    await userEvent.keyboard('{Backspace}{Backspace}')
    await expect(args.onChange).toHaveBeenLastCalledWith(DRAWN)
    await expect(shown(canvasElement)).toEqual(drawnAs('fa-IR', DRAWN))
    await expect(currentBox(canvasElement)).toBe(3)
  },
}

export const SelectingToReplace: Story = {
  globals: { locale: 'fa-IR' },
  parameters: FIXED,
  play: async ({ args, canvasElement }) => {
    // The field's own selection: everything selected and a digit typed replace the
    // code. A press on the second box puts the caret there, and a double press, which
    // selected something, keeps it.
    const field = fieldOf(canvasElement)
    await userEvent.click(field)
    await userEvent.type(field, WHOLE)
    field.setSelectionRange(0, WHOLE.length)
    await userEvent.keyboard('8')
    await expect(args.onChange).toHaveBeenLastCalledWith('8')
    await expect(shown(canvasElement)).toEqual(drawnAs('fa-IR', '8'))

    field.setSelectionRange(1, 1)
    await userEvent.keyboard('123')
    field.setSelectionRange(4, 4)
    await pressOn(canvasElement, 1, 1)
    await expect([field.selectionStart, field.selectionEnd]).toEqual([1, 1])
    await waitFor(async () => {
      await expect(currentBox(canvasElement)).toBe(1)
    })

    field.setSelectionRange(0, 2)
    await pressOn(canvasElement, 3, 2)
    await expect([field.selectionStart, field.selectionEnd]).toEqual([0, 2])
  },
}

export const ReadsAsOneField: Story = {
  args: { enterKeyHint: 'go' },
  globals: { locale: 'fa-IR' },
  parameters: FIXED,
  play: async ({ canvasElement }) => {
    // A screen reader meets one field, named for the code, and none of the digits the
    // boxes draw; the field tells a phone what it holds and what its key does, and
    // sets no length a pasted code would be cut at.
    const canvas = within(canvasElement)
    await expect(canvas.getAllByRole('textbox')).toHaveLength(1)
    const field = fieldOf(canvasElement)
    await expect(field).toHaveAccessibleName(labelIn('fa-IR'))
    const boxes = field.previousElementSibling
    if (!(boxes instanceof HTMLElement)) throw new Error('the code input has no row of boxes')
    await expect(boxes.ariaHidden).toBe(String(true))
    await expect(keyboardOf(field)).toEqual(SIGN_IN_KEYBOARD)
    await expect(field.maxLength).toBe(-1)
  },
}

export const WholeCodeAtOnce: Story = {
  globals: { locale: 'fa-IR' },
  parameters: FIXED,
  play: async ({ args, canvasElement }) => {
    // A whole code written into the field in one change, as a phone's autofill writes
    // it, fills the five boxes. A phone's own suggestion also needs the message to
    // name the site, which no story can show.
    await fireEvent.input(fieldOf(canvasElement), { target: { value: WHOLE } })
    await waitFor(async () => {
      await expect(shown(canvasElement)).toEqual(drawnAs('fa-IR', WHOLE))
    })
    await expect(args.onChange).toHaveBeenLastCalledWith(WHOLE)
  },
}

export const Refused: Story = {
  args: { value: '00000', error: refusalIn('fa-IR') },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  parameters: FIXED,
  play: async ({ canvasElement }) => {
    // Refused, the code says so in the Input's line 4 under the row, 14 on 22 in
    // text/error, announced as it appears; every box's edge is border/error, and the
    // field is invalid and described by the line.
    const field = fieldOf(canvasElement)
    const alert = within(canvasElement).getByRole('alert')
    await expect(alert).toHaveTextContent(refusalIn('fa-IR'))
    await expect(field.ariaInvalid).toBe(String(true))
    await expect(field).toHaveAccessibleDescription(refusalIn('fa-IR'))
    const line = alert.parentElement
    if (!line) throw new Error('the alert has no line around it')
    const lineStyle = getComputedStyle(line)
    await expect([px(lineStyle.marginTop), px(lineStyle.fontSize), px(lineStyle.lineHeight)]).toEqual([4, 14, 22])
    await expect(lineStyle.color).toBe(computed(line, semantic['text/error']))
    for (const box of boxesOf(canvasElement)) await expect(edgeOf(box).borderTopColor).toBe(computed(box, semantic['border/error']))
    // Focused, the current box keeps its focus edge on the red row.
    await userEvent.click(field)
    const current = boxesOf(canvasElement)[currentBox(canvasElement)]
    if (!current) throw new Error('no box took the focus edge')
    await expect(edgeOf(current).borderTopColor).toBe(computed(current, semantic['border/focus']))
  },
}

export const EmptyError: Story = {
  args: { error: '' },
  globals: { locale: 'fa-IR' },
  parameters: FIXED,
  play: async ({ canvasElement }) => {
    // A blank error is no error, the Input's rule: nothing said, no red edge, nothing
    // invalid.
    const field = fieldOf(canvasElement)
    await expect(within(canvasElement).getByRole('alert')).toBeEmptyDOMElement()
    await expect(field.ariaInvalid).toBeNull()
    const first = boxesOf(canvasElement)[0]
    if (!first) throw new Error('the row has no boxes')
    await expect(edgeOf(first).borderTopColor).toBe(computed(first, semantic['border/default']))
  },
}

export const InEnglish: Story = {
  args: { label: labelIn('en-US'), value: WHOLE },
  globals: { locale: 'en-US' },
  parameters: FIXED,
  play: async ({ canvasElement }) => {
    // In English the boxes draw Latin digits, still left to right.
    await expect(shown(canvasElement)).toEqual(drawnAs('en-US', WHOLE))
    await expect(fieldOf(canvasElement)).toHaveAccessibleName(labelIn('en-US'))
  },
}
