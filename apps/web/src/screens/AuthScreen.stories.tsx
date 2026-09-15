import type { StoryObj } from '@storybook/react-vite'
import { useCallback, useRef, type ReactNode } from 'react'
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test'
import { AuthProvider, RESEND_SECONDS, STORAGE_KEY as SESSION_KEY, sessionFor, type Session } from '../core/auth'
import { i18nFor, type Locale } from '../i18n'
import { formatClock } from '../i18n/formatClock'
import { allowConsole } from '../shared/console-guard'
import { formatPhone } from '../shared/contact-card'
import type { StoryMeta } from '../shared/story-docs/story-meta'
import { fixtures } from '../shared/story-fixtures'
import { holdClock } from '../shared/story-fixtures/clock'
import { keyboardOf, type Keyboard } from '../shared/story-fixtures/keyboard'
import { elevation, semantic } from '../theme/tokens'
import { AuthScreen } from './AuthScreen'

// A number the mock accepts, in the shape the design asks for.
const PHONE = '09120000000'

// Another number, for a reader who mistyped the first, KN-587.
const OTHER_PHONE = '09121111111'

// The time a story holds Date.now at, and a second of it, so the minute before a
// resend passes at once, KN-587.
const START = Date.UTC(2026, 8, 15, 9)
const ONE_SECOND = 1000

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

    // The code step says where the code went, the number in the reader's digits
    // grouped as the file writes it, and that nothing was really sent.
    await expect(canvas.getByText(`ارسال شده به ${formatPhone('fa-IR', PHONE)}`)).toBeInTheDocument()
    await userEvent.type(canvas.getByLabelText('کد پنج رقمی'), '00000')
    await userEvent.click(canvas.getByRole('button', { name: 'تأیید و ورود' }))
    await expect(canvas.getByText('این کد درست نیست. دوباره امتحان کن.')).toBeInTheDocument()
  },
}

