import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { i18n } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { semantic } from '../../theme/tokens'
import { hoverEdge } from '../select/hoverEdge'
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

export const Hover: Story = {
  // Select / نوع همکاری's Hover, 448:8051, which the original adds, KN-794: the chosen
  // type in text/primary inside the pointer's text/secondary edge.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await hoverEdge(canvasElement, semantic, true)
  },
}

export const HoverInTheDark: Story = {
  // The same in English and in the dark scheme, in the theme's dark colours.
  globals: { locale: 'en-US', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    await hoverEdge(canvasElement, darkSemantic, true)
  },
}
