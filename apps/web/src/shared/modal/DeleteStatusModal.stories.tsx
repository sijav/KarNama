import { useLingui } from '@lingui/react'
import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { formatCount } from '../../i18n/formatCount'
import { quoted } from '../quoted'
import { darkSemantic } from '../../theme/darkMode'
import { semantic, type StatusToken } from '../../theme/tokens'
import { Button } from '../button'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { closeIsTheFiles } from './closeCheck'
import { DeleteStatusModal, type DeleteStatusModalProps } from './DeleteStatusModal'

const FA = fixtures('fa-IR')
const EN = fixtures('en-US')
type Fixtures = typeof FA

// A stage the reader made, which alone can be deleted.
const MADE: StatusToken = 'custom-1'

// The stage, how many job opportunities it holds, and every other stage they
// can go to, in the board's order.
const stageOf = (set: Fixtures, count: number): Pick<DeleteStatusModalProps, 'name' | 'count' | 'destinations'> => {
  const stage = set.statusOptions.find((option) => option.token === MADE)
  if (!stage) throw new Error('the fixtures hold no stage the reader made')
  return { name: stage.name, count, destinations: set.statusOptions.filter((option) => option.id !== stage.id) }
}

// The modal opens from a trigger, as a stage's menu asks it; either answer
// closes it and calls the args.
const WithTrigger = ({ onDelete, onCancel, ...args }: DeleteStatusModalProps) => {
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
        {i18n._('Delete status')}
      </Button>
      <DeleteStatusModal
        {...args}
        open={open}
        onDelete={(destination) => {
          setOpen(false)
          onDelete(destination)
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
  title: 'Shared/DeleteStatusModal',
  component: DeleteStatusModal,
  args: { open: false, ...stageOf(FA, 0), onDelete: fn(), onCancel: fn() },
  parameters: { controls: { include: ['name', 'count'] } },
  render: (args) => <WithTrigger {...args} />,
} satisfies StoryMeta<typeof DeleteStatusModal>

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

const titleOf = (name: string, locale: Locale) => {
  const i18n = i18nFor(locale)
  return `${i18n._('Delete the status')} ${quoted(i18n, name)}${i18n._('?')}`
}

// Opens the modal from its trigger and waits out the dissolve. The trigger is
// found by waiting, since a modal that has just closed keeps the page hidden
// until its own dissolve is over.
const open = async (canvasElement: HTMLElement, name: string, locale: Locale) => {
  await userEvent.click(await within(canvasElement).findByRole('button'))
  const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog', { name: titleOf(name, locale) })
  await waitFor(() => expect(dialog).toBeVisible())
  return dialog
}

// Node 919:2885 in either variant: the shell at 440, its close at 20, the body
// in Body text/secondary, and at the inline end Cancel then the Destructive
// action, 12 apart, 44 tall, Cancel holding focus.
const isTheFiles = async (dialog: HTMLElement, action: string, locale: Locale, palette: Palette) => {
  const i18n = i18nFor(locale)
  const paper = dialog.querySelector('h2')?.parentElement?.parentElement
  if (!(paper instanceof HTMLElement)) throw new Error('the dialog has no panel')
  await expect(paper.getBoundingClientRect().width).toBe(440)
  await closeIsTheFiles(dialog, locale, palette)
  const text = paper.querySelector('p')
  if (!text) throw new Error('the modal says nothing')
  const style = getComputedStyle(text)
  await expect([px(style.fontSize), px(style.lineHeight), style.fontWeight]).toEqual([14, 22, '400'])
  await expect(style.color).toBe(computed(text, palette['text/secondary']))
  const cancel = within(paper).getByRole('button', { name: i18n._('Cancel') })
  const destroy = within(paper).getByRole('button', { name: action })
  await waitFor(() => expect(cancel).toHaveFocus())
  const actions = destroy.parentElement
  if (!actions || cancel.parentElement !== actions) throw new Error('the actions are not one row')
  const rtl = getComputedStyle(actions).direction === 'rtl'
  const [end, before, row] = [destroy.getBoundingClientRect(), cancel.getBoundingClientRect(), actions.getBoundingClientRect()]
  await expect([end.height, before.height]).toEqual([44, 44])
  await expect(Math.round(rtl ? end.left - row.left : row.right - end.right)).toBe(0)
  await expect(Math.round(rtl ? before.left - end.right : end.left - before.right)).toBe(12)
  await expect(getComputedStyle(destroy).backgroundColor).toBe(computed(destroy, palette['bg/danger/default']))
  return { paper, text }
}

export const Empty: Story = {
  // Cards=None: the stage holds nothing, so it simply goes, 208 tall.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const dialog = await open(canvasElement, args.name, 'fa-IR')
    const { paper, text } = await isTheFiles(dialog, i18n._('Delete status'), 'fa-IR', semantic)
    await expect(text.textContent).toBe(i18n._('This status is removed from the board. There are no job opportunities in it.'))
    await expect(within(paper).queryByRole('combobox')).toBeNull()
    await expect(paper.getBoundingClientRect().height).toBe(208)
    await userEvent.click(within(paper).getByRole('button', { name: i18n._('Delete status') }))
    await expect(args.onDelete).toHaveBeenCalledWith(null)
  },
}

export const WithJobOpportunities: Story = {
  // Cards=Has: two job opportunities in it, which go to the first stage the
  // caller gives unless another is chosen, the Select 16 under the line.
  args: stageOf(FA, 2),
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const dialog = await open(canvasElement, args.name, 'fa-IR')
    const { paper, text } = await isTheFiles(dialog, i18n._('Delete and move'), 'fa-IR', semantic)
    await expect(text.textContent).toBe(
      `${formatCount('fa-IR', 2)} ${i18n._('job opportunities are in this status.')} ${i18n._('Choose where they go once the status is deleted.')}`,
    )
    const select = within(paper).getByRole('combobox')
    await expect(select).toHaveAccessibleName(i18n._('Move the job opportunities to'))
    await expect(select).toHaveTextContent(args.destinations[0]?.name ?? 'missing')
    const field = select.parentElement?.parentElement
    if (!field) throw new Error('the Select has no frame')
    await expect(Math.round(field.getBoundingClientRect().top - text.getBoundingClientRect().bottom)).toBe(16)
    await userEvent.click(within(paper).getByRole('button', { name: i18n._('Delete and move') }))
    await expect(args.onDelete).toHaveBeenCalledWith(args.destinations[0]?.id)
  },
}

