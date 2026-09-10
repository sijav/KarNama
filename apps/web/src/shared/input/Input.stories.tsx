import { useLingui } from '@lingui/react'
import { Stack } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import type { ChangeEvent } from 'react'
import { useArgs } from 'storybook/preview-api'
import { expect, fn, userEvent, within } from 'storybook/test'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { Input, type InputProps } from './Input'

// A token's colour as the browser computes it, so it compares with a computed
// style. Borrowed on the host's own inline style and put back in the same tick.
const computedColour = (host: HTMLElement, colour: string) => {
  const previous = host.style.color
  host.style.color = colour
  const value = getComputedStyle(host).color
  host.style.color = previous
  return value
}

// Everything that places the text inside the field: the input's box, how far
// its content is scrolled, and every computed property of the input, since any
// of them (its own padding, text-indent, the font, letter spacing) can move the
// text inside a box that stays where it was, KN-243. The one exemption is the
// outline: it takes no space, so it cannot move the text, and MUI zeroes the
// input's outline width on focus with no outline drawn in either state.
const NOT_LAYOUT = /^outline(-|$)/
const propertiesOf = (style: CSSStyleDeclaration, prefix = '') =>
  Object.fromEntries(Array.from(style).filter((name) => !NOT_LAYOUT.test(name)).map((name) => [`${prefix}${name}`, style.getPropertyValue(name)]))
const textLayout = (box: HTMLElement): Record<string, string> => {
  const { left, top, width, height } = box.getBoundingClientRect()
  return {
    ...propertiesOf(getComputedStyle(box)),
    // What an empty field shows is its placeholder, a pseudo-element the
    // input's own style does not report. Its properties are keyed with a
    // leading '::', so a failure names the placeholder's own, KN-248.
    ...propertiesOf(getComputedStyle(box, '::placeholder'), '::'),
    // Prefixed, since left, top, width and height are CSS properties too.
    ...Object.fromEntries(Object.entries({ left, top, width, height, scrollLeft: box.scrollLeft, scrollTop: box.scrollTop }).map(([name, value]) => [`box ${name}`, String(value)])),
  }
}

// What differs between two layouts, by name, so a failure says what moved.
const changes = (before: Record<string, string>, after: Record<string, string>) =>
  [...new Set([...Object.keys(before), ...Object.keys(after)])].filter((name) => before[name] !== after[name]).map((name) => `${name}: ${before[name] ?? 'unset'} → ${after[name] ?? 'unset'}`)

// What a user typed: record data, so it is not translated.
const TYPED = 'توسعه‌دهنده فرانت‌اند'

// The design's own specimen, node 95:38, with its copy through the catalog so
// the Language toolbar changes it. The job title field of the add-job form.
// Every arg passes through; the specimen's copy fills in only where an arg is
// left empty, so the Controls panel drives the field, KN-242.
const JobTitle = ({ withError = false, label, placeholder, helperText, ...rest }: Partial<InputProps> & { withError?: boolean }) => {
  const { i18n } = useLingui()
  return (
    <Input
      label={label === undefined || label === '' ? i18n._('Job title') : label}
      placeholder={placeholder ?? i18n._('e.g. Frontend developer')}
      helperText={helperText ?? i18n._('A short explanation')}
      {...(withError ? { error: i18n._('This field cannot be empty') } : {})}
      {...rest}
    />
  )
}

// The controls a story offers: only the args its play function holds for, so
// changing one in Controls and pressing Rerun never has the story report
// something untrue about the canvas. Storybook offers every control unless
// told otherwise, including any prop added later, KN-247.
const offers = (names: (keyof InputProps)[]) => ({ controls: { include: names } })

// The field itself: MUI's input root, the element that draws the border.
const fieldOf = (canvasElement: HTMLElement) => {
  const field = within(canvasElement).getByRole('textbox').parentElement
  if (!field) throw new Error('the input has no field around it')
  return field
}

