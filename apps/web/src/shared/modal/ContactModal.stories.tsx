import { useLingui } from '@lingui/react'
import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { semantic, type SemanticToken } from '../../theme/tokens'
import { Button } from '../button'
import type { DefaultLabel, PersonLabel } from '../label-picker'
import type { LinkedJobItem } from '../linked-jobs'
import { quoted } from '../quoted'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { keyboardOf, type Keyboard } from '../story-fixtures/keyboard'
import { closeIsTheFiles } from './closeCheck'
import { ContactModal, type ContactModalProps, type ContactModalRecord, type ContactModalValues } from './ContactModal'

type Palette = Record<SemanticToken, string>

// The reader's own labels and the name each language makes a new one with;
// the default Mode=Edit chooses, «کارشناس جذب»; and the reader's two labels.
const FA = fixtures('fa-IR').labelPicker
const EN = fixtures('en-US').labelPicker
const RECRUITMENT: DefaultLabel = 'recruitment'
const [CLASSMATE, TEAMMATE] = FA.labels
if (!CLASSMATE || !TEAMMATE) throw new Error('the story fixtures have fewer than two labels of the reader’s own')

// The id the page gives the label it makes from the modal, after those it has.
type OwnPrefix = 'own-'
const OWN: OwnPrefix = 'own-'
const madeId = (labels: readonly PersonLabel[]) => `${OWN}${String(labels.length + 1)}`

// The reader's job opportunities as Linked Jobs lists and offers them, each with
// its status's name, from the fixtures.
const jobsIn = (locale: Locale): readonly LinkedJobItem[] => {
  const set = fixtures(locale)
  return set.jobs.slice(0, 5).map((job) => {
    const option = set.statusOptions.find((entry) => entry.token === job.status)
    if (!option) throw new Error('a job opportunity has a status the fixtures do not name')
    return { id: job.id, title: job.title, company: job.company, status: { token: option.token, name: option.name } }
  })
}
const [FIRST_JOB] = jobsIn('fa-IR')
if (!FIRST_JOB) throw new Error('the story fixtures have no job opportunity')

// The person Mode=Edit draws: the fixtures' first contact, «کارشناس جذب», and two
// job opportunities linked.
const recordIn = (locale: Locale): ContactModalValues => {
  const set = fixtures(locale)
  const [contact] = set.contacts
  const [first, , third] = set.jobs
  if (!contact || !first || !third) throw new Error('the story fixtures have no contact, or fewer than three job opportunities')
  return {
    name: contact.fullName,
    role: contact.role,
    company: contact.company ?? '',
    label: RECRUITMENT,
    email: contact.email ?? '',
    phone: contact.phone ?? '',
    linkedin: contact.linkedin ?? '',
    jobIds: [first.id, third.id],
  }
}

// The modal opens from a trigger; saving and cancelling close it and call the
// args. The reader's labels are held here, as the page's records hold them, so
// a label made, renamed or deleted in the modal is what it is handed next.
const WithTrigger = ({ onSave, onCancel, labels: given, onCreateLabel, onRenameLabel, onDeleteLabel, ...args }: ContactModalProps) => {
  const { i18n } = useLingui()
  const [open, setOpen] = useState(false)
  const [labels, setLabels] = useState(given)
  return (
    <>
      <Button
        onClick={() => {
          setOpen(true)
        }}
      >
        {i18n._('Add contact')}
      </Button>
      <ContactModal
        {...args}
        open={open}
        labels={labels}
        onCreateLabel={(name) => {
          const id = madeId(labels)
          setLabels([...labels, { id, name, people: 0 }])
          onCreateLabel(name)
          return id
        }}
        onRenameLabel={(id, name) => {
          setLabels(labels.map((label) => (label.id === id ? { ...label, name } : label)))
          onRenameLabel(id, name)
        }}
        onDeleteLabel={(id) => {
          setLabels(labels.filter((label) => label.id !== id))
          onDeleteLabel(id)
        }}
        onSave={(values) => {
          setOpen(false)
          onSave(values)
        }}
        onCancel={() => {
          setOpen(false)
          onCancel()
        }}
      />
    </>
  )
}

// The fixture record's id, and a second contact's name to type over it.
const [FIRST_CONTACT, SECOND_CONTACT] = fixtures('fa-IR').contacts
if (!FIRST_CONTACT || !SECOND_CONTACT) throw new Error('the story fixtures have fewer than two contacts')

// A parent that hands the modal a fresh copy of the record on every render, a
// new object with the same contents, as a query or a timer would, and renders
// again when its hidden tick is pressed, which only a story's play does,
// KN-347.
const Rerendering = ({ initial, ...args }: Extract<ContactModalProps, { mode: 'edit' }>) => {
  const [, setTick] = useState(0)
  return (
    <>
      <WithTrigger {...args} initial={initial === undefined ? undefined : { ...initial, values: { ...initial.values } }} />
      <button
        hidden
        data-testid="rerender"
        onClick={() => {
          setTick((tick) => tick + 1)
        }}
      />
    </>
  )
}

