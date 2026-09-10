import { useLingui } from '@lingui/react'
import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import type { ComponentPropsWithRef } from 'react'
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test'
import { elevation } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { Tooltip, TOOLTIP_SURFACE } from './Tooltip'

// The open tip's DRAWN surface, by the class the component puts on it. It used
// to be the first child of the element carrying the role, which is MUI's popper,
// so the test measured whatever MUI placed first. KN-222.
const drawnSurface = () => {
  const surface = document.body.querySelector(`.${TOOLTIP_SURFACE}`)
  if (!(surface instanceof HTMLElement)) throw new Error('the tooltip has no drawn surface')
  return surface
}

// A shadow token as the browser computes it, so it can be compared with a
// computed box-shadow. Borrowed on the element's own inline style and put back
// in the same tick, so nothing is painted with it.
const computedShadow = (host: HTMLElement, shadow: string) => {
  const previous = host.style.boxShadow
  host.style.boxShadow = shadow
  const value = getComputedStyle(host).boxShadow
  host.style.boxShadow = previous
  return value
}

// A stand-in for the real thing. KN-008 builds the icon set; until it lands, a
// story that needs the drawn adornment draws it rather than blocking on it.
const InfoMark = (
  <Box component="svg" viewBox="0 0 16 16" sx={{ width: 16, height: 16, fill: 'currentColor' }}>
    <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3a1 1 0 110 2 1 1 0 010-2zm1 8H7V7h2v5z" />
  </Box>
)

// An ICON-ONLY trigger, the case this component exists for, named by its own
// aria-label from the catalog. It forwards its props and ref, as a tooltip
// child must: MUI clones it to attach the listeners and the description.
const DeleteStatusButton = (props: ComponentPropsWithRef<'button'>) => {
  const { i18n } = useLingui()
  return (
    <button type="button" {...props} aria-label={i18n._('Delete status')}>
      {InfoMark}
    </button>
  )
}

// The mistake KN-211 is about: a wrapper that drops everything MUI hands it,
// ref included, so the tip has nothing to attach to and can never open.
const SwallowingButton = () => {
  const { i18n } = useLingui()
  return (
    <button type="button" aria-label={i18n._('Delete status')}>
      {InfoMark}
    </button>
  )
}

const meta = {
  title: 'Shared/Tooltip',
  component: Tooltip,
  args: {
    title: 'این وضعیت ۳ فرصت شغلی داره؛ برای حذفش اول باید فرصت‌های شغلی رو ببری به ستون دیگه.',
    children: <button type="button">حذف وضعیت</button>,
  },
} satisfies StoryMeta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const OnHover: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button'))
    // Portalled, so it is found on the document rather than in the canvas.
    await waitFor(async () => {
      await expect(within(document.body).getByRole('tooltip')).toBeInTheDocument()
    })

    // KN-210. Node 410:469 is a FIXED 260 wide, read from its design context,
    // not from a screenshot. The number is the design's, written here rather
    // than imported from the component, so the component cannot move it and
    // take the test along.
    //
    // The LAYOUT width, offsetWidth, and not the bounding box. MUI's Grow enters
    // from scale(0.75), the bounding box includes transforms, and the first
    // version of this read 195, exactly 260 times 0.75, mid-animation.
    const surface = drawnSurface()
    await expect(surface.offsetWidth).toBe(260)

    // KN-218. The frame is py 8 and px 12, read from its design context. The
    // numbers are parsed rather than compared as pixel strings, which the
    // no-literals rule refuses outside src/theme.
    const style = getComputedStyle(surface)
    const padding = [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft].map(Number.parseFloat)
    await expect(padding).toEqual([8, 12, 8, 12])
    // And the frame's shadow, which is bound to no effect style. Both sides are
    // normalised by the browser, so the token's hex and the computed rgba agree.
    await expect(style.boxShadow).toBe(computedShadow(surface, elevation.tooltip))
  },
}

