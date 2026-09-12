import { useLingui } from '@lingui/react'
import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test'
import type { Locale } from '../../i18n'
import { Button } from '../button'
import type { SelectOption } from '../select'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { ContactModal, type ContactModalProps, type ContactModalRecord, type ContactModalValues } from './ContactModal'

// The job opportunities a contact can belong to, written «company — title» as
// node 270:152's Select writes them, and a contact to edit, from the fixtures.
const jobsIn = (locale: Locale): SelectOption[] =>
  fixtures(locale).jobs.map((job) => ({ value: job.id, label: `${job.company} — ${job.title}` }))
const recordIn = (locale: Locale): ContactModalValues => {
  const [contact] = fixtures(locale).contacts
  if (!contact) throw new Error('the story fixtures have no contact')
  return {
    name: contact.fullName,
    role: contact.role,
    company: contact.company ?? '',
    email: contact.email ?? '',
    phone: contact.phone ?? '',
    linkedin: contact.linkedin ?? '',
    jobId: contact.jobId,
  }
}

// The modal opens from a trigger; saving and cancelling close it and call the args.
const WithTrigger = ({ onSave, onCancel, ...args }: ContactModalProps) => {
  const { i18n } = useLingui()
  const [open, setOpen] = useState(false)
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

const meta = {
  title: 'Shared/ContactModal',
  component: ContactModal,
  args: { open: false, mode: 'add', jobs: jobsIn('fa-IR'), onSave: fn(), onCancel: fn(), onDelete: fn() },
  parameters: { controls: { include: ['mode'] } },
  render: (args) => <WithTrigger {...args} />,
} satisfies StoryMeta<typeof ContactModal>

export default meta
type Story = StoryObj<typeof meta>

const body = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body)

// Opens the modal and returns it once its 150 ms dissolve has run.
const open = async (canvasElement: HTMLElement) => {
  await userEvent.click(within(canvasElement).getByRole('button'))
  const dialog = await body(canvasElement).findByRole('dialog')
  await waitFor(() => expect(dialog).toBeVisible())
  return dialog
}

export const Add: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // Node 270:152, Mode=Add: 560 wide, the header 68 and the footer 76, the
    // dividers edge to edge; the full name, the role beside the company, the
    // email beside the phone, the social link and the job opportunity; Cancel
    // and Save at the inline end, and no delete.
    const dialog = await open(canvasElement)
    const [header, top, form, bottom, footer] = [...dialog.children].filter((part) => part instanceof HTMLElement)
    if (!header || !top || !form || !bottom || !footer) throw new Error('the panel has not five parts')
    await expect(dialog.getBoundingClientRect().width).toBe(560)
    await expect([header.getBoundingClientRect().height, footer.getBoundingClientRect().height]).toEqual([68, 76])
    await expect([top.getBoundingClientRect().width, bottom.getBoundingClientRect().width]).toEqual([560, 560])
    const fields = within(form).getAllByRole('textbox')
    // Name, role, company, email, phone and the social link.
    await expect(fields).toHaveLength(6)
    const [, role, company] = fields
    await expect([
      Math.round(role?.parentElement?.getBoundingClientRect().width ?? 0),
      Math.round(company?.parentElement?.getBoundingClientRect().width ?? 0),
    ]).toEqual([248, 248])
    await expect(within(form).getByRole('combobox')).toBeVisible()
    await expect(within(footer).getAllByRole('button')).toHaveLength(2)
    await userEvent.keyboard('{Escape}')
  },
}

export const Edit: Story = {
  args: { mode: 'edit', recordId: FIRST_CONTACT.id, initial: { id: FIRST_CONTACT.id, values: recordIn('fa-IR') } },
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // Mode=Edit: filled from the record, and the delete at the inline end.
    const dialog = await open(canvasElement)
    const [name] = within(dialog).getAllByRole('textbox')
    // This story is an edit, so its initial is a record: the union says so.
    if (args.mode !== 'edit') throw new Error('this story is about editing a record')
    await expect(name).toHaveValue(args.initial?.values.name ?? '')
    const buttons = within(dialog).getAllByRole('button')
    const remove = buttons.at(-1)
    if (!remove) throw new Error('no delete')
    await userEvent.click(remove)
    await expect(args.onDelete).toHaveBeenCalledTimes(1)
    await userEvent.keyboard('{Escape}')
  },
}

