import { useLingui } from '@lingui/react'
import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { semantic } from '../../theme/tokens'
import { Button } from '../button'
import { quoted } from '../quoted'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { closeIsTheFiles } from './closeCheck'
import { DeleteJobModal, type DeleteJobModalProps } from './DeleteJobModal'

// The closed outcomes' names, as the board's strips show them.
const namesIn = (locale: Locale) => {
  const names = fixtures(locale).outcomeNames
  return { withdrawnName: names.withdrawn, noResponseName: names.noResponse }
}

// The modal opens from a trigger, as a card's menu asks it; every answer
// closes it and calls the args.
const WithTrigger = ({ onDelete, onMove, onKeep, ...args }: DeleteJobModalProps) => {
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
        {i18n._('Delete job opportunity')}
      </Button>
      <DeleteJobModal
        {...args}
        open={open}
        onDelete={(reason) => {
          setOpen(false)
          onDelete(reason)
        }}
        onMove={(outcome) => {
          setOpen(false)
          onMove(outcome)
        }}
        onKeep={() => {
          setOpen(false)
          onKeep()
        }}
      />
    </>
  )
}

const meta = {
  title: 'Shared/DeleteJobModal',
  component: DeleteJobModal,
  args: { open: false, ...namesIn('fa-IR'), onDelete: fn(), onMove: fn(), onKeep: fn() },
  parameters: { controls: { include: ['withdrawnName', 'noResponseName'] } },
  render: (args) => <WithTrigger {...args} />,
} satisfies StoryMeta<typeof DeleteJobModal>

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
  const i18n = i18nFor(locale)
  await userEvent.click(await within(canvasElement).findByRole('button', { name: i18n._('Delete job opportunity') }))
  const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog', { name: i18n._('Delete this job opportunity?') })
  await waitFor(() => expect(dialog).toBeVisible())
  const paper = dialog.querySelector('h2')?.parentElement?.parentElement
  if (!(paper instanceof HTMLElement)) throw new Error('the dialog has no panel')
  return { dialog, paper }
}

const reasonsIn = (locale: Locale) => {
  const i18n = i18nFor(locale)
  return [i18n._('I am not after it any more'), i18n._('I got no answer'), i18n._('Added by mistake or twice')]
}

// Node 865:33825 in every reason: the shell at 400 and its 20 close; the
// question 14 on 22 at Medium in text/primary and its note 12 on 19 in
// text/secondary, 4 apart; the three reasons, 8 apart, none chosen at first;
// and at the inline end Keep and the rest, 12 apart, Keep holding focus.
const isTheFiles = async (dialog: HTMLElement, paper: HTMLElement, locale: Locale, palette: Palette) => {
  const i18n = i18nFor(locale)
  await expect(paper.getBoundingClientRect().width).toBe(400)
  await closeIsTheFiles(dialog, locale, palette)
  const question = within(paper).getByText(i18n._('Why do you want to delete it?'))
  const note = within(paper).getByText(i18n._('You do not have to choose.'))
  const [asked, noted] = [getComputedStyle(question), getComputedStyle(note)]
  await expect([px(asked.fontSize), px(asked.lineHeight), asked.fontWeight]).toEqual([14, 22, '500'])
  await expect([px(noted.fontSize), px(noted.lineHeight), noted.fontWeight]).toEqual([12, 19, '400'])
  await expect([asked.color, noted.color]).toEqual([computed(question, palette['text/primary']), computed(note, palette['text/secondary'])])
  await expect(Math.round(note.getBoundingClientRect().top - question.getBoundingClientRect().bottom)).toBe(4)
  const group = within(paper).getByRole('radiogroup', { name: i18n._('Why do you want to delete it?') })
  await expect(group).toHaveAccessibleDescription(i18n._('You do not have to choose.'))
  const radios = within(group).getAllByRole('radio')
  await expect(radios.map((radio) => radio.closest('label')?.textContent)).toEqual(reasonsIn(locale))
  const [first, second] = radios.map((radio) => radio.closest('label')?.getBoundingClientRect())
  if (!first || !second) throw new Error('the reasons are missing')
  await expect(Math.round(second.top - first.bottom)).toBe(8)
  await waitFor(() => expect(within(paper).getByRole('button', { name: i18n._('Keep') })).toHaveFocus())
  return { group, radios }
}

