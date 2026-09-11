import { useLingui } from '@lingui/react'
import { Box, Stack } from '@mui/material'
import { useState } from 'react'
import { useAuth } from '../core/auth'
import { Button, type ButtonVariant } from '../shared/button'
import { Input } from '../shared/input'
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

export const AuthScreen = () => {
  const { i18n } = useLingui()
  const auth = useAuth()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [problem, setProblem] = useState<string | null>(null)

  const askForCode = () => {
    setProblem(auth.requestCode(phone) ? null : i18n._('Write your mobile number, 11 digits starting 09'))
  }

  const check = () => {
    const refused = auth.verify(code)
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
        placeholder={i18n._('e.g. Sara Mohammadi')}
        value={name}
        onChange={setName}
        {...(problem === null ? {} : { error: problem })}
      />
      <Button
        onClick={() => {
          if (name.trim() === '') setProblem(i18n._('Write the full name'))
          else auth.saveName(name)
        }}
      >
        {i18n._('Continue')}
      </Button>
    </>
  ) : auth.awaiting ? (
    <>
      <Box sx={{ fontSize: `${typeScale['heading/m'].size}px`, fontWeight: typeScale['heading/m'].weight }}>{i18n._('Enter the code')}</Box>
      <Box sx={{ color: 'text.secondary' }}>{`${i18n._('Sent to')} ${auth.phone}`}</Box>
      <Input
        label={i18n._('Five digit code')}
        value={code}
        onChange={setCode}
        helperText={i18n._('No message is really sent yet: the code is in the browser console.')}
        {...(problem === null ? {} : { error: problem })}
      />
      <Button onClick={check}>{i18n._('Sign in')}</Button>
      <Button
        variant={QUIET}
        onClick={() => {
          setProblem(null)
          auth.resend()
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
        placeholder={i18n._('0912 000 0000')}
        value={phone}
        onChange={setPhone}
        {...(problem === null ? {} : { error: problem })}
      />
      <Button onClick={askForCode}>{i18n._('Send the code')}</Button>
    </>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', p: 6, bgcolor: 'background.default' }}>
      <Stack
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
        {step}
        <Box sx={{ color: 'text.secondary', fontSize: `${typeScale.label.size}px` }}>
          {i18n._('Signing in means you accept how KarNama keeps your records.')}
        </Box>
      </Stack>
    </Box>
  )
}
