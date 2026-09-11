import { setupI18n } from '@lingui/core'
import { useLingui } from '@lingui/react'
import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { useRef, useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import type { Locale } from '../../i18n'
import { messages as en } from '../../i18n/locales/en-US'
import { messages as fa } from '../../i18n/locales/fa-IR'
import { elevation, semantic, spacing } from '../../theme/tokens'
import { IconButton } from '../icon-button'
import type { StoryMeta } from '../story-docs/story-meta'
import { Menu, type MenuAction, type MenuProps } from './Menu'

// The Card menu's three actions with one disabled, 181:22's four states in one
// menu: Default, Disabled and Destructive, and Hover under the pointer. The
// copy is read from the catalog in the language a story pins, so the args hold
// what the canvas draws.
const specimen = (locale: Locale): Pick<MenuProps, 'label' | 'actions'> => {
  const i18n = setupI18n({ locale, messages: { [locale]: locale === 'fa-IR' ? fa : en } })
  const actions: MenuAction[] = [
    { id: 'status', label: i18n._('Change status'), onSelect: fn() },
    { id: 'link', label: i18n._('Open the posting link'), disabled: true, onSelect: fn() },
    { id: 'delete', label: i18n._('Delete job opportunity'), destructive: true, onSelect: fn() },
  ]
  return { label: i18n._('Job opportunity actions'), actions }
}
const FA = specimen('fa-IR')
const EN = specimen('en-US')

// The menu hangs from a trigger, the column header's three dots of 259:2; the
// story holds which element it is open from, and closing calls the args' own.
const WithTrigger = ({ onClose, ...args }: MenuProps) => {
  const { i18n } = useLingui()
  const trigger = useRef<HTMLElement>(null)
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', paddingInline: `${spacing.lg}px` }}>
      <Box ref={trigger} sx={{ display: 'inline-flex' }}>
        <IconButton
          icon="more"
          aria-label={i18n._('Job opportunity actions')}
          onClick={() => {
            setAnchor(trigger.current)
          }}
        />
        <Menu
          {...args}
          anchorEl={anchor}
          onClose={() => {
            setAnchor(null)
            onClose()
          }}
        />
      </Box>
    </Box>
  )
}

const meta = {
  title: 'Shared/Menu',
  component: Menu,
  args: { ...FA, anchorEl: null, onClose: fn() },
  parameters: { controls: { include: ['label'] } },
  render: (args) => <WithTrigger {...args} />,
} satisfies StoryMeta<typeof Menu>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A token's value as the browser computes it, borrowed on the host's own
// inline style and put back in the same tick. Never inside waitFor, KN-014.
const computed = (host: HTMLElement, property: 'color' | 'boxShadow', value: string) => {
  const previous = host.style[property]
  host.style[property] = value
  const result = getComputedStyle(host)[property]
  host.style[property] = previous
  return result
}

// Opens the menu from its trigger and returns it; MUI draws it in a portal.
const open = async (canvasElement: HTMLElement) => {
  await userEvent.click(within(canvasElement).getByRole('button'))
  return within(canvasElement.ownerDocument.body).findByRole('menu')
}
const itemsOf = (menu: HTMLElement) =>
  [...menu.children].filter((item): item is HTMLLIElement => item instanceof HTMLLIElement && item.getAttribute('role') !== 'separator')

