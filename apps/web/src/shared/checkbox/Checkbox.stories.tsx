import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { contrast } from '../../theme/darkMode'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { Checkbox } from './Checkbox'

// A token's colour as the browser computes it, so it can be compared with a
// computed style. The browser does the conversion rather than a hand-written
// parser, so the two sides of the comparison are normalised the same way. The
// host's own inline colour is borrowed and put back within the same tick, so
// nothing is ever painted with it.
const computedColour = (host: HTMLElement, colour: string) => {
  const previous = host.style.color
  host.style.color = colour
  const value = getComputedStyle(host).color
  host.style.color = previous
  return value
}

// The square the design draws, marked with its own class, KN-205.
const frameOf = (canvasElement: HTMLElement) => {
  const frame = canvasElement.querySelector<HTMLElement>('.KarnamaCheckbox-frame')
  if (!frame) throw new Error('the checkbox frame was not found')
  return frame
}

// The frame's edge, an inset shadow, read back from the computed box-shadow:
// its colour, its three offsets, its width and whether it is inside, KN-281.
// Parsed rather than compared to a string, since noLiterals refuses a pixel
// string anywhere outside src/theme.
const edgeOf = (frame: HTMLElement) => {
  const shadow = getComputedStyle(frame).boxShadow
  const close = shadow.indexOf(')') + 1
  const [x = '', y = '', blur = '', spread = '', ...rest] = shadow.slice(close).trim().split(' ')
  return {
    colour: shadow.slice(0, close),
    offsets: [x, y, blur].map(Number.parseFloat),
    width: Number.parseFloat(spread),
    inside: rest.includes('inset'),
  }
}

// Node 204:11 draws the edge at 1.5 in every state, inside the 20 by 20 and
// taking none of it, so the frame's own border is zero, KN-281.
const edgeIsTheFiles = async (canvasElement: HTMLElement) => {
  const frame = frameOf(canvasElement)
  const edge = edgeOf(frame)
  await expect([frame.offsetWidth, frame.offsetHeight]).toEqual([20, 20])
  await expect(edge.width).toBe(1.5)
  await expect(edge.inside).toBe(true)
  await expect(edge.offsets).toEqual([0, 0, 0])
  await expect(Number.parseFloat(getComputedStyle(frame).borderTopWidth)).toBe(0)
}

// MUI's root: the Checkbox's own box, the frame and the room round it, KN-293.
const rootOf = (canvasElement: HTMLElement) => {
  const root = canvasElement.querySelector<HTMLElement>('.MuiCheckbox-root')
  if (!root) throw new Error('the checkbox root was not found')
  return root
}

const px = (value: string) => Number.parseFloat(value) || 0

// A computed rgb() colour as the hex the WCAG contrast formula takes.
const hexOf = (rgb: string) => {
  const channels = rgb.match(/\d+/g)?.slice(0, 3) ?? []
  if (channels.length !== 3) throw new Error(`not an rgb colour: ${rgb}`)
  return `#${channels.map((channel) => Number(channel).toString(16).padStart(2, '0')).join('')}`
}

// A box in the viewport, by its four edges.
interface Extent {
  left: number
  top: number
  right: number
  bottom: number
}

const edges = (box: Extent) => [box.left, box.top, box.right, box.bottom].map((edge) => Math.round(edge * 100) / 100)

// Every ancestor that clips what overflows it, on either axis.
const clippingAncestors = (element: HTMLElement) => {
  const found: HTMLElement[] = []
  for (let node = element.parentElement; node; node = node.parentElement) {
    const style = getComputedStyle(node)
    if (style.overflowX !== 'visible' || style.overflowY !== 'visible') found.push(node)
  }
  return found
}

// Where an ancestor clips: its padding box, inside its borders. A scrollbar
// and a rounded clip are not modelled; the host here is square and hidden,
// and the verifier's screenshots are the rendered proof.
const clipEdge = (node: HTMLElement): Extent => {
  const box = node.getBoundingClientRect()
  const style = getComputedStyle(node)
  return { left: box.left + px(style.borderLeftWidth), top: box.top + px(style.borderTopWidth), right: box.right - px(style.borderRightWidth), bottom: box.bottom - px(style.borderBottomWidth) }
}

// How far an extent passes each side of a box: only the sides it passes, so
// an extent inside the box gives none, and a failure names the side.
const overshoot = (inner: Extent, outer: Extent) =>
  Object.entries({ left: outer.left - inner.left, top: outer.top - inner.top, right: inner.right - outer.right, bottom: inner.bottom - outer.bottom }).filter(([, by]) => by > 0)

// The area of a w by h box whose four corners are rounded to r.
const rounded = (w: number, h: number, r: number) => w * h - (4 - Math.PI) * r * r

