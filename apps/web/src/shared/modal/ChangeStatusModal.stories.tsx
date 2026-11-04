import { useLingui } from '@lingui/react'
import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { semantic } from '../../theme/tokens'
import { Button } from '../button'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { ChangeStatusModal, type ChangeStatusModalProps } from './ChangeStatusModal'
import { closeIsTheFiles } from './closeCheck'

import type { StatusToken } from '../../theme/tokens'

const FA = fixtures('fa-IR')
const EN = fixtures('en-US')

// The status the frame opens on, ذخیره‌شده.
const SAVED: StatusToken = 'new'
// The statuses the story hands over, and so the only values its value can take,
// offered as a select rather than as text, KN-571.
const CHOICES = [...FA.stageOptions, ...FA.outcomeOptions]

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
  args: { open: false, stages: FA.stageOptions, outcomes: FA.outcomeOptions, value: SAVED, onConfirm: fn(), onCancel: fn(), onAdd: fn() },
  argTypes: { value: { control: 'select', options: CHOICES.map((status) => status.id) } },
  parameters: { controls: { include: ['value'] } },
  render: (args) => <WithTrigger {...args} />,
} satisfies StoryMeta<typeof ChangeStatusModal>

export default meta
type Story = StoryObj<typeof meta>

const body = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body)

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

// The runner's 414 cannot hold the 420 modal beside the window's 16, so a story
// that measures it widens the page while it runs.
const wide = async (run: () => Promise<void>) => {
  const testing = '__KARNAMA_STORY_TEST__' in globalThis
  if (testing) await (await import('vitest/browser')).page.viewport(1280, 800)
  try {
    await run()
  } finally {
    if (testing) await (await import('vitest/browser')).page.viewport(414, 896)
  }
}

// The dialog's panel, the heading's grandparent.
const panelOf = (dialog: HTMLElement) => {
  const panel = dialog.querySelector('h2')?.parentElement?.parentElement
  if (!(panel instanceof HTMLElement)) throw new Error('the dialog has no panel')
  return panel
}

// Opens the modal from its trigger and returns its parts: the dialog, its
// panel, the grouped picker named «وضعیت» and its two groups.
const openModal = async (canvasElement: HTMLElement, locale: Locale) => {
  const i18n = i18nFor(locale)
  await userEvent.click(within(canvasElement).getByRole('button', { name: i18n._('Change status') }))
  const dialog = await body(canvasElement).findByRole('dialog', { name: i18n._('Change status') })
  const picker = within(dialog).getByRole('group', { name: i18n._('Status') })
  return {
    dialog,
    panel: panelOf(dialog),
    picker,
    stages: within(picker).getByRole('radiogroup', { name: i18n._('In progress') }),
    outcomes: within(picker).getByRole('radiogroup', { name: i18n._('Closed') }),
  }
}

// Node 150:93 in the original, 420 by 410: the shell round the grouped Status
// Picker of 636:6417 at 372 by 224, «وضعیت» over «در جریان» and the stages, two
// lines of them at 372, a divider, and «بسته‌شده» over the four outcomes, the
// captions in text/disabled; the chosen status takes focus as it opens, KN-337.
const isTheFiles = async (canvasElement: HTMLElement, args: ChangeStatusModalProps, locale: Locale, palette: Palette) => {
  const { dialog, panel, picker, stages, outcomes } = await openModal(canvasElement, locale)
  const i18n = i18nFor(locale)
  await expect(panel.getBoundingClientRect().width).toBe(420)
  await expect(getComputedStyle(panel).backgroundColor).toBe(computed(panel, palette['bg/surface']))
  await closeIsTheFiles(dialog, locale, palette)
  await expect(picker.getBoundingClientRect().width).toBe(372)
  await expect(within(stages).getAllByRole('radio')).toHaveLength(args.stages.length)
  await expect(within(outcomes).getAllByRole('radio')).toHaveLength(args.outcomes.length)
  const caption = within(picker).getByText(i18n._('Closed'))
  await expect(getComputedStyle(caption).color).toBe(computed(caption, palette['text/disabled']))
  await waitFor(() => expect(within(dialog).getByRole('radio', { checked: true })).toHaveFocus())
  await expect(within(dialog).getByRole('radio', { checked: true })).toHaveAttribute('value', args.value)
  return { panel, picker }
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await wide(async () => {
      // The frame's own height, which the Persian stages' two lines make, and
      // an outcome chosen: the two groups are one choice, which waits until
      // Confirm hands it over.
      const { panel, picker } = await isTheFiles(canvasElement, args, 'fa-IR', semantic)
      await expect([panel.getBoundingClientRect().height, picker.getBoundingClientRect().height]).toEqual([410, 224])
      const rejected = args.outcomes.find((status) => status.token === 'rejected')
      if (!rejected) throw new Error('the fixtures hold no rejected outcome')
      await userEvent.click(within(picker).getByRole('radio', { name: rejected.name }))
      await expect(args.onConfirm).not.toHaveBeenCalled()
      await userEvent.click(within(panel).getByRole('button', { name: i18nFor('fa-IR')._('Confirm') }))
      await expect(args.onConfirm).toHaveBeenCalledWith(rejected.id)
    })
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

export const InEnglish: Story = {
  args: { stages: EN.stageOptions, outcomes: EN.outcomeOptions },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await wide(async () => {
      await isTheFiles(canvasElement, args, 'en-US', semantic)
    })
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ args, canvasElement }) => {
    await wide(async () => {
      const { panel } = await isTheFiles(canvasElement, args, 'fa-IR', darkSemantic)
      await expect(panel.getBoundingClientRect().height).toBe(410)
    })
  },
}
