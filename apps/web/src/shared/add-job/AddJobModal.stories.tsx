import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { setupI18n } from '@lingui/core'
import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test'
import { statusGroups } from '../../core/records'
import { i18nFor, type Locale } from '../../i18n'
import { messages as en } from '../../i18n/locales/en-US'
import { darkSemantic } from '../../theme/darkMode'
import { semantic } from '../../theme/tokens'
import type { JobLevel } from '../job-selects'
import type { SourceLists } from '../source-picker'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { keyboardOf, type Keyboard } from '../story-fixtures/keyboard'
import { AddJobModal, type AddJobModalProps, type AddJobStep } from './AddJobModal'
import type { JobDraft } from './draft'

// What reading the posting finds, the Review step of node 150:94: the title and
// company of a fixture job, full-time, a senior specialist, and the rest of
// the posting's details, its source among them.
const LEVEL: JobLevel = 'senior-specialist'
const foundIn = (locale: Locale): Partial<JobDraft> => {
  const [job] = fixtures(locale).jobs
  return {
    title: job?.title ?? '',
    company: job?.company ?? '',
    employmentTypes: ['full-time'],
    jobLevel: LEVEL,
    ...fixtures(locale).extraction,
  }
}
const LINK = fixtures('fa-IR').extraction.postingUrl
const FOUND = foundIn('fa-IR')

// The statuses the product starts with, the fixtures' first five, as the board
// splits them: the stages, and Rejected among the outcomes. A new job
// opportunity starts in the first, «ذخیره‌شده».
const groupsIn = (locale: Locale) => statusGroups(fixtures(locale).statusOptions.slice(0, 5))
const sourcesIn = (locale: Locale): SourceLists => ({
  own: fixtures(locale).sourcePicker.own,
  common: fixtures(locale).sourcePicker.common,
})
// The reader's network: three people at the company reading found.
const PEOPLE = 3
const peopleAtFound = (locale: Locale) => (company: string) => (company === foundIn(locale).company ? PEOPLE : 0)

const STEPS: Exclude<AddJobStep, 'loading'>[] = ['paste', 'review', 'manual', 'error']
const CONTROLLED: (keyof AddJobModalProps)[] = ['open', 'step', 'source']
// The controls a story offers: only the args its play holds for and that change
// what is on screen, so changing one in Controls and pressing Rerun never has the
// story report something untrue about the canvas, KN-255, KN-571.
const offers = (names: (keyof AddJobModalProps)[]) => ({ controls: { include: names } })
// A story that offers none: open, step and source each change the state its play
// opens on and asserts.
const FIXED = { controls: { disable: true } }

// MUI's own cap on a Dialog's Paper, KN-559: it holds a Paper to this much less
// than its container. The number is written once and the text built from it, so
// no quoted run in this file carries a px literal, which the theme's guard
// refuses outside src/theme, KN-658. The story reads both: the text, against the
// rule MUI declares, and the number, in the height it expects.
const CAP_GAP = 64
// A CSS declaration MUI writes, not words anyone reads, so it is named here as
// the API value it is, the way a file name is in catalog.ts, KN-214.
// eslint-disable-next-line lingui/no-unlocalized-strings -- KN-658: a CSS value
const CAP = `calc(100% - ${String(CAP_GAP)}px)`

// The English copy, read from its catalog, so the story says what the canvas
// draws.
const english = setupI18n({ locale: 'en-US', messages: { 'en-US': en } })

const meta = {
  title: 'Shared/AddJobModal',
  component: AddJobModal,
  args: {
    open: true,
    ...groupsIn('fa-IR'),
    status: 'new',
    sources: sourcesIn('fa-IR'),
    // Nobody of the network at any company, unless a story says otherwise.
    peopleAt: fn<(company: string) => number>(() => 0),
    step: 'paste',
    source: '',
    onExtract: fn(() => Promise.resolve(foundIn('fa-IR'))),
    onSave: fn(),
    onAddStatus: fn(),
    onClose: fn(),
  },
  argTypes: { step: { control: 'select', options: STEPS } },
  parameters: { controls: { include: CONTROLLED } },
} satisfies StoryMeta<typeof AddJobModal>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A colour as the browser computes it, borrowed on the body's own inline style,
// which no transition moves, and put back in the same tick. Never inside
// waitFor, KN-014.
const computed = (value: string) => {
  const host = document.body
  const previous = host.style.color
  host.style.color = value
  const result = getComputedStyle(host).color
  host.style.color = previous
  return result
}

// The dialog, once its dissolve has brought it into view.
const dialogNamed = async (name: string) => {
  const dialog = await within(document.body).findByRole('dialog', { name })
  await waitFor(() => expect(dialog).toBeVisible())
  return dialog
}

