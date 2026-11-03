import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18n } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { PasteField, type PasteFieldProps } from './PasteField'

// The add modal's body is 512 wide, the Field Wrap's width in 166:62.
const BODY = 512

// The field holds what is typed, as the add modal holds it.
const Held = ({ value: given, onChange, ...args }: PasteFieldProps) => {
  const [value, setValue] = useState(given)
  return (
    <Box sx={{ width: BODY }}>
      <PasteField
        {...args}
        value={value}
        onChange={(next) => {
          setValue(next)
          onChange(next)
        }}
      />
    </Box>
  )
}

const meta = {
  title: 'Shared/PasteField',
  component: PasteField,
  args: { value: '', onChange: fn(), onFocus: fn() },
  parameters: { controls: { include: ['value', 'error'] } },
  render: (args) => <Held {...args} />,
} satisfies StoryMeta<typeof PasteField>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A colour as the browser computes it, borrowed on the host's own inline style
// and put back in the same tick. Never inside waitFor, KN-014.
const computed = (host: HTMLElement, value: string) => {
  const previous = host.style.color
  host.style.color = value
  const result = getComputedStyle(host).color
  host.style.color = previous
  return result
}

const fieldIn = (canvasElement: HTMLElement) => within(canvasElement).getByRole('textbox', { name: i18n._('Posting link or full text') })
const boxOf = (field: HTMLElement) => {
  const box = field.closest('.MuiInputBase-root')
  if (!(box instanceof HTMLElement)) throw new Error('the field has no box round it')
  return box
}

// Node 961:101573 in its Field Wrap, 166:67: the label at 12 on 19 and Medium in
// text/primary, 4 above a field 512 wide and 54 tall, bg/surface, radius 8, 16
// round its text at 14 on 22, the placeholder in text/secondary, the edge one
// of border/control, the owner's at rest; and 4 under it the helper at 14 on 22
// in text/secondary.
const isAtRest = async (canvasElement: HTMLElement, palette: Record<keyof typeof semantic, string>) => {
  const field = fieldIn(canvasElement)
  const box = boxOf(field)
  const label = canvasElement.querySelector('label')
  if (!label) throw new Error('the field has no label')
  const labelStyle = getComputedStyle(label)
  await expect([px(labelStyle.fontSize), px(labelStyle.lineHeight), labelStyle.fontWeight]).toEqual([12, 19, '500'])
  await expect(labelStyle.color).toBe(computed(label, palette['text/primary']))
  const rect = box.getBoundingClientRect()
  await expect([rect.width, rect.height]).toEqual([BODY, 54])
  await expect(Math.round(rect.top - label.getBoundingClientRect().bottom)).toBe(4)
  const style = getComputedStyle(box)
  await expect([px(style.borderTopLeftRadius), px(style.paddingTop), px(style.paddingBottom), px(style.paddingInlineStart), px(style.paddingInlineEnd)]).toEqual([8, 16, 16, 16, 16])
  await expect(style.backgroundColor).toBe(computed(box, palette['bg/surface']))
  const edge = getComputedStyle(box, '::before')
  await expect([edge.borderTopStyle, px(edge.borderTopWidth)]).toEqual(['solid', 1])
  await expect(edge.borderTopColor).toBe(computed(box, palette['border/control']))
  const text = getComputedStyle(field)
  await expect([px(text.fontSize), px(text.lineHeight)]).toEqual([14, 22])
  await expect(getComputedStyle(field, '::placeholder').color).toBe(computed(box, palette['text/secondary']))
  const helper = canvasElement.ownerDocument.getElementById(field.getAttribute('aria-describedby') ?? '')
  if (!helper) throw new Error('the field has no helper')
  await expect(Math.round(helper.getBoundingClientRect().top - rect.bottom)).toBe(4)
  const helperStyle = getComputedStyle(helper)
  await expect([px(helperStyle.fontSize), px(helperStyle.lineHeight)]).toEqual([14, 22])
  await expect(helperStyle.color).toBe(computed(helper, palette['text/secondary']))
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await isAtRest(canvasElement, semantic)
    const field = fieldIn(canvasElement)
    await expect(field).toHaveAttribute('placeholder', i18n._('Put the posting link or its full text here'))
    await expect(field).toHaveAccessibleDescription(i18n._('A link or the full posting text; no need to separate anything.'))
  },
}