// The props of the mode the args hold, KN-348. The args of the meta are those of an
// edit, its record, its id and its delete, for the docs guard and the Actions panel,
// so the args of an Add story still carry all three, which an add refuses: the add
// is built from the args without them, as barFor does for the Bulk Action Bar.
type EditProps = Extract<ContactModalProps, { mode: 'edit' }>
type Shared = Pick<EditProps, 'jobs' | 'labels' | 'onCreateLabel' | 'onRenameLabel' | 'onDeleteLabel' | 'onSave' | 'onCancel'>
type Args = EditProps | (Shared & Pick<Extract<ContactModalProps, { mode: 'add' }>, 'mode' | 'open'>)
const sharedOf = (args: Shared): Shared => ({
  jobs: args.jobs,
  labels: args.labels,
  onCreateLabel: args.onCreateLabel,
  onRenameLabel: args.onRenameLabel,
  onDeleteLabel: args.onDeleteLabel,
  onSave: args.onSave,
  onCancel: args.onCancel,
})
const modalFor = (args: Args): ContactModalProps => (args.mode === 'edit' ? args : { mode: 'add', open: args.open, ...sharedOf(args) })

const meta = {
  title: 'Shared/ContactModal',
  component: ContactModal,
  args: {
    open: false,
    mode: 'edit',
    recordId: FIRST_CONTACT.id,
    initial: { id: FIRST_CONTACT.id, values: recordIn('fa-IR') },
    jobs: jobsIn('fa-IR'),
    labels: FA.labels,
    onCreateLabel: fn(),
    onRenameLabel: fn(),
    onDeleteLabel: fn(),
    onSave: fn(),
    onCancel: fn(),
    onDelete: fn(),
  },
  // The mode decides which props the modal takes, a record, its id and a delete to
  // edit and none of them to add, so it cannot change alone: an Add story switched
  // to Edit has no record and throws. Its row stays in the table, with no editor,
  // KN-571.
  argTypes: { mode: { control: false } },
  parameters: { controls: { include: ['mode'] } },
  render: (args) => <WithTrigger {...modalFor(args)} />,
} satisfies StoryMeta<typeof ContactModal>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A colour as the browser computes it, borrowed on the host's own inline style,
// which no transition moves, and put back in the same tick. Never inside
// waitFor, KN-014.
const computed = (host: HTMLElement, value: string) => {
  const previous = host.style.color
  host.style.color = value
  const result = getComputedStyle(host).color
  host.style.color = previous
  return result
}

const body = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body)

// Opens the modal and returns it once its 150 ms dissolve has run.
const open = async (canvasElement: HTMLElement) => {
  await userEvent.click(within(canvasElement).getByRole('button'))
  const dialog = await body(canvasElement).findByRole('dialog')
  await waitFor(() => expect(dialog).toBeVisible())
  return dialog
}

// The panel's five parts, and the form its body holds.
const partsOf = (dialog: HTMLElement) => {
  const [header, top, content, bottom, footer] = [...dialog.children].filter((part) => part instanceof HTMLElement)
  if (!header || !top || !content || !bottom || !footer) throw new Error('the panel has not five parts')
  const form = content.querySelector('form')
  if (!form) throw new Error('the panel holds no form')
  return { header, top, content, form, bottom, footer }
}

type Mode = ContactModalProps['mode']

