import { useLingui } from '@lingui/react'
import { Box, Stack } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useArgs, useRef as useStoryRef } from 'storybook/preview-api'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18n } from '../../i18n'
import { contrast } from '../../theme/darkMode'
import { iconSize, radius, semantic, spacing } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
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
    // A measure's name in a failure message, for the developer who reads it.
    // eslint-disable-next-line lingui/no-unlocalized-strings -- KN-214
    ...Object.fromEntries(Object.entries({ left, top, width, height, scrollLeft: box.scrollLeft, scrollTop: box.scrollTop }).map(([name, value]) => [`box ${name}`, String(value)])),
  }
}

// What differs between two layouts, by name, so a failure says what moved.
const changes = (before: Record<string, string>, after: Record<string, string>) =>
  // A failure message, for the developer who reads it.
  // eslint-disable-next-line lingui/no-unlocalized-strings -- KN-214
  [...new Set([...Object.keys(before), ...Object.keys(after)])].filter((name) => before[name] !== after[name]).map((name) => `${name}: ${before[name] ?? 'unset'} → ${after[name] ?? 'unset'}`)

// What a user typed: record data, so it is not translated.
const [FIRST_JOB] = fixtures('fa-IR').jobs
if (!FIRST_JOB) throw new Error('the story fixtures have no job opportunity')
const TYPED = FIRST_JOB.title
// The first word of it, as someone types it before the rest.
const SHORT = TYPED.slice(0, 5)

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

// The args the meta's render takes: the Input's props, and the revision the
// bound field writes with each of its values, KN-280. Story plumbing rather
// than a prop: it never reaches the Input, and no control shows it.
type BoundArgs = InputProps & { revision?: number }

// A value the bound field sent to the args, and the revision it sent it at.
interface Sent {
  revision: number
  value: string
}

// What the bound field holds: the value it shows, what it has sent to the
// args and not yet seen come back, and the value and revision it last saw.
interface Held {
  value: string | undefined
  sent: Sent[]
  seen: { value: string | undefined; revision: number | undefined }
}