export const Hover: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // State=Hover: the edge in text/secondary, by the runner's real pointer,
    // since :hover is the browser's hit-testing, KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) {
      if (import.meta.env.MODE !== 'test') return
      throw new Error('Hover is running outside Storybook without the story-test flag that .storybook/vitest.setup.ts sets')
    }
    const browser = await import('vitest/browser')
    const box = boxOf(fieldIn(canvasElement))
    const edge = computed(box, semantic['text/secondary'])
    await browser.userEvent.hover(box)
    await waitFor(() => expect(getComputedStyle(box, '::before').borderTopColor).toBe(edge))
  },
}

export const Focus: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // The file draws no focus, so it is the Input's: two of border/focus, the
    // text where it was. Focus reaches the caller, which marks the field
    // touched.
    const field = fieldIn(canvasElement)
    await userEvent.click(field)
    await expect(field).toHaveFocus()
    await expect(args.onFocus).toHaveBeenCalled()
    const box = boxOf(field)
    const edge = getComputedStyle(box, '::before')
    await expect([px(edge.borderTopWidth), edge.borderTopColor]).toEqual([2, computed(box, semantic['border/focus'])])
    await expect(box.getBoundingClientRect().height).toBe(54)
  },
}

export const Filled: Story = {
  // Step=PasteFilled, 371:422: a link, in text/primary, the field still one row.
  args: { value: fixtures('fa-IR').extraction.postingUrl },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const field = fieldIn(canvasElement)
    await expect(field).toHaveValue(args.value)
    await expect(getComputedStyle(field).color).toBe(computed(field, semantic['text/primary']))
    await expect(boxOf(field).getBoundingClientRect().height).toBe(54)
  },
}

export const LongText: Story = {
  // A whole posting pasted: the field grows a row at a time, 16 still round
  // the text, up to the Input's eight rows, and then scrolls.
  args: { value: `${fixtures('fa-IR').notes[1]?.text ?? ''} ${fixtures('fa-IR').jobDetail.description}` },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const box = boxOf(fieldIn(canvasElement))
    await waitFor(() => expect(box.getBoundingClientRect().height).toBeGreaterThan(54))
    const height = box.getBoundingClientRect().height
    await expect(height).toBeLessThanOrEqual(8 * 22 + 32)
    await expect((height - 32) % 22).toBe(0)
  },
}

export const WithError: Story = {
  // Step=Error, 304:2: reading failed, its reason in the helper's place in
  // text/error, the edge border/error.
  args: { value: fixtures('fa-IR').extraction.postingUrl, error: i18n._('We could not read this link.') },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const field = fieldIn(canvasElement)
    await expect(field).toHaveAttribute('aria-invalid', 'true')
    const box = boxOf(field)
    await expect(getComputedStyle(box, '::before').borderTopColor).toBe(computed(box, semantic['border/error']))
    const message = canvasElement.ownerDocument.getElementById(field.getAttribute('aria-describedby') ?? '')
    if (!message) throw new Error('the field has no message')
    await expect(getComputedStyle(message).color).toBe(computed(message, semantic['text/error']))
  },
}

export const Typing: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const field = fieldIn(canvasElement)
    await userEvent.type(field, fixtures('fa-IR').extraction.postingUrl)
    await expect(field).toHaveValue(fixtures('fa-IR').extraction.postingUrl)
    await expect(args.onChange).toHaveBeenLastCalledWith(fixtures('fa-IR').extraction.postingUrl)
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await isAtRest(canvasElement, semantic)
    await expect(fieldIn(canvasElement)).toHaveAttribute('placeholder', i18n._('Put the posting link or its full text here'))
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    await isAtRest(canvasElement, darkSemantic)
  },
}
