import { useLingui } from '@lingui/react'
import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { elevation, semantic, spacing } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { LinkedJobs, type LinkedJobItem, type LinkedJobsProps } from './LinkedJobs'

// The person modal's field, 512 wide.
const FIELD_WIDTH = 512

// The reader's first five job opportunities, each with its status's name.
const jobsIn = (locale: Locale): readonly LinkedJobItem[] => {
  const set = fixtures(locale)
  return set.jobs.slice(0, 5).map((job) => {
    const option = set.statusOptions.find((entry) => entry.token === job.status)
    if (!option) throw new Error('a job opportunity has a status the fixtures do not name')
    return { id: job.id, title: job.title, company: job.company, status: { token: option.token, name: option.name } }
  })
}

// The section as the person modal holds it: linking and unlinking change what
// it lists, and the args hear of each.
const InTheModal = ({ linked: given, jobs, onLink, onUnlink }: LinkedJobsProps) => {
  const { i18n } = useLingui()
  const [linked, setLinked] = useState(given)
  return (
    // Inside the modal's padding, as the field is: MUI's Popover keeps 16 from
    // the window's edge, which a field flush with it would push the picker off.
    <Box sx={{ width: FIELD_WIDTH, paddingInline: `${spacing.lg}px` }} aria-label={i18n._('Linked job opportunities')}>
      <LinkedJobs
        linked={linked}
        jobs={jobs}
        onLink={(id) => {
          const job = jobs.find((entry) => entry.id === id)
          if (job) setLinked((current) => [...current, job])
          onLink(id)
        }}
        onUnlink={(id) => {
          setLinked((current) => current.filter((entry) => entry.id !== id))
          onUnlink(id)
        }}
      />
    </Box>
  )
}

const FA_JOBS = jobsIn('fa-IR')

const meta = {
  title: 'Shared/LinkedJobs',
  component: LinkedJobs,
  args: { linked: FA_JOBS.slice(0, 2), jobs: FA_JOBS, onLink: fn(), onUnlink: fn() },
  parameters: { controls: { include: [] } },
  render: (args) => <InTheModal {...args} />,
} satisfies StoryMeta<typeof LinkedJobs>

export default meta
type Story = StoryObj<typeof meta>

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

type Palette = Record<keyof typeof semantic, string>

// The runner's 414 cannot hold a field of 512 and the picker beside it, so a
// story that measures or points at them widens the page while it runs.
const wide = async (run: () => Promise<void>) => {
  const testing = '__KARNAMA_STORY_TEST__' in globalThis
  if (testing) await (await import('vitest/browser')).page.viewport(1280, 800)
  try {
    await run()
  } finally {
    if (testing) await (await import('vitest/browser')).page.viewport(414, 896)
  }
}

const sectionOf = (canvasElement: HTMLElement) => {
  const section = canvasElement.querySelector('[aria-label]')?.firstElementChild
  if (!(section instanceof HTMLElement)) throw new Error('the section is missing')
  return section
}

// Opens the picker from the link button and returns its parts.
const openPicker = async (canvasElement: HTMLElement, locale: Locale) => {
  const i18n = i18nFor(locale)
  const button = within(canvasElement).getByRole('button', { name: i18n._('Link to a job opportunity') })
  await userEvent.click(button)
  const search = await within(canvasElement.ownerDocument.body).findByRole('combobox', { name: i18n._('Search your job opportunities') })
  await waitFor(() => expect(search).toHaveFocus())
  const listbox = within(canvasElement.ownerDocument.body).getByRole('listbox')
  const paper = listbox.parentElement
  if (!(paper instanceof HTMLElement)) throw new Error('the picker has no panel')
  return { button, search, listbox, paper }
}

// Node 1092:3103's label, «فرصت‌های شغلی وصل‌شده», in Label text/primary, 8
// above what it holds, and the Text button at the inline start.
const headIs = async (section: HTMLElement, locale: Locale, palette: Palette) => {
  const i18n = i18nFor(locale)
  const label = within(section).getByText(i18n._('Linked job opportunities'))
  const style = getComputedStyle(label)
  await expect([px(style.fontSize), px(style.lineHeight), style.fontWeight]).toEqual([12, 16, '500'])
  await expect(style.color).toBe(computed(label, palette['text/primary']))
  await expect(px(getComputedStyle(section).rowGap)).toBe(8)
  const button = within(section).getByRole('button', { name: i18n._('Link to a job opportunity') })
  await expect(button.getBoundingClientRect().height).toBe(36)
}