// What every step of 166:82 draws round its body: 560 wide, the header and the
// footer 24 in from the dialog's edges, the dividers 512 across; and the footer's
// primary, the one handed in, at the inline end with Cancel 12 before it.
const isTheShell = async (dialog: HTMLElement, locale: Locale, primary: HTMLElement) => {
  const i18n = i18nFor(locale)
  const rtl = locale === 'fa-IR'
  const box = dialog.getBoundingClientRect()
  await expect(box.width).toBe(560)
  const dividers = [...dialog.querySelectorAll('hr')]
  await expect(dividers.map((divider) => divider.getBoundingClientRect().width)).toEqual([512, 512])
  const cancel = within(dialog).getByRole('button', { name: i18n._('Cancel') })
  const [primaryBox, cancelBox] = [primary.getBoundingClientRect(), cancel.getBoundingClientRect()]
  await expect(Math.round(rtl ? primaryBox.left - box.left : box.right - primaryBox.right)).toBe(24)
  await expect(Math.round(rtl ? cancelBox.left - primaryBox.right : primaryBox.left - cancelBox.right)).toBe(12)
  return cancel
}

// The form steps' footer, 254:13: the Status Select at the inline start, 24 in,
// 44 tall, «وضعیت:» before the chip of the status the job opportunity is added
// in, which the story reads off what it returns.
const isTheStatusFooter = async (dialog: HTMLElement, locale: Locale) => {
  const i18n = i18nFor(locale)
  const said = i18n._('Status:')
  const rtl = locale === 'fa-IR'
  const box = dialog.getBoundingClientRect()
  const select = within(dialog).getByRole('button', { name: (name) => name.startsWith(said) })
  const selectBox = select.getBoundingClientRect()
  await expect(selectBox.height).toBe(44)
  await expect(Math.round(rtl ? box.right - selectBox.right : selectBox.left - box.left)).toBe(24)
  return select
}

// The paste steps' wrap, 166:67, 371:427 and 304:7: the Paste Field 54 tall, its
// helper or the failure in its place, and 4 below the Manual Path Link.
const isThePasteWrap = async (dialog: HTMLElement, locale: Locale) => {
  const i18n = i18nFor(locale)
  const field = within(dialog).getByRole('textbox', { name: i18n._('Posting link or full text') })
  await expect(field.parentElement?.getBoundingClientRect().height).toBe(54)
  const manual = within(dialog).getByRole('button', { name: i18n._('Manual entry') })
  await expect(manual).toBeVisible()
  return field
}

export const Paste: Story = {
  // An entered source makes leaving ask, KN-571.
  parameters: FIXED,
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // Node 166:62: 315 tall, the Paste Field under its label with its helper,
    // the Manual Path Link, and Extract waiting for the field. Leaving an empty
    // flow asks nothing.
    const dialog = await dialogNamed('افزودن فرصت شغلی')
    await expect(dialog.getBoundingClientRect().height).toBe(315)
    const field = await isThePasteWrap(dialog, 'fa-IR')
    await expect(field).toHaveAccessibleDescription('هم لینک، هم متن کامل آگهی؛ لازم نیست چیزی رو جدا کنید.')
    const extract = within(dialog).getByRole('button', { name: 'استخراج اطلاعات' })
    await isTheShell(dialog, 'fa-IR', extract)
    await expect(extract).toBeDisabled()
    await expect(within(dialog).queryByRole('button', { name: /وضعیت/u })).toBeNull()
    await userEvent.click(within(dialog).getByRole('button', { name: 'انصراف' }))
    await expect(args.onClose).toHaveBeenCalledTimes(1)
  },
}

export const PasteFilled: Story = {
  parameters: FIXED,
  args: { source: LINK },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async () => {
    // Node 371:422: the field holds a link, and Extract waits until the field
    // has been touched as well as filled, the critical path's «click into the
    // field».
    const dialog = await dialogNamed('افزودن فرصت شغلی')
    await expect(dialog.getBoundingClientRect().height).toBe(315)
    const field = await isThePasteWrap(dialog, 'fa-IR')
    await expect(field).toHaveValue(LINK)
    const extract = within(dialog).getByRole('button', { name: 'استخراج اطلاعات' })
    await expect(extract).toBeDisabled()
    await userEvent.click(field)
    await expect(extract).toBeEnabled()
  },
}

