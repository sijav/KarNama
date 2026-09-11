import { setupI18n } from '@lingui/core'
import type { StoryObj } from '@storybook/react-vite'
import { useRef, useState } from 'react'
import { useArgs } from 'storybook/preview-api'
import { expect, fn, userEvent, within } from 'storybook/test'
import { messages as en } from '../../i18n/locales/en-US'
import { messages as fa } from '../../i18n/locales/fa-IR'
import { semantic, status, type StatusToken } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { COLOURS, ColorPicker, type ColorPickerProps } from './ColorPicker'

// The args the meta's render takes: the picker's props, and the revision each
// pick is written back with, the Input's way, KN-280. Story plumbing: it never
// reaches the picker, and no control shows it.
type PickedArgs = ColorPickerProps & { revision?: number }

// A pick sent to the args, and the revision it was sent at.
interface Sent {
  revision: number
  value: StatusToken
}

// What the story's picker holds: the colour it shows, the picks sent and not
// yet seen come back, and the value and revision it last saw.
interface Shown {
  value: StatusToken
  sent: Sent[]
  seen: { value: StatusToken; revision: number | undefined }
}

// The picker as a page holds it: a pick shows at once and goes to the args, so
// Controls show what is on screen. An arg that comes back at a revision this
// sent, with the value sent there, is an echo and changes nothing, however
// late; anything else was set in Controls and is taken. Without the revisions
// a late render brought an older pick back over a newer one, which the
// production build showed on 2026-09-11 with two arrow keys in a row, KN-019.
const Held = ({ args: given, updateArgs }: { args: PickedArgs; updateArgs: (update: Partial<PickedArgs>) => void }) => {
  const { revision, ...args } = given
  const [shown, setShown] = useState<Shown>({ value: args.value, sent: [], seen: { value: args.value, revision } })
  // The last revision written, counting on from the store's. Read and written
  // only in the handler.
  const counter = useRef(revision ?? 0)
  // React's pattern for state that follows a prop: adjusted during render.
  if (args.value !== shown.seen.value || revision !== shown.seen.revision) {
    const seen = { value: args.value, revision }
    const echo = revision !== undefined && shown.sent.some((sent) => sent.revision === revision && sent.value === args.value)
    setShown(echo ? { value: shown.value, sent: shown.sent.filter((sent) => sent.revision > revision), seen } : { value: args.value, sent: [], seen })
  }
  return (
    <ColorPicker
      value={shown.value}
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
  title: 'Shared/ColorPicker',
  component: ColorPicker,
  args: { value: 'interview', onChange: fn(), revision: 0 },
  argTypes: {
    value: { control: 'select', options: COLOURS },
    revision: { type: { name: 'number' }, table: { disable: true } },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs<PickedArgs>()
    return <Held args={args} updateArgs={updateArgs} />
  },
} satisfies StoryMeta<PickedArgs>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A token's colour as the browser computes it, so it compares with a computed
// style. Borrowed on the host's own inline style and put back in the same tick.
const computedColour = (host: HTMLElement, colour: string) => {
  const previous = host.style.color
  host.style.color = colour
  const value = getComputedStyle(host).color
  host.style.color = previous
  return value
}

// The colour names in the file's order, as the Documentation frame 376:30
// names the nine: English, through an English catalog, and Persian by looking
// each English id up in the Persian one.
const i18n = setupI18n({ locale: 'en-US', messages: { 'en-US': en } })
const NAMES = [i18n._('Green'), i18n._('Teal'), i18n._('Purple'), i18n._('Pink'), i18n._('Cyan'), i18n._('Gray'), i18n._('Indigo'), i18n._('Amber'), i18n._('Red')]
const persian = (id: string) => {
  const text = fa[id]
  if (text === undefined) throw new Error(`the Persian catalog has no ${id}`)
  return text
}

// The swatch a radio draws, by the class the component gives it.
const swatchOf = (radio: HTMLElement) => {
  const swatch = radio.closest('.MuiRadio-root')?.querySelector<HTMLElement>('.KarnamaColorPicker-swatch')
  if (!swatch) throw new Error('the radio has no swatch')
  return swatch
}

// What node 257:17 draws, in whichever colour is chosen: nine radios in the
// file's order, one checked; that one alone with the two pixel edge and the
// check; every swatch 32 across, eight apart.
const isTheFiles = async (canvasElement: HTMLElement, chosen: StatusToken) => {
  const radios = within(canvasElement).getAllByRole('radio')
  await expect(radios.map((radio) => radio.getAttribute('value'))).toEqual([...COLOURS])
  for (const radio of radios) {
    const swatch = swatchOf(radio)
    const picked = radio.getAttribute('value') === chosen
    await expect(radio).toHaveProperty('checked', picked)
    await expect([swatch.offsetWidth, swatch.offsetHeight]).toEqual([32, 32])
    await expect(radio.closest('.MuiRadio-root')?.getBoundingClientRect().width).toBe(32)
    await expect(px(getComputedStyle(swatch, '::before').borderTopWidth)).toBe(picked ? 2 : 0)
    await expect(swatch.querySelector('svg') !== null).toBe(picked)
  }
  const [one, two] = radios
  if (!one || !two) throw new Error('fewer than two swatches')
  const [first, second] = [swatchOf(one).getBoundingClientRect(), swatchOf(two).getBoundingClientRect()]
  await expect(Math.round(Math.abs(first.left - second.left) - 32)).toBe(8)
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const group = within(canvasElement).getByRole('radiogroup', { name: persian(i18n._('Status colour')) })
    await expect(group).toBeVisible()
    // Named for their colours, from the Documentation frame 376:30, in Persian.
    await expect(within(group).getAllByRole('radio').map((radio) => radio.getAttribute('aria-label'))).toEqual(NAMES.map(persian))
    await isTheFiles(canvasElement, args.value)
    // The panel: 232 wide, 12 of padding, the card's surface and radius.
    const panel = group.parentElement
    if (!panel) throw new Error('the group has no panel')
    const style = getComputedStyle(panel)
    await expect(panel.getBoundingClientRect().width).toBe(232)
    await expect(px(style.paddingTop)).toBe(12)
    await expect(style.backgroundColor).toBe(computedColour(panel, semantic['bg/surface']))
    await expect(px(style.borderTopLeftRadius)).toBe(8)
    // The swatch's edge takes the chosen status's base, the fill its container.
    const picked = swatchOf(within(group).getByRole('radio', { checked: true }))
    await expect(getComputedStyle(picked, '::before').borderTopColor).toBe(computedColour(panel, status.interview.base))
    await expect(getComputedStyle(picked).backgroundColor).toBe(computedColour(panel, status.interview.container))
  },
}

