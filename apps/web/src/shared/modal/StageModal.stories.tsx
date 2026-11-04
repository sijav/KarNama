import { useLingui } from '@lingui/react'
import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { formatCount } from '../../i18n/formatCount'
import { darkSemantic } from '../../theme/darkMode'
import { semantic, type StatusToken } from '../../theme/tokens'
import { Button } from '../button'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { closeIsTheFiles } from './closeCheck'
import { StageModal, type StageModalProps } from './StageModal'

// The colour a new stage is given, the first of the four reserved, which the
// file's variants all show chosen.
const AUTOMATIC: StatusToken = 'custom-1'

// Every stage's name, which a new one may not take.
const takenIn = (locale: Locale) => fixtures(locale).statuses.map((entry) => entry.name)

// A stage being edited: the first suggestion's name, as 919:2803 shows it.
const edited = (locale: Locale) => ({ name: i18nFor(locale)._('Technical interview'), colour: AUTOMATIC })

// The modal opens from a trigger, as the board's add column or a stage's menu
// asks it; either answer closes it and calls the args.
const WithTrigger = ({ onSave, onCancel, onDelete, ...args }: StageModalProps) => {
  const { i18n } = useLingui()
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        variant="secondary"
        onClick={() => {
          setOpen(true)
        }}
      >
        {args.mode === 'edit' ? i18n._('Edit status') : i18n._('Add status')}
      </Button>
      <StageModal
        {...args}
        open={open}
        onSave={(stage) => {
          setOpen(false)
          onSave(stage)
        }}
        onCancel={() => {
          setOpen(false)
          onCancel()
        }}
        {...(onDelete === undefined
          ? {}
          : {
              onDelete: () => {
                setOpen(false)
                onDelete()
              },
            })}
      />
    </>
  )
}

const meta = {
  title: 'Shared/StageModal',
  component: StageModal,
  args: {
    open: false,
    mode: 'add',
    stage: { name: '', colour: AUTOMATIC },
    takenNames: takenIn('fa-IR'),
    onSave: fn(),
    onCancel: fn(),
    onDelete: fn(),
  },
  parameters: { controls: { include: ['mode'] } },
  render: (args) => <WithTrigger {...args} />,
} satisfies StoryMeta<typeof StageModal>

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
const open = async (canvasElement: HTMLElement, mode: StageModalProps['mode'], locale: Locale) => {
  const i18n = i18nFor(locale)
  const title = mode === 'edit' ? i18n._('Edit status') : i18n._('Add status')
  await userEvent.click(await within(canvasElement).findByRole('button', { name: title }))
  const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog', { name: title })
  await waitFor(() => expect(dialog).toBeVisible())
  const paper = dialog.querySelector('h2')?.parentElement?.parentElement
  if (!(paper instanceof HTMLElement)) throw new Error('the dialog has no panel')
  return { dialog, paper }
}

const counted = (locale: Locale, length: number) => {
  const i18n = i18nFor(locale)
  return `${formatCount(locale, length)} ${i18n._('of')} ${formatCount(locale, 20)} ${i18n._('characters')}`
}

const nameField = (paper: HTMLElement, locale: Locale) => within(paper).getByRole('textbox', { name: i18nFor(locale)._('Status name') })

// Node 919:2804 in every mode: the shell at 440 and its 20 close; the fields
// 20 apart; the name with its count under it; the Color Picker across the
// field, on the colour it was given; at the inline end Cancel then the
// primary action, 12 apart, 44 tall.
const isTheFiles = async (dialog: HTMLElement, paper: HTMLElement, locale: Locale, palette: Palette) => {
  const i18n = i18nFor(locale)
  await expect(paper.getBoundingClientRect().width).toBe(440)
  await closeIsTheFiles(dialog, locale, palette)
  const form = paper.querySelector('form')
  if (!form) throw new Error('the modal has no form')
  await expect(px(getComputedStyle(form).rowGap)).toBe(20)
  const picker = within(paper).getByRole('radiogroup', { name: i18n._('Status colour') }).parentElement
  if (!picker) throw new Error('the picker has no panel')
  await expect(picker.getBoundingClientRect().width).toBe(392)
  await expect(within(paper).getByRole('radio', { checked: true })).toHaveAttribute('value', AUTOMATIC)
  const rtl = locale === 'fa-IR'
  const cancel = within(paper).getByRole('button', { name: i18n._('Cancel') })
  const primary = cancel.nextElementSibling
  if (!(primary instanceof HTMLElement)) throw new Error('nothing follows Cancel')
  const row = primary.parentElement?.getBoundingClientRect()
  if (!row) throw new Error('the actions have no row')
  const [end, before] = [primary.getBoundingClientRect(), cancel.getBoundingClientRect()]
  await expect([end.height, before.height]).toEqual([44, 44])
  await expect(Math.round(rtl ? end.left - row.left : row.right - end.right)).toBe(0)
  await expect(Math.round(rtl ? before.left - end.right : end.left - before.right)).toBe(12)
  return { form, primary, cancel }
}

