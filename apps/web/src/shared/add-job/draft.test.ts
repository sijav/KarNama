import { describe, expect, it } from 'vitest'
import { draftFrom, emptyDraft, hasContent, isLink, missingFields } from './draft'

describe('the add modal draft', () => {
  it('starts empty in the status it is given', () => {
    const draft = emptyDraft('status-1')
    expect(draft.status).toBe('status-1')
    expect(missingFields(draft)).toEqual(['title', 'company'])
    expect(hasContent(draft)).toBe(false)
  })

  it('tells a link from the text of a posting', () => {
    expect(isLink('https://jobinja.ir/jobs/9f3c21')).toBe(true)
    expect(isLink('  http://example.com/a  ')).toBe(true)
    expect(isLink('https://example.com/a and some words')).toBe(false)
    expect(isLink('Frontend developer at a company in Tehran')).toBe(false)
    expect(isLink('')).toBe(false)
  })

  it('keeps the pasted link as the posting link when reading found none', () => {
    expect(draftFrom('s', ' https://example.com/1 ', { title: 'A' }).postingUrl).toBe('https://example.com/1')
    expect(draftFrom('s', 'https://example.com/1', { postingUrl: 'https://example.com/2' }).postingUrl).toBe('https://example.com/2')
    expect(draftFrom('s', 'the text of a posting', { title: 'A' }).postingUrl).toBe('')
    expect(draftFrom('s', 'https://example.com/1', { title: 'A' })).toMatchObject({ title: 'A', company: '', status: 's' })
  })

  it('asks for the title and the company, and counts spaces as nothing', () => {
    expect(missingFields({ ...emptyDraft('s'), title: '  ', company: 'Pars' })).toEqual(['title'])
    expect(missingFields({ ...emptyDraft('s'), title: 'A', company: 'B' })).toEqual([])
  })

  it('counts any filled field, a choice or a level as something entered', () => {
    expect(hasContent({ ...emptyDraft('s'), salary: '45' })).toBe(true)
    expect(hasContent({ ...emptyDraft('s'), employmentTypes: ['remote'] })).toBe(true)
    expect(hasContent({ ...emptyDraft('s'), jobLevel: 'specialist' })).toBe(true)
    expect(hasContent({ ...emptyDraft('s'), location: '   ' })).toBe(false)
  })
})
