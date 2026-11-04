import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { darkSemantic, darkStatus } from '../../theme/darkMode'
import { elevation, semantic, status, type StatusToken } from '../../theme/tokens'
import { cardFooter, type CardFooter, type FooterColumn } from '../job-card'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { KanbanCard, type KanbanCardProps } from './KanbanCard'

// The frame's width, which the board's column gives the card.
const WIDTH = 276
// The day the stories are read on, 4 November 2026, so every footer counts
// from one place.
const TODAY_MS = Date.UTC(2026, 10, 4)
const DAY_MS = 86_400_000
const dayOf = (ms: number) => new Date(ms).toISOString().slice(0, 10)
const TODAY = dayOf(TODAY_MS)
const daysFrom = (days: number) => dayOf(TODAY_MS + days * DAY_MS)

const APPLIED: StatusToken = 'applied'
const SAVED: FooterColumn = 'saved'
const PROGRESS: FooterColumn = 'progress'

// The footer the card's column and dates give, in a language.
const footerFor = (locale: Locale, column: FooterColumn, deadlineIn: number | null): CardFooter =>
  cardFooter(
    i18nFor(locale),
    locale,
    column,
    { saved: daysFrom(-6), applied: daysFrom(-23), deadline: deadlineIn === null ? null : daysFrom(deadlineIn) },
    TODAY,
  )

// The frame's three deadlines: five days to go, three, and one already passed.
const NORMAL = 5
const NEAR = 3
const PASSED = -1

// The card as the frame draws it, in a language, with a footer.
const cardIn = (locale: Locale, footer: CardFooter) => {
  const card = fixtures(locale).kanbanCard
  return {
    title: card.title,
    company: card.company,
    location: card.location,
    salary: card.salary,
    source: card.source,
    note: card.note,
    footer,
  }
}

const meta = {
  title: 'Shared/KanbanCard',
  component: KanbanCard,
  args: {
    ...cardIn('fa-IR', footerFor('fa-IR', SAVED, NORMAL)),
    status: APPLIED,
    selecting: false,
    selected: false,
    onOpen: fn(),
    onSelectedChange: fn(),
    onMore: fn(),
    onEditDate: fn(),
    onNoResponse: fn(),
  },
  parameters: { controls: { include: ['selecting', 'selected', 'status'] } },
  decorators: [
    (Story) => (
      <Box sx={{ width: WIDTH }}>
        <Story />
      </Box>
    ),
  ],
} satisfies StoryMeta<typeof KanbanCard>

export default meta
type Story = StoryObj<typeof meta>

type Palette = Record<keyof typeof semantic, string>
type Statuses = Record<StatusToken, { base: string }>
// The footer's two colours, typed so the lint rule reads them as values.
const URGENT: keyof typeof semantic = 'text/error'
const QUIET: keyof typeof semantic = 'text/secondary'
// The media query a touch screen answers, for the same reason.
type Query = '(hover: none)'
const NO_HOVER: Query = '(hover: none)'

const px = (value: string) => Number.parseFloat(value) || 0

// A colour, or a shadow, as the browser computes it, borrowed on the host's own
// inline style and put back in the same tick. Never inside waitFor, KN-014.
const computed = (host: HTMLElement, value: string) => {
  const previous = host.style.color
  host.style.color = value
  const result = getComputedStyle(host).color
  host.style.color = previous
  return result
}
const shadowOf = (host: HTMLElement, value: string) => {
  const previous = host.style.boxShadow
  host.style.boxShadow = value
  const result = getComputedStyle(host).boxShadow
  host.style.boxShadow = previous
  return result
}

const cardOf = (canvasElement: HTMLElement) => {
  const card = canvasElement.querySelector('article')
  if (!(card instanceof HTMLElement)) throw new Error('no card')
  return card
}

// The runner's own pointer, which only the runner has; outside it the story
// shows the card at rest.
const pointAt = async (element: HTMLElement) => {
  if (!('__KARNAMA_STORY_TEST__' in globalThis)) return false
  await (await import('vitest/browser')).userEvent.hover(element)
  return true
}
// A press where the pointer is, which lands on whatever is drawn there, the
// title's cover for a press on the card's text; testing-library's would go to
// the element it is handed instead. Forced, since the runner otherwise waits for
// nothing to be drawn over the element, and the cover always is.
const pressAt = async (element: HTMLElement) => {
  if (!('__KARNAMA_STORY_TEST__' in globalThis)) return false
  await (await import('vitest/browser')).userEvent.click(element, { force: true })
  return true
}