export const ExtractsToReview: Story = {
  parameters: FIXED,
  args: { source: LINK },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // Extracting reads what was pasted and lands on Review with what it found.
    const dialog = await dialogNamed('افزودن فرصت شغلی')
    await userEvent.click(within(dialog).getByRole('textbox', { name: 'لینک آگهی یا متن کامل آگهی' }))
    await userEvent.click(within(dialog).getByRole('button', { name: 'استخراج اطلاعات' }))
    await expect(args.onExtract).toHaveBeenCalledWith(LINK)
    const title = await within(dialog).findByRole('textbox', { name: 'عنوان شغلی' })
    await expect(title).toHaveValue(FOUND.title)
    // The source reading found says so under the source.
    await expect(within(dialog).getByText('از روی لینک آگهی پر شد.')).toBeVisible()
  },
}

// Longer than the 100 ms the Loading State waits before its first spoken line, KN-326.
const QUIET_MS = 300

export const Loading: Story = {
  parameters: FIXED,
  args: { source: LINK, onExtract: fn(() => new Promise<Partial<JobDraft>>(() => undefined)) },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async () => {
    // Node 243:899: while the posting is read, the panel of 243:964, 360 wide,
    // holds the Loading State and nothing else.
    const dialog = await dialogNamed('افزودن فرصت شغلی')
    await userEvent.click(within(dialog).getByRole('textbox', { name: 'لینک آگهی یا متن کامل آگهی' }))
    await userEvent.click(within(dialog).getByRole('button', { name: 'استخراج اطلاعات' }))
    const status = await within(dialog).findByRole('status')
    await expect(status).toHaveTextContent('داره آگهی رو می‌خونه')
    // Focus moves with the step onto the panel, a group that holds the status and is named
    // by the message, not onto a box with no name; and once the 100 ms KN-326 waits are
    // up, the status has not said the first line again, since the focus said it, KN-362.
    await waitFor(async () => {
      const focused = window.document.activeElement
      if (!(focused instanceof HTMLElement)) throw new Error('nothing has focus')
      await expect(focused.getAttribute('role')).toBe('group')
      await expect(focused).toContainElement(status)
      await expect(focused).toHaveAccessibleName('داره آگهی رو می‌خونه…')
    })
    await new Promise((resolve) => window.setTimeout(resolve, QUIET_MS))
    await expect(status.children[1]?.textContent).toBe('')
    await waitFor(() => expect(dialog.getBoundingClientRect().width).toBe(360))
    await expect(within(dialog).queryByRole('button')).toBeNull()
  },
}

export const LeaveWhileReading: Story = {
  parameters: FIXED,
  args: { source: LINK, onExtract: fn(() => new Promise<Partial<JobDraft>>(() => undefined)) },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // Escape while reading goes back to the paste field with the link kept, and
    // closes nothing.
    const dialog = await dialogNamed('افزودن فرصت شغلی')
    await userEvent.click(within(dialog).getByRole('textbox', { name: 'لینک آگهی یا متن کامل آگهی' }))
    await userEvent.click(within(dialog).getByRole('button', { name: 'استخراج اطلاعات' }))
    await within(dialog).findByRole('status')
    await userEvent.keyboard('{Escape}')
    const field = await within(dialog).findByRole('textbox', { name: 'لینک آگهی یا متن کامل آگهی' })
    await expect(field).toHaveValue(LINK)
    await expect(args.onClose).not.toHaveBeenCalled()
  },
}

// The form's own scroll, inside the dialog's body: the element that holds the
// fields and scrolls past its 420.
const formScrollOf = (dialog: HTMLElement) => {
  const title = within(dialog).getByRole('textbox', { name: 'عنوان شغلی' })
  let scroll: HTMLElement | null = title.parentElement
  while (scroll && getComputedStyle(scroll).overflowY !== 'auto') scroll = scroll.parentElement
  if (!scroll) throw new Error('the form does not scroll')
  return scroll
}

