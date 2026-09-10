import { useLingui } from '@lingui/react'
import { Stack } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
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

// What a user typed: record data, so it is not translated.
const TYPED = 'توسعه‌دهنده فرانت‌اند'

// The design's own specimen, node 95:38, with its copy through the catalog so
// the Language toolbar changes it. The job title field of the add-job form.
const JobTitle = (props: Partial<InputProps> & { withError?: boolean }) => {
  const { i18n } = useLingui()
  const { withError = false, ...rest } = props
  return (
    <Input
      label={i18n._('Job title')}
      placeholder={i18n._('e.g. Frontend developer')}
      helperText={i18n._('A short explanation')}
      {...(withError ? { error: i18n._('This field cannot be empty') } : {})}
      {...rest}
    />
  )
}

// The field itself: MUI's input root, the element that draws the border.
const fieldOf = (canvasElement: HTMLElement) => {
  const field = within(canvasElement).getByRole('textbox').parentElement
  if (!field) throw new Error('the input has no field around it')
  return field
}

const meta = {
  title: 'Shared/Input',
  component: Input,
  // The copy comes from the catalog in each story's render; this only makes
  // the required prop's type whole.
  args: { label: '', onChange: fn() },
} satisfies StoryMeta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  globals: { colorScheme: 'light' },
  render: (args) => <JobTitle {...(args.onChange === undefined ? {} : { onChange: args.onChange })} />,
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

export const Filled: Story = {
  render: () => <JobTitle defaultValue={TYPED} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('textbox')).toHaveValue(TYPED)
  },
}

export const Focus: Story = {
  globals: { colorScheme: 'light' },
  render: () => <JobTitle defaultValue={TYPED} />,
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('textbox')
    const field = fieldOf(canvasElement)
    const before = box.getBoundingClientRect()
    await userEvent.tab()
    await expect(box).toHaveFocus()
    const style = getComputedStyle(field)
    // Node 95:17: TWO pixels of border/focus, and the text does not move for
    // it, sideways or up and down: the field is border-box and 44 tall either way.
    await expect(Number.parseFloat(style.borderTopWidth)).toBe(2)
    await expect(style.borderTopColor).toBe(computedColour(field, semantic['border/focus']))
    const after = box.getBoundingClientRect()
    await expect([after.left, after.top]).toEqual([before.left, before.top])
    await expect(field.offsetHeight).toBe(44)
  },
}

export const WithError: Story = {
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
  globals: { colorScheme: 'light' },
  render: () => <JobTitle defaultValue={TYPED} disabled />,
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
  globals: { colorScheme: 'light' },
  render: () => <JobTitle />,
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
  render: () => <JobTitle />,
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
  render: (args) => <Bare name="title" {...(args.onChange === undefined ? {} : { onChange: args.onChange })} />,
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
  render: () => <Bare />,
  play: async ({ canvasElement }) => {
    // Nothing to describe it by, so it points at nothing, and the empty line
    // still holds its place.
    await expect(within(canvasElement).getByRole('textbox')).not.toHaveAttribute('aria-describedby')
  },
}

export const ErrorDoesNotMoveTheField: Story = {
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
