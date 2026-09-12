import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, spyOn, userEvent, waitFor, within } from 'storybook/test'
import { formatCount } from '../i18n/formatCount'
import { defaultStatuses, jobFrom, RecordsProvider, type JobEntry, type Records } from '../core/records'
import { emptyDraft } from '../shared/add-job'
import type { StoryMeta } from '../shared/story-docs/story-meta'
import { fixtures } from '../shared/story-fixtures'
import { JobsScreen } from './JobsScreen'

// A board of the fixtures' own job opportunities, one per status, so the screen
// draws what the design draws rather than a made-up set, KN-062.
const seeded = (): Records => {
  const set = fixtures('fa-IR')
  const statuses = defaultStatuses((token) => set.names[token])
  const jobs: JobEntry[] = set.jobs.slice(0, 5).map((job, at) =>
    jobFrom(
      {
        ...emptyDraft(statuses[at % statuses.length]?.id ?? ''),
        title: job.title,
        company: job.company,
        location: job.location,
        postedAt: job.postedAt,
        postingUrl: job.link ?? '',
      },
      // Added a day apart, built rather than written: a date's own letters are
      // not copy, and the lint rule cannot tell them from a sentence.
      new Date(Date.UTC(2026, 8, at + 1, 9)).toISOString(),
    ),
  )
  return { statuses, jobs, contacts: [] }
}

const meta = {
  title: 'Screens/Jobs',
  component: JobsScreen,
  parameters: { layout: 'fullscreen' },
  args: { addOpen: false, onAddClose: fn() },
  decorators: [
    (Story, context) => (
      // Each story gets its own records, so one cannot change what another
      // draws; the provider is seeded rather than read from the browser.
      // `seeded` is false for a story about a board with nothing on it.
      <RecordsProvider initial={context.parameters.seeded === false ? { statuses: seeded().statuses, jobs: [], contacts: [] } : seeded()}>
        <Story />
      </RecordsProvider>
    ),
  ],
} satisfies StoryMeta<typeof JobsScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Board: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // A column for each status the board holds, named as the reader named it,
    // and the first fixture's job opportunity in one of them.
    const set = fixtures('fa-IR')
    // Each column's name as the reader has it, read from the same place the
    // board reads it rather than written out here.
    for (const status of defaultStatuses((token) => set.names[token])) {
      await expect(canvas.getAllByText(status.name).length).toBeGreaterThan(0)
    }
    await expect(canvas.getByText(set.jobs[0]?.title ?? '')).toBeInTheDocument()
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US' },
}

export const Empty: Story = {
  parameters: { seeded: false },
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // With nothing added the board gives way to the empty state, which offers
    // the one thing there is to do.
    const canvas = within(canvasElement)
    await expect(canvas.getAllByRole('button', { name: /افزودن فرصت شغلی/ }).length).toBeGreaterThan(0)
  },
}

export const AddingFromTheAddress: Story = {
  args: { addOpen: true },
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // The add destination IS the add flow: the address opens it, and closing it
    // says so, which is what puts the address back on the board.
    const dialog = within(canvasElement.ownerDocument.body).getByRole('dialog')
    await expect(dialog).toBeInTheDocument()
    await userEvent.click(within(dialog).getByRole('button', { name: 'انصراف' }))
  },
}

