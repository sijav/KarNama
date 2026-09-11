import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import type { Locale } from '../../i18n'
import { i18n } from '../../i18n'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { StatusPicker, type StatusOption } from './StatusPicker'

// The board's five statuses, their names in the language a story pins, as the
// user named them: data, not copy.
const statusesIn = (locale: Locale): StatusOption[] =>
  fixtures(locale).statuses.map((status) => ({ id: status.token, token: status.token, name: status.name }))

const FA = statusesIn('fa-IR')

const meta = {
  title: 'Shared/StatusPicker',
  component: StatusPicker,
  // The second status chosen, so both neighbours of the chosen one exist.
  args: { statuses: FA, value: FA[1]?.id ?? '', onChange: fn(), onAdd: fn() },
  parameters: { controls: { include: ['value'] } },
} satisfies StoryMeta<typeof StatusPicker>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A token's colour as the browser computes it, borrowed on the host's own
// inline style and put back in the same tick. Never inside waitFor, KN-014.
const computedColour = (host: HTMLElement, colour: string) => {
  const previous = host.style.color
  host.style.color = colour
  const value = getComputedStyle(host).color
  host.style.color = previous
  return value
}

// Each choice's shell is the radio input's next sibling, MUI's icon slot.
const shellOf = (radio: HTMLElement) => {
  const shell = radio.nextElementSibling
  if (!(shell instanceof HTMLElement)) throw new Error('the radio has no choice beside it')
  return shell
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Node 427:592: «وضعیت» at 12 on 16 in text/secondary, 8 above a row of
    // choices, 427:567, each the medium chip in a shell of 4, the chosen one
    // ringed two pixels of border/focus, and the dashed add chip, 28 tall.
    const group = within(canvasElement).getByRole('radiogroup')
    const label = canvasElement.ownerDocument.getElementById(group.getAttribute('aria-labelledby') ?? '')
    if (!label) throw new Error('the group has no label')
    await expect([label.textContent, px(getComputedStyle(label).fontSize), px(getComputedStyle(label).lineHeight)]).toEqual([
      i18n._('Status'),
      12,
      16,
    ])
    await expect(getComputedStyle(label).color).toBe(computedColour(label, semantic['text/secondary']))
    await expect(Math.round(group.getBoundingClientRect().top - label.getBoundingClientRect().bottom)).toBe(8)
    const radios = within(group).getAllByRole('radio')
    await expect(radios.map((radio) => radio.getAttribute('aria-label'))).toEqual(args.statuses.map((status) => status.name))
    for (const radio of radios) {
      const shell = shellOf(radio)
      const ring = getComputedStyle(shell, '::after')
      await expect(shell.getBoundingClientRect().height).toBe(36)
      const chosen = radio instanceof HTMLInputElement && radio.checked
      await expect([px(ring.borderTopWidth), ring.borderTopColor]).toEqual([
        2,
        chosen ? computedColour(shell, semantic['border/focus']) : 'rgba(0, 0, 0, 0)',
      ])
    }
    const add = within(group).getByRole('button', { name: i18n._('New status') })
    await expect(add.getBoundingClientRect().height).toBe(28)
    await expect([getComputedStyle(add, '::before').borderTopStyle, getComputedStyle(add).color]).toEqual([
      'dashed',
      computedColour(add, semantic['text/brand']),
    ])
  },
}

export const ByKeyboard: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // One Tab stop for the choices, on the chosen one, the arrows moving and
    // choosing, three pixels of ring on the one with focus; then the add chip.
    const group = within(canvasElement).getByRole('radiogroup')
    const radios = within(group).getAllByRole('radio')
    await userEvent.tab()
    const chosen = radios.find((radio) => radio instanceof HTMLInputElement && radio.checked)
    await expect(chosen).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    const next = radios[radios.findIndex((radio) => radio === chosen) + 1]
    if (!next) throw new Error('no next status')
    await expect(next).toHaveFocus()
    await expect(args.onChange).toHaveBeenLastCalledWith(next.getAttribute('value'))
    await waitFor(() => expect(px(getComputedStyle(shellOf(next), '::after').borderTopWidth)).toBe(3))
    await userEvent.tab()
    await expect(within(group).getByRole('button', { name: i18n._('New status') })).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect(args.onAdd).toHaveBeenCalledTimes(1)
  },
}

export const Hover: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // Node 427:562: an unchosen choice under the pointer is ringed two pixels
    // of border/default; the browser's own pointer, which only the runner has.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const browser = await import('vitest/browser')
    const radios = within(canvasElement).getAllByRole('radio')
    const unchosen = radios.find((radio) => radio instanceof HTMLInputElement && !radio.checked)
    if (!unchosen) throw new Error('every status is chosen')
    const shell = shellOf(unchosen)
    const edge = computedColour(shell, semantic['border/default'])
    // The pointer goes to MUI's radio round the shell, which the invisible
    // input covers edge to edge.
    const root = unchosen.parentElement
    if (!root) throw new Error('the radio has no root')
    await browser.userEvent.hover(root)
    await waitFor(() => expect(getComputedStyle(shell, '::after').borderTopColor).toBe(edge))
  },
}

export const InEnglish: Story = {
  args: { statuses: statusesIn('en-US') },
  globals: { locale: 'en-US' },
  play: async ({ args, canvasElement }) => {
    const radios = within(canvasElement).getAllByRole('radio')
    await expect(radios.map((radio) => radio.getAttribute('aria-label'))).toEqual(args.statuses.map((status) => status.name))
  },
}