export const SavesWithOnlyAName: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement, args }) => {
    // The owner's decision of KN-071: a full name and nothing else saves.
    const dialog = await open(canvasElement)
    const [name] = within(dialog).getAllByRole('textbox')
    if (!name) throw new Error('no name field')
    await userEvent.type(name, fixtures('fa-IR').contacts[2]?.fullName ?? 'missing')
    const save = within(dialog).getAllByRole('button').at(-1)
    if (!save) throw new Error('no save')
    await userEvent.click(save)
    await expect(args.onSave).toHaveBeenCalledWith({
      name: fixtures('fa-IR').contacts[2]?.fullName,
      role: '',
      company: '',
      email: '',
      phone: '',
      linkedin: '',
      jobId: null,
    })
  },
}

export const NameIsRequired: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement, args }) => {
    // Save with no name: the name field in its error state, nothing saved.
    const dialog = await open(canvasElement)
    const save = within(dialog).getAllByRole('button').at(-1)
    if (!save) throw new Error('no save')
    await userEvent.click(save)
    const [name] = within(dialog).getAllByRole('textbox')
    await expect(name).toHaveAttribute('aria-invalid', 'true')
    await expect(args.onSave).not.toHaveBeenCalled()
    await userEvent.keyboard('{Escape}')
  },
}

export const CancelDiscards: Story = {
  globals: { locale: 'fa-IR' },
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
  globals: { locale: 'fa-IR' },
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
  args: { jobs: jobsIn('en-US') },
  globals: { locale: 'en-US' },
  play: async ({ canvasElement }) => {
    const dialog = await open(canvasElement)
    await waitFor(() => expect(dialog).toBeVisible())
    await userEvent.keyboard('{Escape}')
  },
}

export const EnterSaves: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement, args }) => {
    // The owner, 2026-09-12: the fields are a form and its Save submits it, so
    // Enter in a field does what Save does, KN-463. The action sits in the
    // modal's footer, outside the fields, and names the form by id, which is
    // how a button submits a form it does not sit inside.
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
const Loading = ({ jobs, onSave, onCancel, held }: Pick<Extract<ContactModalProps, { mode: 'edit' }>, 'jobs' | 'onSave' | 'onCancel'> & { held?: ContactModalRecord }) => {
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
      <ContactModal open mode="edit" recordId={id} initial={record} jobs={jobs} onSave={onSave} onCancel={onCancel} />
    </>
  )
}

export const TheRecordArrivesAfterItsId: Story = {
  parameters: { controls: { disable: true } },
  globals: { locale: 'fa-IR' },
  render: (args) => (
    <Loading jobs={args.jobs} onSave={args.onSave} onCancel={args.onCancel} held={{ id: FIRST_CONTACT.id, values: recordIn('fa-IR') }} />
  ),
  play: async ({ args, canvasElement }) => {
    // KN-386 and KN-476: a page knows which record it wants before it has it,
    // so there is a render carrying the NEW id and the OLD record's values.
    // That render is the whole defect, so the parent starts holding the first
    // record rather than nothing: the form shows its values, then the second id
    // is asked for while those values are still what is being passed, and the
    // form must show nothing of them.
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    const name = () => body.getAllByRole('textbox')[0]

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
    await userEvent.click(body.getByRole('button', { name: 'ذخیره' }))
    await expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({ name: SECOND_CONTACT.fullName }))
  },
}

// A modal opened on a record that has not loaded, whose id never changes: the
// record simply arrives afterwards, KN-476.
const LateRecord = ({ jobs, onSave, onCancel }: Pick<Extract<ContactModalProps, { mode: 'edit' }>, 'jobs' | 'onSave' | 'onCancel'>) => {
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
      <ContactModal open mode="edit" recordId={FIRST_CONTACT.id} initial={record} jobs={jobs} onSave={onSave} onCancel={onCancel} />
    </>
  )
}

export const TheRecordArrivesAfterOpening: Story = {
  parameters: { controls: { disable: true } },
  globals: { locale: 'fa-IR' },
  render: (args) => <LateRecord jobs={args.jobs} onSave={args.onSave} onCancel={args.onCancel} />,
  play: async ({ args, canvasElement }) => {
    // The same rule seen the other way, and with the id NEVER changing, KN-476:
    // opened before its record exists, the form is empty and fills itself when
    // the record lands. A modal that started over only on a new id would stay
    // empty here for good.
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    await expect(body.getAllByRole('textbox')[0]).toHaveValue('')

    await userEvent.click(canvas.getByTestId('record-arrives'))
    await waitFor(async () => {
      await expect(body.getAllByRole('textbox')[0]).toHaveValue(FIRST_CONTACT.fullName)
    })
    await userEvent.click(body.getByRole('button', { name: 'ذخیره' }))
    await expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({ name: FIRST_CONTACT.fullName }))
  },
}
