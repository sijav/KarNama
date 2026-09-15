import type { StoryObj } from '@storybook/react-vite'
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { AuthScreen } from '../../screens/AuthScreen'
import type { StoryMeta } from '../../shared/story-docs/story-meta'
import { holdClock } from '../../shared/story-fixtures/clock'
import { RESEND_SECONDS } from './auth'
import { AuthContext, AuthProvider, useMockCode, type AuthValue } from './AuthProvider'

// A number the mock accepts.
const PHONE = '09120000000'

// The time the story holds Date.now at, so the minute before a resend passes at
// once, KN-587.
const START = Date.UTC(2026, 8, 15, 9)

// A probe, not a product component, and it lives inside this file on purpose, as
// the preferences provider's does: stories are outside coverage. It reads the
// mock's code the way the screen does, KN-460, and writes it into a span, since
// what is asserted is the provider's state, not anything a reader sees.
const CodeProbe = () => {
  const mockCode = useMockCode()
  return <span data-testid="mock-code">{mockCode ?? ''}</span>
}

// The sign-in screen and the probe under one provider of the story's own, inside
// the one the preview wraps every story in, so both read the same one.
const SignInWithProbe = () => (
  <AuthProvider initial={null}>
    <AuthScreen />
    <CodeProbe />
  </AuthProvider>
)

// No `component`: the probe wrapper takes no props, so react-docgen reports nothing
// for it and there is no Controls table to key off one, as the network page's
// stories say of theirs; the story renders it directly.
const meta = {
  title: 'Core/AuthProvider',
  render: () => <SignInWithProbe />,
  parameters: { layout: 'fullscreen' },
} satisfies StoryMeta<typeof SignInWithProbe>

export default meta
type Story = StoryObj<typeof meta>

// The code the screen draws: the left-to-right span of its status box, which
// holds the code alone, KN-458.
const shownCode = (canvasElement: HTMLElement) => within(canvasElement).getByRole('status').querySelector('[dir="ltr"]')?.textContent ?? ''

const codeShownIn =
  (locale: Locale): NonNullable<Story['play']> =>
  async ({ canvasElement }) => {
    // KN-465: the code the screen shows is the code the provider holds, read off
    // the provider by name, after a send and after a resend, and it is a code the
    // provider accepts. The mock says each code it sends at the console, which is
    // how the story knows the provider has taken that code before it compares.
    const canvas = within(canvasElement)
    const probe = () => canvas.getByTestId('mock-code').textContent
    const i18n = i18nFor(locale)
    const sends = spyOn(console, 'info').mockImplementation(() => undefined)
    const clock = holdClock(START)
    // The code of the given send, once the mock has said it.
    const sent = async (at: number) => {
      await waitFor(async () => {
        await expect(sends).toHaveBeenCalledTimes(at + 1)
      })
      const code = /: (\d{5})$/u.exec(String(sends.mock.calls[at]?.[0] ?? ''))?.[1] ?? ''
      await expect(code).toMatch(/^\d{5}$/u)
      return code
    }
    try {
      await expect(canvas.getByTestId('mock-code')).toBeEmptyDOMElement()
      await userEvent.type(canvas.getByLabelText(i18n._('Mobile number')), PHONE)
      await userEvent.click(canvas.getByRole('button', { name: i18n._('Send the code') }))
      const first = await sent(0)
      await waitFor(async () => {
        await expect(probe()).toBe(first)
      })
      await expect(shownCode(canvasElement)).toBe(probe())

      // Another, once the minute before a resend is up, KN-587.
      clock.forward(RESEND_SECONDS * 1000)
      await userEvent.click(await canvas.findByRole('button', { name: i18n._('Send the code again') }))
      const second = await sent(1)
      await waitFor(async () => {
        await expect(probe()).toBe(second)
      })
      await expect(shownCode(canvasElement)).toBe(probe())

      // And the code on the screen is one the provider accepts: signing in with
      // it reaches the name step. verify checks the code the provider keeps aside,
      // not the one it hands the screen, so only this can see the two part.
      await userEvent.type(canvas.getByLabelText(i18n._('Five digit code')), shownCode(canvasElement))
      await userEvent.click(canvas.getByRole('button', { name: i18n._('Confirm and sign in') }))
      await expect(await canvas.findByLabelText(i18n._('First and last name'))).toBeInTheDocument()
    } finally {
      clock.release()
      sends.mockRestore()
    }
  }

export const Persian: Story = {
  globals: { locale: 'fa-IR' },
  play: codeShownIn('fa-IR'),
}

export const English: Story = {
  globals: { locale: 'en-US' },
  play: codeShownIn('en-US'),
}

// A provider that does not mock, stood in for by a value waiting for a code, as a
// real provider is once it has sent one, KN-460. Nothing it holds is a code.
const WAITING: AuthValue = {
  session: null,
  awaiting: true,
  signingUp: false,
  phone: PHONE,
  requestCode: () => true,
  resend: () => undefined,
  changeNumber: () => undefined,
  verify: () => null,
  saveName: () => undefined,
  signOut: () => undefined,
}

// The mock's randomness held at 0.5, which makes exactly this code, KN-466.
const HALF = () => 0.5
const MADE = '50000'

// The mock around two sign-in screens: its own, and one under another provider
// mounted inside it, as a story or the preview can mount one.
const MockAroundAnother = () => (
  <AuthProvider initial={null} random={HALF}>
    <div data-testid="mocked">
      <AuthScreen />
    </div>
    <AuthContext.Provider value={WAITING}>
      <div data-testid="another">
        <AuthScreen />
      </div>
    </AuthContext.Provider>
  </AuthProvider>
)

export const NoCodeUnderAnotherProvider: Story = {
  globals: { locale: 'fa-IR' },
  render: () => <MockAroundAnother />,
  play: async ({ canvasElement }) => {
    // KN-460: the mock's code reaches only a screen reading the mock's own value.
    // Once the mock has sent a code, its own screen shows it, and the screen under
    // the other provider, waiting for a code inside the same mock, shows none.
    const canvas = within(canvasElement)
    const mocked = canvas.getByTestId('mocked')
    const another = canvas.getByTestId('another')
    const i18n = i18nFor('fa-IR')
    const sends = spyOn(console, 'info').mockImplementation(() => undefined)
    try {
      await expect(within(another).getByLabelText(i18n._('Five digit code'))).toBeInTheDocument()
      await userEvent.type(within(mocked).getByLabelText(i18n._('Mobile number')), PHONE)
      await userEvent.click(within(mocked).getByRole('button', { name: i18n._('Send the code') }))
      await waitFor(async () => {
        await expect(shownCode(mocked)).toBe(MADE)
      })
      await expect(within(another).queryByRole('status')).toBeNull()
    } finally {
      sends.mockRestore()
    }
  },
}
