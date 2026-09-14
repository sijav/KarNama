import type { StoryObj } from '@storybook/react-vite'
import { useCallback, useRef, type ReactNode } from 'react'
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test'
import { AuthProvider, STORAGE_KEY as SESSION_KEY, sessionFor, type Session } from '../core/auth'
import { i18nFor, type Locale } from '../i18n'
import { allowConsole } from '../shared/console-guard'
import type { StoryMeta } from '../shared/story-docs/story-meta'
import { fixtures } from '../shared/story-fixtures'
import { keyboardOf, type Keyboard } from '../shared/story-fixtures/keyboard'
import { AuthScreen } from './AuthScreen'

// A number the mock accepts, in the shape the design asks for.
const PHONE = '09120000000'

// What a story's `codes` parameter holds, when it is a list of numbers.
const codesOf = (value: unknown): readonly number[] | undefined =>
  Array.isArray(value) && value.every((entry): entry is number => typeof entry === 'number') ? value : undefined

// A fixed run of codes for a story that must know them, KN-466: each send takes the
// next number, from zero to below one, and the mock turns it into five digits. Its
// place is kept in a ref, so a render of the decorator cannot start it over.
const SeededAuth = ({
  initial,
  codes,
  children,
}: {
  initial: Session | null
  codes: readonly number[] | undefined
  children: ReactNode
}) => {
  const at = useRef(0)
  const random = useCallback(() => {
    const value = codes?.[at.current % codes.length] ?? 0
    at.current += 1
    return value
  }, [codes])
  return (
    <AuthProvider initial={initial} {...(codes === undefined ? {} : { random })}>
      {children}
    </AuthProvider>
  )
}

const meta = {
  title: 'Screens/SignIn',
  render: () => <AuthScreen />,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story, context) => (
      // Nobody is signed in unless the story asks for it: `session` seeds one
      // with no name, which is how the signup step is reached without a code.
      // `codes` fixes the codes the mock makes, KN-466.
      <SeededAuth
        initial={context.parameters.session === true ? sessionFor(PHONE, new Date(Date.UTC(2026, 8, 12)).toISOString()) : null}
        codes={codesOf(context.parameters.codes)}
      >
        <Story />
      </SeededAuth>
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
      // What signing in produces is a SESSION, kept under its own key, and that
      // is what is read back: the name step going away is also what the screen
      // does when it falls back to the phone step, so a saveName that stored
      // nothing would pass that. The store is this story's own, KN-178.
      await waitFor(async () => {
        await expect(JSON.parse(window.localStorage.getItem(SESSION_KEY) ?? '{}')).toMatchObject({
          phone: PHONE,
          name: fixtures('fa-IR').contacts[0]?.fullName ?? '',
        })
      })
    } finally {
      said.mockRestore()
    }
  },
}

// A phone's screen, the file's 390 by 844.
const SCREEN = { width: 390, height: 844 }

// The codes the phone story's sends make, KN-466: 0.5 and 0.25 are exact in
// floating point, so the mock's five digits are exactly these two.
const FIXED_CODES = [0.5, 0.25]
const FIRST = '50000'
const SECOND = '25000'

// The five digits the notice shows now.
const codeOnScreen = (canvasElement: HTMLElement) => /(\d{5})/.exec(within(canvasElement).getByRole('status').textContent)?.[1] ?? ''

export const SigningInOnAPhone: Story = {
  globals: { locale: 'fa-IR' },
  parameters: { codes: FIXED_CODES },
  play: async ({ canvasElement }) => {
    // KN-459, the owner on a phone: the code was only ever written to the
    // console, and a phone has no console, so the live product could not be
    // signed into at all. The code is on the SCREEN now, and this reads it from
    // there, with the console left alone entirely. The screen is resized by the
    // runner's own browser, which only the runner has, KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const { page } = await import('vitest/browser')
    const canvas = within(canvasElement)
    const before = { width: window.innerWidth, height: window.innerHeight }
    try {
      await page.viewport(SCREEN.width, SCREEN.height)
      await userEvent.type(canvas.getByLabelText('شماره موبایل'), PHONE)
      await userEvent.click(canvas.getByRole('button', { name: 'ارسال کد' }))

      // The code, where a reader can see it, said plainly to be a stand-in, and
      // the one the story's fixed source made.
      const shown = await canvas.findByRole('status')
      await expect(shown).toHaveTextContent('هنوز پیامکی واقعاً ارسال نمی‌شود')
      await expect(codeOnScreen(canvasElement)).toBe(FIRST)

      // Another code asked for, and the notice changes to it, KN-466: a resend
      // that did nothing leaves the first showing, and this waits out and fails,
      // where it used to read whatever five digits were there.
      await userEvent.click(canvas.getByRole('button', { name: 'ارسال کد دیگر' }))
      await waitFor(async () => {
        await expect(codeOnScreen(canvasElement)).toBe(SECOND)
      })

      // The first code no longer signs in: typed in, it is refused, and no name
      // step comes. The field holds it, so the refusal is of that code.
      const field = canvas.getByLabelText('کد پنج رقمی')
      await userEvent.type(field, FIRST)
      await expect(field).toHaveValue(FIRST)
      await userEvent.click(canvas.getByRole('button', { name: 'ورود' }))
      await expect(await canvas.findByText('این کد درست نیست. دوباره امتحان کن.')).toBeInTheDocument()
      await expect(canvas.queryByLabelText('اسم و فامیل')).toBeNull()

      // And the code on the screen now is the one that works: the field cleared,
      // since it holds five digits at most, and the new code typed in signs the
      // reader in, which the name step asks for next on a first login.
      await userEvent.clear(field)
      await userEvent.type(field, SECOND)
      await userEvent.click(canvas.getByRole('button', { name: 'ورود' }))
      await waitFor(async () => {
        await expect(canvas.getByLabelText('اسم و فامیل')).toBeInTheDocument()
      })
    } finally {
      await page.viewport(before.width, before.height)
    }
  },
}