export const Review: Story = {
  // Its draft carries its own link, which wins over source, so source changes
  // nothing on screen here, KN-571.
  parameters: FIXED,
  args: { step: 'review', source: LINK, draft: FOUND, peopleAt: fn(peopleAtFound('fa-IR')) },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // Node 150:94: 560 by 606, the form filled and open to correction in 420
    // that scroll under a 48 fade; the title and the company required, the
    // company's network said under it in text/brand, the source reading found
    // with its hint; the Status Select at the footer's inline start, «افزودن» at
    // its end, which hands the draft over in the status chosen there.
    const dialog = await dialogNamed('افزودن فرصت شغلی')
    // The frame's 606 where there is room for it, and the cap where there is
    // not, KN-559: MUI caps a Dialog's Paper at CAP of its container, so a
    // Storybook manager's short canvas draws less of the modal while the
    // runner's holds the whole 606. The cap's own text is read too, so a library
    // that changed the rule fails this story for a reader to judge.
    await expect(window.getComputedStyle(dialog).maxHeight).toBe(CAP)
    await expect(dialog.getBoundingClientRect().height).toBe(Math.min(606, window.innerHeight - CAP_GAP))
    await isTheShell(dialog, 'fa-IR', within(dialog).getByRole('button', { name: 'افزودن' }))
    await expect(await isTheStatusFooter(dialog, 'fa-IR')).toHaveTextContent('ذخیره‌شده')
    const title = within(dialog).getByRole('textbox', { name: 'عنوان شغلی' })
    await expect(title).toHaveValue(args.draft?.title ?? 'missing')
    await expect(title).toBeRequired()
    const company = within(dialog).getByRole('textbox', { name: 'نام شرکت' })
    await expect(company).toBeRequired()
    await expect(args.peopleAt).toHaveBeenCalledWith(FOUND.company)
    const note = within(dialog).getByText(`۳ نفر از ${FOUND.company ?? ''} در شبکهٔ شما هستند`)
    const noteStyle = getComputedStyle(note)
    await expect([px(noteStyle.fontSize), px(noteStyle.lineHeight), Number(noteStyle.fontWeight)]).toEqual([14, 22, 400])
    await expect(noteStyle.color).toBe(computed(semantic['text/brand']))
    const companyField = company.parentElement
    if (!companyField) throw new Error('the company has no field')
    await expect(Math.round(note.getBoundingClientRect().top - companyField.getBoundingClientRect().bottom)).toBe(4)
    await expect(within(dialog).getByRole('combobox', { name: 'منبع' })).toHaveValue(FOUND.source ?? 'missing')
    await expect(within(dialog).getByText('از روی لینک آگهی پر شد.')).toBeVisible()
    await expect(within(dialog).getByRole('textbox', { name: 'لینک آگهی' })).toHaveValue(LINK)
    // The fade: 48 of bg/surface rising over the form's foot, gone once the form
    // is scrolled to its end.
    const scroll = formScrollOf(dialog)
    const fade = scroll.nextElementSibling
    if (!(fade instanceof HTMLElement)) throw new Error('the form has no fade')
    const [fadeBox, scrollBox] = [fade.getBoundingClientRect(), scroll.getBoundingClientRect()]
    await expect([fadeBox.width, fadeBox.height, Math.round(scrollBox.bottom - fadeBox.bottom)]).toEqual([512, 48, 0])
    await expect(getComputedStyle(fade).backgroundImage).toContain('linear-gradient')
    scroll.scrollTop = scroll.scrollHeight
    await fireEvent.scroll(scroll)
    await waitFor(() => expect(getComputedStyle(fade).opacity).toBe('0'))
    await userEvent.clear(title)
    await userEvent.type(title, 'مهندس نرم‌افزار')
    await userEvent.click(within(dialog).getByRole('button', { name: 'افزودن' }))
    await expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({ title: 'مهندس نرم‌افزار', status: 'new', postingUrl: LINK }))
  },
}

export const ReviewInEnglish: Story = {
  // Its draft's own link wins over source, as Review's does, KN-571.
  parameters: FIXED,
  args: {
    step: 'review',
    source: LINK,
    draft: foundIn('en-US'),
    ...groupsIn('en-US'),
    sources: sourcesIn('en-US'),
    peopleAt: fn(peopleAtFound('en-US')),
  },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ args }) => {
    // The Review step in English, its footer and its note in the language's own
    // order, saves what reading found, its dates the days the fixtures hold,
    // KN-494: they used to be written «1 September 2026», which the form refused.
    const i18n = english
    const dialog = await dialogNamed(i18n._('Add job opportunity'))
    await isTheShell(dialog, 'en-US', within(dialog).getByRole('button', { name: i18n._('Add') }))
    await expect(await isTheStatusFooter(dialog, 'en-US')).toHaveTextContent(fixtures('en-US').statusOptions[0]?.name ?? 'missing')
    await expect(within(dialog).getByText(`3 people from ${foundIn('en-US').company ?? ''} are in your network`)).toBeVisible()
    await userEvent.click(within(dialog).getByRole('button', { name: i18n._('Add') }))
    await expect(args.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ title: fixtures('en-US').jobs[0]?.title, postedAt: '2026-09-01', expiresAt: '2026-09-04' }),
    )
  },
}

export const OnePersonAtTheCompany: Story = {
  // One person of the network at the company is said in the singular.
  parameters: FIXED,
  args: {
    step: 'review',
    source: LINK,
    draft: foundIn('en-US'),
    ...groupsIn('en-US'),
    sources: sourcesIn('en-US'),
    peopleAt: fn<(company: string) => number>(() => 1),
  },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async () => {
    const i18n = english
    const dialog = await dialogNamed(i18n._('Add job opportunity'))
    await expect(within(dialog).getByText(`1 person from ${foundIn('en-US').company ?? ''} is in your network`)).toBeVisible()
  },
}