// The field the meta's render draws. While a value is bound in the args it
// holds its own copy: an edit shows the moment it is made and then goes to
// the args, which come back through Storybook's channel; waiting for them
// lost keys typed faster than that, KN-253. Each write carries a revision, so
// an arg that comes back at a revision this field sent, with the value it sent
// there, is an echo and changes nothing, however late; anything else was set
// elsewhere, in Controls or by a reset, and is taken. Storybook renders with
// whatever the store holds by then, so a render can skip echoes, or bring a
// Controls value equal to an edit still in flight: that arrives at the
// revision of the field's last write, with a value that is not the one sent
// there, and is taken, KN-280. One Bound per story, so one stream of revisions.
const Bound = ({ args: given, updateArgs }: { args: BoundArgs; updateArgs: (update: Partial<BoundArgs>) => void }) => {
  // The revision is taken out here, so the Input never sees it.
  const { revision, ...args } = given
  const [held, setHeld] = useState<Held>({ value: args.value, sent: [], seen: { value: args.value, revision } })
  // The last revision this field wrote, counting on from the store's, so a
  // remount, a reset or a revision in the address bar never makes a write
  // reuse one. Read and written only in the handler.
  const counter = useRef(revision ?? 0)
  // React's pattern for state that follows a prop: adjusted during render
  // when the arg changes, its value or its revision, not in an effect.
  if (args.value !== held.seen.value || revision !== held.seen.revision) {
    const seen = { value: args.value, revision }
    const echo = revision !== undefined && held.sent.some((sent) => sent.revision === revision && sent.value === args.value)
    setHeld(echo ? { value: held.value, sent: held.sent.filter((sent) => sent.revision > revision), seen } : { value: args.value, sent: [], seen })
  }
  const bound = args.value !== undefined
  const onChange = (value: string, event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (bound) {
      const at = Math.max(counter.current, revision ?? 0) + 1
      counter.current = at
      setHeld((current) => ({ ...current, value, sent: [...current.sent, { revision: at, value }] }))
      updateArgs({ value, revision: at })
    }
    args.onChange?.(value, event)
  }
  return <Input {...args} {...(bound && held.value !== undefined ? { value: held.value } : {})} onChange={onChange} />
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

// The field's edge: a border on its ::before, painted over the padding, so it
// takes no layout space, KN-266.
const edgeOf = (field: HTMLElement) => getComputedStyle(field, '::before')

// A computed length as a number of pixels; none, or auto, is 0.
const px = (value: string) => Number.parseFloat(value) || 0

// Where the text starts and ends inside the field, from its outer edge, start
// first: on the side the text starts from, the input's box plus its own border
// and padding there plus its text-indent, which moves the text inside a box
// that stays put; on the other side, the box less its border and padding. So
// an indent or a padding on the input counts, as a stroke that took space
// would: 95:5 draws 16, KN-266, KN-283. The start is only where the text starts
// while it is aligned there and not scrolled, and an empty field shows its
// placeholder, whose own alignment and indent count then. The direction is the
// input's, and the placeholder's too, since Chromium ignores direction set on a
// placeholder; and it is one fixed direction, from the field's start, only
// while nothing lets the content choose it, the text runs across, and the
// input runs the field's way, KN-297.
const textInsets = (field: HTMLElement, box: HTMLElement) => {
  const outer = field.getBoundingClientRect()
  const inner = box.getBoundingClientRect()
  const style = getComputedStyle(box)
  const shown = box instanceof HTMLInputElement && box.value === '' ? getComputedStyle(box, '::placeholder') : style
  const rtl = style.direction === 'rtl'
  if (/^plaintext$/.test(style.unicodeBidi)) throw new Error('the content sets the direction, unicode-bidi plaintext')
  if (style.writingMode !== 'horizontal-tb') throw new Error(`the text runs ${style.writingMode}, not across`)
  const along = getComputedStyle(field).direction
  if (style.direction !== along) throw new Error(`the text runs ${style.direction} in a field that runs ${along}`)
  // CSS text-align keywords a computed style is compared with.
  // eslint-disable-next-line lingui/no-unlocalized-strings -- KN-214
  if (shown.textAlign !== 'start' && shown.textAlign !== (rtl ? 'right' : 'left')) throw new Error(`the text is aligned ${shown.textAlign}, so it does not start at the field's start`)
  if (box.scrollLeft !== 0) throw new Error(`the text is scrolled by ${box.scrollLeft}, so it does not start at its origin`)
  if (!/^-?[\d.]+px$/.test(shown.textIndent)) throw new Error(`the text-indent is ${shown.textIndent}, not a length`)
  const [start, end] = rtl
    ? [outer.right - inner.right + px(style.borderRightWidth) + px(style.paddingRight), inner.left - outer.left + px(style.borderLeftWidth) + px(style.paddingLeft)]
    : [inner.left - outer.left + px(style.borderLeftWidth) + px(style.paddingLeft), outer.right - inner.right + px(style.borderRightWidth) + px(style.paddingRight)]
  return [start + px(shown.textIndent), end]
}

// The field itself: MUI's input root, the element that carries the edge.
const fieldOf = (canvasElement: HTMLElement) => {
  const field = within(canvasElement).getByRole('textbox').parentElement
  if (!field) throw new Error('the input has no field around it')
  return field
}

const meta = {
  title: 'Shared/Input',
  component: Input,
  // The specimen's copy is IN the args, so the Controls show it, and the
  // render keeps it in the language on screen, KN-245. And the revision the
  // bound field writes with each value, a number from 0, in no table and no
  // control, KN-280.
  args: { ...AT_LOAD, onChange: fn(), revision: 0 },
  argTypes: { revision: { type: { name: 'number' }, table: { disable: true } } },
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
    const [, updateArgs] = useArgs<BoundArgs>()
    // What this story last wrote into each copy field. Storybook's ref, kept
    // with the story's hooks rather than React's, so it outlives the remount a
    // language switch causes.
    const written = useStoryRef<Record<CopyField, string>>({ ...AT_LOAD })
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
    // Drawn exactly as the args say, and nothing else: a value the Controls
    // do not show is the hidden fallback this story used to have.
    return (
      <>
        <FollowTheLanguage pending={COPY_FIELDS.some((field) => update[field] !== undefined)} write={write} />
        <Bound key={args.value === undefined ? `0${args.defaultValue ?? ''}` : '1'} args={args} updateArgs={updateArgs} />
      </>
    )
  },
} satisfies StoryMeta<BoundArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  // Not error: it asserts the default border.
  parameters: offers(['label', 'value', 'defaultValue', 'placeholder', 'helperText', 'disabled', 'name']),
  globals: { colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const field = fieldOf(canvasElement)
    const box = within(canvasElement).getByRole('textbox')
    const style = getComputedStyle(field)
    // Node 95:3: 44 tall, 16 at each side, radius md, one pixel of border/default
    // drawn inside, so the text sits 16 from the edge, not 17, KN-266.
    await expect(field.offsetHeight).toBe(44)
    await expect([style.paddingLeft, style.paddingRight].map(Number.parseFloat)).toEqual([16, 16])
    await expect(Number.parseFloat(style.borderTopLeftRadius)).toBe(8)
    await expect(Number.parseFloat(edgeOf(field).borderTopWidth)).toBe(1)
    await expect(edgeOf(field).borderTopColor).toBe(computedColour(field, semantic['border/default']))
    await expect(textInsets(field, box)).toEqual([16, 16])
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
    await expect(textInsets(field, box)).toEqual([16, 16])
    await userEvent.tab()
    await expect(box).toHaveFocus()
    // Node 95:19: TWO pixels of border/focus, drawn inside, and the text does
    // not move for it: still 16 from the edge, the field 44 tall either way,
    // and nothing that lays the text out inside it changes, KN-266.
    await expect(Number.parseFloat(edgeOf(field).borderTopWidth)).toBe(2)
    await expect(edgeOf(field).borderTopColor).toBe(computedColour(field, semantic['border/focus']))
    await expect(textInsets(field, box)).toEqual([16, 16])
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
  render: () => <JobTitle defaultValue={SHORT} withError />,
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('textbox')
    const field = fieldOf(canvasElement)
    // Node 95:24: border/error on the field, text/error on the line under it,
    // and the error is what the field announces as its description.
    await expect(edgeOf(field).borderTopColor).toBe(computedColour(field, semantic['border/error']))
    await expect(textInsets(field, box)).toEqual([16, 16])
    await expect(box).toHaveAttribute('aria-invalid', 'true')
    const describedBy = box.getAttribute('aria-describedby') ?? ''
    const line = canvasElement.ownerDocument.getElementById(describedBy)
    if (!line) throw new Error('the field describes itself by nothing')
    await expect(getComputedStyle(line).color).toBe(computedColour(line, semantic['text/error']))
    await expect(box).toHaveAccessibleDescription(line.textContent)
  },
}