export const Working: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    const set = fixtures('fa-IR')
    const first = set.jobs[0]?.title ?? ''

    // Searching narrows every column at once, and clearing it brings them back.
    const search = canvas.getByRole('searchbox')
    await userEvent.type(search, set.jobs[1]?.title ?? '')
    await waitFor(async () => {
      await expect(canvas.queryByText(first)).toBeNull()
    })
    await userEvent.clear(search)
    await waitFor(async () => {
      await expect(canvas.getByText(first)).toBeInTheDocument()
    })

    // A card opens the job opportunity, and the modal closes again.
    await userEvent.click(canvas.getByRole('button', { name: first }))
    const modal = await body.findByRole('dialog')
    await userEvent.click(within(modal).getByRole('button', { name: 'بستن' }))

    // Selecting a card brings up the bulk bar, which moves it to another
    // status through the same modal a single card uses. The checkbox is folded
    // away until the card is hovered, KN-341, so the card is hovered first.
    const card = canvas.getByRole('button', { name: first }).closest('article')
    if (!card) throw new Error('the card has no article around it')
    await userEvent.hover(card)
    await userEvent.click(within(card).getByRole('checkbox'))
    const bar = await canvas.findByRole('region', { name: 'کارهای گروهی' })
    await userEvent.click(within(bar).getByRole('button', { name: 'تغییر وضعیت' }))
    const change = await body.findByRole('dialog')
    await userEvent.click(within(change).getByRole('radio', { name: set.names.offer }))
    await userEvent.click(within(change).getByRole('button', { name: 'تأیید' }))

    // And the column it moved TO now holds it, read inside that column: the
    // card was on the board before the move as well, so finding the title
    // anywhere proves nothing about where it went.
    await waitFor(async () => {
      await expect(within(canvas.getByRole('region', { name: set.names.offer })).getByText(first)).toBeInTheDocument()
    })
  },
}

export const Managing: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    const set = fixtures('fa-IR')
    const first = set.jobs[0]?.title ?? ''
    const gone = async () => {
      // MUI hides the page from the accessibility tree while a modal is open.
      await waitFor(async () => {
        await expect(body.queryByRole('dialog')).toBeNull()
      })
    }

    // A column's menu renames it, and the board shows the new name.
    const columns = defaultStatuses((token) => set.names[token])
    const savedName = columns[0]?.name ?? ''
    await userEvent.click(canvas.getByRole('button', { name: `کارهای وضعیت: ${savedName}` }))
    await userEvent.click(await body.findByRole('menuitem', { name: 'تغییر نام' }))
    const rename = await body.findByRole('dialog')
    await userEvent.clear(within(rename).getByRole('textbox'))
    await userEvent.type(within(rename).getByRole('textbox'), 'در انتظار پاسخ')
    await userEvent.click(within(rename).getByRole('button', { name: 'ذخیره' }))
    await gone()
    await expect(canvas.getByText('در انتظار پاسخ')).toBeInTheDocument()

    // A column is added at the end of the board.
    await userEvent.click(canvas.getByRole('button', { name: 'افزودن وضعیت' }))
    await waitFor(async () => {
      await expect(canvas.getAllByText('وضعیت تازه').length).toBeGreaterThan(0)
    })

    // A job opportunity is deleted from its own modal, where the control is not
    // folded behind a hover the synthetic pointer cannot set, KN-365.
    await userEvent.click(canvas.getByRole('button', { name: first }))
    const open = await body.findByRole('dialog')
    await userEvent.click(within(open).getByRole('button', { name: 'حذف فرصت شغلی' }))
    const confirm = await body.findByRole('dialog')
    await userEvent.click(within(confirm).getByRole('button', { name: 'حذف' }))
    await gone()
    await waitFor(async () => {
      await expect(canvas.queryByText(first)).toBeNull()
    })

    // The rejected column opens from its collapsed header, and what proves it
    // is ITS OWN job opportunity appearing, read inside that column: the board
    // has other empty columns, so a count of empty lines anywhere proves
    // nothing, and the title is only on the board at all once it is open.
    const rejected = columns.at(-1)?.name ?? ''
    const held = set.jobs[4]?.title ?? ''
    await expect(canvas.queryByText(held)).toBeNull()
    await userEvent.click(canvas.getByRole('button', { name: new RegExp(rejected) }))
    await waitFor(async () => {
      await expect(within(canvas.getByRole('region', { name: rejected })).getByText(held)).toBeInTheDocument()
    })
  },
}

/**
 * The people and the files kept against one job opportunity, and the ways out.
 *
 * Both live inside the job modal behind their own tabs, and both are the
 * network's records rather than the job's, KN-056: a person added here is on
 * the network page too. The cancels are here for the same reason the saves
 * are — a modal that cannot be backed out of is a trap, and each of these
 * three has its own way out.
 */
