import { describe, expect, it } from 'vitest'
import { defaultGuitarPitches, pitchFrequency, recommendString, stringScaleLengths, stringTensionLb } from './advisor'

describe('string gauge advisor', () => {
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

  it('returns no verified match outside the catalog range', () => {
    expect(recommendString('C0', 100, 'firm').match).toBeNull()
  })
})
