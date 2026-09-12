import { useLingui } from '@lingui/react'
import { useEffect, useRef, useState } from 'react'
import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, spyOn, userEvent, waitFor, within } from 'storybook/test'
import { semantic, spacing, status } from '../../theme/tokens'
import { ICON_NAMES } from '../icon'
import { fixtures } from '../story-fixtures'
import type { StoryMeta } from '../story-docs/story-meta'
import { Tooltip } from '../tooltip'
import { IconButton, type IconButtonSwitch } from './IconButton'

// The button's name is copy, drawn in the reader's language inside the render,
// so its arg is a placeholder no control shows; the icon, the tone and the
// disabled state are the controls.
const Named = (args: IconButtonSwitch) => {
  const { i18n } = useLingui()
  return <IconButton {...args} aria-label={i18n._('Delete status')} />
}

const meta = {
  title: 'Shared/IconButton',
  component: IconButton,
  args: { icon: 'trash', 'aria-label': '', tone: 'neutral', iconSize: 'sm', disabled: false, onClick: fn() },
  argTypes: {
    icon: { control: 'select', options: ICON_NAMES },
    tone: { control: 'radio', options: ['neutral', 'danger'] },
    iconSize: { control: 'radio', options: ['sm', 'md'] },
    disabled: { control: 'boolean' },
  },
  parameters: { controls: { include: ['icon', 'tone', 'iconSize', 'disabled'] } },
  render: (args) => <Named {...args} />,
} satisfies StoryMeta<IconButtonSwitch>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A token's colour as the browser computes it, borrowed on the host's own
// inline style and put back in the same tick.
const computedColour = (host: HTMLElement, colour: string) => {
  const previous = host.style.color
  host.style.color = colour
  const value = getComputedStyle(host).color
  host.style.color = previous
  return value
}

// What node 460:672 draws at rest: a 32 square of radius md, no fill, and the
// 16 icon in text/secondary, or the Bulk Action Bar's 20, 401:436.
const atRest = async (button: HTMLElement, iconSize: IconButtonSwitch['iconSize'] = 'sm') => {
  const style = getComputedStyle(button)
  const box = button.getBoundingClientRect()
  await expect([box.width, box.height]).toEqual([32, 32])
  await expect(px(style.borderTopLeftRadius)).toBe(8)
  await expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')
  await expect(style.color).toBe(computedColour(button, semantic['text/secondary']))
  const icon = button.querySelector('svg')?.getBoundingClientRect()
  const side = iconSize === 'md' ? 20 : 16
  await expect([icon?.width, icon?.height]).toEqual([side, side])
}

export const Default: Story = {
  globals: { colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Named, since an icon alone says nothing to a screen reader.
    const button = within(canvasElement).getByRole('button')
    await expect(button.getAttribute('aria-label')?.length).toBeGreaterThan(0)
    await atRest(button, args.iconSize)
  },
}

export const Danger: Story = {
  args: { tone: 'danger' },
  globals: { colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // At rest the danger tone looks as the neutral one does; it shows only on
    // hover, node 460:667.
    await atRest(within(canvasElement).getByRole('button'), args.iconSize)
  },
}

export const Hover: Story = {
  globals: { colorScheme: 'light' },
  // Both tones side by side, so the tone is not a control here.
  parameters: { controls: { include: ['icon'] } },
  render: (args) => (
    <Box sx={{ display: 'flex', gap: `${spacing.md}px` }}>
      <Named {...args} tone="neutral" />
      <Named {...args} tone="danger" />
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const [neutral, danger] = within(canvasElement).getAllByRole('button')
    if (!neutral || !danger) throw new Error('fewer than two buttons')
    // A real pointer, since :hover is the browser's hit-testing; in the
    // published Storybook there is none to move, so hover a button yourself.
    // The runner is known by the flag .storybook/vitest.setup.ts sets, KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) {
      if ('__STORYBOOK_PREVIEW__' in globalThis) return
      throw new Error('Hover is running outside Storybook without the story-test flag that .storybook/vitest.setup.ts sets')
    }
    const browser = await import('vitest/browser')
    // The colours wanted, worked out BEFORE waiting: computedColour borrows the
    // element's inline style, and waitFor reruns on every change to the DOM,
    // so called inside it, each check set off the next, for ever.
    const [neutralFill, dangerFill] = [
      computedColour(neutral, semantic['bg/surface-secondary']),
      computedColour(danger, status.rejected.container),
    ]
    // Neutral, 460:663: the secondary surface and the primary text. MUI eases
    // the fill in over 150 ms, so the end of it is waited for.
    await browser.userEvent.hover(neutral)
    await waitFor(() => expect(getComputedStyle(neutral).backgroundColor).toBe(neutralFill))
    await expect(getComputedStyle(neutral).color).toBe(computedColour(neutral, semantic['text/primary']))
    // Danger, 460:671: the rejected container and the error text.
    await browser.userEvent.hover(danger)
    await waitFor(() => expect(getComputedStyle(danger).backgroundColor).toBe(dangerFill))
    await expect(getComputedStyle(danger).color).toBe(computedColour(danger, semantic['text/error']))
  },
}

