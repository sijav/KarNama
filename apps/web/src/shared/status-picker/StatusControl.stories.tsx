import { setupI18n } from '@lingui/core'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import type { Locale } from '../../i18n'
import { messages as fa } from '../../i18n/locales/fa-IR'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { StatusControl } from './StatusControl'
import type { StatusOption } from './StatusPicker'

import type { StatusToken } from '../../theme/tokens'

// The status the story opens on.
const INTERVIEW: StatusToken = 'interview'

// The Persian catalog, for the names the pinned Persian stories find.
const i18n = setupI18n({ locale: 'fa-IR', messages: { 'fa-IR': fa } })

// The board's five statuses, their names in the language a story pins.
const statusesIn = (locale: Locale): StatusOption[] =>
  fixtures(locale).statuses.map((status) => ({ id: status.token, token: status.token, name: status.name }))

const meta = {
  title: 'Shared/StatusControl',
  component: StatusControl,
  args: { statuses: statusesIn('fa-IR'), value: INTERVIEW, onChange: fn(), onAdd: fn() },
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

// The dialog the control opens: the Change Status modal, named by its title,
// 150:93, KN-337.
const changeStatus = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body).findByRole('dialog', { name: i18n._('Change status') })

export const ChoosingAStatus: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // The control opens the Change Status modal and shows Pressed, 199:20,
    // while it is open: the hover fill and one and a half of border/focus. A
    // status chosen there waits until Confirm, which hands it over and closes
    // the modal, and focus is back on the control.
    const control = within(canvasElement).getByRole('button')
    await userEvent.click(control)
    const dialog = await changeStatus(canvasElement)
    await expect(control).toHaveAttribute('aria-expanded', 'true')
    await expect(getComputedStyle(control).backgroundColor).toBe(computedColour(control, semantic['bg/surface-secondary']))
    await expect(getComputedStyle(control).boxShadow.endsWith('inset')).toBe(true)
    const other = within(dialog)
      .getAllByRole('radio')
      .find((radio) => radio.getAttribute('value') !== args.value)
    if (!other) throw new Error('no other status')
    await userEvent.click(other)
    await expect(args.onChange).not.toHaveBeenCalled()
    await userEvent.click(within(dialog).getByRole('button', { name: i18n._('Confirm') }))
    await expect(args.onChange).toHaveBeenCalledWith(other.getAttribute('value'))
    await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('dialog')).toBeNull())
    await expect(control).toHaveFocus()
  },
}

export const OpensOnTheChosenStatus: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // The control says it opens a dialog and does: Enter on it opens the
    // Change Status modal, a named dialog, with focus on the status the job
    // has, so the arrows move from there, KN-337.
    const control = within(canvasElement).getByRole('button')
    await expect(control).toHaveAttribute('aria-haspopup', 'dialog')
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    const dialog = await changeStatus(canvasElement)
    const chosen = within(dialog).getByRole('radio', { checked: true })
    await expect(chosen).toHaveAttribute('value', args.value)
    await waitFor(() => expect(chosen).toHaveFocus())
  },
}

export const EscapeCancels: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // Escape closes the modal with nothing changed, focus back on the control.
    const control = within(canvasElement).getByRole('button')
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    await changeStatus(canvasElement)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('dialog')).toBeNull())
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
