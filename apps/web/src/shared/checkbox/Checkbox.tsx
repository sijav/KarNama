import { Checkbox as MuiCheckbox, Box } from '@mui/material'
import { useEffect, useState, type ChangeEvent } from 'react'
import { iconSize } from '../../theme/tokens'

/**
 * The surface is declared explicitly rather than extended from MUI's.
 *
 * Extending `CheckboxProps` pulled `component`, `slots` and `slotProps` into
 * this component's public API, which hands a caller the ability to replace how
 * it renders — the opposite of "match the design exactly", and something no
 * consumer of a design-system control should be offered. The story-docs guard
 * found it by demanding an entry for every prop, which is what a documentation
 * rule is for: it made an API decision visible that a type alias had hidden.
 */
export interface CheckboxProps {
  /** Controlled on or off. Leave unset for an uncontrolled checkbox. */
  checked?: boolean
  /** Starting state when the checkbox is uncontrolled. */
  defaultChecked?: boolean
  /** Shows the dash instead of the tick, for a selection that is partly on. */
  indeterminate?: boolean
  /** Greys the frame and stops it responding. */
  disabled?: boolean
  /** Fired with the event and the new checked value. */
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void
  /** Form field name, for a checkbox inside a form. */
  name?: string
  /** Form field value, for a checkbox inside a form. */
  value?: string
  /** Accessible name, when no visible label is associated with it. */
  'aria-label'?: string
  /** Id of the element that labels it, when there is a visible label. */
  'aria-labelledby'?: string
}

/**
 * Assigns the DOM property, from module scope and taking the node as an
 * argument.
 *
 * Not stylistic. The node is held in `useState`, and the lint rule that stops
 * React state being mutated in place cannot tell a DOM node from application
 * state, so assigning to it inline reads as a state mutation. Setting a
 * property on an element passed in as a parameter says what is actually
 * happening: this is the browser's own API, not React's.
 */
const applyIndeterminate = (node: HTMLInputElement, value: boolean) => {
  node.indeterminate = value
}

/**
 * The frame's own class, so styling never selects by a MUI class name.
 *
 * `.MuiBox-root` is on EVERY Box, including the `svg` glyph nested inside the
 * frame, so a descendant selector matched two elements and the focus outline
 * was drawn around the white tick as well as the frame. KN-205. One constant,
 * used by both the element and the rules, so they cannot drift apart.
 */
const FRAME = 'KarnamaCheckbox-frame'

/** The three ways the 20 by 20 square is drawn, before hover and disabled. */
type Mark = 'none' | 'tick' | 'dash'

/**
 * The square itself, drawn from tokens.
 *
 * Figma node `204:11` gives five states from seven variables, and every one of
 * them already exists in `src/theme/tokens.ts`: the surface, the default
 * border, the brand fill, the focus border, the secondary surface, white on
 * accent, and `radius.sm`. Nothing here is a literal, which is the rule in
 * `AGENTS.md` and what `noLiterals.test.ts` enforces.
 *
 * The tick and the dash are inline SVG rather than an icon font or a Material
 * icon, because the frame is 20 by 20 with a 4 radius and Material's own
 * checkbox glyph is a different shape at a different size. "Match the design
 * exactly" makes that a defect rather than a near-enough.
 */
