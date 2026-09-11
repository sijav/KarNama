import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import type { Locale } from '../../i18n'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { StatusControl } from './StatusControl'
import type { StatusOption } from './StatusPicker'

// The board's five statuses, their names in the language a story pins.
const statusesIn = (locale: Locale): StatusOption[] =>
  fixtures(locale).statuses.map((status) => ({ id: status.token, token: status.token, name: status.name }))

const meta = {
  title: 'Shared/StatusControl',
  component: StatusControl,
  args: { statuses: statusesIn('fa-IR'), value: 'interview', onChange: fn(), onAdd: fn() },
  parameters: { controls: { include: ['value'] } },
} satisfies StoryMeta<typeof StatusControl>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A token's value as the browser computes it, borrowed on the host's own
// inline style and put back in the same tick. Never inside waitFor, KN-014.
const computedColour = (host: HTMLElement, colour: string) => {
  const previous = host.style.color
  host.style.color = colour
  const value = getComputedStyle(host).color
  host.style.color = previous
  return value
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // Node 199:10: a pill 32 tall, bg/surface with one pixel of
    // border/default, 4 round the small chip and 8 beyond the 14 caret. The
    // chip inside is still display only: no role, no tab stop of its own.
    const control = within(canvasElement).getByRole('button')
    const style = getComputedStyle(control)
    await expect([control.getBoundingClientRect().height, px(getComputedStyle(control, '::before').borderTopWidth)]).toEqual([32, 1])
    await expect(style.backgroundColor).toBe(computedColour(control, semantic['bg/surface']))
    await expect([style.paddingTop, style.paddingInlineStart, style.paddingInlineEnd].map(px)).toEqual([4, 4, 8])
    const [chip, caret] = [...control.children]
    if (!(chip instanceof HTMLElement) || !(caret instanceof HTMLElement)) throw new Error('the chip or the caret is missing')
    await expect([chip.getBoundingClientRect().height, caret.getBoundingClientRect().width]).toEqual([24, 14])
    await expect([chip.getAttribute('role'), chip.getAttribute('tabindex'), chip.querySelector('[tabindex], button, a')]).toEqual([
      null,
      null,
      null,
    ])
  },
}

export const ChoosingAStatus: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // The control opens the picker, pressed, 199:20, while it is open: the
    // hover fill and one and a half of border/focus. Choosing a status closes
    // it, hands the choice over, and focus is back on the control.
    const body = within(canvasElement.ownerDocument.body)
    const control = within(canvasElement).getByRole('button')
    await userEvent.click(control)
    const group = await body.findByRole('radiogroup')
    await expect(control).toHaveAttribute('aria-expanded', 'true')
    await expect(getComputedStyle(control).backgroundColor).toBe(computedColour(control, semantic['bg/surface-secondary']))
    await expect(getComputedStyle(control).boxShadow.endsWith('inset')).toBe(true)
    const other = within(group)
      .getAllByRole('radio')
      .find((radio) => radio.getAttribute('value') !== args.value)
    if (!other) throw new Error('no other status')
    await userEvent.click(other)
    await expect(args.onChange).toHaveBeenCalledWith(other.getAttribute('value'))
    await waitFor(() => expect(body.queryByRole('radiogroup')).toBeNull())
    await expect(control).toHaveFocus()
  },
}

export const EscapeCancels: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // Escape closes the picker with nothing changed, focus back on the control.
    const body = within(canvasElement.ownerDocument.body)
    const control = within(canvasElement).getByRole('button')
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    await body.findByRole('radiogroup')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(body.queryByRole('radiogroup')).toBeNull())
    await expect(args.onChange).not.toHaveBeenCalled()
    await expect(control).toHaveFocus()
  },
}

export const InEnglish: Story = {
  args: { statuses: statusesIn('en-US') },
  globals: { locale: 'en-US' },
  play: async ({ args, canvasElement }) => {
    const control = within(canvasElement).getByRole('button')
    await expect(control).toHaveTextContent(args.statuses.find((status) => status.id === args.value)?.name ?? 'missing')
  },
}