// The footer from the inline end: each button given, 12 apart, 44 tall.
const footerIs = async (paper: HTMLElement, locale: Locale, names: readonly string[]) => {
  const buttons = names.map((name) => within(paper).getByRole('button', { name }))
  const rtl = locale === 'fa-IR'
  const row = buttons[0]?.parentElement?.getBoundingClientRect()
  if (!row) throw new Error('the footer is missing')
  const boxes = buttons.map((button) => button.getBoundingClientRect())
  for (const box of boxes) await expect(box.height).toBe(44)
  const [end] = boxes
  if (!end) throw new Error('the footer is empty')
  await expect(Math.round(rtl ? end.left - row.left : row.right - end.right)).toBe(0)
  for (const [index, box] of boxes.entries()) {
    const before = boxes[index + 1]
    if (before) await expect(Math.round(rtl ? before.left - box.right : box.left - before.right)).toBe(12)
  }
  return buttons
}

// The hint the two reasons that have somewhere else to go add: in
// bg/brand/subtle at radius 10, 10 above and below and 12 at the sides, its
// words 13 on 20 in text/primary.
const hintIs = async (paper: HTMLElement, locale: Locale, name: string, palette: Palette) => {
  const i18n = i18nFor(locale)
  const words = `${i18n._('Instead of deleting it, you can move it to')} ${quoted(i18n, name)}${i18n._('.')} ${i18n._('That way it is out of sight and still counts in your stats.')}`
  const hint = within(paper).getByText(words)
  const style = getComputedStyle(hint)
  await expect([px(style.paddingTop), px(style.paddingInlineStart), px(style.borderTopLeftRadius)]).toEqual([10, 12, 10])
  await expect([px(style.fontSize), px(style.lineHeight), style.fontWeight]).toEqual([13, 20, '400'])
  await expect(style.backgroundColor).toBe(computed(hint, palette['bg/brand/subtle']))
  await expect(style.color).toBe(computed(hint, palette['text/primary']))
}

export const NoReason: Story = {
  // Reason=هیچ, 395 tall: no reason, so Keep and the Destructive Delete.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const { dialog, paper } = await open(canvasElement, 'fa-IR')
    await isTheFiles(dialog, paper, 'fa-IR', semantic)
    const [remove] = await footerIs(paper, 'fa-IR', [i18n._('Delete'), i18n._('Keep')])
    if (!remove) throw new Error('no Delete')
    await expect(getComputedStyle(remove).backgroundColor).toBe(computed(remove, semantic['bg/danger/default']))
    await expect(paper.getBoundingClientRect().height).toBe(395)
    await userEvent.click(remove)
    await expect(args.onDelete).toHaveBeenCalledWith(null)
  },
}

export const NotWanted: Story = {
  // Reason=مهم نیست, 471 tall: the hint that it can go to withdrawn instead,
  // and «بردن به انصراف» as the Primary, Delete in red text beside it.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const { dialog, paper } = await open(canvasElement, 'fa-IR')
    const { radios } = await isTheFiles(dialog, paper, 'fa-IR', semantic)
    const [notWanted] = radios
    if (!notWanted) throw new Error('no reasons')
    await userEvent.click(notWanted)
    await hintIs(paper, 'fa-IR', args.withdrawnName, semantic)
    const [move, remove] = await footerIs(paper, 'fa-IR', [`${i18n._('Move to')} ${args.withdrawnName}`, i18n._('Delete'), i18n._('Keep')])
    if (!move || !remove) throw new Error('the footer is missing a button')
    await expect(getComputedStyle(move).backgroundColor).toBe(computed(move, semantic['bg/brand/default']))
    await expect(getComputedStyle(remove).color).toBe(computed(remove, semantic['text/error']))
    await expect(paper.getBoundingClientRect().height).toBe(471)
    await userEvent.click(move)
    await expect(args.onMove).toHaveBeenCalledWith('withdrawn')
    await expect(args.onDelete).not.toHaveBeenCalled()
  },
}

