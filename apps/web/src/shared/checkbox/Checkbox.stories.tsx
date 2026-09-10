import type { StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { Checkbox } from './Checkbox'

/**
 * A token's colour as the browser computes it, so it can be compared with a
 * computed style. The browser does the conversion rather than a hand-written
 * parser, so the two sides of the comparison are normalised the same way. The
 * host's own inline colour is borrowed and put back within the same tick, so
 * nothing is ever painted with it.
 */
const computedColour = (host: HTMLElement, colour: string) => {
  const previous = host.style.color
  host.style.color = colour
  const value = getComputedStyle(host).color
  host.style.color = previous
  return value
}

const meta = {
  title: 'Shared/Checkbox',
  component: Checkbox,
  args: { indeterminate: false, disabled: false },
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
  },
}

export const Checked: Story = {
  args: { checked: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('checkbox')).toBeChecked()

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
  },
}

export const Hover: Story = {
  // Pinned to light so the expected colour is one known token, not whichever
  // palette the toolbar happens to be on.
  globals: { colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('checkbox')
    const frame = canvasElement.querySelector<HTMLElement>('.KarnamaCheckbox-frame')
    if (!frame) throw new Error('the checkbox frame was not found')
    await expect(getComputedStyle(frame).borderTopColor).toBe(computedColour(canvasElement, semantic['border/default']))

    // A REAL pointer, not a dispatched event. `:hover` is the browser's own
    // hit-testing, and no synthetic mouseover sets it, so `storybook/test`'s
    // userEvent cannot reach this state at all. Under Vitest's browser mode,
    // `vitest/browser` is a virtual module that drives Playwright's actual
    // mouse.
    //
    // In the published Storybook there is no test runner to move a pointer, so
    // the story is a canvas: hover it yourself. The two are told apart BEFORE
    // importing, by `__vitest_browser__`, the flag Storybook's own vitest addon
    // checks. The first version caught any failed import instead, so a runner
    // that could not load its pointer passed this story on the unhovered
    // assertion alone, KN-220. Under Vitest the import now has to succeed.
    if (!('__vitest_browser__' in globalThis)) return
    const browser = await import('vitest/browser')
    // The INPUT, not the frame: MUI's invisible input sits on top of the square,
    // so it is what a pointer over the square actually touches, and hovering it
    // is what turns on the root's `:hover`.
    await browser.userEvent.hover(box)
    await expect(getComputedStyle(frame).borderTopColor).toBe(computedColour(canvasElement, semantic['border/focus']))
  },
}

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('checkbox')
    await expect(box).toBeDisabled()
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
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('checkbox')
    // Reachable by Tab and toggleable by Space, with no pointer anywhere in
    // this story. Bulk selection is the feature this exists for, and a
    // selection control that needs a mouse excludes the people most likely to
    // be selecting in bulk.
    await userEvent.tab()
    await expect(box).toHaveFocus()
    await userEvent.keyboard(' ')
    await expect(box).toBeChecked()
    await userEvent.keyboard(' ')
    await expect(box).not.toBeChecked()
  },
}
