import { useLingui } from '@lingui/react'
import { Box, Stack } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { status as statusTokens, type StatusToken } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures, statusName } from '../story-fixtures'
import { defaultStatusName, type DefaultStatus } from './defaultStatusName'
import { StatusChip, type StatusChipProps } from './StatusChip'

// Each size, its height and its text, and the status an unmatched chip falls back to.
const MEASURES: readonly (readonly [NonNullable<StatusChipProps['size']>, number, number])[] = [
  ['S', 24, 12],
  ['M', 28, 14],
]
const NEW: StatusToken = 'new'

// A token's colour as the browser computes it, so it compares with a computed
// style. Borrowed on the host's own inline style and put back in the same tick.
const computedColour = (host: HTMLElement, colour: string) => {
  const previous = host.style.color
  host.style.color = colour
  const value = getComputedStyle(host).color
  host.style.color = previous
  return value
}

// The chip around a name. The name sits in its own span, which is what
// truncates, so the chip, the box the design draws, is its parent. Stories
// measure the chip for its geometry and the name for the cut, KN-263.
const chipOf = (name: HTMLElement) => {
  const chip = name.parentElement
  if (!chip) throw new Error('the name has no chip around it')
  return chip
}

const DEFAULTS: DefaultStatus[] = ['new', 'applied', 'interview', 'rejected', 'offer']

// A status a user renamed to something long: record data, so not translated.
const LONG = fixtures('fa-IR').longStatusName

// A long name in the 276 of a kanban column header, the width from 241:2.
const InAColumn = () => (
  <Box data-testid="column" sx={{ width: 276 }}>
    <StatusChip status="interview" label={LONG} size="M" />
  </Box>
)
// The custom slots have no default name: whatever the user called the status
// is record data. The legend's names at node 410:470 stand in for it.
const CUSTOM: [StatusToken, string][] = [
  ['custom-1', statusName('fa-IR', 'custom-1')],
  ['custom-2', statusName('fa-IR', 'custom-2')],
  ['custom-3', statusName('fa-IR', 'custom-3')],
  ['custom-4', statusName('fa-IR', 'custom-4')],
]

// A default status, named as a fresh account first sees it.
const WithDefaultName = ({ status, size }: { status: DefaultStatus; size: 'S' | 'M' }) => {
  const { i18n } = useLingui()
  return <StatusChip status={status} size={size} label={defaultStatusName(i18n, status)} />
}

// All nine statuses at one size, in the order the design lays them out.
const Row = ({ size }: { size: 'S' | 'M' }) => (
  <Stack direction="row" spacing={3} data-testid={`size-${size}`}>
    {DEFAULTS.map((status) => (
      <WithDefaultName key={status} status={status} size={size} />
    ))}
    {CUSTOM.map(([status, label]) => (
      <StatusChip key={status} status={status} size={size} label={label} />
    ))}
  </Stack>
)

const meta = {
  title: 'Shared/StatusChip',
  component: StatusChip,
  args: { status: 'applied', label: statusName('fa-IR', 'applied'), size: 'S' },
  argTypes: {
    status: { control: 'select', options: Object.keys(statusTokens) },
    size: { control: 'inline-radio', options: ['S', 'M'] },
  },
} satisfies StoryMeta<typeof StatusChip>

export default meta
type Story = StoryObj<typeof meta>

// Rendered from its args, so every control changes the chip, KN-239.
export const Default: Story = {}

export const FromArgs: Story = {
  // Nothing like the defaults: a custom slot at the column-header size. The
  // chip must follow the args, or the Controls panel is controlling nothing.
  globals: { colorScheme: 'light' },
  args: { status: 'custom-2', label: statusName('fa-IR', 'custom-2'), size: 'M' },
  play: async ({ args, canvasElement }) => {
    const chip = chipOf(within(canvasElement).getByText(args.label))
    await expect(chip.offsetHeight).toBe(28)
    await expect(getComputedStyle(chip).backgroundColor).toBe(computedColour(chip, statusTokens['custom-2'].container))
  },
}

