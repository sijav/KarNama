import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { i18n } from '../../i18n'
import type { StoryMeta } from '../story-docs/story-meta'
import { JobLevelSelect, type JobLevelSelectProps } from './JobLevelSelect'
import { jobLevelLabels } from './labels'
import { JOB_LEVELS } from './values'

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