const meta = {
  title: 'Shared/Checkbox',
  component: Checkbox,
  args: { indeterminate: false, disabled: false, onChange: fn() },
  argTypes: {
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    checked: { control: 'boolean' },
  },
} satisfies StoryMeta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Unchecked: Story = {
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('checkbox')
    await expect(box).not.toBeChecked()
    // The property, not an attribute. `toHaveAttribute` would pass for a
    // checkbox that has no third state at all, which is the whole point of
    // KN-013, so the assertion has to read the element.
    await expect(box).toHaveProperty('indeterminate', false)
    await edgeIsTheFiles(canvasElement)
  },
}

export const Checked: Story = {
  args: { checked: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('checkbox')).toBeChecked()
    await edgeIsTheFiles(canvasElement)

    // KN-205, and this is the regression test for it. The focus ring belongs on
    // the square and NOT on the tick inside it. Both used to be `MuiBox-root`,
    // so the descendant selector matched two elements and the white 12px glyph
    // drew its own blue outline.
    //
    // `Mui-focusVisible` is added directly because `:focus-visible` depends on
    // how focus arrived, and a play function cannot make the browser call a
    // programmatic focus keyboard-originated.
    const root = canvasElement.querySelector('.MuiCheckbox-root')
    if (!root) throw new Error('the checkbox root was not found')
    root.classList.add('Mui-focusVisible')

    const outlined = [...root.querySelectorAll('*')].filter((element) => {
      const style = getComputedStyle(element)
      // Parsed rather than compared to a pixel string: noLiterals refuses one
      // anywhere outside src/theme, stories included, and it is right to.
      return style.outlineStyle === 'solid' && Number.parseFloat(style.outlineWidth) > 0
    })
    await expect(outlined).toHaveLength(1)
    await expect(outlined[0]).toHaveClass('KarnamaCheckbox-frame')
  },
}

export const Indeterminate: Story = {
  args: { indeterminate: true },
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('checkbox')
    // There is no `indeterminate` content attribute in HTML. If this were
    // rendered into the markup instead of assigned to the element, React would
    // drop it and this would read false.
    await expect(box).toHaveProperty('indeterminate', true)
    // And the accessible state that a screen reader actually announces.
    await expect(box).toHaveAttribute('data-indeterminate', 'true')
    await edgeIsTheFiles(canvasElement)
  },
}

export const Hover: Story = {
  // Pinned to light so the expected colour is one known token, not whichever
  // palette the toolbar happens to be on.
  globals: { colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('checkbox')
    const frame = frameOf(canvasElement)
    await expect(edgeOf(frame).colour).toBe(computedColour(canvasElement, semantic['border/default']))

    // A REAL pointer, not a dispatched event. `:hover` is the browser's own
    // hit-testing, and no synthetic mouseover sets it, so `storybook/test`'s
    // userEvent cannot reach this state at all. Under Vitest's browser mode,
    // `vitest/browser` is a virtual module that drives Playwright's actual
    // mouse.
    //
    // In the published Storybook there is no test runner to move a pointer, so
    // the story is a canvas: hover it yourself. The two are told apart BEFORE
    // importing, and a failed import is never caught, KN-220: that let a runner
    // that could not load its pointer pass on the unhovered assertion alone.
    //
    // The runner is known by a flag THIS repository sets, in
    // `.storybook/vitest.setup.ts`, which only the Vitest project loads, KN-225.
    // It used to be `__vitest_browser__`, a Vitest internal an upgrade could
    // rename. And a missing flag must FAIL rather than pass, so the canvas
    // branch also needs Storybook's own preview to be the thing rendering the
    // story; anything else is an error, not a quiet skip.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) {
      if ('__STORYBOOK_PREVIEW__' in globalThis) return
      throw new Error('Hover is running outside Storybook without the story-test flag that .storybook/vitest.setup.ts sets')
    }
    const browser = await import('vitest/browser')
    // The INPUT, not the frame: MUI's invisible input sits on top of the square,
    // so it is what a pointer over the square actually touches, and hovering it
    // is what turns on the root's `:hover`.
    await browser.userEvent.hover(box)
    await expect(edgeOf(frame).colour).toBe(computedColour(canvasElement, semantic['border/focus']))
  },
}

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('checkbox')
    await expect(box).toBeDisabled()
    await edgeIsTheFiles(canvasElement)
    // The REFUSAL is the assertion, and getting here took two wrong turns worth
    // recording. `userEvent.click` throws on a disabled control because it has
    // no pointer events — that throw IS the proof a real user cannot reach it.
    //
    // I first wrote `userEvent.click` and read the throw as a broken test. Then
    // I reached for `fireEvent.click` to "ask the question directly", and it
    // CHECKED THE BOX: dispatching an event straight at the element bypasses
    // the browser's activation guard, which is the exact mechanism under test.
    // A green assertion there would have proved nothing and a red one, as it
    // happened, accused the component of a defect it does not have.
    await expect(userEvent.click(box)).rejects.toThrow(/pointer-events/i)
    await expect(box).not.toBeChecked()

    // And it is out of the tab order, so keyboard users do not land on
    // something that cannot respond.
    await userEvent.tab()
    await expect(box).not.toHaveFocus()
  },
}