export const KeyboardOnly: Story = {
  play: async ({ args, canvasElement }) => {
    const group = within(canvasElement).getByRole('radiogroup')
    // One Tab stop, on the chosen colour, and the arrow keys move AND choose,
    // as a native radio group does.
    await userEvent.tab()
    await expect(within(group).getByRole('radio', { checked: true })).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(args.onChange).toHaveBeenLastCalledWith('rejected')
    await isTheFiles(canvasElement, 'rejected')
    await userEvent.keyboard('{ArrowUp}{ArrowUp}')
    const twoBack: StatusToken = 'applied'
    await expect(args.onChange).toHaveBeenLastCalledWith(twoBack)
    await isTheFiles(canvasElement, twoBack)
    // The product's focus ring on the swatch that has focus.
    const focused = swatchOf(within(group).getByRole('radio', { checked: true }))
    const ring = getComputedStyle(focused)
    await expect([ring.outlineStyle, px(ring.outlineWidth), px(ring.outlineOffset)]).toEqual(['solid', 2, 2])
  },
}

export const Picking: Story = {
  play: async ({ args, canvasElement }) => {
    // A pointer picks too, and what it picks is told as the token, never a
    // colour outside the nine.
    const [, second] = within(canvasElement).getAllByRole('radio')
    if (!second) throw new Error('fewer than two radios')
    await userEvent.click(second)
    await expect(args.onChange).toHaveBeenLastCalledWith('custom-1')
    await isTheFiles(canvasElement, 'custom-1')
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US' },
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('radiogroup', { name: i18n._('Status colour') })
    await expect(within(group).getAllByRole('radio').map((radio) => radio.getAttribute('aria-label'))).toEqual(NAMES)
    // Left to right in English: the first swatch sits at the left.
    const [first, second] = within(group).getAllByRole('radio').map((radio) => swatchOf(radio).getBoundingClientRect())
    if (!first || !second) throw new Error('fewer than two swatches')
    await expect(first.left).toBeLessThan(second.left)
  },
}

