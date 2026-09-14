import type { Decorator, StoryObj } from '@storybook/react-vite'
import { expect, fn, spyOn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, isLocale } from '../i18n'
import { formatCount } from '../i18n/formatCount'
import { defaultStatuses, jobFrom, RecordsProvider, STORAGE_KEY, type JobEntry, type Records } from '../core/records'
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
  args: { addOpen: false, onAddClose: fn() , onSelecting: fn(), onSignOut: fn()},
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

// The fixtures' own board, KN-437: the nine statuses and the job opportunity in
// each, as the product keeps them, in the story's language. Keyed on the
// language, since a provider reads the records it starts from once.
const fixtureBoard: Decorator = (Story, context) => {
  const chosen: unknown = context.globals.locale
  const locale = typeof chosen === 'string' && isLocale(chosen) ? chosen : 'fa-IR'
  return (
    <RecordsProvider key={locale} initial={fixtures(locale).records}>
      <Story />
    </RecordsProvider>
  )
}

export const Board: Story = {
  globals: { locale: 'fa-IR' },
  decorators: [fixtureBoard],
  play: async ({ canvasElement }) => {
    // The board fixture, drawn, KN-437: a column for each of the nine statuses,
    // named as the fixtures name it, in the board's order from the inline start,
    // holding its job opportunities as unevenly as the fixture does, KN-438: one
    // column empty, one holding several, and rejected the fullest, collapsed
    // until it is opened.
    const canvas = within(canvasElement)
    const { board } = fixtures('fa-IR')
    const rejected = board.at(-1)
    if (!rejected) throw new Error('the board fixture has no columns')
    await userEvent.click(canvas.getByRole('button', { name: new RegExp(rejected.name) }))
    let before: Element | null = null
    for (const column of board) {
      const region = await canvas.findByRole('region', { name: column.name })
      if (before)
        await expect(before.compareDocumentPosition(region) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
      for (const job of column.jobs) await expect(within(region).getByText(job.title)).toBeInTheDocument()
      before = region
    }
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US' },
  decorators: [fixtureBoard],
}

export const DragAndDrop: Story = {
  globals: { locale: 'fa-IR' },
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
    // The rename's key saves, KN-464.
    await expect(within(rename).getByRole('textbox')).toHaveAttribute('enterkeyhint', 'done')
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

export const SelectingWhileSearching: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // KN-431: the bulk bar counts, selects and deletes only what the search
    // shows. «آسمان» is in the companies of the second and the fourth fixture job
    // opportunities and in nothing else the board is seeded with; the fifth sits
    // in the rejected column, which opens collapsed.
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    const set = fixtures('fa-IR')
    const columns = defaultStatuses((token) => set.names[token])
    const [first = '', second = '', third = '', fourth = '', fifth = ''] = set.jobs.slice(0, 5).map((job) => job.title)
    const bar = () => canvas.getByRole('region', { name: 'کارهای گروهی' })
    const barCounts = async (count: number) => {
      await waitFor(async () => {
        await expect(bar()).toHaveTextContent(formatCount('fa-IR', count))
      })
    }
    // Folded away until focus is inside the card, KN-341; focus is the road a
    // story can rely on.
    const check = (name: string) => {
      const card = canvas.getByRole('button', { name }).closest('article')
      if (!card) throw new Error('the card has no article around it')
      const box = within(card).getByRole('checkbox')
      box.focus()
      return box
    }
    const search = canvas.getByRole('searchbox')

    // The first card chosen, then searched out of view: nothing chosen is shown,
    // so nothing is counted and the bar goes. Today's code kept counting it.
    await userEvent.click(check(first))
    await barCounts(1)
    await userEvent.type(search, 'آسمان')
    await waitFor(async () => {
      await expect(canvas.queryByText(first)).toBeNull()
      await expect(canvas.getByText(second)).toBeInTheDocument()
    })
    await expect(canvas.queryByRole('region', { name: 'کارهای گروهی' })).toBeNull()

    // Another chosen, and select all takes what the search found: two.
    await userEvent.click(check(second))
    await barCounts(1)
    await userEvent.click(within(bar()).getByRole('button', { name: 'انتخاب همه' }))
    await barCounts(2)

    // Select all put the search's two in place of the selection, letting go of
    // the first card chosen before the search: with the search cleared the bar
    // still counts two, where every job opportunity chosen would count five and
    // the two added to the first would count three, KN-431's plan review.
    await userEvent.clear(search)
    await waitFor(async () => {
      await expect(canvas.getByText(first)).toBeInTheDocument()
    })
    await barCounts(2)

    // Searched again and deleted, after the confirmation every deletion asks for.
    await userEvent.type(search, 'آسمان')
    await waitFor(async () => {
      await expect(canvas.queryByText(first)).toBeNull()
    })
    await barCounts(2)
    await userEvent.click(within(bar()).getByRole('button', { name: 'حذف' }))
    const confirm = await body.findByRole('dialog')
    await userEvent.click(within(confirm).getByRole('button', { name: 'حذف' }))
    await waitFor(async () => {
      await expect(body.queryByRole('dialog')).toBeNull()
    })

    // With the search cleared, everything it hid is still on the board: the first
    // and the third in their columns, the fifth in the rejected column once it
    // is opened; the second and the fourth are gone.
    await userEvent.clear(search)
    await waitFor(async () => {
      await expect(canvas.getByText(first)).toBeInTheDocument()
      await expect(canvas.getByText(third)).toBeInTheDocument()
    })
    await expect(canvas.queryByText(second)).toBeNull()
    await expect(canvas.queryByText(fourth)).toBeNull()
    const rejected = columns.at(-1)?.name ?? ''
    await userEvent.click(canvas.getByRole('button', { name: new RegExp(rejected) }))
    await waitFor(async () => {
      await expect(within(canvas.getByRole('region', { name: rejected })).getByText(fifth)).toBeInTheDocument()
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

// A finger on a card, dispatched as the browser would, KN-428: the card's own
// handlers, not a phone's gesture recognition, which the board's e2e test holds
// with a real touch.
type Pointing = 'pointerdown' | 'pointerup'
type Finger = 'touch'
const FINGER: Finger = 'touch'
const touch = (target: Element, type: Pointing) => {
  const box = target.getBoundingClientRect()
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      isPrimary: true,
      pointerId: 1,
      pointerType: FINGER,
      button: 0,
      clientX: box.left + box.width / 2,
      clientY: box.top + box.height / 2,
    }),
  )
}
// The click a finger's release sends.
type Clicking = 'click'
const CLICK: Clicking = 'click'

// Whether a checkbox is seen: its root's, since the native input the role sits
// on is always transparent under the drawn frame.
const seen = (checkbox: HTMLElement) => checkbox.parentElement?.checkVisibility({ opacityProperty: true }) ?? false

export const SelectingOnAPhone: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // KN-428: a phone starts a selection the way the file does, with a press
    // held on a card, 491:751; every card then offers its checkbox, 204:11, and
    // two chosen from two statuses are deleted together. The screen is resized
    // by the runner's own browser, which only the runner has, KN-225, and put
    // back after.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const { page } = await import('vitest/browser')
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    const set = fixtures('fa-IR')
    const columns = defaultStatuses((token) => set.names[token])
    const first = set.jobs[0]?.title ?? ''
    const second = set.jobs[1]?.title ?? ''
    const cardNamed = (name: string) => {
      const card = canvas.getByRole('button', { name }).closest('article')
      if (!card) throw new Error('the card has no article around it')
      return card
    }
    const before = { width: window.innerWidth, height: window.innerHeight }
    try {
      await page.viewport(PHONE.width, PHONE.height)
      await waitFor(async () => {
        await expect(canvas.getByRole('button', { name: new RegExp(columns[1]?.name ?? '') })).toBeInTheDocument()
      })

      // At rest a phone's card offers no checkbox, as 491:751 draws it.
      const held = cardNamed(first)
      await expect(seen(within(held).getByRole('checkbox'))).toBe(false)

      // Held, the card is chosen and the bar comes up; the click its release
      // sends opens nothing.
      const title = within(held).getByRole('button', { name: first })
      touch(title, 'pointerdown')
      // Found with room past the card's half second hold, which a loaded runner
      // can stretch; the search ends as soon as the bar is there.
      const bar = await canvas.findByRole('region', { name: 'کارهای گروهی' }, { timeout: 2000 })
      touch(title, 'pointerup')
      title.dispatchEvent(new MouseEvent(CLICK, { bubbles: true, cancelable: true, detail: 1 }))
      await expect(within(held).getByRole('checkbox')).toBeChecked()
      await expect(body.queryByRole('dialog')).toBeNull()

      // Another status's card offers its checkbox while the board is selecting,
      // and is chosen too.
      await userEvent.click(canvas.getByRole('button', { name: new RegExp(columns[1]?.name ?? '') }))
      const other = await waitFor(() => cardNamed(second))
      const check = within(other).getByRole('checkbox')
      await waitFor(async () => {
        await expect(seen(check)).toBe(true)
      })
      await userEvent.click(check)
      await waitFor(async () => {
        await expect(bar).toHaveTextContent(formatCount('fa-IR', 2))
      })

      // Both go together, after the confirmation every deletion asks for.
      await userEvent.click(within(bar).getByRole('button', { name: 'حذف' }))
      const confirm = await body.findByRole('dialog')
      await userEvent.click(within(confirm).getByRole('button', { name: 'حذف' }))
      await waitFor(async () => {
        await expect(canvas.queryByText(second)).toBeNull()
      })
      await userEvent.click(await canvas.findByRole('button', { name: new RegExp(columns[0]?.name ?? '') }))
      await waitFor(async () => {
        await expect(canvas.queryByText(first)).toBeNull()
      })
    } finally {
      await page.viewport(before.width, before.height)
    }
  },
}

