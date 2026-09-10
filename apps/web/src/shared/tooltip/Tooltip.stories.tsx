import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import type { StoryMeta } from '../story-docs/story-meta'
import { Tooltip } from './Tooltip'

/**
 * A stand-in for the real thing. KN-008 builds the icon set; until it lands, a
 * story that needs the drawn adornment draws it rather than blocking on it.
 */
const InfoMark = (
  <Box component="svg" viewBox="0 0 16 16" sx={{ width: 16, height: 16, fill: 'currentColor' }}>
    <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3a1 1 0 110 2 1 1 0 010-2zm1 8H7V7h2v5z" />
  </Box>
)

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