// What node 270:152 draws round its fields in each mode, read 2026-11-04: 560
// wide on bg/surface, the header 68 with «افزودن به شبکه» or «ویرایش اطلاعات»
// and the close, the dividers edge to edge, and the footer 76: Cancel and the
// primary at the inline end, 12 apart and 24 in, the primary off, Button M's
// Disabled, gray/200 under text/disabled; and in Edit «حذف از شبکه» 24 in from
// the inline start.
const isTheShell = async (dialog: HTMLElement, mode: Mode, locale: Locale, palette: Palette) => {
  const i18n = i18nFor(locale)
  const title = mode === 'add' ? i18n._('Add to network') : i18n._('Edit details')
  const { header, top, bottom, footer } = partsOf(dialog)
  await expect(within(header).getByRole('heading', { level: 2 })).toHaveTextContent(title)
  await expect(dialog).toHaveAccessibleName(title)
  await closeIsTheFiles(dialog, locale, palette)
  await expect(getComputedStyle(dialog).backgroundColor).toBe(computed(dialog, palette['bg/surface']))
  await expect([dialog, top, bottom].map((part) => part.getBoundingClientRect().width)).toEqual([560, 560, 560])
  await expect([header, top, bottom, footer].map((part) => part.getBoundingClientRect().height)).toEqual([68, 1, 1, 76])
  await expect(getComputedStyle(top).backgroundColor).toBe(computed(dialog, palette['border/default']))

  const rtl = getComputedStyle(footer).direction === 'rtl'
  const edge = footer.getBoundingClientRect()
  // How far a box sits in from the footer's inline start, and from its end.
  const fromStart = (box: DOMRect) => Math.round(rtl ? edge.right - box.right : box.left - edge.left)
  const fromEnd = (box: DOMRect) => Math.round(rtl ? box.left - edge.left : edge.right - box.right)
  const cancel = within(footer).getByRole('button', { name: i18n._('Cancel') })
  const primary = within(footer).getByRole('button', { name: mode === 'add' ? i18n._('Add') : i18n._('Save') })
  const [cancelBox, primaryBox] = [cancel.getBoundingClientRect(), primary.getBoundingClientRect()]
  await expect(fromEnd(primaryBox)).toBe(24)
  await expect(Math.round(rtl ? cancelBox.left - primaryBox.right : primaryBox.left - cancelBox.right)).toBe(12)
  await expect(primary).toBeDisabled()
  const look = getComputedStyle(primary)
  await expect([look.backgroundColor, look.color]).toEqual([
    computed(dialog, palette['gray/200']),
    computed(dialog, palette['text/disabled']),
  ])
  const remove = within(footer).queryByRole('button', { name: i18n._('Delete from network') })
  if (mode === 'add') await expect(remove).toBeNull()
  else {
    if (!remove) throw new Error('Edit draws no delete')
    await expect(fromStart(remove.getBoundingClientRect())).toBe(24)
  }
  await expect(within(footer).getAllByRole('button')).toHaveLength(mode === 'add' ? 2 : 3)
}

// The body of each mode, in the file's Persian: Add's 530 and Edit's 623, 24 in
// and 16 between, «اسم و فامیل», «سمت» beside «شرکت», the Label Picker, «ایمیل»
// beside «شماره تماس», «لینک شبکه اجتماعی» and Linked Jobs, each 512 or two of 248;
// Add with no label and nothing linked, Edit with «کارشناس جذب» and two rows.
const BODIES: Record<Mode, { height: number; heights: readonly number[] }> = {
  add: { height: 530, heights: [64, 64, 56, 64, 64, 90] },
  edit: { height: 623, heights: [64, 64, 56, 64, 64, 183] },
}
const isTheBody = async (dialog: HTMLElement, mode: Mode) => {
  const i18n = i18nFor('fa-IR')
  const frame = BODIES[mode]
  const { content, form } = partsOf(dialog)
  // The whole frame where the window has room for it, else 16 short of the
  // window at either end, the body scrolling under the header and the footer.
  await expect(dialog.getBoundingClientRect().height).toBe(Math.min(68 + 1 + frame.height + 1 + 76, window.innerHeight - 32))
  await expect(content.scrollHeight).toBe(frame.height)
  const origin = content.getBoundingClientRect().top - content.scrollTop
  const fields = [...form.children].filter((field) => field instanceof HTMLElement)
  const tops = frame.heights.map((_, index) => 24 + frame.heights.slice(0, index).reduce((sum, height) => sum + height + 16, 0))
  await expect(fields.map((field) => Math.round(field.getBoundingClientRect().top - origin))).toEqual(tops)
  await expect(fields.map((field) => Math.round(field.getBoundingClientRect().height))).toEqual(frame.heights)
  await expect(fields.map((field) => field.getBoundingClientRect().width)).toEqual(frame.heights.map(() => 512))
  for (const pair of [fields[1], fields[3]]) {
    if (!pair) throw new Error('the pairs are missing')
    await expect([...pair.children].map((field) => field.getBoundingClientRect().width)).toEqual([248, 248])
    await expect(px(getComputedStyle(pair).columnGap)).toBe(16)
  }
  const group = within(dialog).getByRole('group', { name: i18n._('Label') })
  await expect(
    within(group)
      .queryAllByRole('button', { pressed: true })
      .map((choice) => choice.textContent),
  ).toEqual(mode === 'add' ? [] : [i18n._('Recruitment specialist')])
  const linked = within(dialog).queryByRole('list', { name: i18n._('Linked job opportunities') })
  if (mode === 'add') {
    await expect(linked).toBeNull()
    await expect(within(dialog).getByText(i18n._('Not linked to a job opportunity yet.'))).toBeVisible()
  } else {
    if (!linked) throw new Error('Edit links nothing')
    await expect(within(linked).getAllByRole('listitem')).toHaveLength(2)
  }
}

export const Add: Story = {
  args: { mode: 'add' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // Node 270:74, Mode=Add.
    const dialog = await open(canvasElement)
    await isTheShell(dialog, 'add', 'fa-IR', semantic)
    await isTheBody(dialog, 'add')
    await userEvent.keyboard('{Escape}')
  },
}

