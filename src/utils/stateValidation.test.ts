import { describe, expect, it } from 'vitest'
import { sanitizeStatePatch, STATE_LIMITS } from './stateValidation'

describe('sanitizeStatePatch', () => {
  it('drops unknown fields and action replacements', () => {
    const result = sanitizeStatePatch({ mode: 'equal', set: null, applyPreset: 'oops', unknown: 1 })
    expect(result).toEqual({ mode: 'curved' })
  })

  it('clamps finite numeric values and ignores non-finite values', () => {
    const result = sanitizeStatePatch({
      strings: 100_000,
      frets: -4,
      scaleTreble: Infinity,
      overhang: -10,
      guidePosPct: 44.6,
    })
    expect(result).toEqual({
      strings: STATE_LIMITS.strings.max,
      frets: STATE_LIMITS.frets.min,
      overhang: STATE_LIMITS.overhang.min,
      guidePosPct: 45,
    })
  })

  it('deduplicates and limits marker frets to the effective fret count', () => {
    const result = sanitizeStatePatch({ frets: 4, markerFrets: [3, 1, 1, 4, -1, 2.5, '2'] })
    expect(result.markerFrets).toEqual([1, 3])
  })

  it('keeps anchor and existing markers valid when the fret count decreases', () => {
    const result = sanitizeStatePatch(
      { frets: 4 },
      { frets: 24, anchorFret: 12, markerFrets: [2, 4, 11] },
    )
    expect(result).toMatchObject({ frets: 4, anchorFret: 4, markerFrets: [2] })
  })

  it('accepts only boolean removeStrings values', () => {
    expect(sanitizeStatePatch({ removeStrings: true })).toEqual({ removeStrings: true })
    expect(sanitizeStatePatch({ removeStrings: 'true' })).toEqual({})
  })
})