export const NoAnswer: Story = {
  // Reason=جواب نگرفتم: the hint names no response, and so does the Primary;
  // Delete in red text still deletes, with its reason.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const { paper } = await open(canvasElement, 'fa-IR')
    await userEvent.click(within(paper).getByRole('radio', { name: i18n._('I got no answer') }))
    await hintIs(paper, 'fa-IR', args.noResponseName, semantic)
    await footerIs(paper, 'fa-IR', [`${i18n._('Move to')} ${args.noResponseName}`, i18n._('Delete'), i18n._('Keep')])
    await userEvent.click(within(paper).getByRole('button', { name: i18n._('Delete') }))
    await expect(args.onDelete).toHaveBeenCalledWith('no-answer')
    await expect(args.onMove).not.toHaveBeenCalled()
  },
}

export const Mistake: Story = {
  // Reason=اشتباه, 395 tall: a mistake has nowhere else to go, so Keep and
  // the Destructive Delete, which deletes with its reason.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const { paper } = await open(canvasElement, 'fa-IR')
    await userEvent.click(within(paper).getByRole('radio', { name: i18n._('Added by mistake or twice') }))
    await expect(within(paper).queryByText(i18n._('That way it is out of sight and still counts in your stats.'), { exact: false })).toBeNull()
    await footerIs(paper, 'fa-IR', [i18n._('Delete'), i18n._('Keep')])
    await expect(paper.getBoundingClientRect().height).toBe(395)
    await userEvent.click(within(paper).getByRole('button', { name: i18n._('Delete') }))
    await expect(args.onDelete).toHaveBeenCalledWith('mistake')
  },
}

export const Keep: Story = {
  // Keep, the close and Escape keep the job opportunity; opened again, no
  // reason is chosen.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const first = await open(canvasElement, 'fa-IR')
    await userEvent.click(within(first.paper).getByRole('radio', { name: i18n._('I got no answer') }))
    await userEvent.click(within(first.paper).getByRole('button', { name: i18n._('Keep') }))
    await expect(args.onKeep).toHaveBeenCalledTimes(1)
    const second = await open(canvasElement, 'fa-IR')
    await expect(within(second.paper).queryByRole('radio', { checked: true })).toBeNull()
    await userEvent.click(within(second.paper).getByRole('button', { name: i18n._('Close') }))
    await expect(args.onKeep).toHaveBeenCalledTimes(2)
    await open(canvasElement, 'fa-IR')
    await userEvent.keyboard('{Escape}')
    await expect(args.onKeep).toHaveBeenCalledTimes(3)
    await expect(args.onDelete).not.toHaveBeenCalled()
  },
}

export const InEnglish: Story = {
  // Read from the left, the footer at the right, its Primary last.
  args: namesIn('en-US'),
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('en-US')
    const { dialog, paper } = await open(canvasElement, 'en-US')
    await isTheFiles(dialog, paper, 'en-US', semantic)
    await userEvent.click(within(paper).getByRole('radio', { name: i18n._('I am not after it any more') }))
    await hintIs(paper, 'en-US', args.withdrawnName, semantic)
    await footerIs(paper, 'en-US', [`${i18n._('Move to')} ${args.withdrawnName}`, i18n._('Delete'), i18n._('Keep')])
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const { dialog, paper } = await open(canvasElement, 'fa-IR')
    await isTheFiles(dialog, paper, 'fa-IR', darkSemantic)
    await userEvent.click(within(paper).getByRole('radio', { name: i18n._('I am not after it any more') }))
    await hintIs(paper, 'fa-IR', args.withdrawnName, darkSemantic)
  },
}