// A box in the viewport, by its four edges.
interface Extent {
  left: number
  top: number
  right: number
  bottom: number
}

// How far past its own box a style paints: its outline, and any shadow cast
// outside it, the largest of its offset, blur and spread. An inset shadow
// paints inside, so it does not count.
const reach = (style: CSSStyleDeclaration) => {
  const outline = style.outlineStyle === 'none' ? 0 : px(style.outlineWidth) + px(style.outlineOffset)
  const shadows = style.boxShadow === 'none' ? [] : style.boxShadow.split(/,(?![^(]*\))/).filter((shadow) => !/\binset\b/.test(shadow))
  const cast = shadows.map((shadow) => {
    const [x = 0, y = 0, blur = 0, spread = 0] = (shadow.replace(/rgba?\([^)]*\)/, '').match(/-?[\d.]+(?=px)/g) ?? []).map(Number)
    return Math.max(Math.abs(x), Math.abs(y)) + blur + spread
  })
  return Math.max(0, outline, ...cast)
}

// What `focusExtent` cannot model. A transform or a filter moves or spreads
// paint, and a clip-path or a mask cuts it, so an extent computed from insets
// and reaches would be a guess wherever one is set. The Input uses none of
// them, so the story requires that rather than reporting a box it cannot know,
// KN-295. The mask is read through its image, which computes to none when there
// is none; the shorthand computes to a string of all its parts.
/* eslint-disable lingui/no-unlocalized-strings -- KN-214: CSS property names, and the labels a failure here prints for whoever reads it. */
const EFFECTS = ['transform', 'filter', 'clipPath', 'maskImage'] as const

/** Each place a paint effect the extent does not model is set, named. */
const unmodelled = (field: HTMLElement, box: HTMLElement) => {
  const places: [string, CSSStyleDeclaration][] = [
    ['the field', getComputedStyle(field)],
    ['the edge, ::before', getComputedStyle(field, '::before')],
    ['the ring, ::after', getComputedStyle(field, '::after')],
    ['the input', getComputedStyle(box)],
  ]
  return places.flatMap(([where, style]) => EFFECTS.filter((effect) => style[effect] !== 'none').map((effect) => `${where}: ${effect}`))
}
/* eslint-enable lingui/no-unlocalized-strings */

// Everything the field's focus can paint, as one box: the field's own box,
// grown by what it paints past itself; the boxes of its two pseudo-elements,
// which an inset below zero would put outside it, grown the same way; and the
// input's own box and reach, since an outline on the input is drawn outside the
// input and the input can fill the field, KN-295.
const focusExtent = (field: HTMLElement, input: HTMLElement): Extent => {
  const box = field.getBoundingClientRect()
  const grow = reach(getComputedStyle(field))
  const extent = { left: box.left - grow, top: box.top - grow, right: box.right + grow, bottom: box.bottom + grow }
  for (const style of [getComputedStyle(field, '::before'), getComputedStyle(field, '::after')]) {
    if (style.content === 'none') continue
    const out = reach(style)
    extent.left = Math.min(extent.left, box.left + px(style.left) - out)
    extent.top = Math.min(extent.top, box.top + px(style.top) - out)
    extent.right = Math.max(extent.right, box.right - px(style.right) + out)
    extent.bottom = Math.max(extent.bottom, box.bottom - px(style.bottom) + out)
  }
  const inner = input.getBoundingClientRect()
  const innerGrow = reach(getComputedStyle(input))
  extent.left = Math.min(extent.left, inner.left - innerGrow)
  extent.top = Math.min(extent.top, inner.top - innerGrow)
  extent.right = Math.max(extent.right, inner.right + innerGrow)
  extent.bottom = Math.max(extent.bottom, inner.bottom + innerGrow)
  return extent
}

// Every ancestor that clips what overflows it, on either axis.
const clippingAncestors = (element: HTMLElement) => {
  const found: HTMLElement[] = []
  for (let node = element.parentElement; node; node = node.parentElement) {
    const style = getComputedStyle(node)
    if (style.overflowX !== 'visible' || style.overflowY !== 'visible') found.push(node)
  }
  return found
}

// Where an ancestor clips: its padding box, inside its borders. That is the
// clip edge for hidden, auto and scroll; an auto or scroll ancestor's
// scrollbars, overflow: clip with a margin, and a rounded clip are not
// modelled, and the host here is square and hidden, with no scrollbar. The
// verifier's screenshots are the rendered proof.
const clipEdge = (node: HTMLElement): Extent => {
  const box = node.getBoundingClientRect()
  const style = getComputedStyle(node)
  return { left: box.left + px(style.borderLeftWidth), top: box.top + px(style.borderTopWidth), right: box.right - px(style.borderRightWidth), bottom: box.bottom - px(style.borderBottomWidth) }
}

