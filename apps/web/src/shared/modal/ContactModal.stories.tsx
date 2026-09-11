import { useLingui } from '@lingui/react'
import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test'
import type { Locale } from '../../i18n'
import { Button } from '../button'
import type { SelectOption } from '../select'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { ContactModal, type ContactModalProps, type ContactModalValues } from './ContactModal'

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
const Rerendering = ({ initial, ...args }: ContactModalProps) => {
  const [, setTick] = useState(0)
  return (
    <>
      <WithTrigger {...args} {...(initial ? { initial: { ...initial } } : {})} />
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
  args: { mode: 'edit', initial: recordIn('fa-IR') },
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // Mode=Edit: filled from the record, and the delete at the inline end.
    const dialog = await open(canvasElement)
    const [name] = within(dialog).getAllByRole('textbox')
    await expect(name).toHaveValue(args.initial?.name ?? 'missing')
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
  args: { mode: 'edit', initial: recordIn('fa-IR'), recordId: FIRST_CONTACT.id },
  parameters: { controls: { disable: true } },
  globals: { locale: 'fa-IR' },
  render: (args) => <Rerendering {...args} />,
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