export const Empty: Story = {
  // State=Empty, 90 tall: nothing linked yet, said in Body text/secondary.
  args: { linked: [] },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await wide(async () => {
      const i18n = i18nFor('fa-IR')
      const section = sectionOf(canvasElement)
      await headIs(section, 'fa-IR', semantic)
      const empty = within(section).getByText(i18n._('Not linked to a job opportunity yet.'))
      await expect([px(getComputedStyle(empty).fontSize), getComputedStyle(empty).color]).toEqual([14, computed(empty, semantic['text/secondary'])])
      await expect(section.getBoundingClientRect().height).toBe(90)
    })
  },
}

export const Filled: Story = {
  // State=Filled, 183 tall: the two linked in a list at radius 8 inside one
  // pixel of border/default, a divider between them.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await wide(async () => {
      const section = sectionOf(canvasElement)
      await headIs(section, 'fa-IR', semantic)
      const list = within(section).getByRole('list')
      const style = getComputedStyle(list)
      await expect([px(style.borderTopWidth), px(style.borderTopLeftRadius)]).toEqual([1, 8])
      await expect(style.borderTopColor).toBe(computed(list, semantic['border/default']))
      await expect(list.getBoundingClientRect().height).toBe(115)
      await expect(within(list).getAllByRole('group').map((row) => row.getAttribute('aria-labelledby') !== null)).toEqual(args.linked.map(() => true))
      await expect(section.getBoundingClientRect().height).toBe(183)
    })
  },
}

export const Picking: Story = {
  // State=Picking: the picker 4 under the button from its inline start, 360
  // wide at radius 8 with its shadow; the search inside one and a half of
  // border/focus; each job opportunity 54 tall, the linked ones muted and
  // marked «وصل است» in text/brand, the others with their status.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await wide(async () => {
      const i18n = i18nFor('fa-IR')
      const { button, search, listbox, paper } = await openPicker(canvasElement, 'fa-IR')
      const style = getComputedStyle(paper)
      await expect([paper.getBoundingClientRect().width, px(style.borderTopLeftRadius), px(style.paddingTop), px(style.rowGap)]).toEqual([360, 8, 8, 4])
      await expect(style.boxShadow).toBe(shadowOf(paper, elevation.picker))
      const [under, over] = [button.getBoundingClientRect(), paper.getBoundingClientRect()]
      await expect(Math.round(over.top - under.bottom)).toBe(4)
      await expect(Math.round(under.right - over.right)).toBe(0)
      const field = search.closest('.MuiInputBase-root')
      if (!(field instanceof HTMLElement)) throw new Error('the search has no field')
      await expect(field.getBoundingClientRect().height).toBe(41)
      // One and a half of border/focus, an inset shadow: its colour, then 0 0 0 and 1.5.
      const edge = getComputedStyle(field).boxShadow
      await expect(edge.startsWith(computed(field, semantic['border/focus']))).toBe(true)
      await expect((edge.match(/-?[\d.]+(?=px)/g) ?? []).map(Number)).toEqual([0, 0, 0, 1.5])
      await expect(edge.endsWith('inset')).toBe(true)
      const options = within(listbox).getAllByRole('option')
      await expect(options.map((option) => option.getBoundingClientRect().height)).toEqual(options.map(() => 54))
      const linkedIds = new Set(args.linked.map((job) => job.id))
      for (const [index, job] of args.jobs.entries()) {
        const option = options[index]
        if (!option) throw new Error('an option is missing')
        await expect(option.getAttribute('aria-disabled')).toBe(String(linkedIds.has(job.id)))
        if (linkedIds.has(job.id)) {
          const mark = within(option).getByText(i18n._('Linked'))
          await expect(getComputedStyle(mark).color).toBe(computed(mark, semantic['text/brand']))
        } else {
          await expect(within(option).getByText(job.status.name)).toBeVisible()
        }
      }
    })
  },
}

