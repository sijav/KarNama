import { describe, expect, it } from 'vitest'
import { EMPLOYMENT_TYPES, JOB_LEVELS, isEmploymentType, isJobLevel } from './values'

describe('the job record enumerations', () => {
  it('lists eight employment types and seven job levels, none twice', () => {
    expect(new Set(EMPLOYMENT_TYPES).size).toBe(8)
    expect(new Set(JOB_LEVELS).size).toBe(7)
  })

  it('recognises its own values and nothing else', () => {
    for (const type of EMPLOYMENT_TYPES) expect(isEmploymentType(type)).toBe(true)
    for (const level of JOB_LEVELS) expect(isJobLevel(level)).toBe(true)
    expect(isEmploymentType('worker')).toBe(false)
    expect(isJobLevel('remote')).toBe(false)
    expect(isEmploymentType('')).toBe(false)
  })
})