export const Edit: Story = {
  args: { mode: 'edit', recordId: FIRST_CONTACT.id, initial: { id: FIRST_CONTACT.id, values: recordIn('fa-IR') } },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Node 270:151, Mode=Edit: filled from the record, the delete at the inline start.
    const dialog = await open(canvasElement)
    await isTheShell(dialog, 'edit', 'fa-IR', semantic)
    await isTheBody(dialog, 'edit')
    // This story is an edit, so its initial is a record: the union says so.
    if (args.mode !== 'edit') throw new Error('this story is about editing a record')
    await expect(within(dialog).getAllByRole('textbox')[0]).toHaveValue(args.initial?.values.name ?? '')
    await userEvent.click(within(dialog).getByRole('button', { name: i18nFor('fa-IR')._('Delete from network') }))
    await expect(args.onDelete).toHaveBeenCalledTimes(1)
    await userEvent.keyboard('{Escape}')
  },
}

export const AddTurnsOnWithAName: Story = {
  // «افزودن» is off until a name is written, the only field a person needs, and
  // off again when only spaces are left.
  args: { mode: 'add' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const dialog = await open(canvasElement)
    const add = within(dialog).getByRole('button', { name: i18nFor('fa-IR')._('Add') })
    const [name] = within(dialog).getAllByRole('textbox')
    if (!name) throw new Error('no name field')
    await expect(add).toBeDisabled()
    await userEvent.type(name, SECOND_CONTACT.fullName)
    await expect(add).toBeEnabled()
    await userEvent.clear(name)
    await userEvent.type(name, '   ')
    await expect(add).toBeDisabled()
    await userEvent.keyboard('{Escape}')
  },
}

export const EditTurnsOnWithAChange: Story = {
  // «ذخیره» is off over the record as it is, on once anything differs, and off
  // again when it is put back, or when the name is gone.
  args: { mode: 'edit', recordId: FIRST_CONTACT.id, initial: { id: FIRST_CONTACT.id, values: recordIn('fa-IR') } },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const dialog = await open(canvasElement)
    const save = within(dialog).getByRole('button', { name: i18n._('Save') })
    const [name, role] = within(dialog).getAllByRole('textbox')
    if (!name || !role) throw new Error('no name or role field')
    await expect(save).toBeDisabled()
    await userEvent.clear(role)
    await userEvent.type(role, SECOND_CONTACT.role)
    await expect(save).toBeEnabled()
    await userEvent.clear(role)
    await userEvent.type(role, recordIn('fa-IR').role)
    await expect(save).toBeDisabled()
    const group = within(dialog).getByRole('group', { name: i18n._('Label') })
    await userEvent.click(within(group).getByRole('button', { name: i18n._('Acquaintance') }))
    await expect(save).toBeEnabled()
    await userEvent.click(within(group).getByRole('button', { name: i18n._('Recruitment specialist') }))
    await expect(save).toBeDisabled()
    await userEvent.clear(role)
    await expect(save).toBeEnabled()
    await userEvent.clear(name)
    await expect(save).toBeDisabled()
    await userEvent.keyboard('{Escape}')
  },
}

export const SavesWithOnlyAName: Story = {
  args: { mode: 'add' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement, args }) => {
    // The owner's decision of KN-071: a full name and nothing else saves, and a role
    // or a company of only spaces is nothing, saved empty, KN-385.
    const dialog = await open(canvasElement)
    const [name, role, company] = within(dialog).getAllByRole('textbox')
    if (!name || !role || !company) throw new Error('no name, role or company field')
    await userEvent.type(name, fixtures('fa-IR').contacts[2]?.fullName ?? 'missing')
    await userEvent.type(role, '   ')
    await userEvent.type(company, ' ')
    await userEvent.click(within(dialog).getByRole('button', { name: i18nFor('fa-IR')._('Add') }))
    await expect(args.onSave).toHaveBeenCalledWith({
      name: fixtures('fa-IR').contacts[2]?.fullName,
      role: '',
      company: '',
      label: null,
      email: '',
      phone: '',
      linkedin: '',
      jobIds: [],
    })
  },
}