export const People: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    const set = fixtures('fa-IR')
    const first = set.jobs[0]?.title ?? ''
    const person = set.contacts[0]?.fullName ?? ''

    await userEvent.click(canvas.getByRole('button', { name: first }))
    const job = await body.findByRole('dialog')
    await userEvent.click(within(job).getByRole('tab', { name: 'افراد مرتبط' }))

    // A person is added against this job opportunity, and the job it belongs to
    // is filled in already, since the modal was opened from that job's own tab.
    await userEvent.click(within(job).getByRole('button', { name: 'افزودن مخاطب' }))
    const adding = await body.findByRole('dialog', { name: 'افزودن مخاطب' })
    await userEvent.type(within(adding).getByLabelText('اسم و فامیل'), person)
    await userEvent.click(within(adding).getByRole('button', { name: 'ذخیره' }))
    // Asked for by role rather than by text: while the nested modal is still
    // closing, MUI holds the job modal out of the accessibility tree, and a
    // text query would find the new person there a frame before it can be
    // clicked.
    await waitFor(async () => {
      await expect(within(job).getByRole('button', { name: person })).toBeInTheDocument()
    })

    // Opening them again reads back what was kept, and backing out changes
    // nothing.
    await userEvent.click(within(job).getByRole('button', { name: person }))
    const editing = await body.findByRole('dialog', { name: 'ویرایش مخاطب' })
    await expect(within(editing).getByLabelText('اسم و فامیل')).toHaveValue(person)
    await userEvent.click(within(editing).getByRole('button', { name: 'انصراف' }))
    // Again by role: the person is still kept, and asking for them this way
    // waits for the job modal to be given back to the accessibility tree,
    // which MUI takes from it while any modal is over it.
    await waitFor(async () => {
      await expect(within(job).getByRole('button', { name: person })).toBeInTheDocument()
    })

    // A file is chosen rather than dropped: the picker is a hidden input, and
    // what a reader picks arrives the same way either road.
    await userEvent.click(within(job).getByRole('tab', { name: 'فایل‌ها' }))
    const picker = job.querySelector('input[type="file"]')
    if (!(picker instanceof HTMLInputElement)) throw new Error('the files tab has no picker')
    const RESUME = set.jobDetail.files[0]?.name ?? ''

    // Choosing a file is the browser's own picker, which a story must not open:
    // what is checked is that the button reaches for it. Dropping a file on the
    // zone is the other road and arrives at the same place.
    const opened = spyOn(picker, 'click').mockImplementation(() => undefined)
    try {
      await userEvent.click(within(job).getByRole('button', { name: 'انتخاب فایل' }))
      await expect(opened).toHaveBeenCalled()
    } finally {
      opened.mockRestore()
    }
    await userEvent.upload(picker, new File(['%PDF-1.4'], RESUME, { type: 'application/pdf' }))
    await waitFor(async () => {
      await expect(within(job).getByText(RESUME)).toBeInTheDocument()
    })
    // The job opportunity's own status is changed from inside it, and a column
    // can be made here as well, since a reader who is looking at a job
    // opportunity is exactly the reader who finds the board has no stage for
    // what just happened to it.
    await userEvent.click(within(job).getByRole('tab', { name: 'اطلاعات فرصت شغلی' }))
    // Waited for by role: the modal is held out of the accessibility tree
    // while anything is over it, and the file picker's own dialog is one.
    await userEvent.click(await within(job).findByRole('button', { name: new RegExp(`^وضعیت:`) }))
    await userEvent.click(await body.findByRole('button', { name: 'وضعیت تازه' }))
    await userEvent.click(await within(job).findByRole('button', { name: new RegExp(`^وضعیت:`) }))
    const picking = await body.findByRole('dialog', { name: 'تغییر وضعیت' })
    await userEvent.click(within(picking).getByRole('radio', { name: set.names.offer }))
    await userEvent.click(within(picking).getByRole('button', { name: 'تأیید' }))
    await waitFor(async () => {
      await expect(within(job).getByRole('button', { name: `وضعیت: ${set.names.offer}` })).toBeInTheDocument()
    })

    // The posting link is written here as well as in the add flow, since a link
    // is the thing most often found after the job opportunity was kept.
    await userEvent.type(within(job).getByLabelText('لینک آگهی'), set.jobs[1]?.link ?? '')

    // Back to the files, where the one that was added is waiting.
    await userEvent.click(within(job).getByRole('tab', { name: 'فایل‌ها' }))

    // Downloading is the browser's own save, which a story cannot let happen:
    // the anchor's click is stood in for, and what is checked is that the file
    // asked for is the one that was added.
    const asked: string[] = []
    const clicking = spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      asked.push(this.download)
    })
    try {
      await userEvent.click(within(job).getByRole('button', { name: `دانلود ${RESUME}` }))
      await expect(asked).toEqual([RESUME])
    } finally {
      clicking.mockRestore()
    }

    // A note written here is kept with the job opportunity, and saving is the
    // end of reading it, so the modal closes, as every other modal in the
    // product does when its work is done.
    const NOTE = set.notes[0]?.text ?? ''
    await userEvent.click(within(job).getByRole('tab', { name: 'یادداشت' }))
    await userEvent.type(within(job).getByRole('textbox', { name: 'یادداشت' }), NOTE)
    await userEvent.click(within(job).getByRole('button', { name: 'ذخیره' }))
    await waitFor(async () => {
      await expect(body.queryByRole('dialog')).toBeNull()
    })
    await userEvent.click(await canvas.findByRole('button', { name: first }))
    const reopened = await body.findByRole('dialog')
    await userEvent.click(within(reopened).getByRole('tab', { name: 'یادداشت' }))
    await expect(within(reopened).getByRole('textbox', { name: 'یادداشت' })).toHaveValue(NOTE)

    // The person kept against it is changed from here too, and let go of from
    // their own card, which takes them off the network page as well.
    await userEvent.click(within(reopened).getByRole('tab', { name: 'افراد مرتبط' }))
    await userEvent.click(within(reopened).getByRole('button', { name: person }))
    const changing = await body.findByRole('dialog', { name: 'ویرایش مخاطب' })
    const ROLE = set.contacts[0]?.role ?? ''
    await userEvent.type(within(changing).getByLabelText('سمت'), ROLE)
    await userEvent.click(within(changing).getByRole('button', { name: 'ذخیره' }))
    await waitFor(async () => {
      await expect(within(reopened).getByRole('button', { name: person })).toBeInTheDocument()
    })
    await expect(within(reopened).getByText(ROLE)).toBeInTheDocument()

    const held = within(reopened).getByRole('button', { name: person }).closest('article')
    if (!held) throw new Error('the person has no card around them')

    await userEvent.click(within(held).getByRole('button', { name: 'حذف مخاطب' }))
    await waitFor(async () => {
      await expect(within(reopened).queryByText(person)).toBeNull()
    })
  },
}