// How far an extent passes each side of a box: only the sides it passes, so
// an extent inside the box gives none, and a failure names the side.
const overshoot = (inner: Extent, outer: Extent) =>
  Object.entries({ left: outer.left - inner.left, top: outer.top - inner.top, right: inner.right - outer.right, bottom: inner.bottom - outer.bottom }).filter(([, by]) => by > 0)

// A contour drawn inside a box: how far in from the box's edge it runs, and
// the radius of its own corners there.
interface Contour {
  inset: number
  radius: number
}

// The area inside a contour of a w by h box: its rectangle less what the
// corners cut away, (4 - PI)r squared, a square less the quarter circle inside
// it at each of the four. Counting a rounded contour as a rectangle overstated
// the change: 3580 square pixels computed against 3536 read from the pixels of
// the 568 wide field, KN-295.
const insetArea = (w: number, h: number, { inset, radius: corner }: Contour) => {
  const r = Math.max(0, Math.min(corner, (w - 2 * inset) / 2, (h - 2 * inset) / 2))
  return (w - 2 * inset) * (h - 2 * inset) - (4 - Math.PI) * r * r
}

// The area of the band between two contours of the same box.
const band = (w: number, h: number, from: Contour, to: Contour) => insetArea(w, h, from) - insetArea(w, h, to)

// A field narrow enough to be the hard case: the change is a band, so the
// narrower the field the less of it there is against the perimeter it has to
// clear, and only a full width one was ever measured, KN-295. DESIGN.md's
// arithmetic puts the crossing at 13 wide.
const NARROW = 80