export const Dark: Story = {
  // Review in the dark theme: the note and the fade in the theme's dark colours.
  parameters: FIXED,
  args: { step: 'review', source: LINK, draft: FOUND, peopleAt: fn(peopleAtFound('fa-IR')) },
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async () => {
    const dialog = await dialogNamed('افزودن فرصت شغلی')
    await expect(getComputedStyle(dialog).backgroundColor).toBe(computed(darkSemantic['bg/surface']))
    const note = within(dialog).getByText(`۳ نفر از ${FOUND.company ?? ''} در شبکهٔ شما هستند`)
    await expect(getComputedStyle(note).color).toBe(computed(darkSemantic['text/brand']))
    const fade = formScrollOf(dialog).nextElementSibling
    if (!(fade instanceof HTMLElement)) throw new Error('the form has no fade')
    await expect(getComputedStyle(fade).backgroundImage).toContain(computed(darkSemantic['bg/surface']))
  },
}

export const Manual: Story = {
  // A pasted link fills the empty form's posting link, KN-571.
  parameters: offers(['source']),
  args: { step: 'manual' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // Node 254:2: 288 tall, the title and the company over «جزئیات بیشتر», the
    // rest of the form behind it, and the footer as Review's. Adding without a
    // title and a company says what is missing and adds nothing; with them, it
    // adds.
    const dialog = await dialogNamed('افزودن فرصت شغلی')
    await expect(dialog.getBoundingClientRect().height).toBe(288)
    const add = within(dialog).getByRole('button', { name: 'افزودن' })
    await isTheShell(dialog, 'fa-IR', add)
    await expect(await isTheStatusFooter(dialog, 'fa-IR')).toHaveTextContent('ذخیره‌شده')
    const toggle = within(dialog).getByRole('button', { name: 'جزئیات بیشتر' })
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    const toggleStyle = getComputedStyle(toggle)
    await expect([px(toggleStyle.fontSize), px(toggleStyle.lineHeight), px(toggleStyle.columnGap)]).toEqual([14, 22, 4])
    await expect(toggleStyle.color).toBe(computed(semantic['text/brand']))
    await expect(within(dialog).queryByRole('textbox', { name: 'موقعیت مکانی' })).toBeNull()
    await userEvent.click(add)
    await expect(args.onSave).not.toHaveBeenCalled()
    await expect(within(dialog).getByRole('textbox', { name: 'عنوان شغلی' })).toHaveAccessibleDescription('عنوان شغلی را بنویس')
    await expect(within(dialog).getByRole('textbox', { name: 'نام شرکت' })).toHaveAccessibleDescription('نام شرکت را بنویس')
    await userEvent.type(within(dialog).getByRole('textbox', { name: 'عنوان شغلی' }), 'طراح محصول')
    await userEvent.type(within(dialog).getByRole('textbox', { name: 'نام شرکت' }), 'اسنپ')
    await userEvent.click(add)
    await expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({ title: 'طراح محصول', company: 'اسنپ', status: 'new' }))
  },
}

