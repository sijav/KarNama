import { setupI18n } from '@lingui/core'
import { useLingui } from '@lingui/react'
import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { useRef, useState } from 'react'
import { useArgs } from 'storybook/preview-api'
import { expect, fn, userEvent, within } from 'storybook/test'
import { messages as en } from '../../i18n/locales/en-US'
import { messages as fa } from '../../i18n/locales/fa-IR'
import { semantic, spacing } from '../../theme/tokens'
import { Input } from '../input'
import type { StoryMeta } from '../story-docs/story-meta'
import { Tabs, type TabsProps } from './Tabs'

// The Job Modal's five tabs, in its order: the four the file draws at 210:276
// and the history the owner put second, KN-072. Values are story plumbing.
type TabValue = 'info' | 'history' | 'note' | 'related' | 'files'
const VALUES: readonly TabValue[] = ['info', 'history', 'note', 'related', 'files']
const FIRST: TabValue = 'info'

// The args the meta's render takes: the Tabs' props and the revision each
// choice is written back with, the Input's way, KN-280. The tablist's name and
// the tabs are drawn in the reader's language inside the render, so their args
// are placeholders no control shows; the tab chosen is the one control.
type HeldArgs = TabsProps & { revision?: number }

interface Sent {
  revision: number
  value: string
}

interface Shown {
  value: string
  sent: Sent[]
  seen: { value: string; revision: number | undefined }
}

// The tabs as the modal would hold them, with the five labels in the reader's
// language and a panel each, of text, or for the tab named `field` a field, as
// the Note tab holds. A choice shows at once and goes to the args, so Controls
// show what is on screen; an arg that comes back at a revision this sent, with
// the value sent there, is an echo, however late, and anything else was set in
// Controls and is taken, KN-019.
const Held = ({
  args: given,
  updateArgs,
  field,
}: {
  args: HeldArgs
  updateArgs: (update: Partial<HeldArgs>) => void
  field?: TabValue
}) => {
  const { i18n } = useLingui()
  const { revision, ...args } = given
  const [shown, setShown] = useState<Shown>({ value: args.value, sent: [], seen: { value: args.value, revision } })
  const counter = useRef(revision ?? 0)
  if (args.value !== shown.seen.value || revision !== shown.seen.revision) {
    const seen = { value: args.value, revision }
    const echo = revision !== undefined && shown.sent.some((sent) => sent.revision === revision && sent.value === args.value)
    setShown(echo ? { value: shown.value, sent: shown.sent.filter((sent) => sent.revision > revision), seen } : { value: args.value, sent: [], seen })
  }
  const labels = [i18n._('Job opportunity info'), i18n._('History'), i18n._('Note'), i18n._('Related people'), i18n._('Files')]
  const tabs = VALUES.map((value, index) => {
    const label = labels[index] ?? value
    return {
      value,
      label,
      panel: <Box sx={{ padding: `${spacing.md}px` }}>{value === field ? <Input label={label} multiline /> : label}</Box>,
    }
  })
  return (
    <Tabs
      aria-label={i18n._('Job opportunity sections')}
      value={shown.value}
      tabs={tabs}
      onChange={(value) => {
        const at = Math.max(counter.current, revision ?? 0) + 1
        counter.current = at
        setShown((current) => ({ ...current, value, sent: [...current.sent, { revision: at, value }] }))
        updateArgs({ value, revision: at })
        args.onChange(value)
      }}
    />
  )
}

