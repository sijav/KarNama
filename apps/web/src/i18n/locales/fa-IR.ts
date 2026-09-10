/**
 * The Persian catalog.
 *
 * Terminology is a hard rule, not a preference. «فرصت شغلی» is the record the
 * user tracks inside KarNama; «آگهی» is ONLY the external source, the original
 * posting or the pasted link. «فرصت» never appears alone, anywhere, including
 * in a secondary reference mid sentence.
 *
 * A key that is absent here falls back to its English id, which is the whole
 * reason the ids are English sentences.
 */
export const messages: Record<string, string> = {
  'KarNama': 'کارنما',
  'My job opportunities': 'فرصت‌های شغلی من',
  'Language': 'زبان',
  'Delete status': 'حذف وضعیت',
  'Saved': 'ذخیره‌شده',
  'Applied': 'درخواست‌شده',
  'Interview': 'مصاحبه',
  'Rejected': 'رد شده',
  'Job offer': 'پیشنهاد کار',
  'Job title': 'عنوان شغلی',
  'e.g. Frontend developer': 'مثلاً: توسعه‌دهنده فرانت‌اند',
  'A short explanation': 'توضیح کوتاه کمکی',
  'This field cannot be empty': 'این فیلد نمی‌تواند خالی باشد',
}
