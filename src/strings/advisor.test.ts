import { describe, expect, it } from 'vitest'
import {
  defaultBassPitches,
  defaultGuitarPitches,
  matchingBalancedBassSet,
  pitchFrequency,
  recommendString,
  recommendStringForProfile,
  stringScaleLengths,
  stringTensionLb,
} from './advisor'
import { XL_BASS_STRINGS, XL_NICKEL_CATALOG_COVERAGE, XL_NICKEL_STRINGS } from './catalog'

describe('string gauge advisor', () => {
  it('tracks current XL single availability separately from calculable entries', () => {
    expect(XL_NICKEL_CATALOG_COVERAGE.available).toBe(66)
    expect(XL_NICKEL_CATALOG_COVERAGE.calculable).toBe(59)
    expect(XL_NICKEL_CATALOG_COVERAGE.unavailableForCalculation.map(item => item.gaugeInches))
      .toEqual([.023, .037, .040, .050, .052, .065, .090])
    expect(XL_NICKEL_STRINGS.find(item => item.gaugeInches === .080)?.evidence)
      .toBe('published-unit-weight')
  })

  it('parses concert pitch', () => {
    expect(pitchFrequency('A4')).toBeCloseTo(440, 8)
    expect(pitchFrequency('E2')).toBeCloseTo(82.4069, 3)
  })

  it('reproduces the published PL009 E4 tension at 25.5 inches', () => {
    expect(stringTensionLb(.00001794, 25.5 * 25.4, pitchFrequency('E4')!)).toBeCloseTo(13.1, 1)
  })

  it('suggests familiar regular-tension gauges for standard tuning', () => {
    const pitches = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']
    const gauges = pitches.map(pitch => recommendString(pitch, 25.5 * 25.4, 'regular').match?.gaugeInches)
    expect(gauges).toEqual([.046, .034, .025, .017, .0135, .010])
    expect(pitches.every(pitch => recommendString(pitch, 25.5 * 25.4, 'regular').withinFeelBand)).toBe(true)
  })

  it('uses each fan-fret string scale from bass to treble', () => {
    const scales = stringScaleLengths(3, 635, 685, 1)
    expect(scales[0]).toBeCloseTo(685, 8)
    expect(scales[2]).toBeCloseTo(635, 8)
    expect(scales[1]).toBeGreaterThan(635)
    expect(scales[1]).toBeLessThan(685)
  })

  it('extends editable guitar tuning defaults beyond six strings', () => {
    expect(defaultGuitarPitches(8)).toEqual(['F#1', 'B1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4'])
    expect(defaultGuitarPitches(6)).toEqual(['E2', 'A2', 'D3', 'G3', 'B3', 'E4'])
    expect(defaultGuitarPitches(12)).toEqual(['E2', 'E3', 'A2', 'A3', 'D3', 'D4', 'G3', 'G4', 'B3', 'B3', 'E4', 'E4'])
  })

  it('uses conventional bass tuning defaults from thickest to thinnest internally', () => {
    expect(defaultBassPitches(4)).toEqual(['E1', 'A1', 'D2', 'G2'])
    expect(defaultBassPitches(5)).toEqual(['B0', 'E1', 'A1', 'D2', 'G2'])
    expect(defaultBassPitches(6)).toEqual(['B0', 'E1', 'A1', 'D2', 'G2', 'C3'])
  })

  it('reproduces the three published four-string balanced bass sets at 34 inches', () => {
    const pitches = ['E1', 'A1', 'D2', 'G2']
    const expected = {
      loose: [.095, .070, .052, .040],
      regular: [.105, .080, .060, .045],
      firm: [.120, .090, .067, .050],
    } as const

    for (const feel of ['loose', 'regular', 'firm'] as const) {
      const recommendations = pitches.map(pitch => recommendString(pitch, 34 * 25.4, feel, false, 'bass'))
      expect(recommendations.map(item => item.match?.gaugeInches)).toEqual(expected[feel])
      expect(recommendations.every(item => item.family === 'bass' && item.withinFeelBand)).toBe(true)
      expect(matchingBalancedBassSet(recommendations, pitches, Array(4).fill(34 * 25.4), feel, 'bass')?.item)
        .toBe(feel === 'loose' ? 'EXL220BT' : feel === 'regular' ? 'EXL170BT' : 'EXL160BT')
    }
  })

  it('selects guitar and bass catalogs per string for a custom hybrid', () => {
    const guitar = recommendStringForProfile('E2', 26 * 25.4, 'regular', 'custom')
    const bass = recommendStringForProfile('E1', 31 * 25.4, 'regular', 'custom')
    expect(guitar.family).toBe('guitar')
    expect(bass.family).toBe('bass')
    expect(XL_BASS_STRINGS.length).toBe(29)
  })

  it('returns no verified match outside the catalog range', () => {
    const recommendation = recommendString('C0', 100, 'firm')
    expect(recommendation.match).toBeNull()
    expect(recommendation.withinFeelBand).toBe(false)
  })
})