const meta = {
  title: 'Shared/Tabs',
  component: Tabs,
  args: { 'aria-label': '', tabs: [], value: FIRST, onChange: fn(), revision: 0 },
  argTypes: {
    value: { control: 'select', options: VALUES },
    revision: { type: { name: 'number' }, table: { disable: true } },
  },
  // The labels and panels come from the reader's language inside the render,
  // so the tab chosen is the one control.
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

// The labels in English through an English catalog, and in Persian by looking
// each English id up in the Persian one.
const i18n = setupI18n({ locale: 'en-US', messages: { 'en-US': en } })
const LABELS = [i18n._('Job opportunity info'), i18n._('History'), i18n._('Note'), i18n._('Related people'), i18n._('Files')]

const persian = (id: string) => {
  const text = fa[id]
  if (text === undefined) throw new Error(`the Persian catalog has no ${id}`)
  return text
}

// What node 204:20 draws for a tab at rest or chosen: 44 tall, the label's
// colour and weight, and its indicator two pixels in the state's colour.
const isTheFiles = async (tab: HTMLElement, chosen: boolean) => {
  const style = getComputedStyle(tab)
  const indicator = getComputedStyle(tab, '::after')
  await expect(tab.getBoundingClientRect().height).toBe(44)
  await expect(style.color).toBe(computedColour(tab, chosen ? semantic['text/brand'] : semantic['text/secondary']))
  await expect(Number(style.fontWeight)).toBe(chosen ? 600 : 500)
  await expect(px(indicator.height)).toBe(2)
  await expect(indicator.backgroundColor).toBe(chosen ? computedColour(tab, semantic['bg/brand/default']) : 'rgba(0, 0, 0, 0)')
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole('tablist', { name: persian(i18n._('Job opportunity sections')) })
    const tabs = within(list).getAllByRole('tab')
    await expect(tabs.map((tab) => tab.textContent)).toEqual(LABELS.map(persian))
    for (const [index, tab] of tabs.entries()) {
      const chosen = index === 0
      // Announced as chosen, and the one tab stop: the roving tabindex.
      await expect(tab).toHaveAttribute('aria-selected', String(chosen))
      await expect(tab.tabIndex).toBe(chosen ? 0 : -1)
      await isTheFiles(tab, chosen)
      // Each tab controls its panel, and each panel is labelled by its tab.
      const panel = canvasElement.ownerDocument.getElementById(tab.getAttribute('aria-controls') ?? '')
      if (!panel) throw new Error('a tab controls no panel')
      await expect(panel).toHaveAttribute('role', 'tabpanel')
      await expect(panel).toHaveAttribute('aria-labelledby', tab.id)
      await expect(panel.hidden).toBe(!chosen)
    }
    // The row: four between tabs.
    const [first, second] = tabs.map((tab) => tab.getBoundingClientRect())
    if (!first || !second) throw new Error('fewer than two tabs')
    await expect(Math.round(first.left - second.right)).toBe(4)
  },
}

export const KeyboardOnly: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    const tabs = within(canvasElement).getAllByRole('tab')
    const [info, history, , , files] = tabs
    if (!info || !history || !files) throw new Error('fewer than five tabs')
    // One Tab stop, on the chosen tab; in Persian the left arrow goes on,
    // since the row runs right to left, and choosing takes Enter.
    await userEvent.tab()
    await expect(info).toHaveFocus()
    await userEvent.keyboard('{ArrowLeft}')
    await expect(history).toHaveFocus()
    await expect(history).toHaveAttribute('aria-selected', 'false')
    await userEvent.keyboard('{Enter}')
    await expect(args.onChange).toHaveBeenLastCalledWith('history')
    await expect(history).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard('{End}')
    await expect(files).toHaveFocus()
    // The ring, inside the tab, three pixels in border/focus.
    await expect(files).toHaveClass('Mui-focusVisible')
    const ring = getComputedStyle(files, '::before')
    await expect([ring.borderTopStyle, px(ring.borderTopWidth), px(ring.top)]).toEqual(['solid', 3, 1])
  },
}

export const Hover: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const [, history] = within(canvasElement).getAllByRole('tab')
    if (!history) throw new Error('fewer than two tabs')
    // A real pointer, since :hover is the browser's hit-testing; in the
    // published Storybook there is none to move, so hover a tab yourself. The
    // runner is known by the flag .storybook/vitest.setup.ts sets, KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) {
      if ('__STORYBOOK_PREVIEW__' in globalThis) return
      throw new Error('Hover is running outside Storybook without the story-test flag that .storybook/vitest.setup.ts sets')
    }
    const browser = await import('vitest/browser')
    await browser.userEvent.hover(history)
    // Node 512:735: the primary text and the default border as indicator.
    await expect(getComputedStyle(history).color).toBe(computedColour(history, semantic['text/primary']))
    await expect(getComputedStyle(history, '::after').backgroundColor).toBe(computedColour(history, semantic['border/default']))
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US' },
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole('tablist', { name: i18n._('Job opportunity sections') })
    const [first, second] = within(list).getAllByRole('tab').map((tab) => tab.getBoundingClientRect())
    if (!first || !second) throw new Error('fewer than two tabs')
    // Left to right in English.
    await expect(first.left).toBeLessThan(second.left)
  },
}

