import { setupI18n } from '@lingui/core'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import type { Locale } from '../../i18n'
import { messages as en } from '../../i18n/locales/en-US'
import { messages as fa } from '../../i18n/locales/fa-IR'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { EmptyState, type EmptyStateProps } from './EmptyState'

type Copy = Pick<EmptyStateProps, 'title' | 'body' | 'actionLabel'>

// The copy is what the Controls offer; the callback is an action.
const CONTROLLED: (keyof Copy)[] = ['title', 'body', 'actionLabel']

// The uses the screens make of node 159:80, their copy read from the catalog
// in the language a story pins, so the args hold what the canvas draws and the
// Controls show it: the empty job list, 243:64, the contacts, 305:2266, and a
// search that finds nothing, 305:1684, which keeps the add button.
const specimens = (locale: Locale): Record<'jobs' | 'contacts' | 'search', Copy> => {
  const i18n = setupI18n({ locale, messages: { [locale]: locale === 'fa-IR' ? fa : en } })
  const add = i18n._('Add job opportunity')
  return {
    jobs: {
      title: i18n._('You have not added a job posting yet'),
      body: i18n._('Add your first posting by its link or its text, and follow it from here.'),
      actionLabel: add,
    },
    contacts: {
      title: i18n._('You have not added anyone to your network yet'),
      body: i18n._('Keep the people you meet on the way to a job here: recruiters, managers, future teammates.'),
      actionLabel: i18n._('Add contact'),
    },
    search: {
      title: i18n._('No results found'),
      body: i18n._('Nothing matches this search. Try other words or remove the filters.'),
      actionLabel: add,
    },
  }
}
const FA = specimens('fa-IR')
const EN = specimens('en-US')

const meta = {
  title: 'Shared/EmptyState',
  component: EmptyState,
  // Every story pins its language, so its copy can sit in the args in that
  // language and the canvas draws exactly what the Controls show.
  args: { ...FA.jobs, onAction: fn() },
  parameters: { controls: { include: CONTROLLED } },
} satisfies StoryMeta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A token's colour as the browser computes it, borrowed on the host's own
// inline style and put back in the same tick.
const computedColour = (host: HTMLElement, colour: string) => {
  const previous = host.style.color
  host.style.color = colour
  const value = getComputedStyle(host).color
  host.style.color = previous
  return value
}

// The state's parts in order, the mark, the title, the body and the action,
// found from the title, its only heading.
const partsOf = (canvasElement: HTMLElement) => {
  const title = within(canvasElement).getByRole('heading', { level: 2 })
  const root = title.parentElement
  const [mark, , body] = root ? [...root.children] : []
  if (!root || !(mark instanceof HTMLElement) || !(body instanceof HTMLElement))
    throw new Error('the empty state is not the mark, the title and the body in a column')
  return { root, mark, title, body, action: within(canvasElement).getByRole('button') }
}

// Node 159:80 as the args fill it: 32 of padding, the round mark of 64, the
// title 12 below it at 16 and 600, the body 12 below that, 220 wide at 14 on
// 22, and the action 32 below the body, a primary button of 44. The state hugs
// the widest of them. The colours, bg/surface-secondary, text/primary and
// text/secondary, are the light palette's, so they are read only where a story
// pins the light scheme; the others follow the toolbar.
const drawsTheFrame = async (canvasElement: HTMLElement, args: EmptyStateProps, { colours }: { colours: boolean }) => {
  const { root, mark, title, body, action } = partsOf(canvasElement)
  const [box, markBox, titleBox, bodyBox, actionBox] = [root, mark, title, body, action].map((part) => part.getBoundingClientRect())
  if (!box || !markBox || !titleBox || !bodyBox || !actionBox) throw new Error('a part has no box')
  const style = getComputedStyle(root)
  await expect([style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft].map(px)).toEqual([32, 32, 32, 32])
  await expect([markBox.width, markBox.height]).toEqual([64, 64])
  await expect(px(getComputedStyle(mark).borderTopLeftRadius)).toBeGreaterThanOrEqual(32)
  const titleStyle = getComputedStyle(title)
  await expect([px(titleStyle.fontSize), Number(titleStyle.fontWeight), px(titleStyle.lineHeight)]).toEqual([16, 600, 24])
  const bodyStyle = getComputedStyle(body)
  await expect([bodyBox.width, px(bodyStyle.fontSize), Number(bodyStyle.fontWeight), px(bodyStyle.lineHeight)]).toEqual([220, 14, 400, 22])
  if (colours) {
    await expect(getComputedStyle(mark).backgroundColor).toBe(computedColour(mark, semantic['bg/surface-secondary']))
    await expect(titleStyle.color).toBe(computedColour(title, semantic['text/primary']))
    await expect(bodyStyle.color).toBe(computedColour(body, semantic['text/secondary']))
  }
  await expect(actionBox.height).toBe(44)
  await expect([titleBox.top - markBox.bottom, bodyBox.top - titleBox.bottom, actionBox.top - bodyBox.bottom].map(Math.round)).toEqual([
    12, 12, 32,
  ])
  await expect(Math.round(box.width)).toBe(Math.round(Math.max(titleBox.width, bodyBox.width, actionBox.width) + 64))
  // The canvas draws the args and nothing else.
  await expect([title.textContent, body.textContent, action.textContent]).toEqual([args.title, args.body, args.actionLabel])
}

export const JobList: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await drawsTheFrame(canvasElement, args, { colours: true })
    // The call to action is the state's way forward: pressing it starts the add flow.
    await userEvent.click(partsOf(canvasElement).action)
    await expect(args.onAction).toHaveBeenCalledTimes(1)
  },
}

export const Contacts: Story = {
  args: FA.contacts,
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // The title hugs its line and the body keeps its 220, so a title wider
    // than the body widens the state, as 305:2266 does to 300.
    await drawsTheFrame(canvasElement, args, { colours: false })
  },
}

export const NoSearchResults: Story = {
  args: FA.search,
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    await drawsTheFrame(canvasElement, args, { colours: false })
  },
}

export const InEnglish: Story = {
  args: EN.jobs,
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await drawsTheFrame(canvasElement, args, { colours: true })
    await expect(getComputedStyle(partsOf(canvasElement).root).direction).toBe('ltr')
  },
}