export const FocusedWhileInvalid: Story = {
  parameters: { controls: { disable: true } },
  globals: { colorScheme: 'light' },
  render: () => (
    // A host that clips what overflows it and has no padding, so its inline
    // edges are the field's, as a modal or a scroll area can be, KN-274.
    <Box data-testid="clipping-host" sx={{ overflow: 'hidden', display: 'grid', gap: `${spacing.md}px` }}>
      <Box data-testid="wide">
        <JobTitle defaultValue={SHORT} withError />
      </Box>
      <Box data-testid="narrow" sx={{ width: `${NARROW}px` }}>
        <JobTitle defaultValue={SHORT} withError />
      </Box>
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const host = within(canvasElement).getByTestId('clipping-host')

    // Everything below is read for one field while it holds the focus, and run
    // for each field in turn, in tab order.
    const check = async (holder: HTMLElement) => {
      const box = within(holder).getByRole('textbox')
      const field = fieldOf(holder)
      const before = textLayout(box)
      const resting = px(edgeOf(field).borderTopWidth)
      await userEvent.tab()
      await expect(box).toHaveFocus()
      // Nothing moves or cuts the paint in a way the extent cannot account
      // for, KN-295.
      await expect(unmodelled(field, box)).toEqual([])
      // Every pixel the focus change paints lies inside the field's own box, so
      // inside any host that holds the field, and inside every ancestor here
      // that clips, the host flush with the field's inline edges among them. A
      // ring round the field would lie four outside, KN-274.
      const extent = focusExtent(field, box)
      await expect(overshoot(extent, field.getBoundingClientRect())).toEqual([])
      const clips = clippingAncestors(field)
      await expect(clips).toContain(host)
      for (const clip of clips) await expect(overshoot(extent, clipEdge(clip))).toEqual([])
      // The ring, since red to red is no change: two pixels of border/focus,
      // changing from the field's own surface at 3:1 or more, KN-244. Measured
      // against the field, not the host, since it is drawn on the field.
      const ring = getComputedStyle(field, '::after')
      const surface = hexOf(getComputedStyle(field).backgroundColor)
      await expect(px(ring.borderTopWidth)).toBeGreaterThanOrEqual(2)
      await expect(contrast(hexOf(ring.borderTopColor), surface)).toBeGreaterThanOrEqual(3)
      await expect(ring.borderTopColor).toBe(computedColour(field, semantic['border/focus']))
      // With the pixel the edge gains, also a change from the surface at 3:1 or
      // more, the change is at least the field's two-pixel perimeter, 4W + 4H,
      // WCAG 2.4.13's measure. Each band runs between two contours, corners and
      // all: the edge's, from its resting width in to its focused one, and the
      // ring's, from its own inset in by its own width.
      const edge = edgeOf(field)
      await expect(contrast(hexOf(edge.borderTopColor), surface)).toBeGreaterThanOrEqual(3)
      const { width, height } = field.getBoundingClientRect()
      const edgeRadius = px(edge.borderTopLeftRadius)
      const edgeWidth = px(edge.borderTopWidth)
      const ringInset = px(ring.top)
      const ringWidth = px(ring.borderTopWidth)
      const ringRadius = px(ring.borderTopLeftRadius)
      const gained = band(width, height, { inset: resting, radius: edgeRadius - resting }, { inset: edgeWidth, radius: edgeRadius - edgeWidth })
      const drawn = band(width, height, { inset: ringInset, radius: ringRadius }, { inset: ringInset + ringWidth, radius: ringRadius - ringWidth })
      await expect(gained + drawn - 4 * (width + height)).toBeGreaterThanOrEqual(0)
      // Not drawn in the file, decided in DESIGN.md. The border keeps the focus
      // width in the error colour, so the error stays in view while it is being
      // fixed, KN-241.
      await expect(edgeWidth).toBe(2)
      await expect(edge.borderTopColor).toBe(computedColour(field, semantic['border/error']))
      // And nothing that lays the text out moves for any of it.
      await expect(changes(before, textLayout(box))).toEqual([])
    }

    await check(within(host).getByTestId('wide'))
    const narrow = within(host).getByTestId('narrow')
    await expect(fieldOf(narrow).getBoundingClientRect().width).toBeLessThanOrEqual(NARROW)
    await check(narrow)
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
    await expect(edgeOf(field).borderTopColor).toBe(computedColour(field, semantic['border/default']))
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
    await expect(edgeOf(field).borderTopColor).toBe(computedColour(field, semantic['text/secondary']))
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
  <Box data-testid="args" data-label={args.label} data-placeholder={args.placeholder} data-helper={args.helperText} data-value={args.value}>
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

// Twenty keys, letter-free since they are test data rather than copy.
const KEYS = '01234567890123456789'

export const TypingIntoABoundValue: Story = {
  // A value bound in the args and twenty keys typed with no delay between
  // them: the field keeps every one, KN-253. In Storybook itself the args
  // then follow the field; under the test runner they cannot move,
  // TECH-DEBT 16, which is what makes the plain round trip refuse every key
  // there. A fixed assertion, so no control is offered.
  parameters: { controls: { disable: true } },
  args: { value: '7' },
  render: WithTheArgs,
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('textbox')
    const recorded = within(canvasElement).getByTestId('args').dataset
    await userEvent.type(box, KEYS, { delay: null })
    await expect(box).toHaveValue(`7${KEYS}`)
    if ('__KARNAMA_STORY_TEST__' in globalThis) return
    await waitFor(async () => {
      await expect(recorded.value).toBe(`7${KEYS}`)
    })
    await expect(box).toHaveValue(`7${KEYS}`)
  },
}

// The file's own placeholder for an icon, nodes 95:6 and 95:8: a 20 by 20
// square of radius sm, in the colour its slot gives it.
const Placeholder = () => (
  <svg viewBox={`0 0 ${iconSize.md} ${iconSize.md}`} aria-hidden>
    <rect width={iconSize.md} height={iconSize.md} rx={radius.sm} fill="currentColor" />
  </svg>
)

// Node 95:38 with its icons on: each slot 20 by 20 in text/secondary, 16 from
// its edge of the field and 4 from the text, on the side the direction gives
// it: the leading one at the inline start, KN-267. The text moves along by the
// icon and the gap, to 40, measured where it starts, KN-283.
const slotsAreTheFiles = async (canvasElement: HTMLElement, sides: { leading: boolean; trailing: boolean }) => {
  const field = fieldOf(canvasElement)
  const box = within(canvasElement).getByRole('textbox')
  const rtl = getComputedStyle(field).direction === 'rtl'
  const outer = field.getBoundingClientRect()
  const fromStart = (rect: DOMRect) => (rtl ? outer.right - rect.right : rect.left - outer.left)
  const fromEnd = (rect: DOMRect) => (rtl ? rect.left - outer.left : outer.right - rect.right)
  // text/secondary in whichever theme is on: the helper line under the field
  // is drawn in it, so the stories need no pin to one palette.
  const helper = canvasElement.ownerDocument.getElementById(box.getAttribute('aria-describedby') ?? '')
  if (!helper) throw new Error('the specimen has no helper line to compare with')
  const secondary = getComputedStyle(helper).color
  const slot = async (element: Element | null, distance: (rect: DOMRect) => number) => {
    if (!(element instanceof HTMLElement)) throw new Error('the slot is not there')
    const rect = element.getBoundingClientRect()
    await expect([rect.width, rect.height]).toEqual([20, 20])
    await expect(distance(rect)).toBe(16)
    await expect(getComputedStyle(element).color).toBe(secondary)
  }
  if (sides.leading) await slot(box.previousElementSibling, fromStart)
  else await expect(box.previousElementSibling).toBeNull()
  if (sides.trailing) await slot(box.nextElementSibling, fromEnd)
  else await expect(box.nextElementSibling).toBeNull()
  await expect(textInsets(field, box)).toEqual([sides.leading ? 40 : 16, sides.trailing ? 40 : 16])
}

export const LeadingIcon: Story = {
  // The leading slot on, with the file's placeholder. A fixed render, so no
  // control is offered.
  parameters: { controls: { disable: true } },
  render: () => <JobTitle leadingIcon={<Placeholder />} />,
  play: async ({ canvasElement }) => {
    await slotsAreTheFiles(canvasElement, { leading: true, trailing: false })
  },
}

export const TrailingIcon: Story = {
  parameters: { controls: { disable: true } },
  render: () => <JobTitle trailingIcon={<Placeholder />} />,
  play: async ({ canvasElement }) => {
    await slotsAreTheFiles(canvasElement, { leading: false, trailing: true })
  },
}

export const BothIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => <JobTitle leadingIcon={<Placeholder />} trailingIcon={<Placeholder />} />,
  play: async ({ canvasElement }) => {
    await slotsAreTheFiles(canvasElement, { leading: true, trailing: true })
  },
}

