import { PRESETS } from '../presets/instruments'
import { presetMeasurements, presetScaleLabel } from '../presets/display'
import { useAppState } from '../store.state'
import {
  MM_PER_INCH,
  formatLength,
  fromDisplayLength,
  fromMillimeters,
  toDisplayLength,
  toMillimeters,
} from './units'

describe('length unit conversion', () => {
  test('uses the exact international inch', () => {
    expect(toMillimeters(1, 'inch')).toBe(25.4)
    expect(fromMillimeters(25.4, 'inch')).toBe(1)
    expect(MM_PER_INCH).toBe(25.4)
  })

  test('round-trips display values without changing physical dimensions', () => {
    const originalMm = 647.7
    const displayedInches = toDisplayLength(originalMm, 'inch')!
    expect(displayedInches).toBe(25.5)
    expect(fromDisplayLength(displayedInches, 'inch')).toBeCloseTo(originalMm, 10)
  })

  test('formats values using unit-specific precision', () => {
    expect(formatLength(647.7, 'mm')).toBe('647.7 mm')
    expect(formatLength(647.7, 'inch')).toBe('25.500 in')
  })
})

describe('preset units', () => {
  const preset = PRESETS.find(item => item.id === 'ormsby-hype-gtr6-ms')!

  test('shows preset scales and dimensions in the selected display unit', () => {
    expect(presetScaleLabel(preset, 'inch')).toBe('25.500 in – 27.500 in')
    expect(presetScaleLabel(preset, 'mm')).toBe('647.7 mm – 698.5 mm')

    expect(presetMeasurements(preset, 'inch')).toEqual({
      scale: '25.500 in – 27.500 in',
      nutSpan: '1.370 in',
      bridgeSpan: '2.000 in',
      overhang: '0.100 in',
    })
  })

  test('applying a preset preserves the user unit and stores exact millimeters', () => {
    useAppState.setState({ units: 'inch' })
    useAppState.getState().applyPreset(preset.id)
    const state = useAppState.getState()

    expect(state.units).toBe('inch')
    expect(state.scaleTreble).toBeCloseTo(25.5 * MM_PER_INCH, 10)
    expect(state.scaleBass).toBeCloseTo(27.5 * MM_PER_INCH, 10)
    expect(state.stringSpanNut).toBeCloseTo(1.37 * MM_PER_INCH, 10)
    expect(state.stringSpanBridge).toBeCloseTo(2 * MM_PER_INCH, 10)
    expect(state.overhang).toBeCloseTo(0.1 * MM_PER_INCH, 10)
  })

  test('switching units never mutates any stored length', () => {
    const before = useAppState.getState()
    const keys = [
      'scaleTreble', 'scaleBass', 'stringSpanNut', 'stringSpanBridge',
      'overhang', 'markerSize', 'radiusNut', 'radiusBridge',
    ] as const

    useAppState.getState().setUnits('mm')
    const after = useAppState.getState()

    keys.forEach(key => expect(after[key]).toBe(before[key]))
  })
})