// A real Tab key, KN-302, through `vitest/browser`: the browser's own order of
// tab stops, which a dispatched key does not ask. In the published Storybook
// there is no runner to press keys, so press Tab yourself. The runner is known
// by the flag .storybook/vitest.setup.ts sets, KN-225.
const realKeys = async () => {
  if (!('__KARNAMA_STORY_TEST__' in globalThis)) {
    if ('__STORYBOOK_PREVIEW__' in globalThis) return null
    throw new Error('Tab is running outside Storybook without the story-test flag that .storybook/vitest.setup.ts sets')
  }
  return import('vitest/browser')
}

export const TabReachesTheField: Story = {
  // The Note tab's panel holds a field. Chosen by a real click on its tab, the
  // panel shows and is no tab stop of its own: Tab goes from the tab straight
  // to the field, as the WAI-ARIA tabs pattern asks.
  render: function Render(args) {
    const [, updateArgs] = useArgs<HeldArgs>()
    return <Held args={args} updateArgs={updateArgs} field="note" />
  },
  play: async ({ canvasElement }) => {
    const browser = await realKeys()
    if (!browser) return
    const [, , note] = within(canvasElement).getAllByRole('tab')
    if (!note) throw new Error('fewer than three tabs')
    await browser.userEvent.click(note)
    await expect(note).toHaveAttribute('aria-selected', 'true')
    const panel = within(canvasElement).getByRole('tabpanel')
    await expect(panel).not.toHaveAttribute('tabindex')
    await browser.userEvent.keyboard('{Tab}')
    await expect(within(panel).getByRole('textbox')).toHaveFocus()
  },
}

export const TabReachesTheText: Story = {
  // A panel of text alone stays a tab stop, so a keyboard reaches what it
  // says: Tab goes from the chosen tab to the panel itself.
  play: async ({ canvasElement }) => {
    const browser = await realKeys()
    if (!browser) return
    const panel = within(canvasElement).getByRole('tabpanel')
    await expect(panel).toHaveAttribute('tabindex', '0')
    within(canvasElement).getByRole('tab', { selected: true }).focus()
    await browser.userEvent.keyboard('{Tab}')
    await expect(panel).toHaveFocus()
  },
}

// Values a caller is free to pick, a space in each, KN-303. Story plumbing,
// typed so they are values and not copy.
type Spaced = 'job info' | 'status history'
const SPACED: readonly Spaced[] = ['job info', 'status history']

export const ValuesWithSpaces: Story = {
  // Tab values holding a space still link each tab to its panel: the ids come
  // from the row's own id and each tab's place, never from the value. A fixed
  // render of two tabs, since the values are the question, so no control
  // applies.
  parameters: { controls: { disable: true } },
  render: function Render() {
    const { i18n } = useLingui()
    const labels = [i18n._('Job opportunity info'), i18n._('History')]
    const [value, setValue] = useState<string>(SPACED[0] ?? '')
    return (
      <Tabs
        aria-label={i18n._('Job opportunity sections')}
        value={value}
        onChange={setValue}
        tabs={SPACED.map((spaced, index) => {
          const label = labels[index] ?? spaced
          return { value: spaced, label, panel: <Box sx={{ padding: `${spacing.md}px` }}>{label}</Box> }
        })}
      />
    )
  },
  play: async ({ canvasElement }) => {
    const tabs = within(canvasElement).getAllByRole('tab')
    await expect(tabs).toHaveLength(2)
    for (const tab of tabs) {
      // One id reference each way, with no space to split it, and each names
      // the other.
      const controls = tab.getAttribute('aria-controls') ?? ''
      await expect(controls).not.toMatch(/\s/)
      await expect(tab.id).not.toMatch(/\s/)
      const panel = canvasElement.ownerDocument.getElementById(controls)
      if (!panel) throw new Error('a tab controls no panel')
      await expect(panel).toHaveAttribute('role', 'tabpanel')
      await expect(panel).toHaveAttribute('aria-labelledby', tab.id)
    }
  },
}
