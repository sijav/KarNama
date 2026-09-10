import { Checkbox as MuiCheckbox, Box } from '@mui/material'
import { useEffect, useState, type ChangeEvent } from 'react'
import { iconSize } from '../../theme/tokens'

// Declared rather than extended from MUI's CheckboxProps, which would hand a
// caller `component`, `slots` and `slotProps`: the power to replace how it
// renders. The props are documented in story-docs, not here, KN-207.
export interface CheckboxProps {
  checked?: boolean
  defaultChecked?: boolean
  indeterminate?: boolean
  disabled?: boolean
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void
  name?: string
  value?: string
  'aria-label'?: string
  'aria-labelledby'?: string
}

// At module scope and taking the node as an argument, because assigning to a
// node held in useState reads to the React lint rule as mutating state. This
// is the browser's API, not React's.
const applyIndeterminate = (node: HTMLInputElement, value: boolean) => {
  node.indeterminate = value
}

// The frame's own class, so no rule selects by a MUI class: `.MuiBox-root` is
// on the tick's svg too, and a focus ring was drawn around both. KN-205.
const FRAME = 'KarnamaCheckbox-frame'

// The frame's edge, 1.5 in all five variants of 204:11, inside the frame and
// out of layout. No Figma variable binds a stroke weight, so it is a
// component constant, like the Tooltip's width, KN-281.
const EDGE = 1.5

// The three marks the 20 by 20 square draws, before hover and disabled.
type Mark = 'none' | 'tick' | 'dash'

// The square, node 204:11, every value from the tokens. The tick and the dash
// are inline SVG because Material's own glyph is a different shape and size.
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
        position: 'relative',
        // Disabled reads as absent rather than off: the edge disappears into
        // the secondary surface.
        backgroundColor: disabled ? colour['bg/surface-secondary'] : filled ? colour['bg/brand/default'] : colour['bg/surface'],
        // The edge as an inset shadow, not a border: the file draws it at 1.5,
        // and Chromium floors a border's width to whole CSS pixels, so a 1.5
        // border draws 1 at every device pixel ratio, measured. A shadow draws
        // the 1.5, inside the frame and out of layout, KN-281.
        boxShadow: `inset 0 0 0 ${EDGE}px ${disabled ? colour['bg/surface-secondary'] : filled ? colour['bg/brand/default'] : colour['border/default']}`,
        // Forced colours remove a shadow and keep a border, so there the edge is
        // a one pixel border in the system's colour for a control's edge, on a
        // pseudo-element laid over the frame so it takes none of its space and
        // the content box stays 20 by 20, KN-284. Disabled takes GrayText, the
        // system's colour for disabled content, so it does not read as enabled;
        // the keyword is kept in a property so a check can read which was chosen
        // whatever the palette resolves it to, KN-288.
        '@media (forced-colors: active)': {
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            boxSizing: 'border-box',
            borderRadius: 'inherit',
            borderStyle: 'solid',
            borderWidth: 1,
            '--karnama-forced-edge': disabled ? 'GrayText' : 'ButtonBorder',
            borderColor: 'var(--karnama-forced-edge)',
            pointerEvents: 'none',
          },
        },
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

// Composes MUI's Checkbox because indeterminate is a DOM PROPERTY, assigned to
// the input through its ref; spread onto an <input>, React would drop it.
export const Checkbox = ({ indeterminate = false, disabled = false, ...rest }: CheckboxProps) => {
  // The node in state, not a ref object: the first render genuinely has no
  // node, the callback sets it, and the effect re-runs, including when React
  // remounts the input. A ref would make the null check below unreachable.
  const [input, setInput] = useState<HTMLInputElement | null>(null)

  // MUI does NOT set the property: its `indeterminate` picks the icon and writes
  // `data-indeterminate`, so assistive technology would hear "unchecked" while
  // a dash is drawn. KN-013.
  useEffect(() => {
    if (!input) return
    applyIndeterminate(input, indeterminate)
  }, [input, indeterminate])

  return (
  <MuiCheckbox
    {...rest}
    // `slotProps.input.ref`, not `inputRef`: MUI 9 removed `inputRef` from
    // SwitchBase, and an unknown prop is silently ignored.
    slotProps={{ input: { ref: setInput } }}
    disabled={disabled}
    indeterminate={indeterminate}
    icon={<Frame mark="none" disabled={disabled} />}
    checkedIcon={<Frame mark="tick" disabled={disabled} />}
    indeterminateIcon={<Frame mark="dash" disabled={disabled} />}
    // No ripple and no padding: the frame is the control, and a ripple draws a
    // circle the design does not have.
    disableRipple
    sx={(theme) => ({
      padding: 0,
      // On the ROOT, not the frame: MUI's invisible input is the frame's
      // sibling and sits on top of it, so `.frame:hover` never matches.
      [`&:hover:not(.Mui-checked):not(.Mui-disabled):not(.MuiCheckbox-indeterminate) .${FRAME}`]: {
        boxShadow: `inset 0 0 0 ${EDGE}px ${theme.karnama.semantic['border/focus']}`,
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