export const Signup: Story = {
  parameters: { session: true },
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('خوش آمدی')).toBeInTheDocument()
    await userEvent.click(canvas.getByRole('button', { name: 'شروع کن' }))
    await expect(canvas.getByText('نام و نام خانوادگی‌ات را بنویس')).toBeInTheDocument()
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
    // The minute before a resend passes at once, KN-587.
    const clock = holdClock(START)
    try {
      await userEvent.type(canvas.getByLabelText('شماره موبایل'), PHONE)
      await userEvent.click(canvas.getByRole('button', { name: 'ارسال کد' }))
      await waitFor(async () => {
        await expect(codes.length).toBeGreaterThan(0)
      })

      // Another code can be asked for once the minute is up, KN-587, and the last
      // one sent is the one that works.
      clock.forward(RESEND_SECONDS * ONE_SECOND)
      await userEvent.click(await canvas.findByRole('button', { name: i18nFor('fa-IR')._('Send the code again') }))
      await waitFor(async () => {
        await expect(codes.length).toBeGreaterThan(1)
      })
      await userEvent.type(canvas.getByLabelText('کد پنج رقمی'), codes.at(-1) ?? '')
      await userEvent.click(canvas.getByRole('button', { name: 'تأیید و ورود' }))

      // The first login asks who this is, and takes the name.
      await waitFor(async () => {
        await expect(canvas.getByText('خوش آمدی')).toBeInTheDocument()
      })
      await userEvent.type(canvas.getByLabelText('نام و نام خانوادگی'), fixtures('fa-IR').contacts[0]?.fullName ?? '')
      await userEvent.click(canvas.getByRole('button', { name: 'شروع کن' }))
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
      clock.release()
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
    const clock = holdClock(START)
    try {
      await page.viewport(SCREEN.width, SCREEN.height)
      await userEvent.type(canvas.getByLabelText('شماره موبایل'), PHONE)
      await userEvent.click(canvas.getByRole('button', { name: 'ارسال کد' }))

      // The code, where a reader can see it, said plainly to be a stand-in, and
      // the one the story's fixed source made.
      const shown = await canvas.findByRole('status')
      await expect(shown).toHaveTextContent('هنوز پیامکی واقعاً ارسال نمی‌شود')
      await expect(codeOnScreen(canvasElement)).toBe(FIRST)

      // Another code asked for once the minute is up, KN-587, and the notice
      // changes to it, KN-466: a resend that did nothing leaves the first showing,
      // and this waits out and fails, where it used to read whatever five digits
      // were there.
      clock.forward(RESEND_SECONDS * ONE_SECOND)
      await userEvent.click(await canvas.findByRole('button', { name: i18nFor('fa-IR')._('Send the code again') }))
      await waitFor(async () => {
        await expect(codeOnScreen(canvasElement)).toBe(SECOND)
      })

      // The first code no longer signs in: typed in, it is refused, and no name
      // step comes. The field holds it, so the refusal is of that code.
      const field = canvas.getByLabelText('کد پنج رقمی')
      await userEvent.type(field, FIRST)
      await expect(field).toHaveValue(FIRST)
      await userEvent.click(canvas.getByRole('button', { name: 'تأیید و ورود' }))
      await expect(await canvas.findByText('این کد درست نیست. دوباره امتحان کن.')).toBeInTheDocument()
      await expect(canvas.queryByLabelText('نام و نام خانوادگی')).toBeNull()

      // And the code on the screen now is the one that works: the field cleared,
      // since it holds five digits at most, and the new code typed in signs the
      // reader in, which the name step asks for next on a first login.
      await userEvent.clear(field)
      await userEvent.type(field, SECOND)
      await userEvent.click(canvas.getByRole('button', { name: 'تأیید و ورود' }))
      await waitFor(async () => {
        await expect(canvas.getByLabelText('نام و نام خانوادگی')).toBeInTheDocument()
      })
    } finally {
      clock.release()
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
        await expect(canvas.getByLabelText('نام و نام خانوادگی')).toBeInTheDocument()
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
      await userEvent.click(canvas.getByRole('button', { name: i18n._('Confirm and sign in') }))
      await expect(keyboardOf(await canvas.findByLabelText(i18n._('First and last name')))).toEqual(STEPS.name)
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

const px = (value: string) => Number.parseFloat(value) || 0

// A token as the browser computes it for one property, borrowed on the host's
// own inline style and put back in the same tick. Never inside waitFor, KN-014.
const borrowed = (host: HTMLElement, property: 'color' | 'backgroundColor' | 'borderTopColor' | 'boxShadow', value: string) => {
  const previous = host.style[property]
  host.style[property] = value
  const result = getComputedStyle(host)[property]
  host.style[property] = previous
  return result
}

// What node 407:6952 draws on every step, KN-518: the card at the width its
// screen gives it, 32 of padding, 24 between its parts, radius lg, bg/surface,
// one pixel of border/default inside and its own shadow; the Brand Row first; and
// the step's heading, the title at 24 and SemiBold on the file's line of 38 with
// the body 8 under it in Body, text/secondary.
const cardIsTheFrames = async (canvasElement: HTMLElement, width: number, title: string, body: string) => {
  const form = canvasElement.querySelector('form')
  if (!form) throw new Error('no sign-in card')
  const style = getComputedStyle(form)
  const edge = getComputedStyle(form, '::before')
  await expect(form.getBoundingClientRect().width).toBe(width)
  await expect([style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft].map(px)).toEqual([32, 32, 32, 32])
  await expect(px(style.rowGap)).toBe(24)
  await expect(px(style.borderTopLeftRadius)).toBe(16)
  await expect(style.backgroundColor).toBe(borrowed(form, 'backgroundColor', semantic['bg/surface']))
  await expect(style.boxShadow).toBe(borrowed(form, 'boxShadow', elevation.authCard))
  await expect([px(edge.borderTopWidth), edge.borderTopStyle]).toEqual([1, 'solid'])
  await expect(edge.borderTopColor).toBe(borrowed(form, 'borderTopColor', semantic['border/default']))
  const [brand, heading] = [...form.children]
  if (!(brand instanceof HTMLElement) || !(heading instanceof HTMLElement)) throw new Error('the card has no brand row and heading')
  const i18n = i18nFor('fa-IR')
  const name = i18n._('KarNama')
  await expect(within(brand).getByText(name)).toBeInTheDocument()
  await expect(within(brand).getByText(name.charAt(0)).getBoundingClientRect().height).toBe(32)
  const [titleLine, bodyLine] = [...heading.children]
  if (!(titleLine instanceof HTMLElement) || !(bodyLine instanceof HTMLElement)) throw new Error('the heading has no title and body')
  await expect(titleLine).toHaveTextContent(title)
  const titleStyle = getComputedStyle(titleLine)
  await expect([px(titleStyle.fontSize), titleStyle.fontWeight]).toEqual([24, '600'])
  await expect(Math.round(titleLine.getBoundingClientRect().height)).toBe(38)
  await expect(px(getComputedStyle(heading).rowGap)).toBe(8)
  await expect(bodyLine).toHaveTextContent(body)
  const bodyStyle = getComputedStyle(bodyLine)
  await expect(px(bodyStyle.fontSize)).toBe(14)
  await expect(bodyStyle.color).toBe(borrowed(form, 'color', semantic['text/secondary']))
}

// The file's two screens, the card each gives it, and the room inside the card's
// 32 of padding: 440 and 376 on a desktop, and on a phone the screen less the
// page's 24 at either side, 342 and 278.
const WIDTHS = [
  { screen: { width: 1440, height: 900 }, card: 440, inner: 376 },
  { screen: { width: 390, height: 844 }, card: 342, inner: 278 },
]

// The measure run at each screen, set by the runner's own browser, which only
// the runner has, KN-225, and the screen put back after.
const atBothWidths = async (measure: (card: number, inner: number) => Promise<void>) => {
  const { page } = await import('vitest/browser')
  const before = { width: window.innerWidth, height: window.innerHeight }
  try {
    for (const { screen, card, inner } of WIDTHS) {
      await page.viewport(screen.width, screen.height)
      await measure(card, inner)
    }
  } finally {
    await page.viewport(before.width, before.height)
  }
}

export const LoginAsTheFrames: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const i18n = i18nFor('fa-IR')
    await atBothWidths(async (card) => {
      await cardIsTheFrames(canvasElement, card, i18n._('Sign in to KarNama'), i18n._('Write your mobile number'))
      await expect(within(canvasElement).getByLabelText(i18n._('Mobile number'))).toHaveAttribute('placeholder', i18n._('0912 345 6789'))
      // The Terms Note last: 12 at Regular, centred, in text/disabled, KN-591.
      const note = canvasElement.querySelector('form')?.lastElementChild
      if (!(note instanceof HTMLElement)) throw new Error('the card has no note')
      await expect(note).toHaveTextContent(i18n._('Signing in means you accept how KarNama keeps your records.'))
      const noteStyle = getComputedStyle(note)
      await expect([px(noteStyle.fontSize), noteStyle.fontWeight, noteStyle.textAlign]).toEqual([12, '400', 'center'])
      await expect(noteStyle.color).toBe(borrowed(note, 'color', semantic['text/disabled']))
    })
  },
}