export const SeededName: Story = {
  // A fixed render: the first built-in, named as a fresh account first sees it.
  // No control applies, so none is shown.
  parameters: { controls: { disable: true } },
  render: () => <WithDefaultName status="new" size="S" />,
}

export const AllStatuses: Story = {
  // A fixed matrix, so the controls it cannot honour are not offered.
  parameters: { controls: { disable: true } },
  // Pinned to light, so every expected colour is the design's own token.
  globals: { colorScheme: 'light' },
  render: () => (
    <Stack spacing={3}>
      <Row size="S" />
      <Row size="M" />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const order: StatusToken[] = [...DEFAULTS, ...CUSTOM.map(([status]) => status)]
    for (const [size, height, fontSize] of MEASURES) {
      const chips = [...within(canvasElement).getByTestId(`size-${size}`).children]
      await expect(chips).toHaveLength(9)
      for (const [index, chip] of chips.entries()) {
        if (!(chip instanceof HTMLElement)) throw new Error('a chip is not an element')
        const style = getComputedStyle(chip)
        const pair = statusTokens[order[index] ?? NEW]
        // Node 82:2, each variant: its height, 8 at each side, a full radius,
        // the status's container fill and its base text, at 12 or at 14.
        await expect(chip.offsetHeight).toBe(height)
        await expect([style.paddingLeft, style.paddingRight].map(Number.parseFloat)).toEqual([8, 8])
        // And none above or below: alignment centres the line, KN-263.
        await expect([style.paddingTop, style.paddingBottom].map(Number.parseFloat)).toEqual([0, 0])
        await expect(Number.parseFloat(style.borderTopLeftRadius)).toBe(999)
        await expect(Number.parseFloat(style.fontSize)).toBe(fontSize)
        await expect(style.backgroundColor).toBe(computedColour(chip, pair.container))
        await expect(style.color).toBe(computedColour(chip, pair.base))
      }
    }
  },
}

export const ColumnHeaderSize: Story = {
  args: { size: 'M' },
  play: async ({ canvasElement }) => {
    const chip = chipOf(within(canvasElement).getByText(statusName('fa-IR', 'applied')))
    // Size=M: 28 tall, body's 14 and 22 with label's weight and tracking.
    await expect(chip.offsetHeight).toBe(28)
    const style = getComputedStyle(chip)
    await expect([style.fontSize, style.lineHeight, style.fontWeight].map(Number.parseFloat)).toEqual([14, 22, 500])
  },
}

export const DisplayOnly: Story = {
  play: async ({ canvasElement }) => {
    const chip = chipOf(within(canvasElement).getByText(statusName('fa-IR', 'applied')))
    // Nothing to press and nothing to land on: no role, no tabindex, and Tab
    // passes it by. A focus ring on every card is exactly what this avoids.
    await expect(chip).not.toHaveAttribute('role')
    await expect(chip).not.toHaveAttribute('tabindex')
    await userEvent.tab()
    await expect(chip).not.toHaveFocus()
    await expect(canvasElement.contains(document.activeElement)).toBe(false)
  },
}

export const RenamedStatus: Story = {
  // The user renamed Applied. The chip shows THEIR name, from the record, and
  // not the catalog's, which no longer describes this status.
  args: { status: 'applied', label: fixtures('fa-IR').renamedStatus.name },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(fixtures('fa-IR').renamedStatus.name)).toBeInTheDocument()
    await expect(within(canvasElement).queryByText(statusName('fa-IR', 'applied'))).not.toBeInTheDocument()
  },
}