export const ChoosingAndMakingALabel: Story = {
  // A press chooses a default; «برچسب تازه» makes one of the reader's own, which
  // the modal then chooses, and the Enter that makes it saves nothing. The
  // person saves with the label made.
  args: { mode: 'add' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const dialog = await open(canvasElement)
    const [name] = within(dialog).getAllByRole('textbox')
    if (!name) throw new Error('no name field')
    await userEvent.type(name, SECOND_CONTACT.fullName)
    const group = within(dialog).getByRole('group', { name: i18n._('Label') })
    await userEvent.click(within(group).getByRole('button', { name: i18n._('Former colleague') }))
    await expect(within(group).getByRole('button', { pressed: true })).toHaveTextContent(i18n._('Former colleague'))
    await userEvent.click(within(group).getByRole('button', { name: i18n._('New label') }))
    const input = within(group).getByRole('combobox', { name: i18n._('New label') })
    await expect(input).toHaveFocus()
    await userEvent.type(input, FA.newName)
    await userEvent.keyboard('{Enter}')
    await expect(args.onCreateLabel).toHaveBeenCalledWith(FA.newName)
    await expect(args.onSave).not.toHaveBeenCalled()
    await expect(within(group).getByRole('button', { pressed: true })).toHaveTextContent(FA.newName)
    await userEvent.click(within(dialog).getByRole('button', { name: i18n._('Add') }))
    await expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({ name: SECOND_CONTACT.fullName, label: madeId(FA.labels) }))
  },
}

// Types the start of a name into the new label, which suggests both of the
// reader's labels, and finds the picker and its suggestions.
const suggestionsIn = async (dialog: HTMLElement) => {
  const i18n = i18nFor('fa-IR')
  const group = within(dialog).getByRole('group', { name: i18n._('Label') })
  await userEvent.click(within(group).getByRole('button', { name: i18n._('New label') }))
  await userEvent.type(within(group).getByRole('combobox', { name: i18n._('New label') }), FA.query)
  return { group, list: within(dialog).getByRole('listbox') }
}

// Opens «⋯» on one of the reader's labels in the suggestions, and finds its menu.
const manage = async (list: HTMLElement, name: string) => {
  const i18n = i18nFor('fa-IR')
  await userEvent.click(within(list).getByRole('button', { name: `${i18n._('Manage the label')} ${quoted(i18n, name)}` }))
  return within(list.ownerDocument.body).findByRole('menu')
}

// The person carries the reader's first label.
const WITH_CLASSMATE: ContactModalRecord = { id: FIRST_CONTACT.id, values: { ...recordIn('fa-IR'), label: CLASSMATE.id } }

export const RenamingALabel: Story = {
  // A rename in the label's row, kept with Enter, renames it where the person
  // carries it, and saves nothing, though the form inside it has a change.
  args: { mode: 'edit', recordId: FIRST_CONTACT.id, initial: WITH_CLASSMATE },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const dialog = await open(canvasElement)
    const [, role] = within(dialog).getAllByRole('textbox')
    if (!role) throw new Error('no role field')
    await userEvent.clear(role)
    await userEvent.type(role, SECOND_CONTACT.role)
    const { group, list } = await suggestionsIn(dialog)
    await userEvent.click(within(await manage(list, CLASSMATE.name)).getByRole('menuitem', { name: i18n._('Rename') }))
    const rename = await within(list).findByRole('textbox', { name: i18n._('New name') })
    await waitFor(() => expect(rename).toHaveFocus())
    await userEvent.clear(rename)
    await userEvent.type(rename, FA.newName)
    await userEvent.keyboard('{Enter}')
    await expect(args.onRenameLabel).toHaveBeenCalledWith(CLASSMATE.id, FA.newName)
    await expect(args.onSave).not.toHaveBeenCalled()
    await expect(dialog).toBeVisible()
    await expect(within(group).getByRole('button', { pressed: true })).toHaveTextContent(FA.newName)
  },
}

export const DeletingTheChosenLabel: Story = {
  // A delete asks in the label's row and takes the label off. Another label
  // leaves the person's as it is; their own leaves them with none, which is
  // then a change to save.
  args: { mode: 'edit', recordId: FIRST_CONTACT.id, initial: WITH_CLASSMATE },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const dialog = await open(canvasElement)
    const save = within(dialog).getByRole('button', { name: i18n._('Save') })
    await expect(save).toBeDisabled()
    const { group, list } = await suggestionsIn(dialog)
    const remove = async (name: string) => {
      await userEvent.click(within(await manage(list, name)).getByRole('menuitem', { name: i18n._('Delete label') }))
      await userEvent.click(await within(list).findByRole('button', { name: i18n._('Delete') }))
    }
    await remove(TEAMMATE.name)
    await expect(args.onDeleteLabel).toHaveBeenCalledWith(TEAMMATE.id)
    await expect(within(group).getByRole('button', { pressed: true })).toHaveTextContent(CLASSMATE.name)
    await expect(save).toBeDisabled()
    await remove(CLASSMATE.name)
    await expect(args.onDeleteLabel).toHaveBeenCalledWith(CLASSMATE.id)
    await expect(within(group).queryByRole('button', { pressed: true })).toBeNull()
    await expect(save).toBeEnabled()
    await userEvent.click(save)
    await expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({ label: null }))
  },
}