export const BackingOut: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    const set = fixtures('fa-IR')
    const first = set.jobs[0]?.title ?? ''
    const columns = defaultStatuses((token) => set.names[token])
    const savedName = columns[0]?.name ?? ''
    const menuOf = (name: string) => canvas.getByRole('button', { name: `کارهای وضعیت: ${name}` })
    const gone = async () => {
      await waitFor(async () => {
        await expect(body.queryByRole('dialog')).toBeNull()
      })
    }

    // A rename backed out of keeps the name it had, even after typing.
    await userEvent.click(menuOf(savedName))
    await userEvent.click(await body.findByRole('menuitem', { name: 'تغییر نام' }))
    const rename = await body.findByRole('dialog')
    await userEvent.type(within(rename).getByRole('textbox'), 'x')
    await userEvent.click(within(rename).getByRole('button', { name: 'انصراف' }))
    await gone()
    await expect(canvas.getAllByText(savedName).length).toBeGreaterThan(0)

    // And the modal's own close, which is the other way out of it.
    await userEvent.click(menuOf(savedName))
    await userEvent.click(await body.findByRole('menuitem', { name: 'تغییر نام' }))
    const closing = await body.findByRole('dialog')
    await userEvent.click(within(closing).getByRole('button', { name: 'بستن' }))
    await gone()

    // A column takes a colour from the same menu, and the picker opened again
    // shows that colour chosen: the picker closing says only that it closed.
    await userEvent.click(menuOf(savedName))
    await userEvent.click(await body.findByRole('menuitem', { name: 'تغییر رنگ' }))
    await expect(await body.findByRole('radio', { name: 'بنفش' })).not.toBeChecked()
    await userEvent.click(await body.findByRole('radio', { name: 'بنفش' }))
    await waitFor(async () => {
      await expect(body.queryByRole('radio', { name: 'بنفش' })).toBeNull()
    })
    await userEvent.click(menuOf(savedName))
    await userEvent.click(await body.findByRole('menuitem', { name: 'تغییر رنگ' }))
    await expect(await body.findByRole('radio', { name: 'بنفش' })).toBeChecked()
    await userEvent.keyboard('{Escape}')
    await waitFor(async () => {
      await expect(body.queryByRole('radio', { name: 'بنفش' })).toBeNull()
    })

    // An empty column is deleted; one holding a job opportunity offers no such
    // thing, which the menu says rather than letting the reader find out.
    await userEvent.click(canvas.getByRole('button', { name: 'افزودن وضعیت' }))
    await waitFor(async () => {
      await expect(canvas.getAllByText('وضعیت تازه').length).toBeGreaterThan(0)
    })
    await userEvent.click(canvas.getByRole('button', { name: 'کارهای وضعیت: وضعیت تازه' }))
    await userEvent.click(await body.findByRole('menuitem', { name: 'حذف وضعیت' }))
    await waitFor(async () => {
      await expect(canvas.queryByText('وضعیت تازه')).toBeNull()
    })
    await userEvent.click(menuOf(savedName))
    await expect(await body.findByRole('menuitem', { name: 'حذف وضعیت' })).toHaveAttribute('aria-disabled', 'true')
    await userEvent.keyboard('{Escape}')
    // The menu's own backdrop lies over the board until it has finished
    // closing, and a click through it lands on nothing.
    await waitFor(async () => {
      await expect(body.queryByRole('menu')).toBeNull()
    })

    // A status change asked for from the bulk bar can add a column from inside
    // it, and backing out leaves the job opportunity where it was.
    const card = canvas.getByRole('button', { name: first }).closest('article')
    if (!card) throw new Error('the card has no article around it')
    // Reached with the keyboard rather than the pointer: the checkbox is folded
    // away until the card is hovered OR has focus inside it, KN-341, and a
    // hover cannot be relied on here because the pointer is already sitting
    // inside the card from the menu above, so no move is made and no :hover
    // ever lands. Focus is the reader's other road to the same control.
    const check = within(card).getByRole('checkbox')
    check.focus()
    await userEvent.click(check)
    const bar = await canvas.findByRole('region', { name: 'کارهای گروهی' })
    await userEvent.click(within(bar).getByRole('button', { name: 'تغییر وضعیت' }))
    const change = await body.findByRole('dialog')
    // The picker's own way to a new column, which reads as the name it will
    // take rather than as an instruction.
    await userEvent.click(within(change).getByRole('button', { name: 'وضعیت تازه' }))
    await waitFor(async () => {
      await expect(within(change).getByRole('radio', { name: 'وضعیت تازه' })).toBeInTheDocument()
    })
    await userEvent.click(within(change).getByRole('button', { name: 'انصراف' }))
    await gone()
    await expect(canvas.getByText(first)).toBeInTheDocument()

    // And a deletion backed out of keeps the job opportunity.
    await userEvent.click(canvas.getByRole('button', { name: first }))
    const job = await body.findByRole('dialog')
    await userEvent.click(within(job).getByRole('button', { name: 'حذف فرصت شغلی' }))
    const confirm = await body.findByRole('dialog', { name: 'حذف این فرصت شغلی؟' })
    await userEvent.click(within(confirm).getByRole('button', { name: 'انصراف' }))
    await waitFor(async () => {
      await expect(body.queryByRole('dialog', { name: 'حذف این فرصت شغلی؟' })).toBeNull()
    })
    await expect(canvas.getByText(first)).toBeInTheDocument()
  },
}

