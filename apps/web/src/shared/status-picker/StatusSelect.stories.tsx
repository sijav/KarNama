import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { semantic, type StatusToken } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import type { StatusOption } from './StatusPicker'
import { StatusSelect, type StatusSelectProps } from './StatusSelect'

const FA = fixtures('fa-IR')
const EN = fixtures('en-US')
type Fixtures = typeof FA

// The four stages and four outcomes the grouped picker draws, as its stories
// take them.
const STAGES: readonly StatusToken[] = ['new', 'applied', 'interview', 'offer']
const ACCEPTED: StatusToken = 'custom-1'
const REJECTED: StatusToken = 'rejected'
const GREY: StatusToken = 'new'

const specimen = (set: Fixtures) => {
  const stages = STAGES.map((token) => {
    const found = set.statusOptions.find((option) => option.token === token)
    if (!found) throw new Error(`the fixtures hold no ${token} status`)
    return found
  })
  const outcomes: StatusOption[] = [
    { id: 'outcome-accepted', token: ACCEPTED, name: set.outcomeNames.accepted },
    { id: 'outcome-rejected', token: REJECTED, name: set.outcomeNames.rejected },
    { id: 'outcome-no-response', token: GREY, name: set.outcomeNames.noResponse },
    { id: 'outcome-withdrawn', token: GREY, name: set.outcomeNames.withdrawn },
  ]
  return { stages, outcomes, value: stages[0]?.id ?? '' }
}

// The trigger holding its own choice, as the add modal does, in a footer that
// leaves room above it for the menu.
const Held = ({ value, onChange, ...args }: StatusSelectProps) => {
  const [chosen, setChosen] = useState(value)
  return (
    <div style={{ paddingBlockStart: 260, paddingInline: 32 }}>
      <StatusSelect
        {...args}
        value={chosen}
        onChange={(id) => {
          setChosen(id)
          onChange(id)
        }}
      />
    </div>
  )
}

const meta = {
  title: 'Shared/StatusSelect',
  component: StatusSelect,
  args: { ...specimen(FA), onChange: fn(), onAdd: fn() },
  parameters: { controls: { include: ['value'] } },
  render: (args) => <Held {...args} />,
} satisfies StoryMeta<typeof StatusSelect>

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

// Named by what it says, «وضعیت:» and the chosen status, however the browser
// spaces the two.
const triggerIn = (canvasElement: HTMLElement, chosen: string, locale: Locale) => {
  const i18n = i18nFor(locale)
  const said = i18n._('Status:')
  return within(canvasElement).getByRole('button', { name: (name) => name.replace(/\s+/g, '') === `${said}${chosen}`.replace(/\s+/g, '') })
}

// Node 1257:3315's field: 44 tall, bg/surface at radius md, 16 at the sides and
// 8 between, from the inline start «وضعیت:» in Body text/secondary, the chosen
// status's small chip and the chevron at 20, its edge one of border/default.
const isTheFiles = async (canvasElement: HTMLElement, args: StatusSelectProps, locale: Locale, palette: Palette) => {
  const chosen = args.stages.find((stage) => stage.id === args.value)
  if (!chosen) throw new Error('the story chose no stage')
  const trigger = triggerIn(canvasElement, chosen.name, locale)
  const style = getComputedStyle(trigger)
  const box = trigger.getBoundingClientRect()
  await expect(box.height).toBe(44)
  await expect([px(style.paddingInlineStart), px(style.paddingInlineEnd), px(style.columnGap), px(style.borderTopLeftRadius)]).toEqual([16, 16, 8, 8])
  await expect(style.backgroundColor).toBe(computed(trigger, palette['bg/surface']))
  const edge = getComputedStyle(trigger, '::before')
  await expect([px(edge.borderTopWidth), edge.borderTopColor]).toEqual([1, computed(trigger, palette['border/default'])])
  await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  const [label, chip, chevron] = [...trigger.children]
  if (!(label instanceof HTMLElement) || !(chip instanceof HTMLElement) || !(chevron instanceof SVGElement)) throw new Error('the field is missing a part')
  const labelled = getComputedStyle(label)
  await expect([px(labelled.fontSize), px(labelled.lineHeight), labelled.fontWeight]).toEqual([14, 22, '400'])
  await expect(labelled.color).toBe(computed(label, palette['text/secondary']))
  await expect(chip.getBoundingClientRect().height).toBe(24)
  await expect(chip).toHaveTextContent(chosen.name)
  await expect([chevron.getBoundingClientRect().width, chevron.getBoundingClientRect().height]).toEqual([20, 20])
  await expect(getComputedStyle(chevron).color).toBe(computed(trigger, palette['text/secondary']))
  const rtl = style.direction === 'rtl'
  const startOf = (part: Element) => Math.round(rtl ? box.right - part.getBoundingClientRect().right : part.getBoundingClientRect().left - box.left)
  await expect(startOf(label)).toBe(16)
  await expect(startOf(label) < startOf(chip) && startOf(chip) < startOf(chevron)).toBe(true)
}