export const EnterFinishesTheStep: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // The owner, 2026-09-12: the fields are a form and finishing it is what the
    // step's own button does, KN-463. So Enter in a field asks for the code,
    // and the page does not reload while doing it, which is what a submit does
    // when nothing prevents it.
    const canvas = within(canvasElement)
    const codes: string[] = []
    const said = spyOn(console, 'info').mockImplementation((...args: unknown[]) => {
      const sent = /mock SMS to \S+: (\d+)/.exec(String(args[0]))
      if (sent?.[1]) codes.push(sent[1])
    })
    try {
      // React 19 runs a form's submit as a transition, and inside the runner's
      // act scope that produces a warning a reader never sees: clicking the very
      // same button does not. So this story says it provokes it, KN-401, rather
      // than the guard letting every warning of that shape through.
      allowConsole(/suspended inside an `act` scope/u)
      await userEvent.type(canvas.getByLabelText('شماره موبایل'), PHONE)
      await userEvent.keyboard('{Enter}')
      await waitFor(async () => {
        await expect(canvas.getByRole('status')).toBeInTheDocument()
      })
      await expect(codes).toHaveLength(1)

      // And again on the next step: Enter signs the reader in.
      const digits = /(\d{5})/.exec(canvas.getByRole('status').textContent)?.[1] ?? ''
      await userEvent.type(canvas.getByLabelText('کد پنج رقمی'), digits)
      await userEvent.keyboard('{Enter}')
      await waitFor(async () => {
        await expect(canvas.getByLabelText('اسم و فامیل')).toBeInTheDocument()
      })
    } finally {
      said.mockRestore()
    }
  },
}

// What each step's field declares, KN-464: the number a phone pad whose key sends
// the code, the code digits whose key signs in, and the name a key that finishes;
// the number and the code offered from what the phone already holds.
const STEPS: Record<'phone' | 'code' | 'name', Keyboard> = {
  phone: { type: 'tel', inputMode: 'tel', enterKeyHint: 'send', autoComplete: 'tel' },
  code: { type: 'text', inputMode: 'numeric', enterKeyHint: 'go', autoComplete: 'one-time-code' },
  name: { type: 'text', inputMode: null, enterKeyHint: 'done', autoComplete: 'name' },
}

const keyboardsIn =
  (locale: Locale): NonNullable<Story['play']> =>
  async ({ canvasElement }) => {
    // Walked by the steps' own buttons, reading each field as it arrives; the
    // code is the one the mock shows on the screen, KN-459.
    const canvas = within(canvasElement)
    const i18n = i18nFor(locale)
    const said = spyOn(console, 'info').mockImplementation(() => undefined)
    try {
      const phone = canvas.getByLabelText(i18n._('Mobile number'))
      await expect(keyboardOf(phone)).toEqual(STEPS.phone)
      await userEvent.type(phone, PHONE)
      await userEvent.click(canvas.getByRole('button', { name: i18n._('Send the code') }))
      const code = await canvas.findByLabelText(i18n._('Five digit code'))
      await expect(keyboardOf(code)).toEqual(STEPS.code)
      const digits = /(\d{5})/.exec(canvas.getByRole('status').textContent)?.[1] ?? ''
      await userEvent.type(code, digits)
      await userEvent.click(canvas.getByRole('button', { name: i18n._('Sign in') }))
      await expect(keyboardOf(await canvas.findByLabelText(i18n._('Full name')))).toEqual(STEPS.name)
    } finally {
      said.mockRestore()
    }
  }

export const KeyboardsForEachStep: Story = {
  globals: { locale: 'fa-IR' },
  play: keyboardsIn('fa-IR'),
}

export const KeyboardsForEachStepInEnglish: Story = {
  globals: { locale: 'en-US' },
  play: keyboardsIn('en-US'),
}
