import { describe, expect, it } from 'vitest'
import { fileKind, fileSize, formatDay } from './format'

const UNITS = { kilobytes: 'KB', megabytes: 'MB' }

describe('the job modal formats', () => {
  it('writes a day on the reader’s calendar', () => {
    expect(formatDay('fa-IR', '2026-09-04T12:00:00Z')).toBe('۱۳ شهریور ۱۴۰۵')
    expect(formatDay('en-US', '2026-09-04T12:00:00Z')).toBe('September 4, 2026')
    // Twice, from the formatter made the first time.
    expect(formatDay('fa-IR', '2026-09-01T12:00:00Z')).toBe('۱۰ شهریور ۱۴۰۵')
  })

  it('names a file’s kind by its extension', () => {
    expect(fileKind('resume.pdf')).toBe('PDF')
    expect(fileKind('cover.letter.docx')).toBe('DOCX')
    expect(fileKind('notes')).toBe('')
    expect(fileKind('.hidden')).toBe('')
    expect(fileKind('trailing.')).toBe('')
  })

  it('writes a size in kilobytes, and in megabytes past one', () => {
    expect(fileSize('fa-IR', 245760, UNITS)).toBe('۲۴۰ KB')
    expect(fileSize('en-US', 38912, UNITS)).toBe('38 KB')
    expect(fileSize('en-US', 10, UNITS)).toBe('1 KB')
    expect(fileSize('en-US', 1536 * 1024, UNITS)).toBe('1.5 MB')
  })
})