// An icon that renders nothing, the way a component can.
const Nothing = () => null

// An icon that renders a space: blank text the Input cannot see in the prop,
// since a component is an element whatever it returns, KN-296.
const Blank = () => ' '

// Strings with nothing to see, spelled by code point so the source shows what
// they are: a zero-width space, a line break and a zero-width joiner.
const ZERO_WIDTH_SPACE = String.fromCodePoint(0x200b)
const LINE_BREAK = String.fromCodePoint(0x0a)
const ZERO_WIDTH_JOINER = String.fromCodePoint(0x200d)

export const IconsTurnedOff: Story = {
  // Every way a caller turns an icon off: false and null, true and an empty
  // string, a space and a zero-width space, a line break and a joiner, an empty
  // fragment and an icon that renders nothing, and the three that hand the slot
  // blank text where the prop cannot show it, an array, a fragment and a
  // component, KN-296. None draws a slot that takes room, and the text stays 16
  // from both edges, KN-291, KN-292. A fixed render.
  parameters: { controls: { disable: true } },
  render: () => (
    <Stack>
      <Box data-testid="no-slot">
        <JobTitle leadingIcon={false} trailingIcon={null} />
      </Box>
      <Box data-testid="no-slot">
        <JobTitle leadingIcon={true} trailingIcon={''} />
      </Box>
      <Box data-testid="no-slot">
        <JobTitle leadingIcon={' '} trailingIcon={ZERO_WIDTH_SPACE} />
      </Box>
      <Box data-testid="no-slot">
        <JobTitle leadingIcon={LINE_BREAK} trailingIcon={ZERO_WIDTH_JOINER} />
      </Box>
      <Box data-testid="empty-slot">
        <JobTitle leadingIcon={<></>} trailingIcon={<Nothing />} />
      </Box>
      <Box data-testid="empty-slot">
        <JobTitle leadingIcon={[' ']} trailingIcon={<>{ZERO_WIDTH_SPACE}</>} />
      </Box>
      <Box data-testid="empty-slot">
        <JobTitle leadingIcon={<Blank />} trailingIcon={<Blank />} />
      </Box>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const plain = canvas.getAllByTestId('no-slot')
    await expect(plain).toHaveLength(4)
    // The values that draw nothing, and the strings with nothing to read, get
    // no slot at all.
    for (const field of plain) {
      const box = within(field).getByRole('textbox')
      await expect([box.previousElementSibling, box.nextElementSibling]).toEqual([null, null])
      await expect(textInsets(fieldOf(field), box)).toEqual([16, 16])
    }
    // What the Input cannot see before React renders it: an empty fragment and
    // an icon that renders nothing, an array and a fragment holding blank text,
    // and a component that returns a space. Each gets a slot that collapses to
    // nothing, measured from what it rendered, KN-291, KN-296.
    const rendered = canvas.getAllByTestId('empty-slot')
    await expect(rendered).toHaveLength(3)
    for (const field of rendered) {
      const box = within(field).getByRole('textbox')
      for (const side of [box.previousElementSibling, box.nextElementSibling]) {
        if (!(side instanceof HTMLElement)) throw new Error('the slot is not there')
        await expect(side.getBoundingClientRect().width).toBe(0)
      }
      await expect(textInsets(fieldOf(field), box)).toEqual([16, 16])
    }
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

// The whole Input around a textbox, label, field and message line, and its
// message line, the element the field would be described by.
const inputOf = (box: HTMLElement) => {
  const whole = box.parentElement?.parentElement
  const line = whole?.lastElementChild
  if (!(whole instanceof HTMLElement) || !(line instanceof HTMLElement)) throw new Error('the textbox is not inside an Input')
  return { whole, line }
}

export const WithoutAHelper: Story = {
  // No helper, which the specimen always has, and a helper of only blank
  // characters, which is none: the file's 64, label, 4 and field, no line
  // drawn and nothing to describe the field by, KN-287. The alert that an
  // error would land in is still in the page, at no size, KN-286. A fixed
  // render, so no control applies.
  parameters: { controls: { disable: true } },
  render: () => (
    <Stack direction="row" spacing={3} sx={{ alignItems: 'flex-start' }}>
      <Bare />
      <Bare helperText="   " />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const boxes = within(canvasElement).getAllByRole('textbox')
    await expect(boxes).toHaveLength(2)
    for (const box of boxes) {
      const { whole, line } = inputOf(box)
      await expect(box).not.toHaveAttribute('aria-describedby')
      await expect(whole.getBoundingClientRect().height).toBe(64)
      await expect(line.getBoundingClientRect().height).toBe(0)
      await expect(within(line).getByRole('alert')).toBeEmptyDOMElement()
    }
  },
}

export const ErrorAddsTheLine: Story = {
  // A field with no helper beside the same field with an error, top aligned,
  // NOT stretched, which would give both the taller one's height: the first is
  // the file's 64 with no line, the second its 90, the error adding the line
  // with its message, the owner's decision of KN-285, KN-287. A fixed render,
  // so no control applies.
  parameters: { controls: { disable: true } },
  render: () => (
    <Stack direction="row" spacing={3} sx={{ alignItems: 'flex-start' }}>
      <Bare />
      <Bare error={i18n._('This field cannot be empty')} />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const [plain, failing] = within(canvasElement).getAllByRole('textbox')
    if (!plain || !failing) throw new Error('the two fields did not render')
    await expect(inputOf(plain).whole.getBoundingClientRect().height).toBe(64)
    await expect(inputOf(failing).whole.getBoundingClientRect().height).toBe(90)
    await expect(inputOf(failing).line.getBoundingClientRect().height).toBe(22)
    await expect(inputOf(failing).line).toHaveTextContent(i18n._('This field cannot be empty'))
    await expect(failing).toHaveAccessibleDescription(i18n._('This field cannot be empty'))
  },
}

export const ErrorReplacesTheHelper: Story = {
  // The specimen, which has a helper, with an error: the line is the file's one
  // line, 90 tall, and it says the error alone, the helper gone from it and
  // from the field's description until the error clears, KN-287. A fixed
  // render, so no control applies.
  parameters: { controls: { disable: true } },
  render: () => <JobTitle withError />,
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('textbox')
    const { whole, line } = inputOf(box)
    const message = i18n._('This field cannot be empty')
    await expect(whole.getBoundingClientRect().height).toBe(90)
    await expect(line.textContent).toBe(message)
    await expect(box).toHaveAccessibleDescription(message)
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
    <Stack direction="row" spacing={3} data-testid="blank">
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
      await expect(edgeOf(field).borderTopColor).toBe(computedColour(field, semantic['border/default']))
      const line = canvasElement.ownerDocument.getElementById(box.getAttribute('aria-describedby') ?? '')
      if (!line) throw new Error('the field describes itself by nothing')
      await expect(line.textContent).not.toBe('')
      await expect(getComputedStyle(line).color).toBe(computedColour(line, semantic['text/secondary']))
    }
  },
}

