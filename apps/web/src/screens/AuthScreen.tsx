import { useLingui } from '@lingui/react'
import { Box, ButtonBase, Stack } from '@mui/material'
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type SyntheticEvent } from 'react'
import { apiErrorText } from '../core/api'
import { useAuth, useMockCode } from '../core/auth'
import { usePreferences } from '../core/preferences'
import { formatClock } from '../i18n/formatClock'
import { Button, type ButtonType } from '../shared/button'
import { CodeInput } from '../shared/code-input'
import { formatPhone } from '../shared/contact-card'
import { Input, type InputDirection } from '../shared/input'
import { BrandRow } from '../shared/navigation'
import { spacing, type as typeScale } from '../theme/tokens'

/**
 * Signing in: a number, then the five digit code, then a name the first time,
 * KN-046.
 *
 * Page-map row 6 draws the three as three screens, and they are three steps of
 * one flow: the card is the same, the heading and the field change. No SMS is
 * sent, the owner's decision for the MVP: the mocked provider writes the code to
 * the console and the page says so, rather than pretending a message is on its
 * way.
 */

// Node 407:6952's Auth Card, the same on every step: 440 wide on a desktop, the
// page's 24 at either side on a phone, 342 at 390, KN-518.
const CARD_WIDTH = 440

// The card's one pixel of edge, drawn inside.
const EDGE = 1

// A second, and how often the resend's countdown looks at the clock: four times a
// second, so the time on the screen is never more than a quarter of a second
// behind the clock, KN-587.
const SECOND = 1000
const TICK = 250

// A Footer Link's focus, two pixels of border/focus, as the add modal's link draws it.
const FOCUS_EDGE = 2

// The seconds left before another code may be asked for, rounded up, so the count
// reaches zero at the moment a resend is taken.
const secondsUntil = (retryAt: number) => Math.max(0, Math.ceil((retryAt - Date.now()) / SECOND))

// A field of latin data: a phone number, an email or a link runs left to
// right whatever the page does, KN-458. Typed so the lint rule reads it as a
// value rather than as copy.
const LATIN: InputDirection = 'ltr'

// The button that finishes the form, typed for the same reason.
const SUBMIT: ButtonType = 'submit'

// Each step's heading, 407:6957: the title at 24 and SemiBold on the font's
// normal line, which is the file's 38, bound to no text style as the Brand Row's
// name is not, and the body 8 under it in Body, text/secondary, KN-518.
const Heading = ({ title, children }: { title: string; children: ReactNode }) => (
  <Stack sx={{ gap: `${spacing.xs}px` }}>
    <Box sx={{ fontSize: `${typeScale['heading/l'].size}px`, fontWeight: typeScale['heading/l'].weight, lineHeight: 'normal' }}>
      {title}
    </Box>
    <Box sx={{ color: 'text.secondary' }}>{children}</Box>
  </Stack>
)

// Node 407:6998's Footer Link: 14 at Medium on the Body line of 22, centred, in
// text/brand, and pressed anywhere across the card's width, as its frame, 407:6997,
// fills it. Drawn on ButtonBase as the add modal's link to the manual form is; the
// file draws no disabled link, so a disabled one takes the Button's disabled text,
// KN-587.
const FooterLink = ({ children, disabled, onClick }: { children: string; disabled: boolean; onClick: () => void }) => (
  <ButtonBase
    disableRipple
    disabled={disabled}
    onClick={onClick}
    sx={(theme) => ({
      fontFamily: 'inherit',
      fontSize: `${typeScale.body.size}px`,
      lineHeight: `${typeScale.body.lineHeight}px`,
      fontWeight: typeScale.label.weight,
      color: theme.karnama.semantic['text/brand'],
      borderRadius: `${theme.karnama.radius.sm}px`,
      '&.Mui-disabled': { color: theme.karnama.semantic['text/disabled'] },
      '&.Mui-focusVisible': { outlineWidth: FOCUS_EDGE, outlineStyle: 'solid', outlineColor: theme.karnama.semantic['border/focus'] },
    })}
  >
    {children}
  </ButtonBase>
)

