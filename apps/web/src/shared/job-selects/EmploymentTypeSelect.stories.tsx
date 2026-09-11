import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { i18n } from '../../i18n'
import type { StoryMeta } from '../story-docs/story-meta'
import { EmploymentTypeSelect, type EmploymentTypeSelectProps } from './EmploymentTypeSelect'
import { employmentTypeLabels } from './labels'
import { EMPLOYMENT_TYPES } from './values'

const CONTROLLED: (keyof EmploymentTypeSelectProps)[] = ['value', 'disabled']

const meta = {
  title: 'Shared/EmploymentTypeSelect',
  component: EmploymentTypeSelect,
  args: { value: ['full-time'], disabled: false, onChange: fn() },
  argTypes: { value: { control: 'check', options: EMPLOYMENT_TYPES } },
  parameters: { controls: { include: CONTROLLED } },
} satisfies StoryMeta<typeof EmploymentTypeSelect>

export default meta
type Story = StoryObj<typeof meta>

// The eight employment types in the file's order, the owner's two last, each
// named from the catalog in the language on screen.
const offersTheEight = async (canvasElement: HTMLElement) => {
  const combobox = within(canvasElement).getByRole('combobox')
  await expect(canvasElement.ownerDocument.getElementById(combobox.getAttribute('aria-labelledby') ?? '')).toHaveTextContent(
    i18n._('Employment type'),
  )
  await userEvent.click(combobox)
  const listbox = await within(canvasElement.ownerDocument.body).findByRole('listbox')
  const labels = employmentTypeLabels(i18n)
  const rows = [...listbox.children].filter((row) => row instanceof HTMLLIElement)
  await expect(rows.map((row) => row.textContent)).toEqual(EMPLOYMENT_TYPES.map((type) => labels[type]))
  await expect(listbox).toHaveAttribute('aria-multiselectable', 'true')
  await userEvent.keyboard('{Escape}')
}

export const Default: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    await offersTheEight(canvasElement)
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US' },
  play: async ({ canvasElement }) => {
    await offersTheEight(canvasElement)
  },
}