export const WithoutCssBaseline: Story = {
  // Every story renders inside AppProviders, and so under CssBaseline, whose
  // `*` rule makes every element INHERIT box-sizing. Border-box enters that
  // chain in two places: html, where the reset puts it, and body, where
  // Storybook's own preview CSS puts it for a padded story. The first version
  // undid only html, passed under Vitest, and failed in the production build,
  // where the preview's body rule was still handing the tip border-box. Both
  // are undone here, which is what a page with no reset looks like, and both
  // are put back when the story ends.
  beforeEach: () => {
    const html = document.documentElement
    const { body } = document
    const htmlBefore = html.style.boxSizing
    const bodyBefore = body.style.boxSizing
    html.style.boxSizing = 'content-box'
    body.style.boxSizing = 'content-box'
    return () => {
      html.style.boxSizing = htmlBefore
      body.style.boxSizing = bodyBefore
    }
  },
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button'))
    const popper = await within(document.body).findByRole('tooltip')
    // The precondition, checked rather than trusted: the tip's own container
    // is content-box, so nothing above it hands the tip border-box, and any
    // border-box the tip has is its own.
    await expect(getComputedStyle(popper)).toHaveProperty('boxSizing', 'content-box')
    // Still the frame's 260, padding included, because the tip sets its own
    // box-sizing. Without it this reads 284: 260 plus 12 at each side.
    await expect(drawnSurface().offsetWidth).toBe(260)
  },
}

export const KeepsTheTriggersName: Story = {
  args: { children: <DeleteStatusButton /> },
  // English, so the expected name is one known string.
  globals: { locale: 'en-US' },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button')
    await userEvent.tab()
    const tip = await within(document.body).findByRole('tooltip')
    // KN-209. While the tip is OPEN, the button is still called what it is,
    // by its own label: a labelling tooltip replaced that with the tip's text.
    await expect(button).toHaveAccessibleName('Delete status')
    // And the tip is reachable, as the button's description.
    await expect(button.getAttribute('aria-describedby')).toBe(tip.id)
    await expect(button).not.toHaveAttribute('aria-labelledby')
  },
}

export const ReportsATriggerThatCannotAttach: Story = {
  args: { children: <SwallowingButton /> },
  // The report is the point, so it is captured rather than printed: the
  // published Storybook shows the silent button, the console stays clean.
  beforeEach: () => {
    const spy = spyOn(console, 'error').mockImplementation(() => undefined)
    return () => {
      spy.mockRestore()
    }
  },
  play: async () => {
    // KN-211. A trigger the tip cannot attach to is REPORTED, not silently
    // left without a tip, which is all MUI does when the ref never arrives.
    await waitFor(async () => {
      await expect(console.error).toHaveBeenCalledWith(expect.stringContaining('did not take a ref'))
    })
  },
}

export const OnKeyboardFocus: Story = {
  play: async ({ canvasElement }) => {
    // The clause the card names, and the one a hover-only tooltip fails. Tab,
    // no pointer anywhere: a tip that only answers a mouse is invisible to
    // whoever most needs a label spelled out.
    await userEvent.tab()
    await expect(within(canvasElement).getByRole('button')).toHaveFocus()
    await waitFor(async () => {
      await expect(within(document.body).getByRole('tooltip')).toBeInTheDocument()
    })
  },
}

export const DoesNotTrapThePointer: Story = {
  play: async () => {
    await userEvent.tab()
    const tip = await within(document.body).findByRole('tooltip')
    // The tip sits over whatever it describes. One that accepts the pointer
    // swallows the click meant for the control underneath.
    await expect(getComputedStyle(tip)).toHaveProperty('pointerEvents', 'none')
  },
}

export const WithIcon: Story = {
  args: { icon: InfoMark },
  play: async () => {
    await userEvent.tab()
    const tip = await within(document.body).findByRole('tooltip')
    // Decorative: the text already says everything, so a screen reader reading
    // the mark as well would just be noise.
    await expect(tip.querySelector('[aria-hidden="true"] svg')).toBeInTheDocument()
  },
}

export const Dismissed: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button'))
    await within(document.body).findByRole('tooltip')
    await userEvent.keyboard('{Escape}')
    // Escape closes it. A tip you cannot dismiss is a tip covering the thing
    // you were trying to read.
    await waitFor(async () => {
      await expect(within(document.body).queryByRole('tooltip')).not.toBeInTheDocument()
    })
  },
}