// The add modal is wider than the test runner's 414, and the menu is 538, so
// the stories that open it give the runner a desktop's width and put its own
// back; in the published Storybook there is no runner to size.
const atDesktopWidth = async () => {
  if ('__KARNAMA_STORY_TEST__' in globalThis) await (await import('vitest/browser')).page.viewport(1280, 800)
}
const backToTheRunnersWidth = async () => {
  if ('__KARNAMA_STORY_TEST__' in globalThis) await (await import('vitest/browser')).page.viewport(414, 896)
}

// The menu the trigger opens: 4 above it from its inline start, bg/surface at
// radius lg, 12 round, an edge of border/default, holding the grouped picker
// without its label, focus on the chosen status.
const opens = async (canvasElement: HTMLElement, args: StatusSelectProps, locale: Locale, palette: Palette) => {
  const chosen = args.stages.find((stage) => stage.id === args.value)
  if (!chosen) throw new Error('the story chose no stage')
  const trigger = triggerIn(canvasElement, chosen.name, locale)
  await userEvent.click(trigger)
  const menu = await within(canvasElement.ownerDocument.body).findByRole('dialog', { name: i18nFor(locale)._('Status') })
  await waitFor(() => expect(within(menu).getByRole('radio', { name: chosen.name })).toHaveFocus())
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(getComputedStyle(trigger, '::before').borderTopColor).toBe(computed(trigger, palette['border/focus']))
  const style = getComputedStyle(menu)
  await expect([px(style.paddingTop), px(style.borderTopWidth), px(style.borderTopLeftRadius)]).toEqual([12, 1, 16])
  await expect(style.borderTopColor).toBe(computed(menu, palette['border/default']))
  await expect(style.backgroundColor).toBe(computed(menu, palette['bg/surface']))
  const [kept, field] = [menu.getBoundingClientRect(), trigger.getBoundingClientRect()]
  await expect(Math.round(field.top - kept.bottom)).toBe(4)
  const rtl = getComputedStyle(trigger).direction === 'rtl'
  await expect(Math.round(rtl ? field.right - kept.right : kept.left - field.left)).toBe(0)
  const i18n = i18nFor(locale)
  await expect(within(menu).queryByText(i18n._('Status'))).toBeNull()
  return { menu, trigger }
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, 'fa-IR', semantic)
  },
}

export const Hover: Story = {
  // Under a real pointer the edge takes text/secondary. Only the test runner
  // has a pointer to move.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const chosen = args.stages[0]
    if (!chosen) throw new Error('no stage')
    const trigger = triggerIn(canvasElement, chosen.name, 'fa-IR')
    const hovered = computed(trigger, semantic['text/secondary'])
    const browser = await import('vitest/browser')
    await browser.userEvent.hover(trigger)
    await waitFor(() => expect(getComputedStyle(trigger, '::before').borderTopColor).toBe(hovered))
  },
}

export const Open: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await atDesktopWidth()
    await opens(canvasElement, args, 'fa-IR', semantic)
    await userEvent.keyboard('{Escape}')
    await backToTheRunnersWidth()
  },
}

export const Choose: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await atDesktopWidth()
    // A choice closes the menu, hands the status over, and the field shows it,
    // focus back on the field.
    const { menu } = await opens(canvasElement, args, 'fa-IR', semantic)
    const next = args.stages[1]
    if (!next) throw new Error('no second stage')
    await userEvent.click(within(menu).getByRole('radio', { name: next.name }))
    await expect(args.onChange).toHaveBeenCalledWith(next.id)
    await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(triggerIn(canvasElement, next.name, 'fa-IR')).toHaveFocus())
    await backToTheRunnersWidth()
  },
}

export const AddAStage: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await atDesktopWidth()
    const i18n = i18nFor('fa-IR')
    const { menu } = await opens(canvasElement, args, 'fa-IR', semantic)
    await userEvent.click(within(menu).getByRole('button', { name: i18n._('Add status') }))
    await expect(args.onAdd).toHaveBeenCalledOnce()
    await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('dialog')).toBeNull())
    await backToTheRunnersWidth()
  },
}

export const Escape: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await atDesktopWidth()
    // Escape closes it with nothing chosen.
    const { trigger } = await opens(canvasElement, args, 'fa-IR', semantic)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(trigger).toHaveFocus())
    await expect(args.onChange).not.toHaveBeenCalled()
    await backToTheRunnersWidth()
  },
}

export const InEnglish: Story = {
  args: specimen(EN),
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await atDesktopWidth()
    await isTheFiles(canvasElement, args, 'en-US', semantic)
    await opens(canvasElement, args, 'en-US', semantic)
    await userEvent.keyboard('{Escape}')
    await backToTheRunnersWidth()
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ args, canvasElement }) => {
    await atDesktopWidth()
    await isTheFiles(canvasElement, args, 'fa-IR', darkSemantic)
    await opens(canvasElement, args, 'fa-IR', darkSemantic)
    await userEvent.keyboard('{Escape}')
    await backToTheRunnersWidth()
  },
}
