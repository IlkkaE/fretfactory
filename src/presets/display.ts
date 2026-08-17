import type { Units } from '../types'
import { formatLength, toMillimeters } from '../utils/units'
import type { PresetInstrument } from './instruments'

const presetLengthMm = (value: number, preset: PresetInstrument): number =>
  toMillimeters(value, preset.units)

export function presetScaleLabel(preset: PresetInstrument, units: Units): string {
  if (preset.scale != null) return formatLength(presetLengthMm(preset.scale, preset), units)
  if (preset.scaleTreble == null || preset.scaleBass == null) return ''

  const treble = formatLength(presetLengthMm(preset.scaleTreble, preset), units)
  const bass = formatLength(presetLengthMm(preset.scaleBass, preset), units)
  return treble === bass ? treble : `${treble} – ${bass}`
}

export function presetMeasurements(preset: PresetInstrument, units: Units) {
  return {
    scale: presetScaleLabel(preset, units),
    nutSpan: formatLength(presetLengthMm(preset.stringSpanNut, preset), units),
    bridgeSpan: formatLength(presetLengthMm(preset.stringSpanBridge, preset), units),
    overhang: formatLength(presetLengthMm(preset.overhang, preset), units),
  }
}