export const LinkingAndUnlinking: Story = {
  // A job opportunity unlinked leaves the list, one chosen from the picker
  // joins it, and the save carries what is linked, in that order.
  args: { mode: 'edit', recordId: FIRST_CONTACT.id, initial: { id: FIRST_CONTACT.id, values: recordIn('fa-IR') } },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const jobs = jobsIn('fa-IR')
    const linked = recordIn('fa-IR').jobIds
    const [first, second] = linked.map((id) => jobs.find((job) => job.id === id))
    const target = jobs.find((job) => !linked.includes(job.id))
    if (!first || !second || !target) throw new Error('the record links fewer than two of the fixtures, or all of them')
    const dialog = await open(canvasElement)
    const list = within(dialog).getByRole('list', { name: i18n._('Linked job opportunities') })
    await userEvent.click(within(within(list).getByRole('group', { name: first.title })).getByRole('button', { name: i18n._('Unlink') }))
    await expect(within(list).queryByRole('group', { name: first.title })).toBeNull()
    const save = within(dialog).getByRole('button', { name: i18n._('Save') })
    await expect(save).toBeEnabled()
    await userEvent.click(within(dialog).getByRole('button', { name: i18n._('Link to a job opportunity') }))
    const listbox = await body(canvasElement).findByRole('listbox')
    await userEvent.click(within(listbox).getByText(target.title))
    await waitFor(() => expect(body(canvasElement).queryByRole('listbox')).toBeNull())
    await expect(within(list).getAllByRole('group')).toHaveLength(2)
    await userEvent.click(save)
    await expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({ jobIds: [second.id, target.id] }))
  },
}

// Added from inside a job opportunity: nothing written yet, and that one linked.
const FROM_A_JOB: ContactModalValues = {
  name: '',
  role: '',
  company: '',
  label: null,
  email: '',
  phone: '',
  linkedin: '',
  jobIds: [FIRST_JOB.id],
}

export const AddFromAJobOpportunity: Story = {
  // Added from inside a job opportunity, the person starts linked to it, and
  // «افزودن» still waits for the name. A fixed start, so no control applies.
  args: { mode: 'add' },
  parameters: { controls: { disable: true } },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  render: (args) => <WithTrigger mode="add" open={false} initial={FROM_A_JOB} {...sharedOf(args)} />,
  play: async ({ canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const dialog = await open(canvasElement)
    const list = within(dialog).getByRole('list', { name: i18n._('Linked job opportunities') })
    await expect(
      within(list)
        .getAllByRole('group')
        .map((row) => row.textContent.includes(FIRST_JOB.title)),
    ).toEqual([true])
    await expect(within(dialog).getByRole('button', { name: i18n._('Add') })).toBeDisabled()
    await userEvent.keyboard('{Escape}')
  },
}

export const CancelDiscards: Story = {
  args: { mode: 'add' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement, args }) => {
    // What was typed goes with Cancel, and the next opening starts empty.
    let dialog = await open(canvasElement)
    const [name] = within(dialog).getAllByRole('textbox')
    if (!name) throw new Error('no name field')
    await userEvent.type(name, fixtures('fa-IR').contacts[0]?.fullName ?? 'missing')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(body(canvasElement).queryByRole('dialog')).toBeNull())
    await expect(args.onCancel).toHaveBeenCalledTimes(1)
    await expect(args.onSave).not.toHaveBeenCalled()
    dialog = await open(canvasElement)
    await expect(within(dialog).getAllByRole('textbox')[0]).toHaveValue('')
    await userEvent.keyboard('{Escape}')
  },
}

export const KeepsTypingThroughARerender: Story = {
  // The parent renders again while a name is being typed, handing over a new
  // copy of the same record: the form keeps what is typed, since it starts
  // again only on opening or on another record's id, KN-347. A fixed parent,
  // so no control applies.
  args: { mode: 'edit', recordId: FIRST_CONTACT.id, initial: { id: FIRST_CONTACT.id, values: recordIn('fa-IR') } },
  parameters: { controls: { disable: true } },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  render: (args) => {
    if (args.mode !== 'edit') throw new Error('this story is about editing a record')
    return <Rerendering {...args} />
  },
  play: async ({ canvasElement }) => {
    const dialog = await open(canvasElement)
    const [name] = within(dialog).getAllByRole('textbox')
    if (!name) throw new Error('no name field')
    await userEvent.clear(name)
    await userEvent.type(name, SECOND_CONTACT.fullName)
    await fireEvent.click(within(canvasElement).getByTestId('rerender'))
    await expect(name).toHaveValue(SECOND_CONTACT.fullName)
  },
}

export const InEnglish: Story = {
  // Mode=Add in English: the frame round its fields, which wrap the labels to
  // the language's own widths.
  args: { mode: 'add', jobs: jobsIn('en-US'), labels: EN.labels },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await isTheShell(await open(canvasElement), 'add', 'en-US', semantic)
    await userEvent.keyboard('{Escape}')
  },
}