const meta = {
  title: 'Shared/Input',
  component: Input,
  // An empty label means the specimen's, from the catalog; set one in
  // Controls and it is used instead.
  args: { label: '', onChange: fn() },
  // Keyed on defaultValue: the field is uncontrolled, and React reads a
  // default only when the field mounts, so a new one needs a new field or the
  // Controls panel changes nothing, KN-246. And on whether value is set: one
  // input cannot turn from uncontrolled to controlled or back, so value
  // arriving or being reset starts the field over too, KN-252. A controlled
  // field ignores its default, so the default is in the key only while value
  // is unset, or a new one would remount it for nothing, KN-258. Value is bound
  // to the args: set it in Controls and the field is controlled, so what is
  // typed has to go back into the arg, or the field refuses every keystroke,
  // KN-249.
  render: function Render(args) {
    const [, updateArgs] = useArgs<InputProps>()
    const onChange = (value: string, event: ChangeEvent<HTMLInputElement>) => {
      if (args.value !== undefined) updateArgs({ value })
      args.onChange?.(value, event)
    }
    return <JobTitle key={args.value === undefined ? `0${args.defaultValue ?? ''}` : '1'} {...args} onChange={onChange} />
  },
} satisfies StoryMeta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  // Not error: it asserts the default border.
  parameters: offers(['label', 'value', 'defaultValue', 'placeholder', 'helperText', 'disabled', 'name']),
  globals: { colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const field = fieldOf(canvasElement)
    const style = getComputedStyle(field)
    // Node 95:3: 44 tall, 16 at each side, radius md, one pixel of border/default.
    await expect(field.offsetHeight).toBe(44)
    await expect([style.paddingLeft, style.paddingRight].map(Number.parseFloat)).toEqual([16, 16])
    await expect(Number.parseFloat(style.borderTopLeftRadius)).toBe(8)
    await expect(Number.parseFloat(style.borderTopWidth)).toBe(1)
    await expect(style.borderTopColor).toBe(computedColour(field, semantic['border/default']))
  },
}

export const FromArgs: Story = {
  // Nothing like the specimen, so the field must be following its args, and
  // what it expects is read from them, so it holds for whatever is set. Not
  // the label: an empty one means the specimen's. Letter-free values, since
  // they are test data rather than copy.
  parameters: offers(['value', 'defaultValue', 'placeholder', 'helperText', 'error', 'disabled', 'name']),
  args: { label: '42', defaultValue: '7', helperText: '#', disabled: true },
  play: async ({ args, canvasElement }) => {
    const box = within(canvasElement).getByRole('textbox')
    await expect(box).toHaveAccessibleName(args.label)
    await expect(box).toHaveValue(args.value ?? args.defaultValue ?? '')
    // A blank error is no error, so the helper describes the field then, KN-254.
    const blank = args.error === undefined || args.error.trim() === ''
    await expect(box).toHaveAccessibleDescription((blank ? args.helperText : args.error) ?? '')
    await (args.disabled === true ? expect(box).toBeDisabled() : expect(box).toBeEnabled())
  },
}

export const Filled: Story = {
  parameters: offers(['label', 'value', 'defaultValue', 'placeholder', 'helperText', 'error', 'disabled', 'name']),
  args: { defaultValue: TYPED },
  play: async ({ args, canvasElement }) => {
    await expect(within(canvasElement).getByRole('textbox')).toHaveValue(args.value ?? args.defaultValue ?? '')
  },
}

export const Focus: Story = {
  // Not error, whose focus is FocusedWhileInvalid, and not disabled, which
  // cannot take focus.
  parameters: offers(['label', 'value', 'defaultValue', 'placeholder', 'helperText', 'name']),
  globals: { colorScheme: 'light' },
  args: { defaultValue: TYPED },
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('textbox')
    const field = fieldOf(canvasElement)
    const before = textLayout(box)
    await userEvent.tab()
    await expect(box).toHaveFocus()
    const style = getComputedStyle(field)
    // Node 95:17: TWO pixels of border/focus, and the text does not move for
    // it: the field is border-box and 44 tall either way, and nothing that lays
    // the text out inside it changes.
    await expect(Number.parseFloat(style.borderTopWidth)).toBe(2)
    await expect(style.borderTopColor).toBe(computedColour(field, semantic['border/focus']))
    await expect(changes(before, textLayout(box))).toEqual([])
    await expect(field.offsetHeight).toBe(44)
  },
}

