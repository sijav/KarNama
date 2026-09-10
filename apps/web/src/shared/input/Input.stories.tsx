import { useLingui } from '@lingui/react'
import { Box, Stack } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { useEffect, type ChangeEvent } from 'react'
import { useArgs, useRef } from 'storybook/preview-api'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18n } from '../../i18n'
import { contrast } from '../../theme/darkMode'
import { semantic, spacing } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { isBlank } from './blank'
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

// A computed rgb() colour as the hex the WCAG contrast formula takes.
const hexOf = (rgb: string) => {
  const channels = rgb.match(/\d+/g)?.slice(0, 3) ?? []
  if (channels.length !== 3) throw new Error(`not an rgb colour: ${rgb}`)
  return `#${channels.map((channel) => Number(channel).toString(16).padStart(2, '0')).join('')}`
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

// The design's own specimen, node 95:38: the job title field of the add-job
// form, its copy through the catalog in the language active when it is read.
type CopyField = 'label' | 'placeholder' | 'helperText'
const COPY_FIELDS: CopyField[] = ['label', 'placeholder', 'helperText']
const specimenCopy = (): Record<CopyField, string> => ({
  label: i18n._('Job title'),
  placeholder: i18n._('e.g. Frontend developer'),
  helperText: i18n._('A short explanation'),
})

// The args start as the specimen's copy in the language this file loads in,
// so the Controls show what the canvas draws from the first frame, KN-245.
const AT_LOAD = specimenCopy()

// Writes the specimen's copy for the language on screen back into the args,
// after the commit, as React's passive effect. Storybook's own effects run
// only once play has finished in its preview, where a play could never see
// their write, and Storybook's hooks may not share a function with React's,
// so the effect lives here and the story render owns the args. Portable
// stories apply no args update, so under the test runner the write changes
// nothing, TECH-DEBT 16.
const FollowTheLanguage = ({ pending, write }: { pending: boolean; write: () => void }) => {
  useEffect(() => {
    if (pending) write()
  })
  return null
}

// The specimen for the fixed renders, which offer no controls: its copy is
// stated here, in the language on screen, and any prop given replaces it.
const JobTitle = ({ withError = false, ...rest }: Partial<InputProps> & { withError?: boolean }) => (
  <Input {...specimenCopy()} {...(withError ? { error: i18n._('This field cannot be empty') } : {})} {...rest} />
)

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
  // The specimen's copy is IN the args, so the Controls show it, and the
  // render keeps it in the language on screen, KN-245.
  args: { ...AT_LOAD, onChange: fn() },
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
  //
  // The specimen's copy follows the Language toolbar IN the args, KN-245. A
  // field still holding what this story put there, what it loaded with or
  // what it last wrote, takes this language's copy, written back with
  // updateArgs; anything else was typed in Controls and is drawn exactly as
  // it is, an emptied one included. A typed value equal to what the story
  // put there cannot be told apart from it, and follows the language too.
  render: function Render(args) {
    const [, updateArgs] = useArgs<InputProps>()
    // What this story last wrote into each copy field. Storybook's ref, kept
    // with the story's hooks rather than React's, so it outlives the remount a
    // language switch causes.
    const written = useRef<Record<CopyField, string>>({ ...AT_LOAD })
    // In the language on screen: the providers activate it before this runs,
    // and a switch remounts the tree, so this reads it fresh.
    const copy = specimenCopy()
    const update: Partial<Record<CopyField, string>> = {}
    for (const field of COPY_FIELDS) {
      const value = args[field]
      if ((value === written.current[field] || value === AT_LOAD[field]) && value !== copy[field]) update[field] = copy[field]
    }
    const write = () => {
      for (const field of COPY_FIELDS) {
        const value = update[field]
        if (value !== undefined) written.current[field] = value
      }
      updateArgs(update)
    }
    const onChange = (value: string, event: ChangeEvent<HTMLInputElement>) => {
      if (args.value !== undefined) updateArgs({ value })
      args.onChange?.(value, event)
    }
    // Drawn exactly as the args say, and nothing else: a value the Controls
    // do not show is the hidden fallback this story used to have.
    return (
      <>
        <FollowTheLanguage pending={COPY_FIELDS.some((field) => update[field] !== undefined)} write={write} />
        <Input key={args.value === undefined ? `0${args.defaultValue ?? ''}` : '1'} {...args} onChange={onChange} />
      </>
    )
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
  // what it expects is read from them, so it holds for whatever is set.
  // Letter-free values, since they are test data rather than copy.
  parameters: offers(['label', 'value', 'defaultValue', 'placeholder', 'helperText', 'error', 'disabled', 'name']),
  args: { label: '42', defaultValue: '7', helperText: '#', disabled: true },
  play: async ({ args, canvasElement }) => {
    const box = within(canvasElement).getByRole('textbox')
    await expect(box).toHaveAccessibleName(args.label)
    await expect(box).toHaveValue(args.value ?? args.defaultValue ?? '')
    // A blank error is no error, so the helper describes the field then, by
    // the Input's own rule rather than a copy of it, KN-254, KN-262.
    const blank = args.error === undefined || isBlank(args.error)
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

// The surfaces a field sits on, each rendered as an opaque backdrop, so the
// focus ring is measured against the colour actually behind it, KN-244.
const SURFACES: (keyof typeof semantic)[] = ['bg/surface', 'bg/page', 'bg/surface-secondary']

export const FocusedWhileInvalid: Story = {
  parameters: { controls: { disable: true } },
  globals: { colorScheme: 'light' },
  render: () => (
    <Stack>
      {SURFACES.map((surface) => (
        <Box key={surface} data-testid={surface} sx={(theme) => ({ backgroundColor: theme.karnama.semantic[surface], padding: `${spacing.md}px` })}>
          <JobTitle defaultValue="توسعه" withError />
        </Box>
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    for (const surface of SURFACES) {
      const backdrop = within(canvasElement).getByTestId(surface)
      await expect(getComputedStyle(backdrop).backgroundColor).toBe(computedColour(backdrop, semantic[surface]))
      const box = within(backdrop).getByRole('textbox')
      const field = fieldOf(backdrop)
      const before = textLayout(box)
      await userEvent.tab()
      await expect(box).toHaveFocus()
      // Not drawn in the file, decided in DESIGN.md. The border keeps the
      // focus width in the error colour, so the error stays in view while it
      // is being fixed, KN-241.
      const style = getComputedStyle(field)
      await expect(Number.parseFloat(style.borderTopWidth)).toBe(2)
      await expect(style.borderTopColor).toBe(computedColour(field, semantic['border/error']))
      // And the focus ring goes round it, since red to red is no change: two
      // pixels of border/focus outside the field, a band larger than the
      // field's own two pixel perimeter, changing from the backdrop at 3:1 or
      // more, WCAG 2.4.13, KN-244.
      await expect(style.outlineStyle).toBe('solid')
      await expect(Number.parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2)
      await expect(Number.parseFloat(style.outlineOffset)).toBeGreaterThanOrEqual(0)
      await expect(style.outlineColor).toBe(computedColour(field, semantic['border/focus']))
      await expect(contrast(hexOf(style.outlineColor), hexOf(getComputedStyle(backdrop).backgroundColor))).toBeGreaterThanOrEqual(3)
      // And nothing that lays the text out moves for any of it.
      await expect(changes(before, textLayout(box))).toEqual([])
    }
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

// The args this render was given, which are the store's and so the Controls
// panel's, recorded beside the field they drive. An unset one records
// nothing, so unset and emptied stay apart.
const WithTheArgs: NonNullable<Story['render']> = (args) => (
  <Box data-testid="args" data-label={args.label} data-placeholder={args.placeholder} data-helper={args.helperText}>
    {meta.render(args)}
  </Box>
)

export const ControlsMatchTheCanvas: Story = {
  // The canvas draws exactly the args, label, placeholder and helper, and
  // untouched they are the specimen's copy in the language on screen, KN-245.
  // A fixed assertion about the untouched state, so no control is offered.
  parameters: { controls: { disable: true } },
  render: WithTheArgs,
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('textbox')
    const recorded = within(canvasElement).getByTestId('args').dataset
    const helper = canvasElement.ownerDocument.getElementById(box.getAttribute('aria-describedby') ?? '')
    await expect(canvasElement.querySelector('label')?.textContent).toBe(recorded.label)
    await expect(box).toHaveAttribute('placeholder', recorded.placeholder)
    await expect(helper?.textContent).toBe(recorded.helper)
    // In Storybook itself, where the Controls panel is, the render writes the
    // copy for the language on screen into the args, so wait for it. Portable
    // stories apply no args update, so under the test runner the args stay in
    // the language this file loaded in and this half cannot run, TECH-DEBT 16.
    if ('__KARNAMA_STORY_TEST__' in globalThis) return
    const copy = specimenCopy()
    await waitFor(async () => {
      await expect(recorded.label).toBe(copy.label)
      await expect(recorded.placeholder).toBe(copy.placeholder)
      await expect(recorded.helper).toBe(copy.helperText)
    })
    await expect(canvasElement.querySelector('label')?.textContent).toBe(recorded.label)
  },
}

export const ControlsMatchTheCanvasInEnglish: Story = {
  ...ControlsMatchTheCanvas,
  // Not the language this file loads in, so the copy has to be written into
  // the args, not only kept there.
  globals: { locale: 'en-US' },
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
  // helper still under it, KN-254. Invisible is blank too: only a zero-width
  // non-joiner, or only a right-to-left mark, KN-259; and only the braille
  // blank, which draws nothing and is no format character, KN-261. A fixed set,
  // so no control applies. WithError is the other half: its Persian message
  // contains a zero-width non-joiner and is still an error.
  parameters: { controls: { disable: true } },
  globals: { colorScheme: 'light' },
  render: () => (
    // Out of the pointer's way: the test runner's real pointer stays where the
    // Hover story left it, and a hovered field takes its hover border.
    <Stack direction="row" spacing={3} data-testid="blank" sx={{ pointerEvents: 'none' }}>
      <JobTitle error="" />
      <JobTitle error="   " />
      <JobTitle error={'\u200c'} />
      <JobTitle error={'\u200f'} />
      <JobTitle error={'\u2800'} />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const pair = [...within(canvasElement).getByTestId('blank').children]
    await expect(pair).toHaveLength(5)
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