// 919:2550's suggestions: «پیشنهادها» 12 on 19 at Medium in text/secondary,
// then the five chips from the inline start in two rows, 8 apart both ways,
// none pressed but the one the name is.
const suggestionsAre = async (paper: HTMLElement, locale: Locale, palette: Palette, pressed: string | undefined) => {
  const i18n = i18nFor(locale)
  const group = within(paper).getByRole('group', { name: i18n._('Suggestions') })
  const heading = within(paper).getByText(i18n._('Suggestions'))
  const style = getComputedStyle(heading)
  await expect([px(style.fontSize), px(style.lineHeight), style.fontWeight]).toEqual([12, 19, '500'])
  await expect(style.color).toBe(computed(heading, palette['text/secondary']))
  const chips = within(group).getAllByRole('button')
  const names = [i18n._('Assignment'), i18n._('HR interview'), i18n._('Technical interview'), i18n._('Salary negotiation'), i18n._('Final interview')]
  await expect(chips.map((chip) => chip.textContent)).toEqual(names)
  await expect(chips.map((chip) => chip.getAttribute('aria-pressed'))).toEqual(names.map((name) => String(name === pressed)))
  const boxes = chips.map((chip) => chip.getBoundingClientRect())
  const [first, , third, fourth, fifth] = boxes
  if (!first || !third || !fourth || !fifth) throw new Error('fewer than five chips')
  await expect([third.top, fourth.top - first.top, fifth.top - fourth.top]).toEqual([first.top, 40, 0])
  const area = group.getBoundingClientRect()
  await expect(Math.round(locale === 'fa-IR' ? area.right - first.right : first.left - area.left)).toBe(0)
}

export const Add: Story = {
  // Mode=Add, 528 tall: the name empty with its example, «۰ از ۲۰ حرف» under
  // it, the suggestions, and Add off.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const { dialog, paper } = await open(canvasElement, 'add', 'fa-IR')
    const { primary } = await isTheFiles(dialog, paper, 'fa-IR', semantic)
    const field = nameField(paper, 'fa-IR')
    await expect(field).toHaveValue('')
    await expect(field).toHaveAttribute('placeholder', `${i18n._('For example:')} ${i18n._('Technical interview')}`)
    await expect(field).toHaveAttribute('maxlength', '20')
    await expect(within(paper).getByText(counted('fa-IR', 0))).toBeVisible()
    await suggestionsAre(paper, 'fa-IR', semantic, undefined)
    await expect(primary).toHaveTextContent(i18n._('Add'))
    await expect(primary).toBeDisabled()
    await expect(paper.getBoundingClientRect().height).toBe(528)
  },
}

export const AddFilled: Story = {
  // Mode=Add Filled: a suggestion pressed fills the name, its count follows,
  // the chip shows pressed and Add hands over the stage.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const { paper } = await open(canvasElement, 'add', 'fa-IR')
    const suggestion = i18n._('Technical interview')
    await userEvent.click(within(paper).getByRole('button', { name: suggestion }))
    await expect(nameField(paper, 'fa-IR')).toHaveValue(suggestion)
    await expect(within(paper).getByText(counted('fa-IR', suggestion.length))).toBeVisible()
    await suggestionsAre(paper, 'fa-IR', semantic, suggestion)
    const add = within(paper).getByRole('button', { name: i18n._('Add') })
    await expect(add).toBeEnabled()
    await userEvent.click(add)
    await expect(args.onSave).toHaveBeenCalledWith({ name: suggestion, colour: AUTOMATIC })
  },
}

export const AddDuplicate: Story = {
  // Mode=Add Duplicate: a name another stage has turns the count to the error
  // in text/error, and Add stays off.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const { paper } = await open(canvasElement, 'add', 'fa-IR')
    const taken = args.takenNames[2]
    if (taken === undefined) throw new Error('the fixtures hold too few stages')
    const field = nameField(paper, 'fa-IR')
    await userEvent.type(field, taken)
    await expect(field).toHaveAttribute('aria-invalid', 'true')
    const error = within(paper).getByText(i18n._('You have already chosen this name. Choose another name.'))
    await expect(getComputedStyle(error).color).toBe(computed(error, semantic['text/error']))
    await expect(within(paper).queryByText(counted('fa-IR', taken.length))).toBeNull()
    await expect(within(paper).getByRole('button', { name: i18n._('Add') })).toBeDisabled()
    // Enter, on the runner's own keyboard, adds nothing either.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const browser = await import('vitest/browser')
    await browser.userEvent.keyboard('{Enter}')
    await expect(args.onSave).not.toHaveBeenCalled()
  },
}

export const TwentyLetters: Story = {
  // The name stops at 20 letters, and the count says so.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const { paper } = await open(canvasElement, 'add', 'fa-IR')
    const field = nameField(paper, 'fa-IR')
    const long = fixtures('fa-IR').longStatusName
    await userEvent.type(field, long)
    await expect(field).toHaveValue(long.slice(0, 20))
    await expect(within(paper).getByText(counted('fa-IR', 20))).toBeVisible()
  },
}

