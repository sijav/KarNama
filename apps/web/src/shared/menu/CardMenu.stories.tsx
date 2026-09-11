import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { useRef, useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18n } from '../../i18n'
import { spacing } from '../../theme/tokens'
import { IconButton } from '../icon-button'
import type { StoryMeta } from '../story-docs/story-meta'
import { CardMenu, type CardMenuProps } from './CardMenu'

// A card's three dots on a phone, and the menu that hangs from them. The story
// can leave the link's action out, for a posting with no link.
const WithTrigger = ({ onClose, withoutLink = false, ...args }: CardMenuProps & { withoutLink?: boolean }) => {
  const trigger = useRef<HTMLElement>(null)
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const { onOpenLink, ...rest } = args
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
        <CardMenu
          {...rest}
          {...(withoutLink || onOpenLink === undefined ? {} : { onOpenLink })}
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
  title: 'Shared/CardMenu',
  component: CardMenu,
  args: { anchorEl: null, onClose: fn(), onChangeStatus: fn(), onOpenLink: fn(), onDelete: fn() },
  parameters: { controls: { disable: true } },
  render: (args) => <WithTrigger {...args} />,
} satisfies StoryMeta<typeof CardMenu>

export default meta
type Story = StoryObj<typeof meta>

const open = async (canvasElement: HTMLElement) => {
  await userEvent.click(within(canvasElement).getByRole('button'))
  return within(canvasElement.ownerDocument.body).findByRole('menu')
}
const itemsOf = (menu: HTMLElement) =>
  [...menu.children].filter((item): item is HTMLLIElement => item instanceof HTMLLIElement && item.getAttribute('role') !== 'separator')

export const Default: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // Node 491:760: change status, open the posting's link, and delete after
    // the divider. Delete closes the menu and hands over, for the page to ask.
    const menu = await open(canvasElement)
    await expect(itemsOf(menu).map((item) => item.textContent)).toEqual([
      i18n._('Change status'),
      i18n._('Open the posting link'),
      i18n._('Delete job opportunity'),
    ])
    const remove = itemsOf(menu).at(-1)
    if (!remove) throw new Error('no delete')
    await userEvent.click(remove)
    await expect(args.onDelete).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('menu')).toBeNull())
  },
}

export const WithoutALink: Story = {
  globals: { locale: 'fa-IR' },
  render: (args) => <WithTrigger {...args} withoutLink />,
  play: async ({ canvasElement }) => {
    // A posting with no link has no link to open.
    const menu = await open(canvasElement)
    await expect(itemsOf(menu).map((item) => item.textContent)).toEqual([i18n._('Change status'), i18n._('Delete job opportunity')])
    await userEvent.keyboard('{Escape}')
  },
}