export const ItemStates: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const menu = await open(canvasElement)
    const paper = menu.parentElement
    if (!paper) throw new Error('the menu has no panel')
    // Node 512:8350: 220 wide, radius md, 4 above and below the items,
    // Elevation/Card, and an edge of border/default inside.
    const style = getComputedStyle(paper)
    await expect([paper.getBoundingClientRect().width, px(style.borderTopLeftRadius), px(getComputedStyle(menu).paddingTop)]).toEqual([
      220, 8, 4,
    ])
    await expect(style.boxShadow).toBe(computed(paper, 'boxShadow', elevation.card))
    await expect([style.outlineStyle, px(style.outlineWidth), px(style.outlineOffset)]).toEqual(['solid', 1, -1])
    // Node 181:22: 40 tall, 14 on 22 at 400, in text/primary, text/disabled
    // and text/error.
    const items = itemsOf(menu)
    await expect(items.map((item) => item.textContent)).toEqual(args.actions.map((action) => action.label))
    for (const item of items) {
      const itemStyle = getComputedStyle(item)
      await expect([
        item.getBoundingClientRect().height,
        px(itemStyle.fontSize),
        px(itemStyle.lineHeight),
        Number(itemStyle.fontWeight),
      ]).toEqual([40, 14, 22, 400])
    }
    const [plain, disabled, destructive] = items
    if (!plain || !disabled || !destructive) throw new Error('three items expected')
    await expect(getComputedStyle(plain).color).toBe(computed(plain, 'color', semantic['text/primary']))
    await expect(disabled).toHaveAttribute('aria-disabled', 'true')
    await expect(getComputedStyle(disabled).color).toBe(computed(disabled, 'color', semantic['text/disabled']))
    await expect(getComputedStyle(destructive).color).toBe(computed(destructive, 'color', semantic['text/error']))
    // Not by its red alone: the destructive action is the last, after a
    // divider of one pixel in border/default with no room round it.
    const divider = destructive.previousElementSibling
    if (!(divider instanceof HTMLElement)) throw new Error('no divider before the destructive item')
    await expect(divider).toHaveAttribute('role', 'separator')
    await expect([
      Math.round(divider.getBoundingClientRect().height),
      Math.round(destructive.getBoundingClientRect().top - disabled.getBoundingClientRect().bottom),
    ]).toEqual([1, 1])
    // Choosing a disabled action does nothing.
    await userEvent.click(disabled)
    await expect(args.actions[1]?.onSelect).not.toHaveBeenCalled()
    // Hover, 181:13, bg/surface-secondary: the browser's own pointer, which
    // only the runner has, KN-225.
    if ('__KARNAMA_STORY_TEST__' in globalThis) {
      const browser = await import('vitest/browser')
      const hover = computed(plain, 'color', semantic['bg/surface-secondary'])
      await browser.userEvent.hover(plain)
      await waitFor(() => expect(getComputedStyle(plain).backgroundColor).toBe(hover))
    }
    await userEvent.click(plain)
    await expect(args.actions[0]?.onSelect).toHaveBeenCalledTimes(1)
    await userEvent.keyboard('{Escape}')
  },
}

export const ClosesAndGivesFocusBack: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // Escape closes it, and so does a press outside; each time focus is back
    // on the trigger it opened from.
    const trigger = within(canvasElement).getByRole('button')
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    const menu = await body.findByRole('menu')
    await waitFor(() => expect(menu.contains(canvasElement.ownerDocument.activeElement)).toBe(true))
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(body.queryByRole('menu')).toBeNull())
    await expect(trigger).toHaveFocus()
    await userEvent.click(trigger)
    // The press outside lands on MUI's invisible backdrop, which fills the page:
    // the first child of the modal round the menu's panel.
    const backdrop = (await body.findByRole('menu')).parentElement?.parentElement?.firstElementChild
    if (!(backdrop instanceof HTMLElement) || backdrop.getAttribute('aria-hidden') !== 'true')
      throw new Error('the menu has no backdrop to press')
    await userEvent.click(backdrop)
    await waitFor(() => expect(body.queryByRole('menu')).toBeNull())
    await expect(trigger).toHaveFocus()
    await expect(args.onClose).toHaveBeenCalledTimes(2)
  },
}

export const InEnglish: Story = {
  args: EN,
  globals: { locale: 'en-US' },
  play: async ({ canvasElement }) => {
    // Left to right it hangs from the trigger's right edge, its inline end.
    const trigger = within(canvasElement).getByRole('button')
    const menu = await open(canvasElement)
    await expect(Math.round(menu.getBoundingClientRect().right)).toBe(Math.round(trigger.getBoundingClientRect().right))
    await userEvent.keyboard('{Escape}')
  },
}