export const ManualDetails: Story = {
  // Node 1262:97354: «جزئیات بیشتر» opens the rest of the form, the modal 606,
  // its chevron turned and «جزئیات کمتر»; the fields keep what was typed when it
  // closes again. A fixed step, so no control applies.
  parameters: FIXED,
  args: { step: 'manual' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async () => {
    const dialog = await dialogNamed('افزودن فرصت شغلی')
    await userEvent.click(within(dialog).getByRole('button', { name: 'جزئیات بیشتر' }))
    const less = within(dialog).getByRole('button', { name: 'جزئیات کمتر' })
    await expect(less).toHaveAttribute('aria-expanded', 'true')
    await waitFor(() => expect(dialog.getBoundingClientRect().height).toBe(Math.min(606, window.innerHeight - CAP_GAP)))
    const chevron = less.querySelector('svg')
    if (!chevron) throw new Error('the toggle has no chevron')
    await expect(getComputedStyle(chevron).transform).toBe('matrix(-1, 0, 0, -1, 0, 0)')
    const location = within(dialog).getByRole('textbox', { name: 'موقعیت مکانی' })
    await userEvent.type(location, 'تهران')
    await expect(within(dialog).getByRole('combobox', { name: 'منبع' })).toHaveValue('')
    await expect(within(dialog).queryByText('از روی لینک آگهی پر شد.')).toBeNull()
    // The description under its heading row: the 16 note icon and the title at
    // 14 and SemiBold, 8 above a field of one line, its placeholder in
    // text/secondary.
    const description = within(dialog).getByRole('textbox', { name: 'شرح شغل و مسئولیت‌ها' })
    await expect(description).toHaveAttribute('placeholder', 'متن آگهی یا شرح شغل رو اینجا بذارید')
    await expect(description.parentElement?.getBoundingClientRect().height).toBe(46)
    const heading = within(dialog).getByRole('heading', { name: 'شرح شغل و مسئولیت‌ها' })
    await expect([px(getComputedStyle(heading).fontSize), Number(getComputedStyle(heading).fontWeight)]).toEqual([14, 600])
    await expect(formScrollOf(dialog).nextElementSibling).toBeNull()
    await userEvent.click(less)
    await expect(within(dialog).queryByRole('textbox', { name: 'موقعیت مکانی' })).toBeNull()
    await userEvent.click(within(dialog).getByRole('button', { name: 'جزئیات بیشتر' }))
    await expect(within(dialog).getByRole('textbox', { name: 'موقعیت مکانی' })).toHaveValue('تهران')
  },
}

export const ManualShowsWhatStopsTheSave: Story = {
  // A field behind the toggle that stops the save opens the details, so its
  // error is seen: a link that is not one, typed and then put away. A fixed
  // step, so no control applies.
  parameters: FIXED,
  args: { step: 'manual' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    const dialog = await dialogNamed('افزودن فرصت شغلی')
    await userEvent.click(within(dialog).getByRole('button', { name: 'جزئیات بیشتر' }))
    await userEvent.type(within(dialog).getByRole('textbox', { name: 'لینک آگهی' }), 'not-a-link')
    await userEvent.click(within(dialog).getByRole('button', { name: 'جزئیات کمتر' }))
    await userEvent.type(within(dialog).getByRole('textbox', { name: 'عنوان شغلی' }), 'طراح محصول')
    await userEvent.type(within(dialog).getByRole('textbox', { name: 'نام شرکت' }), 'اسنپ')
    await userEvent.click(within(dialog).getByRole('button', { name: 'افزودن' }))
    await expect(args.onSave).not.toHaveBeenCalled()
    await expect(within(dialog).getByRole('button', { name: 'جزئیات کمتر' })).toHaveAttribute('aria-expanded', 'true')
    await expect(within(dialog).getByRole('textbox', { name: 'لینک آگهی' })).toHaveAccessibleDescription(
      'یک لینک معتبر با http یا https وارد کن',
    )
  },
}

export const ManualPath: Story = {
  // The paste field shows the source before the way round is taken, KN-571.
  parameters: offers(['source']),
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async () => {
    // «ورود دستی» goes to the empty form.
    const dialog = await dialogNamed('افزودن فرصت شغلی')
    await userEvent.click(within(dialog).getByRole('button', { name: 'ورود دستی' }))
    await expect(await within(dialog).findByRole('textbox', { name: 'عنوان شغلی' })).toHaveValue('')
  },
}

// The server's answer for a posting it could not read: a GraphQL error whose
// code is the API's word for it.
type Unreadable = 'POSTING_UNAVAILABLE'
const UNAVAILABLE: Unreadable = 'POSTING_UNAVAILABLE'
const unreadable = () => new CombinedGraphQLErrors({ errors: [{ message: UNAVAILABLE, extensions: { code: UNAVAILABLE } }] })

export const ErrorStep: Story = {
  parameters: FIXED,
  args: { step: 'error', source: LINK, onExtract: fn(() => Promise.reject(unreadable())) },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // Node 304:2: 315 tall, the title says reading failed, the field keeps the
    // link and says why in text/error, the way round stays, and «تلاش دوباره»
    // reads it again; the posting failing again, it says so again.
    const dialog = await dialogNamed('نتونستیم آگهی رو بخونیم')
    await expect(dialog.getBoundingClientRect().height).toBe(315)
    const field = await isThePasteWrap(dialog, 'fa-IR')
    await expect(field).toHaveValue(LINK)
    await expect(field).toHaveAccessibleDescription('شاید آگهی حذف شده یا سایتش اجازهٔ خوندن نمی‌ده. یه بار دیگه امتحان کنید.')
    await isTheShell(dialog, 'fa-IR', within(dialog).getByRole('button', { name: 'تلاش دوباره' }))
    await userEvent.click(within(dialog).getByRole('button', { name: 'تلاش دوباره' }))
    await expect(args.onExtract).toHaveBeenCalledWith(LINK)
    const again = await dialogNamed('نتونستیم آگهی رو بخونیم')
    await expect(await within(again).findByRole('textbox', { name: 'لینک آگهی یا متن کامل آگهی' })).toHaveAccessibleDescription(
      'شاید آگهی حذف شده یا سایتش اجازهٔ خوندن نمی‌ده. یه بار دیگه امتحان کنید.',
    )
  },
}