export const UncheckingOnAPhone: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // KN-352: the last card chosen on a phone, unchecked by the keyboard, ends
    // the selection and leaves focus on its checkbox, which stays in view while
    // it has that focus and folds once focus has left the card. The checkbox was
    // once drawn only while its card was selected, so unchecking took it out of
    // the page and focus fell to the body. The runner's own viewport and keys,
    // which only the runner has, KN-225, the viewport put back after.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const browser = await import('vitest/browser')
    const canvas = within(canvasElement)
    const doc = canvasElement.ownerDocument
    const set = fixtures('fa-IR')
    const columns = defaultStatuses((token) => set.names[token])
    const first = set.jobs[0]?.title ?? ''
    const before = { width: window.innerWidth, height: window.innerHeight }
    try {
      await browser.page.viewport(PHONE.width, PHONE.height)
      await waitFor(async () => {
        await expect(canvas.getByRole('button', { name: new RegExp(columns[1]?.name ?? '') })).toBeInTheDocument()
      })
      const title = canvas.getByRole('button', { name: first })
      const card = title.closest('article')
      if (!card) throw new Error('the card has no article around it')

      // The one card chosen, by a press held on it, KN-428. Its checkbox is found
      // once the card is chosen, so a card that draws it only while chosen, the
      // bug as filed, still reaches the keys below and fails where focus is
      // asserted. It unfolds over 250 ms, and the keys wait for that unfold to
      // finish, on its own transitions' promises: any transition on it after
      // Space is then one Space began. The first run asserted too soon and caught
      // the unfold.
      touch(title, 'pointerdown')
      await expect(await canvas.findByRole('region', { name: 'کارهای گروهی' }, { timeout: 2000 })).toBeInTheDocument()
      touch(title, 'pointerup')
      const check = within(card).getByRole('checkbox')
      const fold = check.closest('.KarnamaJobCard-check')
      if (!(fold instanceof HTMLElement)) throw new Error('the checkbox has no fold around it')
      await Promise.all(fold.getAnimations().map((animation) => animation.finished))

      // The keyboard reaches its checkbox from the title and unchecks it with
      // Space. It was the last one chosen, so the board stops selecting: waited
      // for on the bar going rather than on the checkbox, which a card that took
      // its checkbox out of the page would never show unchecked.
      title.focus()
      await browser.userEvent.tab({ shift: true })
      await expect(check).toHaveFocus()
      await browser.userEvent.keyboard('{Space}')
      await waitFor(async () => {
        await expect(canvas.queryByRole('region', { name: 'کارهای گروهی' })).toBeNull()
      })

      // Focus is still on that checkbox, unchecked and in view. A fold takes
      // 250 ms and a checkbox part way through one still reads as seen, so what
      // is asserted is that no fold is under way on it, KN-352's plan review.
      await expect(check).toHaveFocus()
      await expect(check).not.toBeChecked()
      await expect(fold.getAnimations()).toHaveLength(0)
      await expect(seen(check)).toBe(true)

      // Once focus has left the card, back to the chips before it, the checkbox
      // folds away as the desktop's does.
      await browser.userEvent.tab({ shift: true })
      await expect(card.contains(doc.activeElement)).toBe(false)
      await expect(doc.activeElement).not.toBe(doc.body)
      await waitFor(async () => {
        await expect(seen(check)).toBe(false)
      })
    } finally {
      await browser.page.viewport(before.width, before.height)
    }
  },
}

