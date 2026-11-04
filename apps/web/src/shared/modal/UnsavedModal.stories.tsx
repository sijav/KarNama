import { useLingui } from '@lingui/react'
import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { semantic } from '../../theme/tokens'
import { Button } from '../button'
import type { StoryMeta } from '../story-docs/story-meta'
import { closeIsTheFiles } from './closeCheck'
import { UnsavedModal, type UnsavedModalProps } from './UnsavedModal'

// The modal opens from a trigger, as a modal holding changes asks it; each
// answer closes it and calls the args.
const WithTrigger = ({ onSave, onDiscard, onKeepEditing, ...args }: UnsavedModalProps) => {
  const { i18n } = useLingui()
  const [open, setOpen] = useState(false)
  const answer = (then: () => void) => () => {
    setOpen(false)
    then()
  }
  return (
    <>
      <Button
        variant="secondary"
        onClick={() => {
          setOpen(true)
        }}
      >
        {i18n._('Close')}
      </Button>
      <UnsavedModal {...args} open={open} onSave={answer(onSave)} onDiscard={answer(onDiscard)} onKeepEditing={answer(onKeepEditing)} />
    </>
  )
}

const meta = {
  title: 'Shared/UnsavedModal',
  component: UnsavedModal,
  args: { open: false, onSave: fn(), onDiscard: fn(), onKeepEditing: fn() },
  parameters: { controls: { include: [] } },
  render: (args) => <WithTrigger {...args} />,
} satisfies StoryMeta<typeof UnsavedModal>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A colour as the browser computes it, borrowed on the host's own inline style
// and put back in the same tick. Never inside waitFor, KN-014.
const computed = (host: HTMLElement, value: string) => {
  const previous = host.style.color
  host.style.color = value
  const result = getComputedStyle(host).color
  host.style.color = previous
  return result
}

type Palette = Record<keyof typeof semantic, string>

// Opens the modal from its trigger and waits out the dissolve. The trigger is
// found by waiting, since a modal that has just closed keeps the page hidden
// until its own dissolve is over.
const open = async (canvasElement: HTMLElement, locale: Locale) => {
  await userEvent.click(await within(canvasElement).findByRole('button'))
  const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog', { name: i18nFor(locale)._('Unsaved changes') })
  await waitFor(() => expect(dialog).toBeVisible())
  return dialog
}

// Node 893:3780: the shell at 360, its close Popover / Close at 20; the body
// in Body text/secondary; and at the inline end, 12 apart, Close without saving
// then Save, Save at the very end and holding focus.
const isTheFiles = async (dialog: HTMLElement, locale: Locale, palette: Palette) => {
  const i18n = i18nFor(locale)
  const paper = dialog.querySelector('h2')?.parentElement?.parentElement
  if (!(paper instanceof HTMLElement)) throw new Error('the dialog has no panel')
  await expect(paper.getBoundingClientRect().width).toBe(360)
  await closeIsTheFiles(dialog, locale, palette)
  const text = within(paper).getByText(i18n._('If you close without saving, the changes you made will be lost.'))
  const style = getComputedStyle(text)
  await expect([px(style.fontSize), px(style.lineHeight), style.fontWeight]).toEqual([14, 22, '400'])
  await expect(style.color).toBe(computed(text, palette['text/secondary']))
  const discard = within(paper).getByRole('button', { name: i18n._('Close without saving') })
  const save = within(paper).getByRole('button', { name: i18n._('Save') })
  await waitFor(() => expect(save).toHaveFocus())
  const actions = save.parentElement
  if (!actions || discard.parentElement !== actions) throw new Error('the actions are not one row')
  const rtl = getComputedStyle(actions).direction === 'rtl'
  const [kept, lost, row] = [save.getBoundingClientRect(), discard.getBoundingClientRect(), actions.getBoundingClientRect()]
  await expect([kept.height, lost.height]).toEqual([44, 44])
  await expect(Math.round(rtl ? kept.left - row.left : row.right - kept.right)).toBe(0)
  await expect(Math.round(rtl ? lost.left - kept.right : kept.left - lost.right)).toBe(12)
  await expect(getComputedStyle(save).backgroundColor).toBe(computed(save, palette['bg/brand/default']))
  await expect(getComputedStyle(discard).color).toBe(computed(discard, palette['text/brand']))
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const dialog = await open(canvasElement, 'fa-IR')
    await isTheFiles(dialog, 'fa-IR', semantic)
    await userEvent.keyboard('{Escape}')
  },
}

export const Save: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Enter on the focused Save keeps the changes, and only that is called.
    await open(canvasElement, 'fa-IR')
    await userEvent.keyboard('{Enter}')
    await expect(args.onSave).toHaveBeenCalledOnce()
    await expect(args.onDiscard).not.toHaveBeenCalled()
    await expect(args.onKeepEditing).not.toHaveBeenCalled()
  },
}

export const CloseWithoutSaving: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const dialog = await open(canvasElement, 'fa-IR')
    await userEvent.click(within(dialog).getByRole('button', { name: i18nFor('fa-IR')._('Close without saving') }))
    await expect(args.onDiscard).toHaveBeenCalledOnce()
    await expect(args.onSave).not.toHaveBeenCalled()
  },
}

export const BackToTheModal: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // The close and Escape both go back to the modal, changing nothing.
    const dialog = await open(canvasElement, 'fa-IR')
    await userEvent.click(within(dialog).getByRole('button', { name: i18nFor('fa-IR')._('Close') }))
    await expect(args.onKeepEditing).toHaveBeenCalledTimes(1)
    await open(canvasElement, 'fa-IR')
    await userEvent.keyboard('{Escape}')
    await expect(args.onKeepEditing).toHaveBeenCalledTimes(2)
    await expect(args.onSave).not.toHaveBeenCalled()
    await expect(args.onDiscard).not.toHaveBeenCalled()
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const dialog = await open(canvasElement, 'en-US')
    await isTheFiles(dialog, 'en-US', semantic)
    await userEvent.keyboard('{Escape}')
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    const dialog = await open(canvasElement, 'fa-IR')
    await isTheFiles(dialog, 'fa-IR', darkSemantic)
    await userEvent.keyboard('{Escape}')
  },
}