export const LongName: Story = {
  // Renamed to something long. The chip stops at the column's edge and cuts
  // the name with an ellipsis, on one line, and the whole name is still its
  // text for a screen reader, KN-238. A fixed render, so no control applies.
  parameters: { controls: { disable: true } },
  render: () => <InAColumn />,
  play: async ({ canvasElement }) => {
    const column = within(canvasElement).getByTestId('column')
    const name = within(column).getByText(LONG)
    const chip = chipOf(name)
    // Nothing spills out of the column, and the chip is as wide as it, no wider.
    await expect(column.scrollWidth).toBe(column.clientWidth)
    await expect(chip.offsetWidth).toBe(column.clientWidth)
    // The name is cut, with an ellipsis, on one line, in a chip of the same height.
    await expect(name.scrollWidth).toBeGreaterThan(name.clientWidth)
    await expect(getComputedStyle(name)).toHaveProperty('textOverflow', 'ellipsis')
    await expect(chip.offsetHeight).toBe(28)
    // A screen reader reads the text, and all of it is there.
    await expect(chip).toHaveTextContent(LONG)
  },
}

export const LongNameInEnglish: Story = {
  // The same Persian name with the English interface. The chip takes its
  // direction from the name, not the page, so the ellipsis still cuts the END
  // of the name and its start stays in view, KN-238.
  parameters: { controls: { disable: true } },
  globals: { locale: 'en-US' },
  render: () => <InAColumn />,
  play: async ({ canvasElement }) => {
    const name = within(within(canvasElement).getByTestId('column')).getByText(LONG)
    const chip = chipOf(name)
    await expect(document.documentElement).toHaveAttribute('dir', 'ltr')
    await expect(getComputedStyle(chip)).toHaveProperty('direction', 'rtl')
    await expect(name.scrollWidth).toBeGreaterThan(name.clientWidth)
  },
}

// A name in a column as wide as the kanban header, 276, the Size=M chip.
const NAMES = fixtures('fa-IR').mixedStatusNames
const Named = ({ label }: { label: string }) => (
  <Box data-testid="column" sx={{ width: 276 }}>
    <StatusChip status="interview" label={label} size="M" />
  </Box>
)

export const LatinLedInPersian: Story = {
  // The case dir=auto is there for, KN-264: a name led by a Latin word in the
  // Persian interface runs left to right, so the ellipsis cuts its end and its
  // start stays in view.
  parameters: { controls: { disable: true } },
  globals: { locale: 'fa-IR' },
  render: () => <Named label={NAMES.latinLed} />,
  play: async ({ canvasElement }) => {
    const name = within(within(canvasElement).getByTestId('column')).getByText(NAMES.latinLed)
    await expect(document.documentElement).toHaveAttribute('dir', 'rtl')
    await expect(getComputedStyle(chipOf(name))).toHaveProperty('direction', 'ltr')
    await expect(name.scrollWidth).toBeGreaterThan(name.clientWidth)
  },
}

export const DigitLedResolvesRtl: Story = {
  // A Persian name led by digits, in the English interface: digits have no
  // direction of their own, so the first letter decides, and it is Persian.
  parameters: { controls: { disable: true } },
  globals: { locale: 'en-US' },
  render: () => <Named label={NAMES.digitLed} />,
  play: async ({ canvasElement }) => {
    const name = within(within(canvasElement).getByTestId('column')).getByText(NAMES.digitLed)
    await expect(document.documentElement).toHaveAttribute('dir', 'ltr')
    await expect(getComputedStyle(chipOf(name))).toHaveProperty('direction', 'rtl')
  },
}

export const NoLettersFollowsThePage: Story = {
  // A name with no letter at all has no direction of its own and follows the
  // page's: left to right in the English interface.
  parameters: { controls: { disable: true } },
  globals: { locale: 'en-US' },
  render: () => <Named label={NAMES.noLetters} />,
  play: async ({ canvasElement }) => {
    const name = within(within(canvasElement).getByTestId('column')).getByText(NAMES.noLetters)
    await expect(getComputedStyle(chipOf(name))).toHaveProperty('direction', 'ltr')
  },
}