// Real arrow keys, KN-301: Playwright's keyboard through `vitest/browser`, so
// the browser's own radio group is there to be overridden, as in use;
// storybook/test's userEvent walks a radio group by its own rule, left always
// the previous, and never asks the browser. From the amber, in the
// middle of its row both ways, the left arrow lands on the swatch beside it on
// the left, 8 away in the same row, and the right arrow on the one on the
// right; up and down still move through the order. In the published Storybook
// there is no runner to press keys, so press them yourself. The runner is
// known by the flag .storybook/vitest.setup.ts sets, KN-225.
type Arrow = '{ArrowLeft}' | '{ArrowRight}' | '{ArrowUp}' | '{ArrowDown}'
const arrowsFollowTheScreen =
  (direction: 'rtl' | 'ltr'): NonNullable<Story['play']> =>
  async ({ args, canvasElement }) => {
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) {
      if ('__STORYBOOK_PREVIEW__' in globalThis) return
      throw new Error('The arrow keys are running outside Storybook without the story-test flag that .storybook/vitest.setup.ts sets')
    }
    const browser = await import('vitest/browser')
    await expect(document.documentElement).toHaveAttribute('dir', direction)
    const group = within(canvasElement).getByRole('radiogroup')
    const chosen = () => {
      const radio = within(group).getByRole('radio', { checked: true })
      const box = swatchOf(radio).getBoundingClientRect()
      return {
        radio,
        value: radio.getAttribute('value'),
        top: Math.round(box.top),
        left: Math.round(box.left),
        right: Math.round(box.right),
      }
    }
    const start = chosen()
    // The row takes left and right itself, whatever the engine would do, and
    // leaves up and down to the browser, so the last keydown says which moved
    // the choice.
    let last: KeyboardEvent | undefined
    group.addEventListener('keydown', (event) => {
      last = event
    })
    const TAKEN: Arrow[] = ['{ArrowLeft}', '{ArrowRight}']
    const press = async (key: Arrow) => {
      await browser.userEvent.keyboard(key)
      const now = chosen()
      await expect(now.radio).toHaveFocus()
      await expect(args.onChange).toHaveBeenLastCalledWith(now.value)
      await expect(last?.defaultPrevented).toBe(TAKEN.includes(key))
      return now
    }
    start.radio.focus()
    const left = await press('{ArrowLeft}')
    await expect([left.top, left.right]).toEqual([start.top, start.left - 8])
    await expect(await press('{ArrowRight}')).toMatchObject({ value: start.value, left: start.left })
    const right = await press('{ArrowRight}')
    await expect([right.top, right.left]).toEqual([start.top, start.right + 8])
    await expect(await press('{ArrowLeft}')).toMatchObject({ value: start.value })
    const next = COLOURS[COLOURS.findIndex((colour) => colour === start.value) + 1]
    await expect(await press('{ArrowDown}')).toMatchObject({ value: next })
    await expect(await press('{ArrowUp}')).toMatchObject({ value: start.value })
  }

export const ArrowsInPersian: Story = {
  globals: { locale: 'fa-IR' },
  play: arrowsFollowTheScreen('rtl'),
}

export const ArrowsInEnglish: Story = {
  globals: { locale: 'en-US' },
  play: arrowsFollowTheScreen('ltr'),
}
