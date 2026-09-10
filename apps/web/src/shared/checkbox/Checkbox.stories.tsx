import type { StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import type { StoryMeta } from '../story-docs/story-meta'
import { Checkbox } from './Checkbox'

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