export const EditInEnglish: Story = {
  // Mode=Edit in English, «حذف از شبکه» as Delete from network at the left.
  args: {
    mode: 'edit',
    recordId: FIRST_CONTACT.id,
    initial: { id: FIRST_CONTACT.id, values: recordIn('en-US') },
    jobs: jobsIn('en-US'),
    labels: EN.labels,
  },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const i18n = i18nFor('en-US')
    const dialog = await open(canvasElement)
    await isTheShell(dialog, 'edit', 'en-US', semantic)
    const group = within(dialog).getByRole('group', { name: i18n._('Label') })
    await expect(within(group).getByRole('button', { pressed: true })).toHaveTextContent(i18n._('Recruitment specialist'))
    await userEvent.keyboard('{Escape}')
  },
}

export const Dark: Story = {
  // Mode=Edit in the dark theme, in the theme's dark colours.
  args: { mode: 'edit', recordId: FIRST_CONTACT.id, initial: { id: FIRST_CONTACT.id, values: recordIn('fa-IR') } },
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    const dialog = await open(canvasElement)
    await isTheShell(dialog, 'edit', 'fa-IR', darkSemantic)
    await isTheBody(dialog, 'edit')
    await userEvent.keyboard('{Escape}')
  },
}

export const DarkInEnglish: Story = {
  // Mode=Edit in English in the dark theme.
  args: {
    mode: 'edit',
    recordId: FIRST_CONTACT.id,
    initial: { id: FIRST_CONTACT.id, values: recordIn('en-US') },
    jobs: jobsIn('en-US'),
    labels: EN.labels,
  },
  globals: { locale: 'en-US', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    await isTheShell(await open(canvasElement), 'edit', 'en-US', darkSemantic)
    await userEvent.keyboard('{Escape}')
  },
}

export const EnterSaves: Story = {
  args: { mode: 'add' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement, args }) => {
    // The owner, 2026-09-12: the fields are a form and its primary submits it,
    // so Enter in a field does what the primary does, KN-463. The action sits
    // in the modal's footer, outside the fields, and names the form by id,
    // which is how a button submits a form it does not sit inside.
    const dialog = await open(canvasElement)
    const [name] = within(dialog).getAllByRole('textbox')
    if (!name) throw new Error('no name field')
    const person = fixtures('fa-IR').contacts[2]?.fullName ?? ''
    await userEvent.type(name, person)

    // The runner's own keyboard, KN-225: implicit submission is the BROWSER's,
    // and a synthetic Enter cannot ask for it. testing-library stands in for it
    // by clicking a submit button inside the form, and this one is in the
    // modal's footer, associated by id, so only a real key press proves it.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const browser = await import('vitest/browser')
    await browser.userEvent.keyboard('{Enter}')
    await waitFor(async () => {
      await expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({ name: person }))
    })
  },
}

// A parent that hands over the id first and the record afterwards, which is
// what a page does when it knows WHICH record it wants before it has loaded it.
const Loading = ({ held, onDelete, ...shared }: Shared & Pick<EditProps, 'onDelete'> & { held?: ContactModalRecord }) => {
  // Starts holding whatever record the story gives it, so a story can render
  // the SECOND id while the FIRST record's values are still the ones being
  // passed. That one render is the whole defect, KN-476.
  const [record, setRecord] = useState<ContactModalRecord | undefined>(held)
  const [id, setId] = useState(FIRST_CONTACT.id)
  return (
    <>
      <button
        data-testid="ask-for-second"
        type="button"
        onClick={() => {
          // The id alone: the record for it has not arrived.
          setId(SECOND_CONTACT.id)
        }}
      />
      <button
        data-testid="record-arrives"
        type="button"
        onClick={() => {
          setRecord({ id: SECOND_CONTACT.id, values: { ...recordIn('fa-IR'), name: SECOND_CONTACT.fullName } })
        }}
      />
      <ContactModal open mode="edit" recordId={id} initial={record} onDelete={onDelete} {...sharedOf(shared)} />
    </>
  )
}

// A change to the label, which an edit waits for before it saves.
const chooseAcquaintance = async (canvasElement: HTMLElement) => {
  const i18n = i18nFor('fa-IR')
  const group = body(canvasElement).getByRole('group', { name: i18n._('Label') })
  await userEvent.click(within(group).getByRole('button', { name: i18n._('Acquaintance') }))
}