// Node 793:1820 at rest: 276 wide, 16 round and 12 between, bg/surface inside
// one pixel of border/default at radius 8, the status's 4 stripe at the inline
// start; the title 14 on 22 at Medium in text/primary over the company 12 on 19
// in text/secondary; the meta line's dot in text/disabled; the note line's 14
// icon and its text in text/primary; the footer's source at the inline start and
// its time at the inline end, the deadline at Medium after its clock, red when
// near; More and the pencil folded, and no shadow.
const isTheFrame = async (canvasElement: HTMLElement, args: KanbanCardProps, palette: Palette, statuses: Statuses = status) => {
  const card = cardOf(canvasElement)
  const style = getComputedStyle(card)
  await expect([
    card.getBoundingClientRect().width,
    px(style.paddingTop),
    px(style.paddingInlineStart),
    px(style.rowGap),
    px(style.borderTopLeftRadius),
  ]).toEqual([WIDTH, 16, 16, 12, 8])
  await expect(style.backgroundColor).toBe(computed(card, palette['bg/surface']))
  await expect(px(getComputedStyle(card, '::before').borderTopWidth)).toBe(args.selected === true ? 2 : 1)
  await expect(getComputedStyle(card).boxShadow).toBe('none')
  const rtl = style.direction === 'rtl'
  const box = card.getBoundingClientRect()
  const stripe = card.firstElementChild
  if (!(stripe instanceof HTMLElement)) throw new Error('the card has no stripe')
  const stripeBox = stripe.getBoundingClientRect()
  await expect([stripeBox.width, stripeBox.height]).toEqual([4, box.height])
  await expect(Math.round(rtl ? box.right - stripeBox.right : stripeBox.left - box.left)).toBe(0)
  await expect(getComputedStyle(stripe).backgroundColor).toBe(computed(stripe, statuses[args.status].base))
  const title = within(card).getByRole('button', { name: args.title })
  const titled = getComputedStyle(title)
  await expect([px(titled.fontSize), px(titled.lineHeight), Number(titled.fontWeight)]).toEqual([14, 22, 500])
  await expect(titled.color).toBe(computed(title, palette['text/primary']))
  const company = within(card).getByText(args.company)
  await expect([px(getComputedStyle(company).fontSize), px(getComputedStyle(company).lineHeight)]).toEqual([12, 19])
  await expect(getComputedStyle(company).color).toBe(computed(company, palette['text/secondary']))
  const dot = within(card).getByText('·')
  await expect(getComputedStyle(dot).color).toBe(computed(dot, palette['text/disabled']))
  if (args.note !== undefined && args.note !== null) {
    const note = within(card).getByText(args.note)
    await expect(getComputedStyle(note).color).toBe(computed(note, palette['text/primary']))
    await expect(note.previousElementSibling?.getBoundingClientRect().width).toBe(14)
  }
  const time = within(card).getByText(args.footer.text)
  await expect(Number(getComputedStyle(time).fontWeight)).toBe(args.footer.clock ? 500 : 400)
  await expect(getComputedStyle(time).color).toBe(computed(time, palette[args.footer.urgent ? URGENT : QUIET]))
  if (args.source !== undefined && args.source !== null) {
    const source = within(card).getByText(args.source).getBoundingClientRect()
    const timed = time.getBoundingClientRect()
    await expect(rtl ? source.left > timed.right : source.right < timed.left).toBe(true)
  }
  const more = within(card).queryByRole('button', { name: i18nFor(rtl ? 'fa-IR' : 'en-US')._('Job opportunity actions') })
  if (more) await expect(more.parentElement?.getBoundingClientRect().width).toBe(0)
  return card
}

// Hover, 793:1775: the shadow elevation.kanbanCard, More unfolded to its 28
// square and the pencil to its 28 by 19 beside the time; Select Hover, 961:100656,
// the shadow alone, More kept folded while the board is selecting.
const isHovered = async (canvasElement: HTMLElement, args: KanbanCardProps, locale: Locale) => {
  const card = cardOf(canvasElement)
  if (!(await pointAt(card))) return
  const i18n = i18nFor(locale)
  await waitFor(() => expect(getComputedStyle(card).boxShadow).toBe(shadowOf(card, elevation.kanbanCard)))
  const more = within(card).getByRole('button', { name: i18n._('Job opportunity actions'), hidden: true })
  if (args.selecting === true) {
    await expect(more.parentElement?.getBoundingClientRect().width).toBe(0)
  } else {
    await waitFor(() => expect(more.getBoundingClientRect().width).toBe(28))
    await expect(more.getBoundingClientRect().height).toBe(28)
  }
  const pencil = within(card).getByRole('button', { name: i18n._('Change the deadline'), hidden: true })
  await waitFor(() => expect([pencil.getBoundingClientRect().width, pencil.getBoundingClientRect().height]).toEqual([28, 19]))
}

const variant = (locale: Locale, deadlineIn: number, state: 'rest' | 'hover' | 'select-hover'): Story => ({
  args: { ...cardIn(locale, footerFor(locale, SAVED, deadlineIn)), selecting: state === 'select-hover' },
  globals: { locale, colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFrame(canvasElement, args, semantic)
    if (state !== 'rest') await isHovered(canvasElement, args, locale)
  },
})

