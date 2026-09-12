import type { I18n } from '@lingui/core'

export const apiErrorText = (i18n: I18n, code: string): string => {
  switch (code) {
    case 'API_NOT_CONFIGURED':
    case 'AUTH_NOT_CONFIGURED':
    case 'SMS_NOT_CONFIGURED':
      return i18n._('Sign-in is not configured yet. Please try later.')
    case 'SMS_DELIVERY_FAILED':
      return i18n._('The code could not be sent. Please try again.')
    case 'RATE_LIMITED':
      return i18n._('Too many attempts. Please try again in an hour.')
    case 'RESEND_TOO_SOON':
      return i18n._('Please wait a minute before requesting another code.')
    case 'CODE_EXPIRED':
    case 'CODE_LOCKED':
      return i18n._('That code has expired. Ask for another one.')
    case 'CODE_WRONG':
      return i18n._('That code is not right. Try again.')
    case 'UNAUTHENTICATED':
      return i18n._('Your session has expired. Sign in again.')
    case 'DEMO_EXTRACTION_UNAVAILABLE':
      return i18n._('Automatic extraction is not enabled for demo sign-in. You can enter the details yourself.')
    case 'EXTRACTION_NOT_CONFIGURED':
      return i18n._('Automatic extraction is unavailable. You can enter the details yourself.')
    default:
      return i18n._('Could not reach the service. Please try again.')
  }
}
