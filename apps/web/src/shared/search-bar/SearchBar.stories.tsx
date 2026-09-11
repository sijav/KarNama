import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { useRef, useState } from 'react'
import { useArgs } from 'storybook/preview-api'
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test'
import { semantic } from '../../theme/tokens'
import { fixtures } from '../story-fixtures'
import type { StoryMeta } from '../story-docs/story-meta'
import { DEBOUNCE_MS, SearchBar, type SearchBarProps } from './SearchBar'

// The typed search the file draws, «فرانت‌اند»: the second word of the first
// sample job opportunity's title.
const [FIRST_JOB] = fixtures('fa-IR').jobs
if (!FIRST_JOB) throw new Error('the story fixtures have no job opportunity')
const TYPED = FIRST_JOB.title.split(' ').at(-1) ?? ''

// The args the meta's render takes: the bar's props and the revision each
// keystroke is written back with, the Input's way, KN-280.
type HeldArgs = SearchBarProps & { revision?: number }

interface Sent {
  revision: number
  value: string
}

interface Shown {
  value: string
  sent: Sent[]
  seen: { value: string; revision: number | undefined }
}

// The bar as a page holds it: what is typed shows at once and goes to the
// args, so Controls show it; an arg that comes back at a revision this sent,
// with the value sent there, is an echo, however late, and anything else was
// set in Controls and is taken, KN-019.
const Held = ({ args: given, updateArgs }: { args: HeldArgs; updateArgs: (update: Partial<HeldArgs>) => void }) => {
  const { revision, value = '', ...args } = given
  const [shown, setShown] = useState<Shown>({ value, sent: [], seen: { value, revision } })
  const counter = useRef(revision ?? 0)
  if (value !== shown.seen.value || revision !== shown.seen.revision) {
    const seen = { value, revision }
    const echo = revision !== undefined && shown.sent.some((sent) => sent.revision === revision && sent.value === value)
    setShown(echo ? { value: shown.value, sent: shown.sent.filter((sent) => sent.revision > revision), seen } : { value, sent: [], seen })
  }
  return (
    <Box sx={{ width: 320 }}>
      <SearchBar
        {...args}
        value={shown.value}
        onChange={(next) => {
          const at = Math.max(counter.current, revision ?? 0) + 1
          counter.current = at
          setShown((current) => ({ ...current, value: next, sent: [...current.sent, { revision: at, value: next }] }))
          updateArgs({ value: next, revision: at })
          args.onChange?.(next)
        }}
      />
    </Box>
  )
}

const meta = {
  title: 'Shared/SearchBar',
  component: SearchBar,
  args: { value: '', onChange: fn(), onSearch: fn(), revision: 0 },
  argTypes: {
    value: { control: 'text' },
    revision: { type: { name: 'number' }, table: { disable: true } },
  },
  parameters: { controls: { include: ['value'] } },
  render: function Render(args) {
    const [, updateArgs] = useArgs<HeldArgs>()
    return <Held args={args} updateArgs={updateArgs} />
  },
} satisfies StoryMeta<HeldArgs>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A token's colour as the browser computes it, borrowed on the host's own
// inline style and put back in the same tick.
const computedColour = (host: HTMLElement, colour: string) => {
  const previous = host.style.color
  host.style.color = colour
  const value = getComputedStyle(host).color
  host.style.color = previous
  return value
}

// The bar, the field, and the bar's edge on its ::before.
const partsOf = (canvasElement: HTMLElement) => {
  const field = within(canvasElement).getByRole('searchbox')
  // The input sits in MUI's field box, which sits in the bar.
  const bar = field.parentElement?.parentElement
  if (!bar) throw new Error('the field has no bar round it')
  return { field, bar, edge: getComputedStyle(bar, '::before') }
}

// What node 155:92 draws in every state: 44 tall, radius md, the text 16 from
// the edge, the search icon at 20 in text/secondary at the inline start.
const isTheFiles = async (canvasElement: HTMLElement) => {
  const { field, bar } = partsOf(canvasElement)
  const box = bar.getBoundingClientRect()
  await expect(box.height).toBe(44)
  await expect(px(getComputedStyle(bar).borderTopLeftRadius)).toBe(8)
  const icon = bar.querySelector('svg')
  if (!icon) throw new Error('the bar has no search icon')
  const iconBox = icon.getBoundingClientRect()
  await expect([iconBox.width, iconBox.height]).toEqual([20, 20])
  await expect(getComputedStyle(icon).color).toBe(computedColour(bar, semantic['text/secondary']))
  // At the inline start, 16 in, and the field 8 after it.
  const rtl = getComputedStyle(bar).direction === 'rtl'
  const start = rtl ? box.right - iconBox.right : iconBox.left - box.left
  await expect(Math.round(start)).toBe(16)
  const fieldBox = field.getBoundingClientRect()
  await expect(Math.round(rtl ? iconBox.left - fieldBox.right : fieldBox.left - iconBox.right)).toBe(8)
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const { field, edge } = partsOf(canvasElement)
    await isTheFiles(canvasElement)
    // 155:86: the one pixel default edge, and the placeholder in the reader's
    // language, with no clear control while there is nothing to clear.
    await expect([edge.borderTopStyle, px(edge.borderTopWidth)]).toEqual(['solid', 1])
    await expect(edge.borderTopColor).toBe(computedColour(field, semantic['border/default']))
    await expect(field instanceof HTMLInputElement ? field.placeholder.length : 0).toBeGreaterThan(0)
    await expect(within(canvasElement).queryByRole('button')).not.toBeInTheDocument()
  },
}