// What 407:6972 and 407:7043 draw under the code step's action, KN-587: the Resend
// Timer and then the Change Number frame, each the card's inner width, 22 tall and
// 24 under what is above it; the timer at 14 Regular, centred, in text/disabled,
// and the Footer Link at 14 Medium, centred, in text/brand.
const linesUnderTheAction = async (canvasElement: HTMLElement, inner: number, timerText: string) => {
  const form = canvasElement.querySelector('form')
  if (!form) throw new Error('no sign-in card')
  const canvas = within(canvasElement)
  const i18n = i18nFor('fa-IR')
  const action = canvas.getByRole('button', { name: i18n._('Confirm and sign in') }).getBoundingClientRect()
  const timer = canvas.getByText(timerText)
  const link = canvas.getByRole('button', { name: i18n._('Change the number') })
  const timerBox = timer.getBoundingClientRect()
  const linkBox = link.getBoundingClientRect()
  await expect([timerBox.width, timerBox.height, Math.round(timerBox.top - action.bottom)]).toEqual([inner, 22, 24])
  await expect([linkBox.width, linkBox.height, Math.round(linkBox.top - timerBox.bottom)]).toEqual([inner, 22, 24])
  const timerStyle = getComputedStyle(timer)
  await expect([px(timerStyle.fontSize), timerStyle.fontWeight, px(timerStyle.lineHeight)]).toEqual([14, '400', 22])
  await expect(timerStyle.textAlign).toBe('center')
  await expect(timerStyle.color).toBe(borrowed(form, 'color', semantic['text/disabled']))
  const linkStyle = getComputedStyle(link)
  await expect([px(linkStyle.fontSize), linkStyle.fontWeight, px(linkStyle.lineHeight)]).toEqual([14, '500', 22])
  await expect(linkStyle.color).toBe(borrowed(form, 'color', semantic['text/brand']))
  // The link's words sit mid-row, read with a Range over them rather than from its
  // box, AGENTS.md section 7.
  const words = document.createRange()
  words.selectNodeContents(link)
  const drawn = words.getBoundingClientRect()
  await expect(Math.abs(drawn.left + drawn.width / 2 - (linkBox.left + linkBox.width / 2))).toBeLessThan(1)
}

