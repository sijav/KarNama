import { useLingui } from '@lingui/react'
import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import type { Locale } from '../../i18n'
import { Button } from '../button'
import type { StatusOption } from '../status-picker'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { ChangeStatusModal, type ChangeStatusModalProps } from './ChangeStatusModal'

// The board's statuses, their names in the language a story pins.
const statusesIn = (locale: Locale): StatusOption[] =>
  fixtures(locale).statuses.map((status) => ({ id: status.token, token: status.token, name: status.name }))

// The modal opens from a trigger; either answer closes it and calls the args.
const WithTrigger = ({ onConfirm, onCancel, ...args }: ChangeStatusModalProps) => {
  const { i18n } = useLingui()
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        onClick={() => {
          setOpen(true)
        }}
      >
        {i18n._('Change status')}
      </Button>
      <ChangeStatusModal
        {...args}
        open={open}
        onConfirm={(id) => {
          setOpen(false)
          onConfirm(id)
        }}
        onCancel={() => {
          setOpen(false)
          onCancel()
        }}
      />
    </>
  )
}

const meta = {
  title: 'Shared/ChangeStatusModal',
  component: ChangeStatusModal,
  args: { open: false, statuses: statusesIn('fa-IR'), value: 'interview', onConfirm: fn(), onCancel: fn(), onAdd: fn() },
  parameters: { controls: { include: ['value'] } },
  render: (args) => <WithTrigger {...args} />,
} satisfies StoryMeta<typeof ChangeStatusModal>

export default meta
type Story = StoryObj<typeof meta>

const body = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body)

// The dialog's panel, the heading's grandparent.
const panelOf = (dialog: HTMLElement) => {
  const panel = dialog.querySelector('h2')?.parentElement?.parentElement
  if (!(panel instanceof HTMLElement)) throw new Error('the dialog has no panel')
  return panel
}

export const Default: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // Node 150:93: 420 wide, the Status Picker on the job's status; a choice
    // waits until Confirm hands it over.
    await userEvent.click(within(canvasElement).getByRole('button'))
    const dialog = await body(canvasElement).findByRole('dialog')
    await expect(panelOf(dialog).getBoundingClientRect().width).toBe(420)
    const radios = within(dialog).getAllByRole('radio')
    const other = radios.find((radio) => radio.getAttribute('value') !== args.value)
    if (!other) throw new Error('no other status')
    await userEvent.click(other)
    await expect(args.onConfirm).not.toHaveBeenCalled()
    const confirm = within(dialog).getAllByRole('button').at(-1)
    if (!confirm) throw new Error('no confirm')
    await userEvent.click(confirm)
    await expect(args.onConfirm).toHaveBeenCalledWith(other.getAttribute('value'))
  },
}

export const CancelLeavesItAsItWas: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // A choice, then Escape: nothing handed over, and the next opening starts
    // again from the job's status.
    const trigger = within(canvasElement).getByRole('button')
    await userEvent.click(trigger)
    let dialog = await body(canvasElement).findByRole('dialog')
    const other = within(dialog)
      .getAllByRole('radio')
      .find((radio) => radio.getAttribute('value') !== args.value)
    if (!other) throw new Error('no other status')
    await userEvent.click(other)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(body(canvasElement).queryByRole('dialog')).toBeNull())
    await expect(args.onCancel).toHaveBeenCalledTimes(1)
    await expect(args.onConfirm).not.toHaveBeenCalled()
    await userEvent.click(trigger)
    dialog = await body(canvasElement).findByRole('dialog')
    const checked = within(dialog)
      .getAllByRole('radio')
      .find((radio) => radio instanceof HTMLInputElement && radio.checked)
    await expect(checked?.getAttribute('value')).toBe(args.value)
    await userEvent.keyboard('{Escape}')
  },
}