export const Focused: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const { field, bar } = partsOf(canvasElement)
    await userEvent.tab()
    await expect(field).toHaveFocus()
    // 155:89: two pixels of border/focus, and nothing inside moves.
    const edge = getComputedStyle(bar, '::before')
    await expect(px(edge.borderTopWidth)).toBe(2)
    await expect(edge.borderTopColor).toBe(computedColour(field, semantic['border/focus']))
    await isTheFiles(canvasElement)
  },
}

export const Filled: Story = {
  args: { value: TYPED },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const { field } = partsOf(canvasElement)
    await isTheFiles(canvasElement)
    // 401:437: the text in text/primary, and the clear control, 20 square at
    // the inline end, named.
    await expect(field).toHaveValue(TYPED)
    await expect(getComputedStyle(field).color).toBe(computedColour(field, semantic['text/primary']))
    const clear = within(canvasElement).getByRole('button')
    await expect(clear.getAttribute('aria-label')?.length).toBeGreaterThan(0)
    const box = clear.getBoundingClientRect()
    await expect([box.width, box.height]).toEqual([20, 20])
  },
}

export const Clearing: Story = {
  args: { value: TYPED },
  play: async ({ args, canvasElement }) => {
    const { field } = partsOf(canvasElement)
    // Clearing empties the field, searches for nothing at once, takes the
    // clear control away, and gives focus back to the field.
    await userEvent.click(within(canvasElement).getByRole('button'))
    await expect(field).toHaveValue('')
    await expect(args.onSearch).toHaveBeenLastCalledWith('')
    await expect(within(canvasElement).queryByRole('button')).not.toBeInTheDocument()
    await expect(field).toHaveFocus()
  },
}

export const Debounced: Story = {
  play: async ({ args, canvasElement }) => {
    const { field } = partsOf(canvasElement)
    // Typed quickly: nothing is searched while the keys come, and once they
    // stop, one search runs with every key in it, the last included.
    await userEvent.type(field, TYPED)
    await expect(args.onSearch).not.toHaveBeenCalled()
    await new Promise((resolve) => setTimeout(resolve, DEBOUNCE_MS + 150))
    await expect(args.onSearch).toHaveBeenCalledTimes(1)
    await expect(args.onSearch).toHaveBeenLastCalledWith(TYPED)
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US' },
  play: async ({ canvasElement }) => {
    // Left to right: the icon at the left, 16 in.
    await isTheFiles(canvasElement)
  },
}

// A parent that replaces the value while a search is pending, KN-314: it
// follows what is typed and empties the bar when its hidden reset is pressed,
// which only a story's play does, as a navigation or a reset elsewhere would.
const Resetting = ({ onSearch }: { onSearch?: (value: string) => void }) => {
  const [value, setValue] = useState('')
  return (
    <Box sx={{ width: 320 }}>
      <SearchBar value={value} onChange={setValue} {...(onSearch ? { onSearch } : {})} />
      <button
        hidden
        data-testid="reset"
        onClick={() => {
          setValue('')
        }}
      />
    </Box>
  )
}

export const ResetWhilePending: Story = {
  // Typed, and emptied by the parent before the pause ends: the field shows
  // nothing, and the search for what it no longer shows never runs. A fixed
  // parent, so no control applies.
  parameters: { controls: { disable: true } },
  render: (args) => <Resetting {...(args.onSearch ? { onSearch: args.onSearch } : {})} />,
  play: async ({ args, canvasElement }) => {
    const { field } = partsOf(canvasElement)
    await userEvent.type(field, TYPED)
    await fireEvent.click(within(canvasElement).getByTestId('reset'))
    await expect(field).toHaveValue('')
    await new Promise((resolve) => setTimeout(resolve, DEBOUNCE_MS + 150))
    await expect(args.onSearch).not.toHaveBeenCalled()
  },
}

export const IgnoredKeystrokes: Story = {
  // A parent that holds the value and ignores what is typed: the keys are
  // reported, the field keeps showing nothing, and nothing is searched for
  // text it never showed. A fixed parent, so no control applies.
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Box sx={{ width: 320 }}>
      <SearchBar value="" {...(args.onChange ? { onChange: args.onChange } : {})} {...(args.onSearch ? { onSearch: args.onSearch } : {})} />
    </Box>
  ),
  play: async ({ args, canvasElement }) => {
    const { field } = partsOf(canvasElement)
    await userEvent.type(field, TYPED)
    await expect(field).toHaveValue('')
    await expect(args.onChange).toHaveBeenCalled()
    await new Promise((resolve) => setTimeout(resolve, DEBOUNCE_MS + 150))
    await expect(args.onSearch).not.toHaveBeenCalled()
  },
}