// The event a browser hands every other open tab of the page when one of them
// writes its storage, typed so the lint rule reads the name as a value.
const STORED: keyof WindowEventMap = 'storage'

export const ChangedInAnotherTab: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // KN-419: another tab's change to the board reaches this one, and this tab's
    // next change keeps it, where it used to write its own stale copy over it.
    // The other tab is stood in for by what its write delivers here: the story's
    // own storage written under the provider's key, then that event.
    const canvas = within(canvasElement)
    const set = fixtures('fa-IR')
    const records = seeded()
    const elsewhere = set.jobs[5]?.title ?? ''
    const theirs: Records = {
      ...records,
      jobs: [
        jobFrom(
          { ...emptyDraft(records.statuses[0]?.id ?? ''), title: elsewhere, company: set.jobs[5]?.company ?? '' },
          new Date(Date.UTC(2026, 8, 9, 9)).toISOString(),
        ),
        ...records.jobs,
      ],
    }
    const written = JSON.stringify(theirs)
    window.localStorage.setItem(STORAGE_KEY, written)
    window.dispatchEvent(new StorageEvent(STORED, { key: STORAGE_KEY, newValue: written }))
    await waitFor(async () => {
      await expect(canvas.getByText(elsewhere)).toBeInTheDocument()
    })

    // This tab's own next change builds on the other tab's board: a status added
    // here is written with the other tab's job opportunity still in it.
    await userEvent.click(canvas.getByRole('button', { name: 'افزودن وضعیت' }))
    await waitFor(async () => {
      const kept = window.localStorage.getItem(STORAGE_KEY) ?? ''
      await expect(kept).toContain(elsewhere)
      await expect(kept).toContain('وضعیت تازه')
    })

    // Another tab's clear() of the whole store, the one write with no key,
    // leaves this tab the fresh board as well.
    window.localStorage.clear()
    window.dispatchEvent(new StorageEvent(STORED, { key: null }))
    await waitFor(async () => {
      await expect(canvas.queryByText(elsewhere)).toBeNull()
      await expect(canvas.queryByText(set.jobs[0]?.title ?? '')).toBeNull()
    })
  },
}