export const KeyboardOnly: Story = {
  play: async ({ args, canvasElement }) => {
    const box = within(canvasElement).getByRole('checkbox')
    // Reachable by Tab and toggleable by Space, with no pointer anywhere in
    // this story. Bulk selection is the feature this exists for, and a
    // selection control that needs a mouse excludes the people most likely to
    // be selecting in bulk.
    await userEvent.tab()
    await expect(box).toHaveFocus()
    await userEvent.keyboard(' ')
    await expect(box).toBeChecked()
    // The documented contract: the event, then the NEW checked value, so a
    // caller never has to read it back off the element. KN-207.
    await expect(args.onChange).toHaveBeenLastCalledWith(expect.objectContaining({ target: box }), true)
    await userEvent.keyboard(' ')
    await expect(box).not.toBeChecked()
    await expect(args.onChange).toHaveBeenLastCalledWith(expect.objectContaining({ target: box }), false)
    await expect(args.onChange).toHaveBeenCalledTimes(2)
  },
}

export const FocusedInAClippingHost: Story = {
  // The ring has to hold whatever the mark, so the marks are the controls; a
  // disabled Checkbox takes no focus, so it is not offered, KN-255.
  parameters: { controls: { include: ['checked', 'indeterminate'] } },
  render: (args) => (
    // A host that clips what overflows it, with no padding and no border,
    // sized to the Checkbox, on a card's surface: a list row, a table cell, or
    // the Title Group the file clips, KN-293.
    <Box data-testid="clipping-host" sx={(theme) => ({ display: 'inline-flex', overflow: 'hidden', backgroundColor: theme.karnama.semantic['bg/surface'] })}>
      <Checkbox {...args} />
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const host = within(canvasElement).getByTestId('clipping-host')
    const box = within(host).getByRole('checkbox')
    const root = rootOf(host)
    const frame = frameOf(host)
    // Flush: the host clips on both axes, has no padding and no border, and
    // its box is the root's, so it clips at the Checkbox's own edge.
    const surface = getComputedStyle(host)
    await expect([surface.overflowX, surface.overflowY]).toEqual(['hidden', 'hidden'])
    const inset = [surface.paddingTop, surface.paddingRight, surface.paddingBottom, surface.paddingLeft, surface.borderTopWidth, surface.borderRightWidth, surface.borderBottomWidth, surface.borderLeftWidth]
    await expect(inset.map(px)).toEqual([0, 0, 0, 0, 0, 0, 0, 0])
    await expect(edges(host.getBoundingClientRect())).toEqual(edges(root.getBoundingClientRect()))

    await userEvent.tab()
    await expect(box).toHaveFocus()
    // The ring is drawn on `Mui-focusVisible`, which MUI sets when the focus
    // matches :focus-visible, and that depends on how focus arrived: this Tab
    // is dispatched, not the browser's, so the class is put on as Checked puts
    // it, KN-205. The verifier presses a real Tab in a production build.
    root.classList.add('Mui-focusVisible')
    const ring = getComputedStyle(frame)
    const [width, offset] = [px(ring.outlineWidth), px(ring.outlineOffset)]
    await expect(ring.outlineStyle).toBe('solid')
    await expect(width).toBeGreaterThanOrEqual(2)
    // At 3:1 or more against the surface it is drawn over, the host's.
    await expect(contrast(hexOf(ring.outlineColor), hexOf(surface.backgroundColor))).toBeGreaterThanOrEqual(3)

    // Every pixel of the ring lies inside every ancestor that clips, the host
    // among them: the frame's box grown by the ring's reach, its offset and
    // its width. A ring with no room kept for it passes the host by four on
    // every side, KN-293.
    const square = frame.getBoundingClientRect()
    const reach = offset + width
    const extent = { left: square.left - reach, top: square.top - reach, right: square.right + reach, bottom: square.bottom + reach }
    const clips = clippingAncestors(frame)
    await expect(clips).toContain(host)
    for (const clip of clips) await expect(overshoot(extent, clipEdge(clip))).toEqual([])

    // And it is at least the frame's two-pixel perimeter, 4W + 4H, WCAG
    // 2.4.13's measure taken on the square as it is seen, since the room
    // round it draws nothing: the band between the frame grown by the offset
    // and by the reach, each corner concentric with the frame's own.
    const corner = px(ring.borderTopLeftRadius)
    const band =
      rounded(square.width + 2 * reach, square.height + 2 * reach, corner + reach) - rounded(square.width + 2 * offset, square.height + 2 * offset, corner + offset)
    await expect(band - 4 * (square.width + square.height)).toBeGreaterThanOrEqual(0)
  },
}
