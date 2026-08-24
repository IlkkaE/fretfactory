import { describe, expect, it } from 'vitest'
import { parseHash } from './share'

const hash = (value: unknown) => `#state=${encodeURIComponent(JSON.stringify(value))}`

describe('parseHash', () => {
  it('keeps only validated shareable data', () => {
    expect(parseHash(hash({
      mode: 'equal',
      units: 'inch',
      strings: 100_000,
      removeStrings: true,
      set: null,
      selectedPresetId: 'hidden-field',
    }))).toEqual({ mode: 'curved', units: 'inch', strings: 12, removeStrings: true })
  })

  it('rejects unrelated and oversized hashes', () => {
    expect(parseHash(hash({ set: null, unknown: true }))).toBeNull()
    expect(parseHash(`#state=${'x'.repeat(12_001)}`)).toBeNull()
  })

  it('keeps validated string-advisor settings', () => {
    expect(parseHash(hash({
      stringPitches: ['B1', 'E2', 'A2'],
      stringFeel: 'loose',
      preferWoundG3: true,
    }))).toEqual({
      stringPitches: ['B1', 'E2', 'A2'],
      stringFeel: 'loose',
      preferWoundG3: true,
    })
  })
})