export const LeavingAsks: Story = {
  // Its draft's own link wins over source, as Review's does, KN-571.
  parameters: FIXED,
  args: { step: 'review', source: LINK, draft: FOUND },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    // Leaving with something entered asks first; keeping it goes back, and
    // closing for good closes.
    const dialog = await dialogNamed('افزودن فرصت شغلی')
    await userEvent.click(within(dialog).getByRole('button', { name: 'انصراف' }))
    const ask = await dialogNamed('بدون ذخیره بسته شود؟')
    await userEvent.click(within(ask).getByRole('button', { name: 'انصراف' }))
    await waitFor(() => expect(within(document.body).queryByRole('dialog', { name: 'بدون ذخیره بسته شود؟' })).toBeNull())
    await expect(args.onClose).not.toHaveBeenCalled()
    await userEvent.click(within(dialog).getByRole('button', { name: 'بستن' }))
    // The ask's own close is named «بستن» too; its action comes last.
    const close = within(await dialogNamed('بدون ذخیره بسته شود؟'))
      .getAllByRole('button', { name: 'بستن' })
      .at(-1)
    if (!close) throw new Error('the ask has no close')
    await userEvent.click(close)
    await expect(args.onClose).toHaveBeenCalledTimes(1)
  },
}

export const Phone: Story = {
  // Its draft's own link wins over source, and its assertions, which only the
  // runner reaches, read the form of that step, KN-571.
  parameters: FIXED,
  args: { step: 'review', source: LINK, draft: FOUND },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async () => {
    // On a phone's width, 243:726, the modal sits 16 from the edges and the
    // fields are one column. The screen is resized by the runner's own
    // browser, which only the runner has, KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const { page } = await import('vitest/browser')
    const before = { width: window.innerWidth, height: window.innerHeight }
    try {
      await page.viewport(390, 844)
      const dialog = await dialogNamed('افزودن فرصت شغلی')
      await waitFor(() => expect(dialog.getBoundingClientRect().width).toBe(358))
      const title = within(dialog).getByRole('textbox', { name: 'عنوان شغلی' }).getBoundingClientRect()
      const company = within(dialog).getByRole('textbox', { name: 'نام شرکت' }).getBoundingClientRect()
      await expect([Math.round(company.right), company.top > title.bottom]).toEqual([Math.round(title.right), true])
      // The footer keeps inside the dialog: the actions take a row of their own
      // under the Status Select, at the inline end, rather than run past it.
      const box = dialog.getBoundingClientRect()
      const select = (await isTheStatusFooter(dialog, 'fa-IR')).getBoundingClientRect()
      const add = within(dialog).getByRole('button', { name: 'افزودن' }).getBoundingClientRect()
      const cancel = within(dialog).getByRole('button', { name: 'انصراف' }).getBoundingClientRect()
      await expect([add, cancel, select].every((part) => part.left >= box.left && part.right <= box.right)).toBe(true)
      await expect([add.top > select.bottom, Math.round(add.left - box.left)]).toEqual([true, 24])
    } finally {
      await page.viewport(before.width, before.height)
    }
  },
}

export const InEnglish: Story = {
  // The paste field shows the source, KN-571.
  parameters: offers(['source']),
  args: { ...groupsIn('en-US'), sources: sourcesIn('en-US') },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async () => {
    const i18n = english
    const dialog = await dialogNamed(i18n._('Add job opportunity'))
    await isThePasteWrap(dialog, 'en-US')
    const extract = within(dialog).getByRole('button', { name: i18n._('Extract details') })
    await isTheShell(dialog, 'en-US', extract)
    await expect(extract).toBeDisabled()
  },
}

// A parent that changes the open modal's step, as Storybook's Controls change
// an arg, through a hidden button only a story's play presses, KN-361. A
// portable story applies no updateArgs, so the prop changes where the Controls
// would change it, on the component.
const PASTE: NonNullable<AddJobModalProps['step']> = 'paste'
const Restepped = (args: AddJobModalProps) => {
  const [step, setStep] = useState(args.step ?? PASTE)
  return (
    <>
      <AddJobModal {...args} step={step} />
      <button
        hidden
        data-testid="to-manual"
        onClick={() => {
          setStep('manual')
        }}
      />
    </>
  )
}

export const StepFromItsArgs: Story = {
  // The step changed while the modal is open restarts the flow there: from
  // Paste to the empty form, as choosing Manual in the Controls does. A fixed
  // parent, so no control applies.
  parameters: { controls: { disable: true } },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  render: (args) => <Restepped {...args} />,
  play: async ({ canvasElement }) => {
    const dialog = await dialogNamed('افزودن فرصت شغلی')
    await expect(within(dialog).getByRole('textbox', { name: 'لینک آگهی یا متن کامل آگهی' })).toBeInTheDocument()
    await fireEvent.click(within(canvasElement).getByTestId('to-manual'))
    await expect(await within(dialog).findByRole('textbox', { name: 'عنوان شغلی' })).toHaveValue('')
  },
}