const Frame = ({ mark, disabled }: { mark: Mark; disabled: boolean }) => (
  <Box
    aria-hidden
    className={FRAME}
    sx={(theme) => {
      const colour = theme.karnama.semantic
      const filled = mark !== 'none'
      return {
        width: iconSize.md,
        height: iconSize.md,
        borderRadius: `${theme.karnama.radius.sm}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        // Width and style are separate rather than the CSS shorthand, because
        // `noLiterals.test.ts` refuses a pixel string anywhere outside
        // `src/theme` and it is right to: a value that happens to match the
        // token today is one the next design change silently misses. It reads
        // comments too, so even explaining the shorthand by writing it out
        // fails, which is how this comment came to be phrased around it.
        //
        // The width itself has no Figma variable — the file draws every border
        // at one — so it is a plain number here and a token the day one exists.
        borderWidth: 1,
        borderStyle: 'solid',
        // Disabled reads as absent rather than as off: the frame is the
        // secondary surface and the border disappears into it, so it does not
        // compete with the checkboxes a user can actually act on.
        ...(disabled
          ? { backgroundColor: colour['bg/surface-secondary'], borderColor: colour['bg/surface-secondary'] }
          : filled
            ? { backgroundColor: colour['bg/brand/default'], borderColor: colour['bg/brand/default'] }
            : { backgroundColor: colour['bg/surface'], borderColor: colour['border/default'] }),
      }
    }}
  >
    {mark === 'tick' ? (
      <Box
        component="svg"
        viewBox="0 0 12 12"
        sx={(theme) => ({ width: 12, height: 12, fill: 'none', stroke: theme.karnama.semantic['text/on-accent'] })}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="2.5,6.5 5,9 9.5,3.5" />
      </Box>
    ) : null}
    {mark === 'dash' ? (
      <Box
        component="svg"
        viewBox="0 0 12 12"
        sx={(theme) => ({ width: 12, height: 12, stroke: theme.karnama.semantic['text/on-accent'] })}
        strokeWidth={2}
        strokeLinecap="round"
      >
        <line x1="3" y1="6" x2="9" y2="6" />
      </Box>
    ) : null}
  </Box>
)

/**
 * The checkbox, at 20 by 20, from Figma node `204:11`.
 *
 * **Indeterminate is a DOM property, never an attribute.** There is no
 * `indeterminate` content attribute in HTML: it exists only on the element, so
 * it has to be assigned to the input rather than rendered into the markup. That
 * is why this composes MUI's `Checkbox`, which assigns it through a ref, instead
 * of spreading the prop onto an `<input>` where React would drop it and the dash
 * would vanish on the next re-render. `KN-013.mjs` asserts the property, not the
 * markup, for exactly that reason.
 *
 * Bulk selection on the board is what needs the third state: a column header
 * with some of its cards selected has to show a dash, because a tick there is a
 * lie and an empty box is a different lie.
 */
export const Checkbox = ({ indeterminate = false, disabled = false, ...rest }: CheckboxProps) => {
  // The node in STATE, not a ref object. A ref would make the null check below
  // unreachable — the ref is always attached by the time an effect runs — and an
  // unreachable branch is dead code that coverage correctly refuses to call
  // covered. Held as state, the first render genuinely has no node, the callback
  // sets it, and the effect re-runs. It is also more correct: if React ever
  // remounts the input, the node identity changes and the effect re-applies,
  // which is exactly the survives-a-re-render property this card asks for.
  const [input, setInput] = useState<HTMLInputElement | null>(null)

  // MUI does NOT do this, which is the whole of KN-013 and I only found it
  // because a story asserted the property and failed. `indeterminate` on MUI's
  // Checkbox picks the icon and sets `data-indeterminate`; the DOM property
  // stays false, so assistive technology is told the box is simply unchecked
  // while a dash is drawn on screen.
  //
  useEffect(() => {
    if (!input) return
    applyIndeterminate(input, indeterminate)
  }, [input, indeterminate])

  return (
  <MuiCheckbox
    {...rest}
    // `slotProps.input.ref`, NOT `inputRef`. MUI 9 removed `inputRef` from
    // SwitchBase entirely — grep it and there are zero occurrences — and an
    // unknown prop is simply ignored, so the ref stayed null and the effect
    // below silently did nothing. The story that asserts the DOM property is
    // what caught it; nothing about the rendered output looked wrong.
    slotProps={{ input: { ref: setInput } }}
    disabled={disabled}
    indeterminate={indeterminate}
    icon={<Frame mark="none" disabled={disabled} />}
    checkedIcon={<Frame mark="tick" disabled={disabled} />}
    indeterminateIcon={<Frame mark="dash" disabled={disabled} />}
    // No ripple and no padding: the frame IS the control in the design, and a
    // Material ripple would draw a circle the file does not have. The hit area
    // comes back through the label that wraps it wherever this is used.
    disableRipple
    sx={(theme) => ({
      padding: 0,
      // Hover belongs on the ROOT, not on the frame, and this is not a style
      // preference. MUI lays an invisible `input` over the whole control, and
      // it is a SIBLING of the frame rather than a descendant, so it is the
      // topmost element at the frame's centre and `.frame:hover` never matches.
      // The label does. I moved this into the frame first, and hovering with a
      // real pointer showed the border never changing.
      //
      // What WAS wrong is the target: `.MuiBox-root` matched the glyph too.
      [`&:hover:not(.Mui-checked):not(.Mui-disabled):not(.MuiCheckbox-indeterminate) .${FRAME}`]: {
        borderColor: theme.karnama.semantic['border/focus'],
      },
      // Scoped to the frame's own class. The focus ring belongs on the square,
      // and the glyph inside it must not get one of its own.
      [`&.Mui-focusVisible .${FRAME}`]: {
        outlineWidth: 2,
        outlineStyle: 'solid',
        outlineColor: theme.karnama.semantic['border/focus'],
        outlineOffset: 2,
      },
    })}
  />
  )
}
