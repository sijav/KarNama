import { expect, within } from 'storybook/test'
import type { semantic } from '../../theme/tokens'

// Storybook only: the Select's stories and the option Selects' use it, and
// nothing that ships imports it.

type Palette = Record<keyof typeof semantic, string>

// A colour as the browser computes it, borrowed on the host's own inline style
// and put back in the same tick. Never inside waitFor, KN-014.
const computed = (host: HTMLElement, value: string) => {
  const previous = host.style.color
  host.style.color = value
  const result = getComputedStyle(host).color
  host.style.color = previous
  return result
}

/**
 * The Selects' Hover and Filled Hover, which the original adds to 183:26,
 * 448:8051 and 448:8095, KN-794: under a real pointer the field's edge takes
 * text/secondary, whether it holds a value or not, and what it shows keeps its
 * colour, the value text/primary and the placeholder text/secondary. Only the
 * test runner's real pointer reaches the hovered assertions; in Storybook
 * itself the story is a canvas to hover by hand.
 */
export const hoverEdge = async (canvasElement: HTMLElement, palette: Palette, filled: boolean) => {
  const combobox = within(canvasElement).getByRole('combobox')
  const field = combobox.parentElement
  if (!field) throw new Error('the select has no field')
  await expect(getComputedStyle(field, '::before').borderTopColor).toBe(computed(field, palette['border/control']))
  if (!('__KARNAMA_STORY_TEST__' in globalThis)) {
    if (import.meta.env.MODE !== 'test') return
    throw new Error('a Select hover story is running outside Storybook without the story-test flag that .storybook/vitest.setup.ts sets')
  }
  const browser = await import('vitest/browser')
  await browser.userEvent.hover(combobox)
  await expect(getComputedStyle(field, '::before').borderTopColor).toBe(computed(field, palette['text/secondary']))
  const shown = filled ? combobox : combobox.firstElementChild
  if (!(shown instanceof HTMLElement)) throw new Error('the field shows nothing')
  const words: keyof Palette = filled ? 'text/primary' : 'text/secondary'
  await expect(getComputedStyle(shown).color).toBe(computed(shown, palette[words]))
}
