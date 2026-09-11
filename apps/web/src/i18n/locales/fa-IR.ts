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
  'Enter at least two characters': 'دست‌کم دو نویسه وارد کنید',
  'Status colour': 'رنگ وضعیت',
  'A colour was chosen for you; change it if you like.': 'رنگ خودکار انتخاب شده؛ اگر خواستی عوضش کن.',
  'Gray': 'خاکستری',
  'Indigo': 'نیلی',
  'Amber': 'کهربایی',
  'Red': 'قرمز',
  'Green': 'سبز',
  'Teal': 'سبزآبی',
  'Purple': 'بنفش',
  'Pink': 'صورتی',
  'Cyan': 'فیروزه‌ای',
  'Job opportunity sections': 'بخش‌های فرصت شغلی',
  'Job opportunity info': 'اطلاعات فرصت شغلی',
  'History': 'سابقه',
  'Note': 'یادداشت',
  'Related people': 'افراد مرتبط',
  'Files': 'فایل‌ها',
  'Search in title, company or note': 'جستجو در عنوان، شرکت یا یادداشت',
  'Search job opportunities': 'جستجوی فرصت‌های شغلی',
  'Clear search': 'پاک کردن جستجو',
  'Button': 'دکمه',
}
