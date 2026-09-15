/**
 * Digits as a reader types them, read as Latin: a number or a code reads the same
 * whichever keyboard wrote it. Moved here from core/auth for the Code Input, which
 * reads a code the same way, so a shared component does not depend on auth, KN-586.
 */

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
