import { useLingui } from '@lingui/react'
import { RadioGroup } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import type { DeleteReason } from './DeleteJobModal'
import { ReasonOption, type ReasonOptionProps } from './ReasonOption'

// The delete modal's reasons are 352 wide, its body's width.
const WIDTH = 352

// The first reason, as the delete modal words it.
const NOT_WANTED: DeleteReason = 'not-wanted'
const reasonIn = (locale: Locale): ReasonOptionProps => {
  const i18n = i18nFor(locale)
  return { value: NOT_WANTED, label: i18n._('I am not after it any more') }
}

// The option in a group of its own, as the delete modal holds its three,
// chosen from the start or not.
const InTheGroup = ({ option, chosen }: { option: ReasonOptionProps; chosen: boolean }) => {
  const { i18n } = useLingui()
  const [value, setValue] = useState(chosen ? option.value : '')
  return (
    <RadioGroup
      aria-label={i18n._('Why do you want to delete it?')}
      value={value}
      onChange={(_, picked) => {
        setValue(picked)
      }}
      sx={{ width: WIDTH }}
    >
      <ReasonOption {...option} />
    </RadioGroup>
  )
}

const meta = {
  title: 'Shared/ReasonOption',
  component: ReasonOption,
  args: reasonIn('fa-IR'),
  parameters: { controls: { include: ['label'] } },
  render: (args) => <InTheGroup option={args} chosen={false} />,
} satisfies StoryMeta<typeof ReasonOption>

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

type Palette = Record<keyof typeof semantic, string>

// The option's parts: its row, the radio's ring and the label.
const partsOf = (canvasElement: HTMLElement, args: ReasonOptionProps) => {
  const radio = within(canvasElement).getByRole('radio', { name: args.label })
  const row = radio.closest('label')
  const ring = radio.parentElement?.querySelector<HTMLElement>('span')
  const label = within(canvasElement).getByText(args.label)
  if (!row || !ring) throw new Error('the option is missing a part')
  return { radio, row, ring, label }
}

// An inset stroke as the browser computes it: its width and its colour.
const strokeOf = (element: HTMLElement) => {
  const shadow = getComputedStyle(element).boxShadow
  const widths = (shadow.match(/-?[\d.]+(?=px)/g) ?? []).map(Number)
  return { width: widths.at(-1) ?? 0, colour: shadow.replace(/\s*-?[\d.]+px/g, '').replace(/\s*inset\s*/, '').trim() }
}

// Node 865:33595: 44 tall at radius 10, 11 above and below and 14 at the
// sides, the radio 18 at the inline start and the label 10 after it, 14 on 22
// at Medium in text/primary; at rest bg/surface inside one pixel of
// border/default, the radio's one and a half of it; chosen bg/brand/subtle
// inside one and a half of bg/brand/default, the radio's five of it.
const isTheFiles = async (canvasElement: HTMLElement, args: ReasonOptionProps, chosen: boolean, palette: Palette, locale: Locale) => {
  const { radio, row, ring, label } = partsOf(canvasElement, args)
  const style = getComputedStyle(row)
  await expect(row.getBoundingClientRect().height).toBe(44)
  await expect([px(style.paddingTop), px(style.paddingInlineStart), px(style.columnGap), px(style.borderTopLeftRadius)]).toEqual([11, 14, 10, 10])
  await expect([ring.getBoundingClientRect().width, ring.getBoundingClientRect().height]).toEqual([18, 18])
  const [box, spot, words] = [row.getBoundingClientRect(), ring.getBoundingClientRect(), label.getBoundingClientRect()]
  await expect(Math.round(locale === 'fa-IR' ? box.right - spot.right : spot.left - box.left)).toBe(14)
  await expect(Math.round(locale === 'fa-IR' ? spot.left - words.right : words.left - spot.right)).toBe(10)
  const text = getComputedStyle(label)
  await expect([px(text.fontSize), px(text.lineHeight), text.fontWeight]).toEqual([14, 22, '500'])
  await expect(text.color).toBe(computed(label, palette['text/primary']))
  await expect(style.backgroundColor).toBe(computed(row, chosen ? palette['bg/brand/subtle'] : palette['bg/surface']))
  const edge = strokeOf(row)
  await expect(edge.width).toBe(chosen ? 1.5 : 1)
  await expect(edge.colour).toBe(computed(row, chosen ? palette['bg/brand/default'] : palette['border/default']))
  const circle = strokeOf(ring)
  await expect(circle.width).toBe(chosen ? 5 : 1.5)
  await expect(circle.colour).toBe(computed(ring, chosen ? palette['bg/brand/default'] : palette['border/default']))
  await expect(radio).toHaveProperty('checked', chosen)
}

// Under a real pointer the edge turns text/secondary, at its own width. Only
// the test runner has a pointer to move.
const hovers = async (canvasElement: HTMLElement, args: ReasonOptionProps, width: number) => {
  if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
  const { row } = partsOf(canvasElement, args)
  const secondary = computed(row, semantic['text/secondary'])
  const browser = await import('vitest/browser')
  await browser.userEvent.hover(row)
  await waitFor(() => expect(strokeOf(row)).toEqual({ width, colour: secondary }))
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, false, semantic, 'fa-IR')
  },
}

export const Hover: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await hovers(canvasElement, args, 1)
  },
}

export const Selected: Story = {
  render: (args) => <InTheGroup option={args} chosen />,
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, true, semantic, 'fa-IR')
  },
}

export const SelectedHover: Story = {
  render: (args) => <InTheGroup option={args} chosen />,
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await hovers(canvasElement, args, 1.5)
  },
}

export const Choosing: Story = {
  // A press anywhere on the row chooses it.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByText(args.label))
    await isTheFiles(canvasElement, args, true, semantic, 'fa-IR')
  },
}

export const KeyboardFocus: Story = {
  // Tab reaches the radio, and the row draws the ring two clear of itself.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const { radio, row } = partsOf(canvasElement, args)
    await userEvent.tab()
    await expect(radio).toHaveFocus()
    const style = getComputedStyle(row)
    await expect([style.outlineStyle, px(style.outlineWidth), px(style.outlineOffset)]).toEqual(['solid', 2, 2])
    await expect(style.outlineColor).toBe(computed(row, semantic['border/focus']))
  },
}

export const InEnglish: Story = {
  args: reasonIn('en-US'),
  render: (args) => <InTheGroup option={args} chosen />,
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, true, semantic, 'en-US')
  },
}

export const Dark: Story = {
  render: (args) => <InTheGroup option={args} chosen />,
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, true, darkSemantic, 'fa-IR')
  },
}
