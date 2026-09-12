import { useLingui } from '@lingui/react'
import { Box, Stack } from '@mui/material'
import { useEffect, useState, type SyntheticEvent } from 'react'
import { apiErrorText } from '../core/api'
import { useAuth } from '../core/auth'
import { Button, type ButtonType, type ButtonVariant } from '../shared/button'
import { Input, type InputDirection } from '../shared/input'
import { radius, spacing, type as typeScale } from '../theme/tokens'

/**
 * Signing in: a number, then the five digit code, then a name the first time,
 * KN-046.
 *
 * Page-map row 6 draws the three as three screens, and they are three steps of
 * one flow: the card is the same 440 wide, the heading and the field change.
 * No SMS is sent, the owner's decision for the MVP: the mocked provider writes
 * the code to the console and the page says so, rather than pretending a
 * message is on its way.
 */

// Node 407:6951's card, 440 wide, and the room it keeps round its contents.
const CARD_WIDTH = 440

// The resend is a quiet action beside the primary one, typed so the lint rule
// reads it as a value.
const QUIET: ButtonVariant = 'text'

// A field of latin data: a phone number, an email or a link runs left to
// right whatever the page does, KN-458. Typed so the lint rule reads it as a
// value rather than as copy.
const LATIN: InputDirection = 'ltr'

// The button that finishes the form, typed for the same reason.
const SUBMIT: ButtonType = 'submit'

export const AuthScreen = () => {
  const { i18n } = useLingui()
  const auth = useAuth()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [problem, setProblem] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!auth.retryAt) return
    const timer = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => {
      window.clearInterval(timer)
    }
  }, [auth.retryAt])

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
      if (name.trim() === '') setProblem(i18n._('Write the full name'))
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

  const step = auth.signingUp ? (
    <>
      <Box sx={{ fontSize: `${typeScale['heading/m'].size}px`, fontWeight: typeScale['heading/m'].weight }}>
        {i18n._('What should we call you?')}
      </Box>
      <Input
        label={i18n._('Full name')}
        autoComplete="name"
        placeholder={i18n._('e.g. Sara Mohammadi')}
        value={name}
        onChange={setName}
        {...(problem === null ? {} : { error: problem })}
      />
      <Button type={SUBMIT} disabled={auth.busy ?? false}>
        {i18n._('Continue')}
      </Button>
    </>
  ) : auth.awaiting ? (
    <>
      <Box sx={{ fontSize: `${typeScale['heading/m'].size}px`, fontWeight: typeScale['heading/m'].weight }}>{i18n._('Enter the code')}</Box>
      <Box sx={{ color: 'text.secondary' }}>{`${i18n._('Sent to')} ${auth.phone}`}</Box>
      {/* The code itself, on the screen, KN-459: no message is really sent, and
          the console was the only place it appeared, which a phone does not
          have. Marked plainly as a stand-in so nobody mistakes it for something
          that arrived, and it goes with the mock. */}
      {auth.mockCode === null ? null : (
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
            {auth.mockCode}
          </Box>
        </Box>
      )}
      <Input
        label={i18n._('Five digit code')}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={5}
        direction={LATIN}
        value={code}
        onChange={setCode}
        {...(problem === null ? {} : { error: problem })}
      />
      <Button type={SUBMIT} disabled={auth.busy ?? false}>
        {i18n._('Sign in')}
      </Button>
      <Button
        variant={QUIET}
        disabled={(auth.busy ?? false) || now < (auth.retryAt ?? 0)}
        onClick={() => {
          setProblem(null)
          void Promise.resolve(auth.resend()).catch(() => undefined)
        }}
      >
        {i18n._('Send another code')}
      </Button>
    </>
  ) : (
    <>
      <Box sx={{ fontSize: `${typeScale['heading/m'].size}px`, fontWeight: typeScale['heading/m'].weight }}>
        {i18n._('Sign in to KarNama')}
      </Box>
      <Box sx={{ color: 'text.secondary' }}>{i18n._('Write your mobile number')}</Box>
      <Input
        label={i18n._('Mobile number')}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        direction={LATIN}
        placeholder={i18n._('0912 000 0000')}
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
        component="form"
        noValidate
        onSubmit={finish}
        sx={{
          width: '100%',
          maxWidth: `${CARD_WIDTH}px`,
          gap: `${spacing.md}px`,
          p: `${spacing.lg}px`,
          borderRadius: `${radius.md}px`,
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ fontSize: `${typeScale['heading/l'].size}px`, fontWeight: typeScale['heading/l'].weight }}>{i18n._('KarNama')}</Box>
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
        <Box sx={{ color: 'text.secondary', fontSize: `${typeScale.label.size}px` }}>
          {i18n._('Signing in means you accept how KarNama keeps your records.')}
        </Box>
      </Stack>
    </Box>
  )
}
