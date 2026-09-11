/**
 * Signing in: a mobile number, then a five digit code, DESIGN.md section 3.
 *
 * The provider is MOCKED for the MVP, the owner's decision: no SMS is sent, the
 * code is made here and written to the console, and everything is behind one
 * interface so the real provider replaces it without the screens changing,
 * KN-036. Everything that decides anything is here, as data in and data out.
 */

/** Who is signed in: their number, their name once they have given it, and when they signed in. */
export interface Session {
  phone: string
  name: string
  since: string
}

/** A code the mock sent: which number it was for, what it was, and when it expires. */
export interface SentCode {
  phone: string
  code: string
  expiresAt: number
}

/** How long a code is good for. Long enough to read an SMS, short enough to matter. */
export const CODE_MINUTES = 2
export const CODE_LENGTH = 5

// Iranian mobile numbers, the only ones the product asks for: eleven digits
// from 09, or the same number written with +98 or 0098 in front of the 9.
const DIGITS = /^\d+$/

/** The digit tables a reader might type in: Persian, Arabic-Indic, and the Latin they are stored in. */
const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'

/** The same text with every digit written in Latin, so a number reads the same however it was typed. */
export const latinDigits = (text: string): string =>
  // Replaced rather than walked character by character: spreading a string
  // splits what a reader sees as one sign, which the lint rule is right about.
  text.replace(/[۰-۹٠-٩]/g, (sign) => {
    const persian = PERSIAN_DIGITS.indexOf(sign)
    return String(persian === -1 ? ARABIC_DIGITS.indexOf(sign) : persian)
  })

/** The number as it is stored, 09xxxxxxxxx, or null when it is not one. */
export const normalisePhone = (typed: string): string | null => {
  const bare = latinDigits(typed).replace(/[\s-()]/g, '')
  const national = bare.startsWith('+98') ? `0${bare.slice(3)}` : bare.startsWith('0098') ? `0${bare.slice(4)}` : bare
  const withZero = national.startsWith('9') ? `0${national}` : national
  if (!DIGITS.test(withZero) || withZero.length !== 11 || !withZero.startsWith('09')) return null
  return withZero
}

export const isPhone = (typed: string): boolean => normalisePhone(typed) !== null

/** A five digit code, made where the SMS provider would have made it. */
export const makeCode = (random: () => number = Math.random): string =>
  String(Math.floor(random() * 10 ** CODE_LENGTH))
    .padStart(CODE_LENGTH, '0')
    .slice(0, CODE_LENGTH)

/** What the mock sends: the code, for that number, good for two minutes. */
export const sendCode = (phone: string, now: number, random?: () => number): SentCode => ({
  phone,
  code: makeCode(random),
  expiresAt: now + CODE_MINUTES * 60 * 1000,
})

/** Why a code was refused, or null when it is the right one. */
export type CodeProblem = 'expired' | 'wrong'

// Typed rather than written at each return: a literal handed back from a
// function loses the union that exempts it from the lingui rule, KN-217.
const EXPIRED: CodeProblem = 'expired'
const WRONG: CodeProblem = 'wrong'

export const checkCode = (sent: SentCode | null, typed: string, now: number): CodeProblem | null => {
  if (!sent || sent.expiresAt <= now) return EXPIRED
  return latinDigits(typed).trim() === sent.code ? null : WRONG
}

/** A session for a number, with no name until the first login collects one. */
export const sessionFor = (phone: string, at: string, name = ''): Session => ({ phone, name, since: at })

/** Whether this session still has to say who it belongs to, which is the signup step. */
export const needsName = (session: Session): boolean => session.name.trim() === ''

/** A stored session, or null for anything that is not one. */
export const readSession = (raw: unknown): Session | null => {
  if (typeof raw !== 'object' || raw === null) return null
  const held: Record<string, unknown> = { ...raw }
  const { phone, name, since } = held
  if (typeof phone !== 'string' || typeof name !== 'string' || typeof since !== 'string') return null
  return normalisePhone(phone) === null ? null : { phone, name, since }
}
