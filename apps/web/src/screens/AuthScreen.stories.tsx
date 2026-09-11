import type { StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { AuthProvider, sessionFor } from '../core/auth'
import type { StoryMeta } from '../shared/story-docs/story-meta'
import { AuthScreen } from './AuthScreen'

// A number the mock accepts, in the shape the design asks for.
const PHONE = '09120000000'

const meta = {
  title: 'Screens/SignIn',
  render: () => <AuthScreen />,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story, context) => (
      // Nobody is signed in unless the story asks for it: `session` seeds one
      // with no name, which is how the signup step is reached without a code.
      <AuthProvider
        initial={context.parameters.session === true ? sessionFor(PHONE, new Date(Date.UTC(2026, 8, 12)).toISOString()) : null}
      >
        <Story />
      </AuthProvider>
    ),
  ],
} satisfies StoryMeta<typeof AuthScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Login: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('ورود به کارنما')).toBeInTheDocument()
    // A number that is not one is refused, with what to do about it.
    await userEvent.type(canvas.getByLabelText('شماره موبایل'), '12')
    await userEvent.click(canvas.getByRole('button', { name: 'ارسال کد' }))
    await expect(canvas.getByText('شماره موبایلت را بنویس، ۱۱ رقم که با ۰۹ شروع می‌شود')).toBeInTheDocument()
  },
}

export const Code: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByLabelText('شماره موبایل'), PHONE)
    await userEvent.click(canvas.getByRole('button', { name: 'ارسال کد' }))

    // The code step says where the code went, and that nothing was really sent.
    await expect(canvas.getByText(`ارسال شده به ${PHONE}`)).toBeInTheDocument()
    await userEvent.type(canvas.getByLabelText('کد پنج رقمی'), '00000')
    await userEvent.click(canvas.getByRole('button', { name: 'ورود' }))
    await expect(canvas.getByText('این کد درست نیست. دوباره امتحان کن.')).toBeInTheDocument()
  },
}

export const Signup: Story = {
  parameters: { session: true },
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('تو را چه صدا کنیم؟')).toBeInTheDocument()
    await userEvent.click(canvas.getByRole('button', { name: 'ادامه' }))
    await expect(canvas.getByText('اسم و فامیل را بنویس')).toBeInTheDocument()
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US' },
}