export const ChooseAnother: Story = {
  // Another stage chosen in the Select is where they go.
  args: stageOf(FA, 2),
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const dialog = await open(canvasElement, args.name, 'fa-IR')
    const target = args.destinations[2]
    if (!target) throw new Error('the fixtures hold too few stages')
    await userEvent.click(within(dialog).getByRole('combobox'))
    const listbox = await within(canvasElement.ownerDocument.body).findByRole('listbox')
    await userEvent.click(within(listbox).getByRole('option', { name: target.name }))
    await expect(within(dialog).getByRole('combobox')).toHaveTextContent(target.name)
    await userEvent.click(within(dialog).getByRole('button', { name: i18n._('Delete and move') }))
    await expect(args.onDelete).toHaveBeenCalledWith(target.id)
  },
}

export const Cancel: Story = {
  // The close and Escape cancel, deleting nothing.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const dialog = await open(canvasElement, args.name, 'fa-IR')
    await userEvent.click(within(dialog).getByRole('button', { name: i18nFor('fa-IR')._('Close') }))
    await expect(args.onCancel).toHaveBeenCalledTimes(1)
    await open(canvasElement, args.name, 'fa-IR')
    await userEvent.keyboard('{Escape}')
    await expect(args.onCancel).toHaveBeenCalledTimes(2)
    await expect(args.onDelete).not.toHaveBeenCalled()
  },
}

export const OneInEnglish: Story = {
  // One job opportunity, in English, which counts it in the singular.
  args: stageOf(EN, 1),
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('en-US')
    const dialog = await open(canvasElement, args.name, 'en-US')
    const { paper, text } = await isTheFiles(dialog, i18n._('Delete and move'), 'en-US', semantic)
    await expect(text.textContent).toBe(
      `${formatCount('en-US', 1)} ${i18n._('job opportunity is in this status.')} ${i18n._('Choose where it goes once the status is deleted.')}`,
    )
    await expect(within(paper).getByRole('combobox')).toHaveAccessibleName(i18n._('Move the job opportunity to'))
    await userEvent.keyboard('{Escape}')
  },
}

export const InEnglish: Story = {
  args: stageOf(EN, 2),
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('en-US')
    const dialog = await open(canvasElement, args.name, 'en-US')
    await isTheFiles(dialog, i18n._('Delete and move'), 'en-US', semantic)
    await userEvent.keyboard('{Escape}')
  },
}

export const Dark: Story = {
  args: stageOf(FA, 2),
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const dialog = await open(canvasElement, args.name, 'fa-IR')
    await isTheFiles(dialog, i18n._('Delete and move'), 'fa-IR', darkSemantic)
    await userEvent.keyboard('{Escape}')
  },
}