// A field that checks itself as it is typed in, the way a form's validation
// does, by two rules: empty is an error the moment it happens, one character is
// another, and a second clears it. The specimen with its helper, or the bare
// field with none.
const ValidatesAsYouType = ({ described }: { described: boolean }) => {
  const { i18n } = useLingui()
  const [value, setValue] = useState(TYPED)
  const error = value === '' ? { error: i18n._('This field cannot be empty') } : value.length < 2 ? { error: i18n._('Enter at least two characters') } : {}
  return described ? <JobTitle value={value} onChange={setValue} {...error} /> : <Bare value={value} onChange={setValue} {...error} />
}

export const ErrorAnnouncedWhileTyping: Story = {
  // An error that appears while the field has focus: a changed description is
  // not read while focus stays, so the error goes into a live region that was
  // in the page before it arrived, WCAG 4.1.3, KN-286. An error replaced by
  // another, focus kept, lands in the same region, KN-298. Cleared, the helper
  // is the description again, and a field with no helper is described by
  // nothing. A fixed render, so no control applies.
  parameters: { controls: { disable: true } },
  render: () => (
    <Stack spacing={3}>
      <Box data-testid="described">
        <ValidatesAsYouType described />
      </Box>
      <Box data-testid="bare">
        <ValidatesAsYouType described={false} />
      </Box>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const message = i18n._('This field cannot be empty')
    const short = i18n._('Enter at least two characters')
    for (const { id, helper } of [
      { id: 'described', helper: specimenCopy().helperText },
      { id: 'bare', helper: undefined },
    ]) {
      const field = within(canvasElement).getByTestId(id)
      const box = within(field).getByRole('textbox')
      // The line is drawn while there is something to say: the described
      // field is 90 throughout, the bare one 64 until an error adds its line,
      // KN-287.
      const { whole } = inputOf(box)
      const valid = helper === undefined ? 64 : 90
      await expect(whole.getBoundingClientRect().height).toBe(valid)
      // The region is in the page before anything goes wrong, and empty.
      const region = within(field).getByRole('alert')
      await expect(region).toBeEmptyDOMElement()
      await userEvent.click(box)
      await userEvent.clear(box)
      // Still in the field, and told: the same region carries the error.
      await expect(box).toHaveFocus()
      await expect(region).toHaveTextContent(message)
      await expect(box).toHaveAttribute('aria-invalid', 'true')
      await expect(box).toHaveAccessibleDescription(message)
      await expect(whole.getBoundingClientRect().height).toBe(90)
      // One character: the error is replaced by another, focus kept, and it is
      // the same region, still in the page, that carries it, not a new one.
      await userEvent.type(box, 'x')
      await expect(box).toHaveFocus()
      await expect(region).toBeInTheDocument()
      await expect(within(field).getByRole('alert')).toBe(region)
      await expect(region).toHaveTextContent(short)
      await expect(box).toHaveAccessibleDescription(short)
      await expect(whole.getBoundingClientRect().height).toBe(90)
      await userEvent.type(box, 'y')
      await expect(region).toBeEmptyDOMElement()
      await expect(box).not.toHaveAttribute('aria-invalid')
      if (helper === undefined) await expect(box).not.toHaveAttribute('aria-describedby')
      else await expect(box).toHaveAccessibleDescription(helper)
      await expect(whole.getBoundingClientRect().height).toBe(valid)
    }
  },
}