export const CodeAsTheFrames: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const i18n = i18nFor('fa-IR')
    const canvas = within(canvasElement)
    // The clock held a second past the send, where the file draws its countdown.
    const clock = holdClock(START)
    try {
      await userEvent.type(canvas.getByLabelText(i18n._('Mobile number')), PHONE)
      await userEvent.click(canvas.getByRole('button', { name: i18n._('Send the code') }))
      await canvas.findByLabelText(i18n._('Five digit code'))
      clock.forward(ONE_SECOND)
      const timerText = `${i18n._('Send the code again in')} ${formatClock('fa-IR', RESEND_SECONDS - 1)}`
      await canvas.findByText(timerText)
      await atBothWidths(async (card, inner) => {
        await cardIsTheFrames(canvasElement, card, i18n._('Enter the code'), `${i18n._('Sent to')} ${formatPhone('fa-IR', PHONE)}`)
        await linesUnderTheAction(canvasElement, inner, timerText)
      })
    } finally {
      clock.release()
    }
  },
}

export const SignupAsTheFrames: Story = {
  parameters: { session: true },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const i18n = i18nFor('fa-IR')
    const canvas = within(canvasElement)
    await atBothWidths(async (card) => {
      await cardIsTheFrames(
        canvasElement,
        card,
        i18n._('Welcome'),
        i18n._('Just tell us your name so we can build your job opportunities board.'),
      )
      await expect(canvas.getByLabelText(i18n._('First and last name'))).toHaveAttribute('placeholder', i18n._('Mehdi Rezaei'))
      await expect(canvas.getByRole('button', { name: i18n._('Start') })).toBeInTheDocument()
    })
  },
}

// The countdown to a resend, KN-587, walked on a held clock: the minute in the
// reader's digits right after the send with no resend offered, the file's 00:59 a
// second on, one second left, and at the end a link that sends another code and
// starts the count again. A move of the clock shows at the countdown's next look,
// a quarter of a second later, which findBy waits for.
const countsDownIn =
  (locale: Locale): NonNullable<Story['play']> =>
  async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const i18n = i18nFor(locale)
    const line = (seconds: number) => `${i18n._('Send the code again in')} ${formatClock(locale, seconds)}`
    const sends = spyOn(console, 'info').mockImplementation(() => undefined)
    const clock = holdClock(START)
    try {
      await userEvent.type(canvas.getByLabelText(i18n._('Mobile number')), PHONE)
      await userEvent.click(canvas.getByRole('button', { name: i18n._('Send the code') }))
      await expect(await canvas.findByText(line(RESEND_SECONDS))).toBeInTheDocument()
      await expect(canvas.queryByRole('button', { name: i18n._('Send the code again') })).toBeNull()

      clock.forward(ONE_SECOND)
      await expect(await canvas.findByText(line(RESEND_SECONDS - 1))).toBeInTheDocument()
      clock.forward((RESEND_SECONDS - 2) * ONE_SECOND)
      await expect(await canvas.findByText(line(1))).toBeInTheDocument()

      clock.forward(ONE_SECOND)
      await userEvent.click(await canvas.findByRole('button', { name: i18n._('Send the code again') }))
      await waitFor(async () => {
        await expect(sends).toHaveBeenCalledTimes(2)
      })
      await expect(await canvas.findByText(line(RESEND_SECONDS))).toBeInTheDocument()
    } finally {
      clock.release()
      sends.mockRestore()
    }
  }

export const CountsDownToAResend: Story = {
  globals: { locale: 'fa-IR' },
  play: countsDownIn('fa-IR'),
}

export const CountsDownToAResendInEnglish: Story = {
  globals: { locale: 'en-US' },
  play: countsDownIn('en-US'),
}

export const ChangingTheNumber: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // KN-587: a mistyped number changed from the code step, as 407:6997's reaction
    // goes back to Login. The number step returns with the number as it was typed,
    // in its field and focused, and the code goes to the number typed instead.
    const canvas = within(canvasElement)
    const i18n = i18nFor('fa-IR')
    const sends = spyOn(console, 'info').mockImplementation(() => undefined)
    try {
      await userEvent.type(canvas.getByLabelText(i18n._('Mobile number')), PHONE)
      await userEvent.click(canvas.getByRole('button', { name: i18n._('Send the code') }))
      await userEvent.click(await canvas.findByRole('button', { name: i18n._('Change the number') }))

      const number = await canvas.findByLabelText(i18n._('Mobile number'))
      await expect(canvas.getByText(i18n._('Sign in to KarNama'))).toBeInTheDocument()
      await expect(number).toHaveValue(PHONE)
      await expect(number).toHaveFocus()

      await userEvent.clear(number)
      await userEvent.type(number, OTHER_PHONE)
      await userEvent.click(canvas.getByRole('button', { name: i18n._('Send the code') }))
      await expect(await canvas.findByText(`${i18n._('Sent to')} ${formatPhone('fa-IR', OTHER_PHONE)}`)).toBeInTheDocument()
      await expect(String(sends.mock.calls.at(-1)?.[0])).toContain(OTHER_PHONE)
    } finally {
      sends.mockRestore()
    }
  },
}