export const Choosing: Story = {
  // A press on one that is not linked links it, closes the picker, and the
  // list then holds it.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await wide(async () => {
      const { listbox } = await openPicker(canvasElement, 'fa-IR')
      const target = args.jobs[3]
      if (!target) throw new Error('the fixtures hold too few job opportunities')
      await userEvent.click(within(listbox).getByText(target.title))
      await expect(args.onLink).toHaveBeenCalledWith(target.id)
      await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('listbox')).toBeNull())
      await expect(within(within(canvasElement).getByRole('list')).getByRole('group', { name: target.title })).toBeVisible()
    })
  },
}

export const Searching: Story = {
  // What is typed narrows the list to the titles and companies that hold it;
  // with nothing found it says so.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await wide(async () => {
      const i18n = i18nFor('fa-IR')
      const { search, listbox } = await openPicker(canvasElement, 'fa-IR')
      const target = args.jobs[2]
      if (!target) throw new Error('the fixtures hold too few job opportunities')
      await userEvent.type(search, target.title)
      await expect(within(listbox).getAllByRole('option').map((option) => option.textContent.includes(target.title))).not.toContain(false)
      await userEvent.clear(search)
      await userEvent.type(search, fixtures('fa-IR').longStatusName)
      await expect(within(listbox).queryAllByRole('option')).toHaveLength(0)
      await expect(within(listbox).getByText(i18n._('No results found'))).toBeVisible()
    })
  },
}

export const Keyboard: Story = {
  // The arrows move through the ones that can be chosen, the search keeps
  // focus and names the one it is on, and Enter links it; Escape closes.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await wide(async () => {
      const { search } = await openPicker(canvasElement, 'fa-IR')
      const choosable = args.jobs.filter((job) => !args.linked.some((linked) => linked.id === job.id))
      const [first, second] = choosable
      if (!first || !second) throw new Error('the fixtures hold too few job opportunities')
      const activeOf = () => search.ownerDocument.getElementById(search.getAttribute('aria-activedescendant') ?? '')
      await expect(activeOf()?.textContent).toContain(first.title)
      await userEvent.keyboard('{ArrowDown}')
      await expect(search).toHaveFocus()
      await expect(activeOf()?.textContent).toContain(second.title)
      await userEvent.keyboard('{Enter}')
      await expect(args.onLink).toHaveBeenCalledWith(second.id)
      await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('listbox')).toBeNull())
      await openPicker(canvasElement, 'fa-IR')
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('listbox')).toBeNull())
      await expect(args.onLink).toHaveBeenCalledOnce()
    })
  },
}

export const Unlinking: Story = {
  // The unlink button on a row takes it out of the list.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await wide(async () => {
      const i18n = i18nFor('fa-IR')
      const [first] = args.linked
      if (!first) throw new Error('the story links nothing')
      const row = within(within(canvasElement).getByRole('list')).getByRole('group', { name: first.title })
      await userEvent.click(within(row).getByRole('button', { name: i18n._('Unlink') }))
      await expect(args.onUnlink).toHaveBeenCalledWith(first.id)
      await expect(within(within(canvasElement).getByRole('list')).queryByRole('group', { name: first.title })).toBeNull()
    })
  },
}

export const InEnglish: Story = {
  // In English the picker hangs from the button's left edge.
  args: { linked: jobsIn('en-US').slice(0, 2), jobs: jobsIn('en-US') },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await wide(async () => {
      await headIs(sectionOf(canvasElement), 'en-US', semantic)
      const { button, paper } = await openPicker(canvasElement, 'en-US')
      await expect(Math.round(paper.getBoundingClientRect().left - button.getBoundingClientRect().left)).toBe(0)
    })
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    await wide(async () => {
      await headIs(sectionOf(canvasElement), 'fa-IR', darkSemantic)
      const { paper } = await openPicker(canvasElement, 'fa-IR')
      await expect(getComputedStyle(paper).backgroundColor).toBe(computed(paper, darkSemantic['bg/surface']))
    })
  },
}