// The reading a story holds open and settles when its play says, KN-391.
let settleReading: ((found: Partial<JobDraft>) => void) | undefined

export const RestartWhileReading: Story = {
  // The step changed while the loading panel waits: the flow starts again on
  // that step, and when the reading it left comes back, it lands nowhere, KN-391.
  // A fixed parent, so no control applies.
  args: {
    source: LINK,
    onExtract: fn(
      () =>
        new Promise<Partial<JobDraft>>((resolve) => {
          settleReading = resolve
        }),
    ),
  },
  parameters: { controls: { disable: true } },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  render: (args) => <Restepped {...args} />,
  play: async ({ canvasElement }) => {
    const dialog = await dialogNamed('افزودن فرصت شغلی')
    await userEvent.click(within(dialog).getByRole('textbox', { name: 'لینک آگهی یا متن کامل آگهی' }))
    await userEvent.click(within(dialog).getByRole('button', { name: 'استخراج اطلاعات' }))
    await within(dialog).findByRole('status')
    await fireEvent.click(within(canvasElement).getByTestId('to-manual'))
    const title = await within(document.body).findByRole('textbox', { name: 'عنوان شغلی' })
    await expect(title).toHaveValue('')
    settleReading?.(FOUND)
    await new Promise((resolve) => setTimeout(resolve, 100))
    await expect(within(document.body).getByRole('textbox', { name: 'عنوان شغلی' })).toHaveValue('')
  },
}

// The reading this story holds open, so its play decides when the answer lands.
let settleLeft: ((found: Partial<JobDraft>) => void) | undefined

export const AnswerAfterLeaving: Story = {
  // Escape while reading goes back to the paste field, KN-361. The reading it
  // left is still out there, and when it answers it must land nowhere: without
  // the guard the form would fill itself under a reader who had walked away
  // from it, KN-391.
  args: {
    source: LINK,
    onExtract: fn(
      () =>
        new Promise<Partial<JobDraft>>((resolve) => {
          settleLeft = resolve
        }),
    ),
  },
  parameters: FIXED,
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const dialog = await dialogNamed('افزودن فرصت شغلی')
    await userEvent.click(within(dialog).getByRole('textbox', { name: 'لینک آگهی یا متن کامل آگهی' }))
    await userEvent.click(within(dialog).getByRole('button', { name: 'استخراج اطلاعات' }))
    await within(dialog).findByRole('status')
    await userEvent.keyboard('{Escape}')
    const field = await within(dialog).findByRole('textbox', { name: 'لینک آگهی یا متن کامل آگهی' })

    // The answer arrives for a reading nobody is waiting on any more.
    settleLeft?.(FOUND)
    await new Promise((resolve) => setTimeout(resolve, 100))
    await expect(field).toHaveValue(LINK)
    await expect(within(canvasElement.ownerDocument.body).queryByRole('textbox', { name: 'عنوان شغلی' })).toBeNull()
  },
}

// What the form's single-line fields declare, KN-464: the key that finishes each
// saves, and the posting link asks for a link's keyboard. The source is the
// Source Picker's combobox, which names no key of its own.
const TYPED: Keyboard = { type: 'text', inputMode: null, enterKeyHint: 'done', autoComplete: null }
const POSTING: Keyboard = { ...TYPED, type: 'url' }

const formIn =
  (locale: Locale): NonNullable<Story['play']> =>
  async () => {
    const i18n = i18nFor(locale)
    const dialog = await dialogNamed(i18n._('Add job opportunity'))
    await userEvent.click(within(dialog).getByRole('button', { name: i18n._('More details') }))
    const expected: [string, Keyboard][] = [
      [i18n._('Job title'), TYPED],
      [i18n._('Company name'), TYPED],
      [i18n._('Location'), TYPED],
      [i18n._('Required experience'), TYPED],
      [i18n._('Salary'), TYPED],
      [i18n._('Posting link'), POSTING],
    ]
    for (const [label, keyboard] of expected) {
      await expect(keyboardOf(within(dialog).getByRole('textbox', { name: label })), label).toEqual(keyboard)
    }
  }

export const KeyboardsOnTheForm: Story = {
  // A pasted link fills the empty form's posting link, KN-571.
  parameters: offers(['source']),
  args: { step: 'manual' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: formIn('fa-IR'),
}

export const KeyboardsOnTheFormInEnglish: Story = {
  // A pasted link fills the empty form's posting link, KN-571.
  parameters: offers(['source']),
  args: { step: 'manual', ...groupsIn('en-US'), sources: sourcesIn('en-US') },
  globals: { locale: 'en-US' },
  play: formIn('en-US'),
}