// Node 407:6996's Resend Timer: the words and, beside them rather than inside,
// KN-221, the time left in the reader's digits, at 14 Regular on 22, centred, in
// text/disabled. When no time is left the same line is a Footer Link that asks for
// another code, which the file does not draw, KN-587. The screen keys it by
// retryAt, so every send starts the count again.
const Resend = ({ retryAt, busy, onResend }: { retryAt: number; busy: boolean; onResend: () => void }) => {
  const { i18n } = useLingui()
  const { locale } = usePreferences()
  const [left, setLeft] = useState(() => secondsUntil(retryAt))
  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = secondsUntil(retryAt)
      setLeft(next)
      if (next === 0) window.clearInterval(timer)
    }, TICK)
    return () => {
      window.clearInterval(timer)
    }
  }, [retryAt])
  if (left === 0) {
    return (
      <FooterLink disabled={busy} onClick={onResend}>
        {i18n._('Send the code again')}
      </FooterLink>
    )
  }
  return (
    <Box
      sx={(theme) => ({
        fontSize: `${typeScale.body.size}px`,
        lineHeight: `${typeScale.body.lineHeight}px`,
        fontWeight: typeScale.body.weight,
        textAlign: 'center',
        color: theme.karnama.semantic['text/disabled'],
      })}
    >
      {`${i18n._('Send the code again in')} ${formatClock(locale, left)}`}
    </Box>
  )
}

