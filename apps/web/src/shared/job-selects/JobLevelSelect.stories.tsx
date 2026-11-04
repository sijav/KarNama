import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { i18n } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { semantic } from '../../theme/tokens'
import { hoverEdge } from '../select/hoverEdge'
import type { StoryMeta } from '../story-docs/story-meta'
import { JobLevelSelect, type JobLevelSelectProps } from './JobLevelSelect'
import { jobLevelLabels } from './labels'
import { JOB_LEVELS, type JobLevel } from './values'

const CONTROLLED: (keyof JobLevelSelectProps)[] = ['value', 'disabled']

const meta = {
  title: 'Shared/JobLevelSelect',
  component: JobLevelSelect,
  args: { value: null, disabled: false, onChange: fn() },
  argTypes: { value: { control: 'select', options: JOB_LEVELS } },
  parameters: { controls: { include: CONTROLLED } },
} satisfies StoryMeta<typeof JobLevelSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // Seven levels, one at a time: choosing one hands it back and closes.
    const combobox = within(canvasElement).getByRole('combobox')
    await expect(canvasElement.ownerDocument.getElementById(combobox.getAttribute('aria-labelledby') ?? '')).toHaveTextContent(
      i18n._('Job level'),
    )
    await userEvent.click(combobox)
    const listbox = await within(canvasElement.ownerDocument.body).findByRole('listbox')
    const labels = jobLevelLabels(i18n)
    // MUI's options are the listbox's list items.
    const rows = [...listbox.children].filter((row) => row instanceof HTMLLIElement)
    await expect(rows.map((row) => row.textContent)).toEqual(JOB_LEVELS.map((level) => labels[level]))
    await userEvent.click(rows[2] ?? listbox)
    await expect(args.onChange).toHaveBeenCalledWith(JOB_LEVELS[2])
  },
}

// The level the file shows hovered, «کارشناس ارشد».
const SENIOR: JobLevel = 'senior-specialist'

export const Hover: Story = {
  // Select / سطح شغلی's Hover, 448:8095, which the original adds, KN-794: the chosen
  // level in text/primary inside the pointer's text/secondary edge.
  args: { value: SENIOR },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await hoverEdge(canvasElement, semantic, true)
  },
}

export const HoverInTheDark: Story = {
  // The same in English and in the dark scheme, in the theme's dark colours.
  args: { value: SENIOR },
  globals: { locale: 'en-US', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    await hoverEdge(canvasElement, darkSemantic, true)
  },
}