export const RecolouringKeepsItsPlace: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // KN-440: a colour is not a place. Two statuses of the reader's own are
    // added, the first renamed so the two can be told apart, and the second
    // given offer's colour, green, from its column's menu: every column stays
    // where it was. Read from the colour, the second used to jump ahead of the
    // first.
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    const set = fixtures('fa-IR')
    const defaults = defaultStatuses((token) => set.names[token])
    const rejected = defaults.at(-1)?.name ?? ''
    const renamed = set.renamedStatus.name
    // The name a status added from the board is given, read from the catalog.
    const i18n = i18nFor('fa-IR')
    const fresh = i18n._('New status')
    const gone = async () => {
      await waitFor(async () => {
        await expect(body.queryByRole('dialog')).toBeNull()
      })
    }
    const added = async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'افزودن وضعیت' }))
      await canvas.findByRole('region', { name: fresh })
    }

    await added()
    await userEvent.click(canvas.getByRole('button', { name: `کارهای وضعیت: ${fresh}` }))
    await userEvent.click(await body.findByRole('menuitem', { name: 'تغییر نام' }))
    const rename = await body.findByRole('dialog')
    await userEvent.clear(within(rename).getByRole('textbox'))
    await userEvent.type(within(rename).getByRole('textbox'), renamed)
    await userEvent.click(within(rename).getByRole('button', { name: 'ذخیره' }))
    await gone()
    await added()

    await userEvent.click(canvas.getByRole('button', { name: `کارهای وضعیت: ${fresh}` }))
    await userEvent.click(await body.findByRole('menuitem', { name: 'تغییر رنگ' }))
    await userEvent.click(await body.findByRole('radio', { name: 'سبز' }))
    await waitFor(async () => {
      await expect(body.queryByRole('radio', { name: 'سبز' })).toBeNull()
    })

    // The rejected column opens from its collapsed header, and every column is
    // then a region to read the order from.
    await userEvent.click(canvas.getByRole('button', { name: new RegExp(rejected) }))
    const order = [...defaults.slice(0, -1).map((status) => status.name), renamed, fresh, rejected]
    let before: Element | null = null
    for (const name of order) {
      const region = await canvas.findByRole('region', { name })
      if (before)
        await expect(before.compareDocumentPosition(region) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
      before = region
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
    // The column it is in, named before it goes: the seeded board holds one job
    // opportunity a column, so deleting it leaves that column empty.
    const column = canvas.getByRole('button', { name: first }).closest('section')?.getAttribute('aria-label') ?? ''

    await userEvent.click(canvas.getByRole('button', { name: first }))
    const job = await body.findByRole('dialog')
    await userEvent.click(within(job).getByRole('button', { name: 'حذف فرصت شغلی' }))
    const confirm = await body.findByRole('dialog', { name: 'حذف این فرصت شغلی؟' })
    await userEvent.click(within(confirm).getByRole('button', { name: 'حذف' }))

    // Where a reader carries on from once both dialogs are gone, KN-472: the card
    // after it in its column, and with none left there, that column's own Add
    // Card row. Not the page body, KN-344, and not the first card of some other
    // column.
    await waitFor(async () => {
      await expect(body.queryByRole('dialog')).toBeNull()
    })
    const i18n = i18nFor('fa-IR')
    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name: `${i18n._('Add a job opportunity to')} ${column}` })).toHaveFocus()
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

