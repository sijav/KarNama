import { setupI18n } from '@lingui/core'
import { useLingui } from '@lingui/react'
import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import type { Locale } from '../../i18n'
import { messages as en } from '../../i18n/locales/en-US'
import { messages as fa } from '../../i18n/locales/fa-IR'
import { elevation, semantic } from '../../theme/tokens'
import { Button } from '../button'
import type { StoryMeta } from '../story-docs/story-meta'
import { Modal, type ModalProps } from './Modal'

// The file's Confirm specimen, node 150:92, its title from the catalog in the
// language a story pins, so the args hold what the canvas draws.
const titleIn = (locale: Locale) => {
  const i18n = setupI18n({ locale, messages: { [locale]: locale === 'fa-IR' ? fa : en } })
  return i18n._('Delete this job opportunity?')
}

// The shell opens from a trigger and holds the specimen's body and actions;
// the story holds whether it is open, and closing calls the args' own.
const WithTrigger = ({ onClose, ...args }: ModalProps) => {
  const { i18n } = useLingui()
  const [open, setOpen] = useState(false)
  const close = () => {
    setOpen(false)
    onClose()
  }
  return (
    <>
      <Button
        onClick={() => {
          setOpen(true)
        }}
      >
        {i18n._('Delete')}
      </Button>
      <Modal
        {...args}
        open={open}
        onClose={close}
        actions={
          <>
            <Button variant="ghost" onClick={close}>
              {i18n._('Cancel')}
            </Button>
            <Button variant="destructive" onClick={close}>
              {i18n._('Delete')}
            </Button>
          </>
        }
      >
        <Box component="p" sx={(theme) => ({ margin: 0, color: theme.karnama.semantic['text/secondary'] })}>
          {i18n._('This job opportunity is deleted for good and cannot be brought back.')}
        </Box>
      </Modal>
    </>
  )
}

const meta = {
  title: 'Shared/Modal',
  component: Modal,
  args: { open: false, title: titleIn('fa-IR'), width: 360, onClose: fn(), children: null, actions: null , onClosed: fn()},
  parameters: { controls: { include: ['title', 'width'] } },
  render: (args) => <WithTrigger {...args} />,
} satisfies StoryMeta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A token's value as the browser computes it, borrowed on the host's own
// inline style and put back in the same tick. Never inside waitFor, KN-014.
const computed = (host: HTMLElement, property: 'color' | 'boxShadow' | 'backgroundColor', value: string) => {
  const previous = host.style[property]
  host.style[property] = value
  const result = getComputedStyle(host)[property]
  host.style[property] = previous
  return result
}

const body = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body)

export const Shell: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Nodes 150:92 and 377:6244: a modal dialog named by its title, 360 wide,
    // 24 of padding and 16 between its parts, radius lg, Elevation/Modal, over
    // the file's scrim; the title in Heading/M, the close at the other end, a
    // divider on each side of the body, and the actions at the inline end.
    await userEvent.click(within(canvasElement).getByRole('button'))
    const dialog = await body(canvasElement).findByRole('dialog', { name: args.title })
    const paper = dialog.querySelector('h2')?.parentElement?.parentElement
    if (!(paper instanceof HTMLElement)) throw new Error('the dialog has no panel')
    const style = getComputedStyle(paper)
    await expect([paper.getBoundingClientRect().width, px(style.paddingTop), px(style.rowGap), px(style.borderTopLeftRadius)]).toEqual([
      360, 24, 16, 16,
    ])
    await expect(style.boxShadow).toBe(computed(paper, 'boxShadow', elevation.modal))
    // The dialog is MUI's panel, in its container, in the modal's root, whose
    // first child is the scrim.
    const scrim = dialog.parentElement?.parentElement?.firstElementChild
    if (!(scrim instanceof HTMLElement)) throw new Error('no scrim')
    await expect(getComputedStyle(scrim).backgroundColor).toBe(computed(scrim, 'backgroundColor', semantic['overlay/scrim']))
    const title = within(paper).getByRole('heading', { level: 2 })
    await expect([
      px(getComputedStyle(title).fontSize),
      px(getComputedStyle(title).lineHeight),
      Number(getComputedStyle(title).fontWeight),
    ]).toEqual([20, 28, 600])
    await expect(title.parentElement?.getBoundingClientRect().height).toBe(28)
    await expect([...paper.querySelectorAll('hr')].map((rule) => rule.getBoundingClientRect().height)).toEqual([1, 1])
    await userEvent.keyboard('{Escape}')
  },
}

export const TrapsFocusAndEscapes: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // Opened by the keyboard, focus stays inside however far Tab goes; Escape
    // closes it and gives focus back to the trigger.
    const trigger = within(canvasElement).getByRole('button')
    trigger.focus()
    await userEvent.keyboard('{Enter}')
    const dialog = await body(canvasElement).findByRole('dialog')
    await waitFor(() => expect(dialog.contains(canvasElement.ownerDocument.activeElement)).toBe(true))
    for (let step = 0; step < 6; step += 1) {
      await userEvent.tab()
      await expect(dialog.contains(canvasElement.ownerDocument.activeElement)).toBe(true)
    }
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(body(canvasElement).queryByRole('dialog')).toBeNull())
    await expect(trigger).toHaveFocus()
    await expect(args.onClose).toHaveBeenCalledTimes(1)
  },
}

export const ScrimCloses: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // A press on the scrim closes it, as Cancel does, and focus goes back.
    const trigger = within(canvasElement).getByRole('button')
    await userEvent.click(trigger)
    const dialog = await body(canvasElement).findByRole('dialog')
    // The press lands on MUI's container round the panel, which lies over the
    // scrim and fills the screen; a press on it and not on the panel closes.
    const container = dialog.parentElement
    if (!(container instanceof HTMLElement)) throw new Error('no container')
    await userEvent.click(container)
    await waitFor(() => expect(body(canvasElement).queryByRole('dialog')).toBeNull())
    await expect(trigger).toHaveFocus()
    await expect(args.onClose).toHaveBeenCalledTimes(1)
  },
}

export const InEnglish: Story = {
  args: { title: titleIn('en-US') },
  globals: { locale: 'en-US' },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button'))
    // It dissolves in over 150 ms, so it is visible once that has run.
    const dialog = await body(canvasElement).findByRole('dialog', { name: args.title })
    await waitFor(() => expect(dialog).toBeVisible())
    await userEvent.keyboard('{Escape}')
  },
}
