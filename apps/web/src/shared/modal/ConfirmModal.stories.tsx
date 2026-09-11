import { setupI18n } from '@lingui/core'
import { useLingui } from '@lingui/react'
import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import type { Locale } from '../../i18n'
import { messages as en } from '../../i18n/locales/en-US'
import { messages as fa } from '../../i18n/locales/fa-IR'
import { Button } from '../button'
import type { StoryMeta } from '../story-docs/story-meta'
import { ConfirmModal, type ConfirmModalProps } from './ConfirmModal'

// Deleting a job opportunity, node 150:92, its copy from the catalog in the
// language a story pins.
const specimen = (locale: Locale): Pick<ConfirmModalProps, 'title' | 'body' | 'confirmLabel'> => {
  const i18n = setupI18n({ locale, messages: { [locale]: locale === 'fa-IR' ? fa : en } })
  return {
    title: i18n._('Delete this job opportunity?'),
    body: i18n._('This job opportunity is deleted for good and cannot be brought back.'),
    confirmLabel: i18n._('Delete'),
  }
}

// The modal opens from a trigger; either answer closes it and calls the args.
const WithTrigger = ({ onConfirm, onCancel, ...args }: ConfirmModalProps) => {
  const { i18n } = useLingui()
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        variant="destructive"
        onClick={() => {
          setOpen(true)
        }}
      >
        {i18n._('Delete')}
      </Button>
      <ConfirmModal
        {...args}
        open={open}
        onConfirm={() => {
          setOpen(false)
          onConfirm()
        }}
        onCancel={() => {
          setOpen(false)
          onCancel()
        }}
      />
    </>
  )
}

const CONTROLLED: (keyof ConfirmModalProps)[] = ['title', 'body', 'confirmLabel']

const meta = {
  title: 'Shared/ConfirmModal',
  component: ConfirmModal,
  args: { ...specimen('fa-IR'), open: false, onConfirm: fn(), onCancel: fn() },
  parameters: { controls: { include: CONTROLLED } },
  render: (args) => <WithTrigger {...args} />,
} satisfies StoryMeta<typeof ConfirmModal>

export default meta
type Story = StoryObj<typeof meta>

const body = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body)

export const DeleteAJobOpportunity: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // The question, what cannot be undone, and Cancel with focus as it opens,
    // so the first key changes nothing; the red action deletes.
    await userEvent.click(within(canvasElement).getByRole('button'))
    const dialog = await body(canvasElement).findByRole('dialog', { name: args.title })
    await expect(dialog).toHaveTextContent(args.body)
    const [cancel, confirm] = within(dialog)
      .getAllByRole('button')
      .filter((button) => button.textContent !== '')
    if (!cancel || !confirm) throw new Error('two actions expected')
    await waitFor(() => expect(cancel).toHaveFocus())
    await userEvent.click(confirm)
    await expect(args.onConfirm).toHaveBeenCalledTimes(1)
    await expect(args.onCancel).not.toHaveBeenCalled()
  },
}

export const CancelChangesNothing: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button'))
    await body(canvasElement).findByRole('dialog')
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(body(canvasElement).queryByRole('dialog')).toBeNull())
    await expect(args.onCancel).toHaveBeenCalledTimes(1)
    await expect(args.onConfirm).not.toHaveBeenCalled()
  },
}

export const InEnglish: Story = {
  args: specimen('en-US'),
  globals: { locale: 'en-US' },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button'))
    // It dissolves in over 150 ms, so it is visible once that has run.
    const dialog = await body(canvasElement).findByRole('dialog', { name: args.title })
    await waitFor(() => expect(dialog).toBeVisible())
    await userEvent.keyboard('{Escape}')
  },
}