// A card's title, which is its first button, KN-472.
const titleOf = (card: HTMLElement | undefined) => (card === undefined ? '' : (within(card).getAllByRole('button')[0]?.textContent ?? ''))

// A card deleted from its own delete, reached as a keyboard reader reaches it:
// it folds away until the card is hovered or holds focus, KN-341. Done once the
// confirmation is gone, so focus is read where it settled.
const deleteCard = async (card: HTMLElement, canvasElement: HTMLElement) => {
  const body = within(canvasElement.ownerDocument.body)
  const remove = within(card).getByRole('button', { name: 'حذف فرصت شغلی' })
  remove.focus()
  await userEvent.click(remove)
  const confirm = await body.findByRole('dialog', { name: 'حذف این فرصت شغلی؟' })
  await userEvent.click(within(confirm).getByRole('button', { name: 'حذف' }))
  await waitFor(async () => {
    await expect(body.queryByRole('dialog')).toBeNull()
  })
}

export const FocusAfterDeletingInAColumn: Story = {
  globals: { locale: 'fa-IR' },
  decorators: [fixtureBoard],
  play: async ({ canvasElement }) => {
    // KN-472: a card deleted from a column leaves the reader on the card after
    // it, or on the one before it when it was the last, and never on the first
    // card of the whole board, which reads as the product jumping somewhere on
    // its own. Rejected is the last column and the fullest, so the board's first
    // card is in another column entirely.
    const canvas = within(canvasElement)
    const rejected = fixtures('fa-IR').board.at(-1)
    if (!rejected) throw new Error('the board fixture has no columns')
    await userEvent.click(canvas.getByRole('button', { name: new RegExp(rejected.name) }))
    const column = await canvas.findByRole('region', { name: rejected.name })
    const cards = within(column).getAllByRole('article')
    if (cards.length < 3) throw new Error('the rejected column holds too few cards')

    // A card in the middle: focus lands on the one after it, by its name.
    const middle = Math.floor(cards.length / 2)
    const after = titleOf(cards[middle + 1])
    const doomed = cards[middle]
    if (!doomed) throw new Error('no middle card')
    await deleteCard(doomed, canvasElement)
    await waitFor(async () => {
      await expect(within(column).getByRole('button', { name: after })).toHaveFocus()
    })

    // The last card: nothing comes after it, so focus lands on the one before.
    const left = within(column).getAllByRole('article')
    const last = left.at(-1)
    const before = titleOf(left.at(-2))
    if (!last) throw new Error('no last card')
    await deleteCard(last, canvasElement)
    await waitFor(async () => {
      await expect(within(column).getByRole('button', { name: before })).toHaveFocus()
    })
  },
}