export const FocusWhileEmpty: Story = {
  // Empty, so what it shows is the placeholder, and that must not move on
  // focus either, KN-248. Not value or defaultValue, which would fill it, and
  // not disabled, which cannot take focus.
  parameters: offers(['label', 'placeholder', 'helperText', 'error', 'name']),
  globals: { colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('textbox')
    await expect(box).toHaveValue('')
    const before = textLayout(box)
    await userEvent.tab()
    await expect(box).toHaveFocus()
    await expect(changes(before, textLayout(box))).toEqual([])
  },
}

export const WithError: Story = {
  // A fixed render: the error copy comes from the catalog, which an arg cannot
  // carry, so the controls are not offered.
  parameters: { controls: { disable: true } },
  globals: { colorScheme: 'light' },
  render: () => <JobTitle defaultValue="توسعه" withError />,
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('textbox')
    const field = fieldOf(canvasElement)
    // Node 95:24: border/error on the field, text/error on the line under it,
    // and the error is what the field announces as its description.
    await expect(getComputedStyle(field).borderTopColor).toBe(computedColour(field, semantic['border/error']))
    await expect(box).toHaveAttribute('aria-invalid', 'true')
    const describedBy = box.getAttribute('aria-describedby') ?? ''
    const line = canvasElement.ownerDocument.getElementById(describedBy)
    if (!line) throw new Error('the field describes itself by nothing')
    await expect(getComputedStyle(line).color).toBe(computedColour(line, semantic['text/error']))
    await expect(box).toHaveAccessibleDescription(line.textContent)
  },
}

export const FocusedWhileInvalid: Story = {
  parameters: { controls: { disable: true } },
  globals: { colorScheme: 'light' },
  render: () => <JobTitle defaultValue="توسعه" withError />,
  play: async ({ canvasElement }) => {
    const field = fieldOf(canvasElement)
    await userEvent.tab()
    await expect(within(canvasElement).getByRole('textbox')).toHaveFocus()
    // Not drawn in the file, decided in DESIGN.md: the focus width in the
    // error colour, so the error stays visible while it is being fixed.
    const style = getComputedStyle(field)
    await expect(Number.parseFloat(style.borderTopWidth)).toBe(2)
    await expect(style.borderTopColor).toBe(computedColour(field, semantic['border/error']))
  },
}

export const Disabled: Story = {
  parameters: offers(['label', 'value', 'defaultValue', 'placeholder', 'helperText', 'error', 'name']),
  globals: { colorScheme: 'light' },
  args: { defaultValue: TYPED, disabled: true },
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('textbox')
    const field = fieldOf(canvasElement)
    // Node 95:31: the secondary surface, and text/disabled for what it holds.
    await expect(box).toBeDisabled()
    await expect(getComputedStyle(field).backgroundColor).toBe(computedColour(field, semantic['bg/surface-secondary']))
    await expect(getComputedStyle(box).webkitTextFillColor).toBe(computedColour(box, semantic['text/disabled']))
  },
}

export const Hover: Story = {
  // Not error and not disabled: neither takes the hover border. Only the test
  // runner's real pointer reaches that assertion, so this list is read, not run.
  parameters: offers(['label', 'value', 'defaultValue', 'placeholder', 'helperText', 'name']),
  globals: { colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('textbox')
    const field = fieldOf(canvasElement)
    await expect(getComputedStyle(field).borderTopColor).toBe(computedColour(field, semantic['border/default']))
    // A REAL pointer, the Checkbox's pattern: `:hover` is the browser's own hit
    // testing, and only the test runner can drive one. In Storybook's UI the
    // story is a canvas; anywhere else without the flag is an error, KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) {
      if ('__STORYBOOK_PREVIEW__' in globalThis) return
      throw new Error('Hover is running outside Storybook without the story-test flag that .storybook/vitest.setup.ts sets')
    }
    const browser = await import('vitest/browser')
    await browser.userEvent.hover(box)
    // Node 512:761: the border takes text/secondary.
    await expect(getComputedStyle(field).borderTopColor).toBe(computedColour(field, semantic['text/secondary']))
  },
}