export const TheRecordArrivesAfterItsId: Story = {
  parameters: { controls: { disable: true } },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  render: (args) => {
    if (args.mode !== 'edit') throw new Error('this story is about editing a record')
    return <Loading {...sharedOf(args)} onDelete={args.onDelete} held={{ id: FIRST_CONTACT.id, values: recordIn('fa-IR') }} />
  },
  play: async ({ args, canvasElement }) => {
    // KN-386 and KN-476: a page knows which record it wants before it has it,
    // so there is a render carrying the NEW id and the OLD record's values.
    // That render is the whole defect, so the parent starts holding the first
    // record rather than nothing: the form shows its values, then the second id
    // is asked for while those values are still what is being passed, and the
    // form must show nothing of them.
    const canvas = within(canvasElement)
    const name = () => body(canvasElement).getAllByRole('textbox')[0]

    // The first record, shown because the form follows what it is given.
    await waitFor(async () => {
      await expect(name()).toHaveValue(recordIn('fa-IR').name)
    })

    // The second id alone: the values in hand are still the first record's.
    await userEvent.click(canvas.getByTestId('ask-for-second'))
    await waitFor(async () => {
      await expect(name()).toHaveValue('')
    })

    await userEvent.click(canvas.getByTestId('record-arrives'))
    await waitFor(async () => {
      await expect(name()).toHaveValue(SECOND_CONTACT.fullName)
    })

    // And saving now saves the SECOND record's values, never the first's.
    await chooseAcquaintance(canvasElement)
    await userEvent.click(body(canvasElement).getByRole('button', { name: i18nFor('fa-IR')._('Save') }))
    await expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({ name: SECOND_CONTACT.fullName }))
  },
}

// A modal opened on a record that has not loaded, whose id never changes: the
// record simply arrives afterwards, KN-476.
const LateRecord = ({ onDelete, ...shared }: Shared & Pick<EditProps, 'onDelete'>) => {
  const [record, setRecord] = useState<ContactModalRecord | undefined>(undefined)
  return (
    <>
      <button
        data-testid="record-arrives"
        type="button"
        onClick={() => {
          setRecord({ id: FIRST_CONTACT.id, values: { ...recordIn('fa-IR'), name: FIRST_CONTACT.fullName } })
        }}
      />
      <ContactModal open mode="edit" recordId={FIRST_CONTACT.id} initial={record} onDelete={onDelete} {...sharedOf(shared)} />
    </>
  )
}

export const TheRecordArrivesAfterOpening: Story = {
  parameters: { controls: { disable: true } },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  render: (args) => {
    if (args.mode !== 'edit') throw new Error('this story is about editing a record')
    return <LateRecord {...sharedOf(args)} onDelete={args.onDelete} />
  },
  play: async ({ args, canvasElement }) => {
    // The same rule seen the other way, and with the id NEVER changing, KN-476:
    // opened before its record exists, the form is empty and fills itself when
    // the record lands. A modal that started over only on a new id would stay
    // empty here for good.
    const canvas = within(canvasElement)
    await expect(body(canvasElement).getAllByRole('textbox')[0]).toHaveValue('')

    await userEvent.click(canvas.getByTestId('record-arrives'))
    await waitFor(async () => {
      await expect(body(canvasElement).getAllByRole('textbox')[0]).toHaveValue(FIRST_CONTACT.fullName)
    })
    await chooseAcquaintance(canvasElement)
    await userEvent.click(body(canvasElement).getByRole('button', { name: i18nFor('fa-IR')._('Save') }))
    await expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({ name: FIRST_CONTACT.fullName }))
  },
}

// What every field of the modal declares, KN-464: an email, a phone and a link each
// their own keyboard, every key saving, and nothing offered from the reader's own
// details, since the record is somebody else's.
const WORDS: Keyboard = { type: 'text', inputMode: null, enterKeyHint: 'done', autoComplete: 'off' }
const EMAIL: Keyboard = { ...WORDS, type: 'email' }
const PHONE_NUMBER: Keyboard = { ...WORDS, type: 'tel' }
const LINK: Keyboard = { ...WORDS, type: 'url' }

const fieldsIn =
  (locale: Locale): NonNullable<Story['play']> =>
  async ({ canvasElement }) => {
    const dialog = await open(canvasElement)
    const i18n = i18nFor(locale)
    const expected: [string, Keyboard][] = [
      [i18n._('Full name'), WORDS],
      [i18n._('Role'), WORDS],
      [i18n._('Company'), WORDS],
      [i18n._('Email'), EMAIL],
      [i18n._('Phone'), PHONE_NUMBER],
      [i18n._('Social link'), LINK],
    ]
    for (const [label, keyboard] of expected) {
      await expect(keyboardOf(within(dialog).getByRole('textbox', { name: label })), label).toEqual(keyboard)
    }
    await userEvent.keyboard('{Escape}')
  }

export const KeyboardsForEachField: Story = {
  args: { mode: 'add' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: fieldsIn('fa-IR'),
}

export const KeyboardsForEachFieldInEnglish: Story = {
  args: { mode: 'add', jobs: jobsIn('en-US'), labels: EN.labels },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: fieldsIn('en-US'),
}
