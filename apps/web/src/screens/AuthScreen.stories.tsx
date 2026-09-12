import type { StoryObj } from '@storybook/react-vite'
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test'
import { AuthProvider, sessionFor } from '../core/auth'
import { fixtures } from '../shared/story-fixtures'
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
      <AuthProvider initial={context.parameters.session === true ? sessionFor(PHONE, new Date(Date.UTC(2026, 8, 12)).toISOString()) : null}>
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

export const SigningIn: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The code the mock says it sent, read where whoever is testing reads it.
    const codes: string[] = []
    const said = spyOn(console, 'info').mockImplementation((...args: unknown[]) => {
      const sent = /mock SMS to \S+: (\d+)/.exec(String(args[0]))
      if (sent?.[1]) codes.push(sent[1])
    })
    try {
      await userEvent.type(canvas.getByLabelText('شماره موبایل'), PHONE)
      await userEvent.click(canvas.getByRole('button', { name: 'ارسال کد' }))
      await waitFor(async () => {
        await expect(codes.length).toBeGreaterThan(0)
      })

      // Another code can be asked for, and the last one sent is the one that works.
      await userEvent.click(canvas.getByRole('button', { name: 'ارسال کد دیگر' }))
      await waitFor(async () => {
        await expect(codes.length).toBeGreaterThan(1)
      })
      await userEvent.type(canvas.getByLabelText('کد پنج رقمی'), codes.at(-1) ?? '')
      await userEvent.click(canvas.getByRole('button', { name: 'ورود' }))

      // The first login asks who this is, and takes the name.
      await waitFor(async () => {
        await expect(canvas.getByText('تو را چه صدا کنیم؟')).toBeInTheDocument()
      })
      await userEvent.type(canvas.getByLabelText('اسم و فامیل'), fixtures('fa-IR').contacts[0]?.fullName ?? '')
      await userEvent.click(canvas.getByRole('button', { name: 'ادامه' }))
      // With a name, the screen has nothing left to ask: the shell takes over,
      // which a story of the screen alone shows as the sign-in step gone.
      await waitFor(async () => {
        await expect(canvas.queryByText('تو را چه صدا کنیم؟')).toBeNull()
      })
    } finally {
      said.mockRestore()
    }
  },
}