/**
 * Adding, by each of the three roads the board offers.
 *
 * The header's action, a column's own Add Card row and the empty state all
 * reach the same flow; what differs is the status the new job opportunity
 * lands in, which is the column it was asked for from.
 */
export const Adding: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    const set = fixtures('fa-IR')
    const columns = defaultStatuses((token) => set.names[token])
    const savedName = columns[0]?.name ?? ''
    const gone = async () => {
      await waitFor(async () => {
        await expect(body.queryByRole('dialog')).toBeNull()
      })
    }

    // The header's action opens the flow on the first column. The link is read
    // by the screen's own extractor, which for now gives back the link itself
    // and leaves the rest to be typed, KN-042.
    await userEvent.click(canvas.getByRole('button', { name: 'افزودن فرصت شغلی' }))
    const adding = await body.findByRole('dialog')
    const posting = set.jobs[0]?.link ?? ''
    await userEvent.type(within(adding).getByLabelText(/لینک آگهی یا متن کامل آگهی/), posting)
    await userEvent.click(within(adding).getByRole('button', { name: 'استخراج اطلاعات' }))

    // The form that comes back can take a column of its own before saving.
    // The sixth fixture job opportunity, which the board is not seeded with.
    const title = set.jobs[5]?.title ?? ''
    await waitFor(async () => {
      await expect(within(adding).getByLabelText(/عنوان شغلی/)).toBeInTheDocument()
    })
    await userEvent.click(within(adding).getByRole('button', { name: 'وضعیت تازه' }))
    await waitFor(async () => {
      await expect(within(adding).getByRole('radio', { name: 'وضعیت تازه' })).toBeInTheDocument()
    })
    await userEvent.type(within(adding).getByLabelText(/عنوان شغلی/), title)
    await userEvent.type(within(adding).getByLabelText(/شرکت/), set.jobs[0]?.company ?? '')

    // The rest of the form is optional and is filled the same way: the fields
    // that are typed, the two that are chosen from a list, and the status,
    // which the form carries as well so the add flow never needs the board.
    await userEvent.type(within(adding).getByLabelText('موقعیت مکانی'), set.jobs[0]?.location ?? '')
    await userEvent.type(within(adding).getByLabelText('لینک آگهی'), set.jobs[1]?.link ?? '')
    const choose = async (field: HTMLElement) => {
      await userEvent.click(field)
      const list = await body.findByRole('listbox')
      await userEvent.click(within(list).getAllByRole('option')[1] ?? list)
      // One of the two takes several, so its list stays open for the next
      // choice and has to be closed; the other closes itself, and an Escape
      // sent then would reach the modal behind it and close the add flow.
      if (body.queryByRole('listbox') !== null) await userEvent.keyboard('{Escape}')
      await waitFor(async () => {
        await expect(body.queryByRole('listbox')).toBeNull()
      })
    }
    await choose(within(adding).getByRole('combobox', { name: 'نوع همکاری' }))
    await choose(within(adding).getByRole('combobox', { name: 'سطح شغلی' }))
    await userEvent.click(await within(adding).findByRole('radio', { name: columns[1]?.name ?? '' }))

    await userEvent.click(within(adding).getByRole('button', { name: 'ذخیره' }))
    await gone()
    await waitFor(async () => {
      await expect(canvas.getByText(title)).toBeInTheDocument()
    })

    // A column's own Add Card row opens the same flow for that column, and
    // nothing typed means nothing to lose, so cancelling just closes.
    await userEvent.click(canvas.getByRole('button', { name: `افزودن فرصت شغلی به ${savedName}` }))
    const again = await body.findByRole('dialog')
    await userEvent.click(within(again).getByRole('button', { name: 'انصراف' }))
    await gone()
  },
}

