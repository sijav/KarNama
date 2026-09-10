/**
 * The English catalog. Ids ARE the English text, so this file is an identity
 * map and stays that way: it exists so `i18n.load` has both locales and so a
 * missing Persian message has something to fall back to.
 *
 * Generated catalogs replace this once `lingui extract` runs over real
 * components. Until then it is written by hand and its keys are the contract.
 */
export const messages: Record<string, string> = {
  'KarNama': 'KarNama',
  'My job opportunities': 'My job opportunities',
  'Language': 'Language',
  'Delete status': 'Delete status',
  'Saved': 'Saved',
  'Applied': 'Applied',
  'Interview': 'Interview',
  'Rejected': 'Rejected',
  'Job offer': 'Job offer',
  'Job title': 'Job title',
  'e.g. Frontend developer': 'e.g. Frontend developer',
  'A short explanation': 'A short explanation',
  'This field cannot be empty': 'This field cannot be empty',
}