export const Multiline: Story = {
  // Several lines, the add modal's paste field, node 166:69: 140 tall, the
  // text 16 from every edge and starting at the top, KN-029.
  parameters: offers(['label', 'value', 'defaultValue', 'placeholder', 'helperText', 'error', 'disabled', 'name']),
  args: { multiline: true },
  globals: { colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const field = fieldOf(canvasElement)
    const box = within(canvasElement).getByRole('textbox')
    await expect(box.tagName).toBe('TEXTAREA')
    await expect(field.offsetHeight).toBe(140)
    const style = getComputedStyle(field)
    await expect([style.paddingTop, style.paddingLeft].map(Number.parseFloat)).toEqual([16, 16])
    await expect(Math.round(box.getBoundingClientRect().top - field.getBoundingClientRect().top)).toBe(16)
    await expect(box.getBoundingClientRect().height).toBe(108)
    await userEvent.type(box, Array.from({ length: 20 }, (_, index) => `${String(index)} ${fixtures('en-US').longStatusName}`).join('\n'))
    await waitFor(() => expect(field.offsetHeight).toBeGreaterThan(140))
    await expect(field.offsetHeight).toBeLessThanOrEqual(208)
    await expect(box.scrollHeight).toBeGreaterThan(box.clientHeight)
    await expect(field.getBoundingClientRect().height).toBe(box.getBoundingClientRect().height + 32)
  },
}

export const Required: Story = {
  // A required field, the owner's KN-075: a mark after the label, seen and not
  // read, and the field says it is required.
  parameters: offers(['label', 'value', 'defaultValue', 'placeholder', 'helperText', 'error', 'disabled', 'name']),
  args: { required: true },
  play: async ({ args, canvasElement }) => {
    const box = within(canvasElement).getByRole('textbox')
    await expect(box).toBeRequired()
    await expect(box).toHaveAccessibleName(args.label)
  },
}

export const LeavesThePointerOnTheField: Story = {
  // The first half of KN-260's check: the runner's real pointer is left on the
  // field, which takes the hover border. StartsAtRest follows it in the same
  // spot and must find the resting border, which the suite's reset gives it.
  parameters: offers(['label', 'value', 'defaultValue', 'placeholder', 'helperText', 'name']),
  globals: { colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const browser = await import('vitest/browser')
    const field = fieldOf(canvasElement)
    await browser.userEvent.hover(within(canvasElement).getByRole('textbox'))
    await expect(edgeOf(field).borderTopColor).toBe(computedColour(field, semantic['text/secondary']))
  },
}

export const StartsAtRest: Story = {
  // The second half: drawn where the story before left the pointer, the field
  // is at rest, because every story starts with the pointer on nothing.
  parameters: offers(['label', 'value', 'defaultValue', 'placeholder', 'helperText', 'name']),
  globals: { colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const field = fieldOf(canvasElement)
    await expect(edgeOf(field).borderTopColor).toBe(computedColour(field, semantic['border/default']))
  },
}

// A phone number as a reader types it, and the field that holds one.
const TYPED_NUMBER = '09123456789'

export const LatinInAPersianPage: Story = {
  args: { label: '', direction: 'ltr' },
  globals: { locale: 'fa-IR' },
  render: function Render(args) {
    const { i18n } = useLingui()
    const [held, setHeld] = useState('')
    return <Input {...args} label={i18n._('Mobile number')} value={held} onChange={setHeld} />
  },
  play: async ({ canvasElement }) => {
    // KN-458, the owner on a phone: a number typed into an RTL field came back
    // as '318 0912'. A run of latin digits in a right-to-left field is laid out
    // by the bidi algorithm, which reorders it around anything that is not a
    // digit, so what the reader sees is not what they typed.
    const field = within(canvasElement).getByLabelText('شماره موبایل')
    await userEvent.type(field, TYPED_NUMBER)
    await expect(field).toHaveValue(TYPED_NUMBER)

    // The field runs left to right, and still sits at the page's own inline
    // start, which is the right in Persian.
    const style = getComputedStyle(field)
    await expect(style.direction).toBe('ltr')
    await expect(style.textAlign).toBe('right')
  },
}

export const LatinInAnEnglishPage: Story = {
  args: { label: '', direction: 'ltr' },
  globals: { locale: 'en-US' },
  render: function Render(args) {
    const { i18n } = useLingui()
    const [held, setHeld] = useState('')
    return <Input {...args} label={i18n._('Mobile number')} value={held} onChange={setHeld} />
  },
  play: async ({ canvasElement }) => {
    // The same field in a page that already runs the same way: nothing moves.
    const field = within(canvasElement).getByLabelText('Mobile number')
    await userEvent.type(field, TYPED_NUMBER)
    await expect(field).toHaveValue(TYPED_NUMBER)
    await expect(getComputedStyle(field).textAlign).toBe('left')
  },
}
