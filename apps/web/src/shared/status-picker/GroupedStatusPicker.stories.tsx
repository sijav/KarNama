import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { semantic, type StatusToken } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { GroupedStatusPicker, type GroupedStatusPickerProps } from './GroupedStatusPicker'
import type { StatusOption } from './StatusPicker'

// The modal's body is 512 wide where the file draws the picker.
const WIDTH = 512

const FA = fixtures('fa-IR')
const EN = fixtures('en-US')
type Fixtures = typeof FA

// The four stages the file draws, from the fixtures' own statuses.
const STAGES: readonly StatusToken[] = ['new', 'applied', 'interview', 'offer']
const ACCEPTED: StatusToken = 'custom-1'
const REJECTED: StatusToken = 'rejected'
const GREY: StatusToken = 'new'

const stagesOf = (set: Fixtures): StatusOption[] =>
  STAGES.map((token) => {
    const found = set.statusOptions.find((option) => option.token === token)
    if (!found) throw new Error(`the fixtures hold no ${token} status`)
    return found
  })

// The four outcomes in the pairs the file draws them in, until the records hold
// them, KN-749.
const outcomesOf = (set: Fixtures): StatusOption[] => [
  { id: 'outcome-accepted', token: ACCEPTED, name: set.outcomeNames.accepted },
  { id: 'outcome-rejected', token: REJECTED, name: set.outcomeNames.rejected },
  { id: 'outcome-no-response', token: GREY, name: set.outcomeNames.noResponse },
  { id: 'outcome-withdrawn', token: GREY, name: set.outcomeNames.withdrawn },
]

const specimen = (set: Fixtures) => {
  const stages = stagesOf(set)
  return { stages, outcomes: outcomesOf(set), value: stages[0]?.id ?? '' }
}

// The picker holding its own choice, as a modal does, telling the args.
const Held = ({ value, onChange, ...args }: GroupedStatusPickerProps) => {
  const [chosen, setChosen] = useState(value)
  return (
    <Box sx={{ width: WIDTH }}>
      <GroupedStatusPicker
        {...args}
        value={chosen}
        onChange={(id) => {
          setChosen(id)
          onChange(id)
        }}
      />
    </Box>
  )
}

const meta = {
  title: 'Shared/GroupedStatusPicker',
  component: GroupedStatusPicker,
  args: { ...specimen(FA), onChange: fn(), onAdd: fn() },
  parameters: { controls: { include: ['value'] } },
  render: (args) => <Held {...args} />,
} satisfies StoryMeta<typeof GroupedStatusPicker>

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

// Each choice's shell is the radio input's next sibling, MUI's icon slot.
const shellOf = (radio: HTMLElement) => {
  const shell = radio.nextElementSibling
  if (!(shell instanceof HTMLElement)) throw new Error('the radio has no choice beside it')
  return shell
}

// Node 636:6417: «وضعیت» 12 on 19 at Medium in text/secondary, each caption 12
// on 19 at Regular in text/disabled, 10 apart down the column; the stages and
// the outcomes each a radio group named by its caption, sharing one name; the
// add chip after the stages, outside their group; a divider of border/default
// between; the chosen choice ringed two of border/focus.
const isTheFiles = async (canvasElement: HTMLElement, args: GroupedStatusPickerProps, locale: Locale, palette: Palette) => {
  const i18n = i18nFor(locale)
  const whole = within(canvasElement).getByRole('group', { name: i18n._('Status') })
  const label = canvasElement.ownerDocument.getElementById(whole.getAttribute('aria-labelledby') ?? '')
  if (!label) throw new Error('the picker has no label')
  const labelled = getComputedStyle(label)
  await expect([px(labelled.fontSize), px(labelled.lineHeight), labelled.fontWeight]).toEqual([12, 19, '500'])
  await expect(labelled.color).toBe(computed(label, palette['text/secondary']))
  const stages = within(whole).getByRole('radiogroup', { name: i18n._('In progress') })
  const outcomes = within(whole).getByRole('radiogroup', { name: i18n._('Closed') })
  for (const group of [stages, outcomes]) {
    const named = canvasElement.ownerDocument.getElementById(group.getAttribute('aria-labelledby') ?? '')
    if (!named) throw new Error('a group has no caption')
    const style = getComputedStyle(named)
    await expect([px(style.fontSize), px(style.lineHeight), style.fontWeight]).toEqual([12, 19, '400'])
    await expect(style.color).toBe(computed(named, palette['text/disabled']))
  }
  await expect(within(stages).getAllByRole('radio').map((radio) => radio.getAttribute('aria-label'))).toEqual(args.stages.map((stage) => stage.name))
  await expect(within(outcomes).getAllByRole('radio').map((radio) => radio.getAttribute('aria-label'))).toEqual(
    args.outcomes.map((outcome) => outcome.name),
  )
  const names = new Set(within(whole).getAllByRole('radio').map((radio) => radio.getAttribute('name')))
  await expect(names.size).toBe(1)
  const add = within(whole).getByRole('button', { name: i18n._('Add status') })
  await expect(stages.contains(add)).toBe(false)
  await expect(px(getComputedStyle(whole).rowGap)).toBe(10)
  const rule = whole.querySelector('hr')
  if (!rule) throw new Error('no divider')
  await expect([rule.getBoundingClientRect().width, rule.getBoundingClientRect().height]).toEqual([WIDTH, 1])
  await expect(getComputedStyle(rule).backgroundColor).toBe(computed(rule, palette['border/default']))
  const chosen = within(whole).getByRole('radio', { checked: true })
  const ring = getComputedStyle(shellOf(chosen), '::after')
  await expect([px(ring.borderTopWidth), ring.borderTopColor]).toEqual([2, computed(chosen, palette['border/focus'])])
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, 'fa-IR', semantic)
  },
}

export const ChooseAnOutcome: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // One choice across both groups: an outcome chosen leaves no stage chosen.
    const outcome = args.outcomes[1]
    if (!outcome) throw new Error('no outcome')
    await userEvent.click(within(canvasElement).getByRole('radio', { name: outcome.name }))
    await expect(args.onChange).toHaveBeenCalledWith(outcome.id)
    const checked = within(canvasElement).getAllByRole('radio').filter((radio) => radio instanceof HTMLInputElement && radio.checked)
    await expect(checked.map((radio) => radio.getAttribute('aria-label'))).toEqual([outcome.name])
  },
}

export const ArrowsAcrossTheGroups: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // One Tab stop, the chosen stage; the arrow that points onward moves from
    // the last stage to the first outcome and chooses it, across the groups.
    const last = args.stages.at(-1)
    const first = args.outcomes[0]
    if (!last || !first) throw new Error('no stages or outcomes')
    await userEvent.click(within(canvasElement).getByRole('radio', { name: last.name }))
    await expect(within(canvasElement).getByRole('radio', { name: last.name })).toHaveFocus()
    await userEvent.keyboard('{ArrowLeft}')
    await expect(within(canvasElement).getByRole('radio', { name: first.name })).toHaveFocus()
    await expect(args.onChange).toHaveBeenLastCalledWith(first.id)
  },
}

export const AddAStage: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: i18nFor('fa-IR')._('Add status') }))
    await expect(args.onAdd).toHaveBeenCalledOnce()
  },
}

export const InEnglish: Story = {
  args: specimen(EN),
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, 'en-US', semantic)
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, 'fa-IR', darkSemantic)
  },
}