export const AddingFromEmpty: Story = {
  parameters: { seeded: false },
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // A board with nothing on it offers the one thing there is to do, and it
    // opens the same flow the header's action does.
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    const empty = canvas.getAllByRole('button', { name: /افزودن فرصت شغلی/ })
    await userEvent.click(empty.at(-1) ?? empty[0] ?? canvasElement)
    await expect(await body.findByRole('dialog')).toBeInTheDocument()
  },
}

/**
 * Several at once: what the bulk bar does with a selection, and the card's own
 * menu, which is the same work asked for one at a time.
 */
export const Selecting: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    const set = fixtures('fa-IR')
    const first = set.jobs[0]?.title ?? ''
    const second = set.jobs[1]?.title ?? ''
    // Folded away until the card is hovered or has focus inside it, KN-341;
    // focus is the road a keyboard takes and the one a story can rely on.
    const check = (name: string) => {
      const card = canvas.getByRole('button', { name }).closest('article')
      if (!card) throw new Error('the card has no article around it')
      const box = within(card).getByRole('checkbox')
      box.focus()
      return box
    }

    // One selected and unselected again, which is the half of choosing that
    // takes a card back out of the selection.
    await userEvent.click(check(first))
    await userEvent.click(check(first))
    await waitFor(async () => {
      await expect(canvas.queryByRole('region', { name: 'کارهای گروهی' })).toBeNull()
    })

    // Then one, then every one of them, then the selection let go of.
    await userEvent.click(check(first))
    const bar = await canvas.findByRole('region', { name: 'کارهای گروهی' })
    await userEvent.click(within(bar).getByRole('button', { name: 'انتخاب همه' }))
    // Counted in the reader's own digits, which is why the number is built
    // rather than written: '5' is not what a Persian reader is shown.
    await waitFor(async () => {
      await expect(bar).toHaveTextContent(formatCount('fa-IR', seeded().jobs.length))
    })
    await userEvent.click(within(bar).getByRole('button', { name: 'لغو انتخاب' }))
    await waitFor(async () => {
      await expect(canvas.queryByRole('region', { name: 'کارهای گروهی' })).toBeNull()
    })

    // Two selected are deleted together, after the confirmation every deletion
    // in the product asks for.
    await userEvent.click(check(first))
    await userEvent.click(check(second))
    const again = await canvas.findByRole('region', { name: 'کارهای گروهی' })
    await userEvent.click(within(again).getByRole('button', { name: 'حذف' }))
    const confirm = await body.findByRole('dialog')
    await userEvent.click(within(confirm).getByRole('button', { name: 'حذف' }))
    // Asked for by role, which waits for the page to be given back to the
    // accessibility tree after the confirmation closes as well as for the two
    // to be gone.
    const third = set.jobs[2]?.title ?? ''
    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name: third })).toBeInTheDocument()
      await expect(canvas.queryByText(first)).toBeNull()
      await expect(canvas.queryByText(second)).toBeNull()
    })
  },
}