// The nine variants of 793:1820: State by مهلت.
export const Default: Story = variant('fa-IR', NORMAL, 'rest')
export const Hover: Story = variant('fa-IR', NORMAL, 'hover')
export const SelectHover: Story = variant('fa-IR', NORMAL, 'select-hover')
export const NearDeadline: Story = variant('fa-IR', NEAR, 'rest')
export const NearDeadlineHover: Story = variant('fa-IR', NEAR, 'hover')
export const NearDeadlineSelectHover: Story = variant('fa-IR', NEAR, 'select-hover')
export const PassedDeadline: Story = variant('fa-IR', PASSED, 'rest')
export const PassedDeadlineHover: Story = variant('fa-IR', PASSED, 'hover')
export const PassedDeadlineSelectHover: Story = variant('fa-IR', PASSED, 'select-hover')

export const InProgress: Story = {
  // A stage in progress counts the days since applying, with no clock, and the
  // pencil edits the application, the board's commonest card.
  args: { ...cardIn('fa-IR', footerFor('fa-IR', PROGRESS, null)) },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const card = await isTheFrame(canvasElement, args, semantic)
    if (!(await pointAt(card))) return
    const pencil = within(card).getByRole('button', { name: i18nFor('fa-IR')._('Change the application date'), hidden: true })
    await waitFor(() => expect(pencil.getBoundingClientRect().width).toBe(28))
    await userEvent.click(pencil)
    await expect(args.onEditDate).toHaveBeenCalledWith(pencil.parentElement)
  },
}

export const Selected: Story = {
  // Selected while selecting: the Checkbox ticked and the brand's ring of two.
  args: { selecting: true, selected: true },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const card = await isTheFrame(canvasElement, args, semantic)
    await expect(getComputedStyle(card, '::before').borderTopColor).toBe(computed(card, semantic['border/focus']))
    await expect(within(card).getByRole('checkbox', { name: `${i18nFor('fa-IR')._('Select')} ${args.title}` })).toBeChecked()
  },
}

export const Opening: Story = {
  // A press anywhere that is not another control opens the job opportunity;
  // while selecting it selects instead, the handoff's «تا پایانش هر کلیک
  // انتخاب است».
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const card = cardOf(canvasElement)
    if (!(await pressAt(within(card).getByText(args.company)))) return
    await expect(args.onOpen).toHaveBeenCalledTimes(1)
    await expect(args.onSelectedChange).not.toHaveBeenCalled()
  },
}

export const SelectingByAPress: Story = {
  args: { selecting: true },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const card = cardOf(canvasElement)
    if (!(await pressAt(within(card).getByText(args.company)))) return
    await expect(args.onSelectedChange).toHaveBeenCalledWith(true)
    await expect(args.onOpen).not.toHaveBeenCalled()
  },
}

export const MoreOpens: Story = {
  // More hands the board its anchor, for the card's menu.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const card = cardOf(canvasElement)
    if (!(await pointAt(card))) return
    const more = within(card).getByRole('button', { name: i18nFor('fa-IR')._('Job opportunity actions') })
    await waitFor(() => expect(more.getBoundingClientRect().width).toBe(28))
    await userEvent.click(more)
    await expect(args.onMore).toHaveBeenCalledWith(more.parentElement)
    await expect(args.onOpen).not.toHaveBeenCalled()
  },
}

export const StillWaiting: Story = {
  // The prompt, 694:10489: «هنوز منتظرید؟» on bg/surface-secondary at radius
  // 6, and the inline link that says it went unanswered.
  args: { ...cardIn('fa-IR', footerFor('fa-IR', PROGRESS, null)), note: null, waiting: true },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const card = cardOf(canvasElement)
    const asked = within(card).getByText(i18n._('Still waiting?'))
    const row = asked.parentElement
    if (!(row instanceof HTMLElement)) throw new Error('the prompt has no row')
    const style = getComputedStyle(row)
    await expect([px(style.paddingTop), px(style.paddingInlineStart), px(style.borderTopLeftRadius)]).toEqual([6, 8, 6])
    await expect(style.backgroundColor).toBe(computed(row, semantic['bg/surface-secondary']))
    await userEvent.click(within(row).getByRole('button', { name: i18n._('It went unanswered') }))
    await expect(args.onNoResponse).toHaveBeenCalledTimes(1)
    await expect(args.onOpen).not.toHaveBeenCalled()
  },
}

export const OnATouchScreen: Story = {
  // Where there is no hover, as on a phone, More is in view at rest, 1274:64316.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const touch = window.matchMedia(NO_HOVER).matches
    const more = within(cardOf(canvasElement)).getByRole('button', { name: i18nFor('fa-IR')._('Job opportunity actions'), hidden: true })
    await expect(more.parentElement?.getBoundingClientRect().width).toBe(touch ? 28 : 0)
  },
}

export const InEnglish: Story = {
  args: { ...cardIn('en-US', footerFor('en-US', SAVED, NEAR)) },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFrame(canvasElement, args, semantic)
    await isHovered(canvasElement, args, 'en-US')
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ args, canvasElement }) => {
    await isTheFrame(canvasElement, args, darkSemantic, darkStatus)
  },
}