export const LabelIsBound: Story = {
  // Not disabled: a disabled field does not take focus from its label.
  parameters: offers(['label', 'value', 'defaultValue', 'placeholder', 'helperText', 'error', 'name']),
  play: async ({ canvasElement }) => {
    // Clicking the label reaches the field, and the field is named by it.
    const box = within(canvasElement).getByRole('textbox')
    const label = canvasElement.querySelector('label')
    if (!label) throw new Error('there is no label element')
    await expect(box).toHaveAccessibleName(label.textContent)
    await userEvent.click(label)
    await expect(box).toHaveFocus()
  },
}

// The bare field: a label and nothing under it, not even a helper.
const Bare = (props: Partial<InputProps>) => {
  const { i18n } = useLingui()
  return <Input label={i18n._('Job title')} {...props} />
}

export const Typing: Story = {
  // What it types and the name it checks are fixed, so neither the field's
  // content, its name nor disabled is offered.
  parameters: offers(['label', 'placeholder', 'helperText', 'error']),
  args: { name: 'title' },
  play: async ({ args, canvasElement }) => {
    const box = within(canvasElement).getByRole('textbox')
    await userEvent.type(box, '42')
    await expect(box).toHaveValue('42')
    // The new text first, then the event, so a caller never reads it back off
    // the element.
    await expect(args.onChange).toHaveBeenLastCalledWith('42', expect.objectContaining({ target: box }))
    await expect(box).toHaveAttribute('name', 'title')
  },
}

export const WithoutAHelper: Story = {
  // A fixed render with no helper at all, which the specimen always has.
  parameters: { controls: { disable: true } },
  render: () => <Bare />,
  play: async ({ canvasElement }) => {
    // Nothing to describe it by, so it points at nothing, and the empty line
    // still holds its place.
    await expect(within(canvasElement).getByRole('textbox')).not.toHaveAttribute('aria-describedby')
  },
}

export const ErrorDoesNotMoveTheField: Story = {
  parameters: { controls: { disable: true } },
  // Side by side, with no message at all and with an error: the line under the
  // field keeps its height either way, so validation never shifts what comes
  // after it in a form. Aligned to the top, NOT stretched: a stretching row
  // gave both the taller one's height, and the first version passed with the
  // reserved line removed.
  render: () => (
    <Stack direction="row" spacing={3} data-testid="pair" sx={{ alignItems: 'flex-start' }}>
      <JobTitle helperText="" />
      <JobTitle withError />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const [plain, failing] = within(canvasElement).getAllByRole('textbox')
    if (!plain || !failing) throw new Error('the two fields did not render')
    const [first, second] = [...within(canvasElement).getByTestId('pair').children]
    if (!(first instanceof HTMLElement) || !(second instanceof HTMLElement)) throw new Error('the pair is not two elements')
    await expect(first.offsetHeight).toBe(second.offsetHeight)
    await expect(plain.getBoundingClientRect().top).toBe(failing.getBoundingClientRect().top)
  },
}

export const BlankErrorIsNoError: Story = {
  // A form may clear a field's error to '' rather than to undefined, or leave
  // spaces in it. Blank is no error: the default border, not invalid, and the
  // helper still under it, KN-254. A fixed pair, so no control applies.
  parameters: { controls: { disable: true } },
  globals: { colorScheme: 'light' },
  render: () => (
    <Stack direction="row" spacing={3} data-testid="blank">
      <JobTitle error="" />
      <JobTitle error="   " />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const pair = [...within(canvasElement).getByTestId('blank').children]
    await expect(pair).toHaveLength(2)
    for (const input of pair) {
      if (!(input instanceof HTMLElement)) throw new Error('a field is not an element')
      const box = within(input).getByRole('textbox')
      const field = fieldOf(input)
      await expect(box).not.toHaveAttribute('aria-invalid')
      await expect(getComputedStyle(field).borderTopColor).toBe(computedColour(field, semantic['border/default']))
      const line = canvasElement.ownerDocument.getElementById(box.getAttribute('aria-describedby') ?? '')
      if (!line) throw new Error('the field describes itself by nothing')
      await expect(line.textContent).not.toBe('')
      await expect(getComputedStyle(line).color).toBe(computedColour(line, semantic['text/secondary']))
    }
  },
}