// A phone's screen, the file's 390 by 844.
const PHONE = { width: 390, height: 844 }

export const OnAPhone: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // A phone has no room for columns side by side, so the statuses become a
    // row of chips and the chosen one's cards stand alone under them. The
    // screen is resized by the runner's own browser, which only the runner
    // has, KN-225, and put back after.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const { page } = await import('vitest/browser')
    const canvas = within(canvasElement)
    const set = fixtures('fa-IR')
    const columns = defaultStatuses((token) => set.names[token])
    const before = { width: window.innerWidth, height: window.innerHeight }
    try {
      await page.viewport(PHONE.width, PHONE.height)
      await waitFor(async () => {
        await expect(canvas.getByRole('button', { name: new RegExp(columns[0]?.name ?? '') })).toBeInTheDocument()
      })
      // Choosing another status shows that status's own cards, alone.
      const rejected = columns.at(-1)?.name ?? ''
      const last = set.jobs[4]?.title ?? ''
      await userEvent.click(canvas.getByRole('button', { name: new RegExp(rejected) }))
      await waitFor(async () => {
        await expect(canvas.getByRole('button', { name: last })).toBeInTheDocument()
      })

      // A card on a phone carries its own menu, which is where the two things
      // that are done to one job opportunity live when there is no room to
      // fold them behind a hover no phone has.
      const body = within(canvasElement.ownerDocument.body)
      const card = canvas.getByRole('button', { name: last }).closest('article')
      if (!card) throw new Error('the card has no article around it')
      await userEvent.click(within(card).getByRole('button', { name: 'کارهای فرصت شغلی' }))
      await userEvent.click(await body.findByRole('menuitem', { name: 'تغییر وضعیت' }))
      const change = await body.findByRole('dialog')
      await userEvent.click(within(change).getByRole('radio', { name: set.names.offer }))
      await userEvent.click(within(change).getByRole('button', { name: 'تأیید' }))

      // Moved out of this status, it leaves nothing behind, and the page says
      // so rather than going blank, which a phone needs as much as the desktop
      // does, KN-422.
      await waitFor(async () => {
        await expect(canvas.getByText('هنوز فرصت شغلی‌ای تو این مرحله نیست')).toBeInTheDocument()
      })

      // And the same menu deletes one, after the confirmation. The chip is
      // waited for by role, which is also waiting for the page to be given
      // back to the accessibility tree after the modal closes.
      await userEvent.click(await canvas.findByRole('button', { name: new RegExp(set.names.offer) }))
      const moved = canvas.getByRole('button', { name: last }).closest('article')
      if (!moved) throw new Error('the card has no article around it')
      await userEvent.click(within(moved).getByRole('button', { name: 'کارهای فرصت شغلی' }))
      await userEvent.click(await body.findByRole('menuitem', { name: 'حذف فرصت شغلی' }))
      const confirm = await body.findByRole('dialog')
      await userEvent.click(within(confirm).getByRole('button', { name: 'حذف' }))
      await waitFor(async () => {
        await expect(canvas.queryByText(last)).toBeNull()
      })
    } finally {
      await page.viewport(before.width, before.height)
    }
  },
}