export const AuthScreen = () => {
  const { i18n } = useLingui()
  const { locale } = usePreferences()
  const auth = useAuth()
  const mockCode = useMockCode()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [problem, setProblem] = useState<string | null>(null)

  // «ویرایش شماره» marks the return, and once the number step is back its field
  // takes focus: the link went with the code step, and focus would otherwise fall
  // to the page's body, KN-587.
  const card = useRef<HTMLFormElement>(null)
  const returning = useRef(false)
  useLayoutEffect(() => {
    if (!returning.current || auth.awaiting) return
    returning.current = false
    card.current?.querySelector('input')?.focus()
  }, [auth.awaiting])
  const changeNumber = () => {
    returning.current = true
    setCode('')
    setProblem(null)
    auth.changeNumber()
  }

  const askForCode = async () => {
    setProblem((await auth.requestCode(phone)) ? null : i18n._('Write your mobile number, 11 digits starting 09'))
  }

  // Finishing the form is whatever the step in front of the reader means by
  // finished, KN-463. One form rather than one per step: React replaces this
  // handler on every render, so a step change cannot carry a stale one, and
  // Enter in a field does what the step's own button does.
  const finish = (event: SyntheticEvent) => {
    event.preventDefault()
    if (auth.busy || auth.restoring) return
    setProblem(null)
    void submit().catch(() => undefined)
  }
  const submit = async () => {
    if (auth.signingUp) {
      if (name.trim() === '') setProblem(i18n._('Write your first and last name'))
      else await auth.saveName(name)
      return
    }
    if (auth.awaiting) {
      await check()
      return
    }
    await askForCode()
  }

  const check = async () => {
    const refused = await auth.verify(code)
    if (refused === null) {
      setProblem(null)
      setCode('')
      return
    }
    setProblem(refused === 'expired' ? i18n._('That code has expired. Ask for another one.') : i18n._('That code is not right. Try again.'))
  }

  // The steps' own words where the file's promise nothing the product does not
  // do: the text message the Login and Code lines would promise waits on KN-589.
  const step = auth.signingUp ? (
    <>
      {/* The file's body says «برد آگهی‌هایت»; «آگهی» is only the external source,
          so this says «فرصت‌های شغلی», as KN-329 does. */}
      <Heading title={i18n._('Welcome')}>{i18n._('Just tell us your name so we can build your job opportunities board.')}</Heading>
      <Input
        label={i18n._('First and last name')}
        autoComplete="name"
        enterKeyHint="done"
        placeholder={i18n._('Mehdi Rezaei')}
        value={name}
        onChange={setName}
        {...(problem === null ? {} : { error: problem })}
      />
      <Button type={SUBMIT} disabled={auth.busy ?? false}>
        {i18n._('Start')}
      </Button>
    </>
  ) : auth.awaiting ? (
    <>
      <Heading title={i18n._('Enter the code')}>{`${i18n._('Code for')} ${formatPhone(locale, auth.phone)}`}</Heading>
      {/* The code itself, on the screen, KN-459: no message is really sent, and
          the console was the only place it appeared, which a phone does not
          have. Marked plainly as a stand-in so nobody mistakes it for something
          that arrived. It comes from the mock alone, never from the contract a
          real provider fills, KN-460, and goes with the mock. */}
      {mockCode === null ? null : (
        <Box
          role="status"
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: `${spacing.sm}px`,
            padding: `${spacing.sm}px ${spacing.md}px`,
            borderRadius: `${theme.karnama.radius.md}px`,
            backgroundColor: theme.karnama.semantic['bg/surface-secondary'],
            color: theme.karnama.semantic['text/secondary'],
          })}
        >
          <Box component="span">{i18n._('No message is really sent yet. Your code is:')}</Box>
          <Box
            component="span"
            // The code is latin digits and must not be reordered by the page's
            // direction, KN-458.
            dir="ltr"
            sx={(theme) => ({
              fontSize: `${typeScale['heading/m'].size}px`,
              fontWeight: typeScale['heading/m'].weight,
              letterSpacing: `${spacing['2xs']}px`,
              color: theme.karnama.semantic['text/primary'],
            })}
          >
            {mockCode}
          </Box>
        </Box>
      )}
      {/* The file's Code Row, 407:6981 and 407:7052: five boxes over one field that
          types, pastes and takes a phone's autofill, KN-586. */}
      <CodeInput
        label={i18n._('Five digit code')}
        enterKeyHint="go"
        value={code}
        onChange={setCode}
        {...(problem === null ? {} : { error: problem })}
      />
      <Button type={SUBMIT} disabled={auth.busy ?? false}>
        {i18n._('Confirm and sign in')}
      </Button>
      <Resend
        key={auth.retryAt ?? 0}
        retryAt={auth.retryAt ?? 0}
        busy={auth.busy ?? false}
        onResend={() => {
          setProblem(null)
          void Promise.resolve(auth.resend()).catch(() => undefined)
        }}
      />
      {/* «ویرایش شماره», 407:6997: back to the number step with the number kept, as
          its reaction goes back to Login, 407:6951, KN-587. */}
      <FooterLink disabled={auth.busy ?? false} onClick={changeNumber}>
        {i18n._('Change the number')}
      </FooterLink>
    </>
  ) : (
    <>
      <Heading title={i18n._('Sign in to KarNama')}>{i18n._('Write your mobile number')}</Heading>
      <Input
        label={i18n._('Mobile number')}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        enterKeyHint="send"
        direction={LATIN}
        placeholder={i18n._('0912 345 6789')}
        value={phone}
        onChange={setPhone}
        {...(problem === null ? {} : { error: problem })}
      />
      <Button type={SUBMIT} disabled={auth.busy ?? false}>
        {i18n._('Send the code')}
      </Button>
    </>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', p: 6, bgcolor: 'background.default' }}>
      <Stack
        ref={card}
        component="form"
        noValidate
        onSubmit={finish}
        sx={(theme) => ({
          position: 'relative',
          boxSizing: 'border-box',
          width: '100%',
          maxWidth: `${CARD_WIDTH}px`,
          gap: `${spacing.lg}px`,
          padding: `${spacing.xl}px`,
          borderRadius: `${theme.karnama.radius.lg}px`,
          backgroundColor: theme.karnama.semantic['bg/surface'],
          boxShadow: theme.karnama.elevation.authCard,
          // The edge is drawn inside and takes no room, DESIGN.md's rule for a
          // stroke, as the job card draws its own.
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            borderStyle: 'solid',
            borderWidth: EDGE,
            borderColor: theme.karnama.semantic['border/default'],
            pointerEvents: 'none',
          },
        })}
      >
        <BrandRow />
        {auth.restoring ? (
          <>
            <Box role="status">{i18n._('Restoring your session…')}</Box>
            {auth.error ? <Button onClick={() => auth.retrySession?.()}>{i18n._('Try again')}</Button> : null}
          </>
        ) : (
          step
        )}
        {auth.busy ? <Box role="status">{i18n._('Connecting… The server may take a minute to wake up.')}</Box> : null}
        {auth.error ? (
          <Box role="alert" sx={{ color: 'error.main' }}>
            {apiErrorText(i18n, auth.error)}
          </Box>
        ) : null}
        {/* The Terms Note, 407:6971, on the number's step alone as the file draws
            it: 12 at Regular on the font's normal line, centred, in text/disabled,
            2.54 to one on the card, KN-591. Its words are the product's own until
            the owner settles the terms and privacy the file's name, KN-590. */}
        {auth.restoring || auth.awaiting || auth.signingUp ? null : (
          <Box
            sx={(theme) => ({
              fontSize: `${typeScale.label.size}px`,
              fontWeight: typeScale.body.weight,
              lineHeight: 'normal',
              textAlign: 'center',
              color: theme.karnama.semantic['text/disabled'],
            })}
          >
            {i18n._('Signing in means you accept how KarNama keeps your records.')}
          </Box>
        )}
      </Stack>
    </Box>
  )
}