export const Disabled: Story = {
  globals: { colorScheme: 'light' },
  parameters: { controls: { include: ['icon'] } },
  render: (args) => (
    <Box sx={{ display: 'flex', gap: `${spacing.md}px` }}>
      <Named {...args} tone="neutral" disabled />
      <Named {...args} tone="danger" disabled />
    </Box>
  ),
  play: async ({ canvasElement }) => {
    // 512:742 and 512:745: both tones at 0.7, the icon in text/disabled, and
    // out of the tab order.
    for (const button of within(canvasElement).getAllByRole('button')) {
      await expect(button).toBeDisabled()
      await expect(Number(getComputedStyle(button).opacity)).toBe(0.7)
      await expect(getComputedStyle(button).color).toBe(computedColour(button, semantic['text/disabled']))
    }
    await userEvent.tab()
    await expect(canvasElement.ownerDocument.activeElement?.tagName).not.toBe('BUTTON')
  },
}

export const KeyboardOnly: Story = {
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button')
    // Reached by Tab, pressed by Enter and by Space, with no pointer.
    await userEvent.tab()
    await expect(button).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    await expect(args.onClick).toHaveBeenCalledTimes(2)
    // The ring, three pixels inside the button, in border/focus.
    await expect(button).toHaveClass('Mui-focusVisible')
    const ring = getComputedStyle(button, '::after')
    await expect([ring.borderTopStyle, px(ring.borderTopWidth), px(ring.top)]).toEqual(['solid', 3, 1])
  },
}

export const BlankName: Story = {
  // A blank name is refused rather than rendered nameless, KN-311: that button
  // is left out and reported in the console, and the named one beside it
  // renders, so the mistake stays at the button instead of taking the screen
  // down. The console is watched from before the render, since the report comes
  // as the button mounts. A fixed pair, so no control applies.
  parameters: { controls: { disable: true } },
  beforeEach: () => {
    const report = spyOn(console, 'error')
    return () => {
      report.mockRestore()
    }
  },
  render: (args) => (
    <Box data-testid="row" sx={{ display: 'flex', gap: `${spacing.xs}px` }}>
      <IconButton {...args} aria-label="   " />
      <Named {...args} />
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const row = within(canvasElement).getByTestId('row')
    await expect(within(row).getAllByRole('button')).toHaveLength(1)
    await expect(console.error).toHaveBeenCalledWith(expect.stringMatching(/aria-label is blank/u))
  },
}

// A button that explains itself, which is what an icon-only control most needs:
// the design explains the delete that is off while a column holds job
// opportunities, node 259:295. The name and the tip are both copy, so both are
// drawn in the reader's language inside the render.
const Explained = () => {
  const { i18n } = useLingui()
  return (
    <Tooltip title={i18n._('This status has')} placement="start">
      <IconButton icon="trash" tone="danger" aria-label={i18n._('Delete status')} />
    </Tooltip>
  )
}

export const InATooltip: Story = {
  parameters: { controls: { disable: true } },
  globals: { locale: 'fa-IR' },
  render: () => <Explained />,
  play: async ({ canvasElement }) => {
    // KN-310: the button used to declare only its own props, so the ref and the
    // aria-describedby the Tooltip clones onto its child were dropped and the
    // tip could never open. A console.error from either component is a failure
    // of this story as much as a missing tip is.
    const said: string[] = []
    const watching = spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      said.push(String(args[0]))
    })
    try {
      const button = within(canvasElement).getByRole('button', { name: 'حذف وضعیت' })

      // Described from the first render, before anything is opened, KN-231: a
      // screen reader on the focused button hears the tip's text, and the
      // button keeps its OWN name rather than being renamed by the tip.
      const describes = button.getAttribute('aria-describedby') ?? ''
      await expect(describes).not.toBe('')
      const description = describes
        .split(' ')
        .map((id) => canvasElement.ownerDocument.getElementById(id)?.textContent ?? '')
        .join(' ')
      await expect(description).toContain('این وضعیت')

      // It opens on hover, and on focus alone, which is the clause a
      // hover-only tip fails.
      await userEvent.hover(button)
      const tip = await within(canvasElement.ownerDocument.body).findByRole('tooltip')
      await expect(tip).toHaveTextContent('این وضعیت')
      await userEvent.unhover(button)
      await waitFor(async () => {
        await expect(within(canvasElement.ownerDocument.body).queryByRole('tooltip')).toBeNull()
      })
      await userEvent.tab()
      await expect(button).toHaveFocus()
      await expect(await within(canvasElement.ownerDocument.body).findByRole('tooltip')).toHaveTextContent('این وضعیت')

      await expect(said).toEqual([])
    } finally {
      watching.mockRestore()
    }
  },
}