export const FocusAfterDeleting: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // KN-344: the control that asks to delete a job opportunity is ON that job
    // opportunity, so confirming takes it away. MUI puts focus back where it
    // found it, and where it found it is no longer in the page, so a keyboard
    // reader was left on the body with the next Tab starting from the top.
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    const set = fixtures('fa-IR')
    const first = set.jobs[0]?.title ?? ''

    await userEvent.click(canvas.getByRole('button', { name: first }))
    const job = await body.findByRole('dialog')
    await userEvent.click(within(job).getByRole('button', { name: 'حذف فرصت شغلی' }))
    const confirm = await body.findByRole('dialog', { name: 'حذف این فرصت شغلی؟' })
    await userEvent.click(within(confirm).getByRole('button', { name: 'حذف' }))

    // Somewhere a reader can carry on from, and NOT the page body.
    await waitFor(async () => {
      const landed = canvasElement.ownerDocument.activeElement
      await expect(landed).not.toBe(canvasElement.ownerDocument.body)
      await expect(canvasElement.contains(landed)).toBe(true)
    })
  },
}

export const FocusWhenTheOpenerSurvives: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // The other half, KN-344: a confirmation backed out of leaves the control
    // that opened it exactly where it was, and the fallback must not take over.
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    const set = fixtures('fa-IR')
    const first = set.jobs[0]?.title ?? ''

    await userEvent.click(canvas.getByRole('button', { name: first }))
    const job = await body.findByRole('dialog')
    const opener = within(job).getByRole('button', { name: 'حذف فرصت شغلی' })
    await userEvent.click(opener)
    const confirm = await body.findByRole('dialog', { name: 'حذف این فرصت شغلی؟' })
    await userEvent.click(within(confirm).getByRole('button', { name: 'انصراف' }))
    await waitFor(async () => {
      await expect(opener).toHaveFocus()
    })
  },
}
