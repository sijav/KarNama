import { useLingui } from '@lingui/react'
import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { useRef, useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18n } from '../../i18n'
import { formatCount } from '../../i18n/formatCount'
import { spacing } from '../../theme/tokens'
import { IconButton } from '../icon-button'
import type { StoryMeta } from '../story-docs/story-meta'
import { StatusMenu, type StatusMenuProps } from './StatusMenu'

// The column header's three dots, 259:2, and the menu that hangs from them.
const WithTrigger = ({ onClose, ...args }: StatusMenuProps) => {
  const { i18n } = useLingui()
  const trigger = useRef<HTMLElement>(null)
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', paddingInline: `${spacing.lg}px` }}>
      <Box ref={trigger} sx={{ display: 'inline-flex' }}>
        <IconButton
          icon="more"
          aria-label={i18n._('Status actions')}
          onClick={() => {
            setAnchor(trigger.current)
          }}
        />
        <StatusMenu
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
  title: 'Shared/StatusMenu',
  component: StatusMenu,
  args: { anchorEl: null, colour: 'applied', jobCount: 0, onClose: fn(), onRename: fn(), onColourChange: fn(), onDelete: fn() },
  argTypes: { jobCount: { control: { type: 'number', min: 0, step: 1 } } },
  parameters: { controls: { include: ['colour', 'jobCount'] } },
  render: (args) => <WithTrigger {...args} />,
} satisfies StoryMeta<typeof StatusMenu>

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
    // Exactly three: rename, change colour and delete, the last after the
    // divider. Rename closes the menu, gives focus back and hands over.
    const trigger = within(canvasElement).getByRole('button')
    const menu = await open(canvasElement)
    await expect(itemsOf(menu).map((item) => item.textContent)).toEqual([
      i18n._('Rename'),
      i18n._('Change colour'),
      i18n._('Delete status'),
    ])
    const [rename] = itemsOf(menu)
    if (!rename) throw new Error('no rename')
    await userEvent.click(rename)
    await expect(args.onRename).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('menu')).toBeNull())
    await expect(trigger).toHaveFocus()
  },
}

export const DeleteBlocked: Story = {
  args: { jobCount: 3 },
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // 259:295: a column that holds three job opportunities cannot be deleted,
    // and the item says why beside itself, to the keyboard as to the pointer.
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    const menu = await within(canvasElement.ownerDocument.body).findByRole('menu')
    const remove = itemsOf(menu).at(-1)
    if (!remove) throw new Error('no delete')
    await expect(remove).toHaveAttribute('aria-disabled', 'true')
    await userEvent.keyboard('{End}')
    await waitFor(() => expect(remove).toHaveFocus())
    const tip = await within(canvasElement.ownerDocument.body).findByRole('tooltip')
    await expect(tip).toHaveTextContent(`${i18n._('This status has')} ${formatCount('fa-IR', args.jobCount)}`)
    await userEvent.keyboard('{Enter}')
    await expect(args.onDelete).not.toHaveBeenCalled()
    await userEvent.keyboard('{Escape}')
  },
}

export const ChangeColour: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // 259:184: Change colour replaces the menu with the Color Picker in the
    // same place; choosing a colour hands it over, closes, and gives focus back.
    const body = within(canvasElement.ownerDocument.body)
    const trigger = within(canvasElement).getByRole('button')
    const menu = await open(canvasElement)
    const menuBox = menu.getBoundingClientRect()
    const colour = itemsOf(menu)[1]
    if (!colour) throw new Error('no change colour')
    await userEvent.click(colour)
    const picker = await body.findByRole('radiogroup')
    await waitFor(() => expect(body.queryByRole('menu')).toBeNull())
    // The picker's panel, the radio group's parent, where the menu was.
    const panel = picker.parentElement
    if (!panel) throw new Error('the swatches have no panel')
    await expect(Math.abs(panel.getBoundingClientRect().top - menuBox.top)).toBeLessThanOrEqual(1)
    const [first] = within(picker).getAllByRole('radio')
    if (!first) throw new Error('no swatch')
    await userEvent.click(first)
    await expect(args.onColourChange).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(body.queryByRole('radiogroup')).toBeNull())
    await expect(trigger).toHaveFocus()
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US' },
  play: async ({ canvasElement }) => {
    const menu = await open(canvasElement)
    await expect(itemsOf(menu).map((item) => item.textContent)).toEqual([
      i18n._('Rename'),
      i18n._('Change colour'),
      i18n._('Delete status'),
    ])
    await userEvent.keyboard('{Escape}')
  },
}