// Whose address it is: record data, from the fixtures, never written here.
const WRITES_TO = fixtures('fa-IR').contacts[0]?.email ?? ''

// A button that hands its element back, and a link that hands back its own.
// Both refs are typed for the element that shape renders, KN-447: a link IS an
// anchor, and a ref to it typed as a button is a cast waiting to be written.
// Ref OBJECTS rather than callbacks, which is what a caller holding an element
// writes, and which do not change between renders.
const Handed = () => {
  const { i18n } = useLingui()
  const button = useRef<HTMLButtonElement | null>(null)
  const link = useRef<HTMLAnchorElement | null>(null)
  const [tags, setTags] = useState('')
  useEffect(() => {
    setTags(`${button.current?.tagName ?? ''} ${link.current?.tagName ?? ''}`)
  }, [])
  return (
    <Box sx={{ display: 'flex', gap: `${spacing.md}px` }}>
      <IconButton icon="trash" aria-label={i18n._('Delete status')} ref={button} />
      <IconButton icon="mail" aria-label={i18n._('Send an email')} href={`mailto:${WRITES_TO}`} ref={link} />
      <span data-testid="tags">{tags}</span>
    </Box>
  )
}

export const HandsBackItsElement: Story = {
  parameters: { controls: { disable: true } },
  globals: { locale: 'fa-IR' },
  render: () => <Handed />,
  play: async ({ canvasElement }) => {
    // Each shape gives back the element it actually renders, which is what the
    // types now say: a BUTTON for the one that can be turned off, an A for the
    // one that goes somewhere.
    const canvas = within(canvasElement)
    await waitFor(async () => {
      await expect(canvas.getByTestId('tags')).toHaveTextContent('BUTTON A')
    })
    await expect(canvas.getByRole('link', { name: 'ارسال ایمیل' })).toHaveAttribute('href', `mailto:${WRITES_TO}`)
  },
}

// A link that explains itself: the contact card's mail control is an Icon
// Button with an href, KN-433, and an icon-only control that goes somewhere is
// exactly what a tooltip is for.
const ExplainedLink = () => {
  const { i18n } = useLingui()
  return (
    <Tooltip title={i18n._('Send an email')} placement="start">
      <IconButton icon="mail" aria-label={i18n._('Send an email')} href={`mailto:${WRITES_TO}`} />
    </Tooltip>
  )
}

export const ALinkInATooltip: Story = {
  // KN-453: InATooltip covers the button and HandsBackItsElement covers the
  // link with no tip, so the combination the product actually ships, a tip on
  // the card's mail control, was covered by neither. The console is watched
  // from BEFORE the render and calls through, as BlankName does: the Tooltip
  // reports a child that took no ref synchronously, in its ref callback, and
  // MUI reports one that took no props in a mount effect, so a spy installed
  // inside play sees neither.
  parameters: { controls: { disable: true } },
  globals: { locale: 'fa-IR' },
  beforeEach: () => {
    const report = spyOn(console, 'error')
    return () => {
      report.mockRestore()
    }
  },
  render: () => <ExplainedLink />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)
    // A LINK, with the address on it: the tip must not have turned it back into
    // a button or taken its href.
    const link = within(canvasElement).getByRole('link', { name: 'ارسال ایمیل' })
    await expect(link).toHaveAttribute('href', `mailto:${WRITES_TO}`)

    // Described from the first render, KN-231, and still NAMED by its own
    // label: describeChild means the tip describes the link rather than
    // renaming it, and on an icon-only control the name is all a screen reader
    // has.
    await expect(link).toHaveAccessibleName('ارسال ایمیل')
    const describes = link.getAttribute('aria-describedby') ?? ''
    await expect(describes).not.toBe('')
    const description = describes
      .split(' ')
      .map((id) => canvasElement.ownerDocument.getElementById(id)?.textContent ?? '')
      .join(' ')
    await expect(description).toContain('ارسال ایمیل')

    // It opens on hover, and on the keyboard alone, which is the half a
    // hover-only tip fails. Tab rather than focus(), because MUI opens the tip
    // only for a focus the browser calls visible.
    await userEvent.hover(link)
    await expect(await body.findByRole('tooltip')).toHaveTextContent('ارسال ایمیل')
    await userEvent.unhover(link)
    await waitFor(async () => {
      await expect(body.queryByRole('tooltip')).toBeNull()
    })
    await userEvent.tab()
    await expect(link).toHaveFocus()
    await expect(await body.findByRole('tooltip')).toHaveTextContent('ارسال ایمیل')

    // And neither component complained while any of that happened.
    await expect(console.error).not.toHaveBeenCalled()
  },
}