export const EnterAdds: Story = {
  // Enter in the name adds the stage, the name trimmed.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const name = i18n._('Final interview')
    const { paper } = await open(canvasElement, 'add', 'fa-IR')
    await userEvent.type(nameField(paper, 'fa-IR'), ` ${name} `)
    // The runner's own keyboard, KN-225: implicit submission is the browser's,
    // and Add sits in the footer, outside the form it names by id, which a
    // synthetic Enter cannot see, as the Contact Modal's EnterSaves says.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const browser = await import('vitest/browser')
    await browser.userEvent.keyboard('{Enter}')
    await waitFor(() => expect(args.onSave).toHaveBeenCalledWith({ name, colour: AUTOMATIC }))
  },
}

export const Cancel: Story = {
  // Cancel, the close and Escape cancel, adding nothing.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const first = await open(canvasElement, 'add', 'fa-IR')
    await userEvent.click(within(first.paper).getByRole('button', { name: i18n._('Cancel') }))
    await expect(args.onCancel).toHaveBeenCalledTimes(1)
    const second = await open(canvasElement, 'add', 'fa-IR')
    await userEvent.click(within(second.paper).getByRole('button', { name: i18n._('Close') }))
    await expect(args.onCancel).toHaveBeenCalledTimes(2)
    await open(canvasElement, 'add', 'fa-IR')
    await userEvent.keyboard('{Escape}')
    await expect(args.onCancel).toHaveBeenCalledTimes(3)
    await expect(args.onSave).not.toHaveBeenCalled()
  },
}

export const Edit: Story = {
  // Mode=Edit, 409 tall: the stage's name and colour, no suggestions, Save,
  // and Delete status in text/error at the footer's inline start.
  args: { mode: 'edit', stage: edited('fa-IR') },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const { dialog, paper } = await open(canvasElement, 'edit', 'fa-IR')
    const { primary } = await isTheFiles(dialog, paper, 'fa-IR', semantic)
    await expect(nameField(paper, 'fa-IR')).toHaveValue(args.stage.name)
    await expect(within(paper).getByText(counted('fa-IR', args.stage.name.length))).toBeVisible()
    await expect(within(paper).queryByRole('group', { name: i18n._('Suggestions') })).toBeNull()
    await expect(primary).toHaveTextContent(i18n._('Save'))
    const remove = within(paper).getByRole('button', { name: i18n._('Delete status') })
    await expect(getComputedStyle(remove).color).toBe(computed(remove, semantic['text/error']))
    await expect(getComputedStyle(remove).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    const row = primary.parentElement?.getBoundingClientRect()
    if (!row) throw new Error('the actions have no row')
    await expect(Math.round(row.right - remove.getBoundingClientRect().right)).toBe(0)
    await expect(paper.getBoundingClientRect().height).toBe(409)
  },
}

export const EditActions: Story = {
  // Save hands over the renamed stage; Delete status asks for the deletion.
  args: { mode: 'edit', stage: edited('fa-IR') },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const first = await open(canvasElement, 'edit', 'fa-IR')
    const field = nameField(first.paper, 'fa-IR')
    await userEvent.clear(field)
    await userEvent.type(field, i18n._('Final interview'))
    await userEvent.click(within(first.paper).getByRole('radio', { name: i18n._('Teal') }))
    await userEvent.click(within(first.paper).getByRole('button', { name: i18n._('Save') }))
    await expect(args.onSave).toHaveBeenCalledWith({ name: i18n._('Final interview'), colour: 'interview' })
    const second = await open(canvasElement, 'edit', 'fa-IR')
    // Opened again, it starts from the stage as it was given.
    await expect(nameField(second.paper, 'fa-IR')).toHaveValue(args.stage.name)
    await userEvent.click(within(second.paper).getByRole('button', { name: i18n._('Delete status') }))
    await expect(args.onDelete).toHaveBeenCalledOnce()
  },
}

export const InEnglish: Story = {
  // Add in English, read from the left, the chips in the same order from it.
  args: { takenNames: takenIn('en-US') },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const { dialog, paper } = await open(canvasElement, 'add', 'en-US')
    await isTheFiles(dialog, paper, 'en-US', semantic)
    await expect(within(paper).getByText(counted('en-US', 0))).toBeVisible()
    await suggestionsAre(paper, 'en-US', semantic, undefined)
  },
}

export const Dark: Story = {
  args: { mode: 'edit', stage: edited('fa-IR') },
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const { dialog, paper } = await open(canvasElement, 'edit', 'fa-IR')
    await isTheFiles(dialog, paper, 'fa-IR', darkSemantic)
    const remove = within(paper).getByRole('button', { name: i18n._('Delete status') })
    await expect(getComputedStyle(remove).color).toBe(computed(remove, darkSemantic['text/error']))
  },
}
