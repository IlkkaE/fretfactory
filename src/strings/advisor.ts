import {
  XL_BALANCED_BASS_SETS,
  XL_BASS_STRINGS,
  XL_NICKEL_STRINGS,
  type BalancedBassSet,
  type CatalogString,
  type StringConstruction,
  type StringFamily,
} from './catalog'

export type StringFeel = 'loose' | 'regular' | 'firm'

export const FEEL_TARGETS_LB: Record<StringFeel, number> = {
  loose: 14.1,
  regular: 16.8,
  firm: 19.5,
}

// Means of D'Addario's current four-string XL Balanced Tension sets:
// EXL220BT, EXL170BT and EXL160BT respectively.
export const BASS_FEEL_TARGETS_LB: Record<StringFeel, number> = {
  loose: 32.5,
  regular: 40.7,
  firm: 50.4,
}

// Product-language tolerance, not a physical law. Outside this band the
// nearest catalog gauge is shown without claiming it matches the selected feel.
export const FEEL_TOLERANCE_PERCENT = 8

export const FEEL_LABELS: Record<StringFeel, string> = {
  loose: 'Loose · equalized target',
  regular: 'Regular · equalized target',
  firm: 'Firm · equalized target',
}

const NOTE_INDEX: Record<string, number> = {
  C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5,
  'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11,
}

export const NOTE_NAMES = Object.keys(NOTE_INDEX)

export type StringRecommendation = {
  pitch: string
  scaleMm: number
  frequencyHz: number
  targetLb: number
  family: StringFamily
  match: CatalogString | null
  tensionLb: number | null
  targetPercent: number | null
  withinFeelBand: boolean
  lighter: CatalogString | null
  heavier: CatalogString | null
}

export function pitchToMidi(pitch: string): number | null {
  const match = /^([A-G])(#?)(-?\d)$/.exec(pitch)
  if (!match) return null
  const name = `${match[1]}${match[2]}`
  const note = NOTE_INDEX[name]
  const octave = Number(match[3])
  if (note == null || octave < -1 || octave > 8) return null
  return (octave + 1) * 12 + note
}

export function pitchFrequency(pitch: string): number | null {
  const midi = pitchToMidi(pitch)
  return midi == null ? null : 440 * Math.pow(2, (midi - 69) / 12)
}

export function stringTensionLb(
  unitWeightLbPerInch: number,
  scaleMm: number,
  frequencyHz: number,
): number {
  const scaleInches = scaleMm / 25.4
  return unitWeightLbPerInch * Math.pow(2 * scaleInches * frequencyHz, 2) / 386.4
}

export function stringScaleLengths(
  strings: number,
  scaleTreble: number,
  scaleBass: number,
  curvedExponent = 1,
): number[] {
  const logBass = Math.log(scaleBass)
  const logTreble = Math.log(scaleTreble)
  const exponent = Math.max(0.01, curvedExponent)
  return Array.from({ length: strings }, (_, index) => {
    const u = strings === 1 ? 0 : index / (strings - 1)
    const curvedPosition = 1 - Math.pow(1 - u, exponent)
    return Math.exp(logBass + (logTreble - logBass) * curvedPosition)
  })
}

function preferredConstruction(
  pitch: string,
  preferWoundG3: boolean,
  family: StringFamily,
): StringConstruction | null {
  const midi = pitchToMidi(pitch)
  if (midi == null) return null
  if (family === 'bass') return midi >= 55 ? 'plain' : 'wound'
  if (pitch === 'G3' && preferWoundG3) return 'wound'
  return midi >= 55 ? 'plain' : 'wound'
}

export function recommendString(
  pitch: string,
  scaleMm: number,
  feel: StringFeel,
  preferWoundG3 = false,
  family: StringFamily = 'guitar',
): StringRecommendation {
  const frequencyHz = pitchFrequency(pitch) ?? 0
  const targetLb = family === 'bass' ? BASS_FEEL_TARGETS_LB[feel] : FEEL_TARGETS_LB[feel]
  const construction = preferredConstruction(pitch, preferWoundG3, family)
  const catalog = family === 'bass' ? XL_BASS_STRINGS : XL_NICKEL_STRINGS
  const candidates = catalog.filter(item => item.construction === construction)
    .map(item => ({ item, tension: stringTensionLb(item.unitWeightLbPerInch, scaleMm, frequencyHz) }))
    .sort((a, b) => a.item.gaugeInches - b.item.gaugeInches)

  if (!frequencyHz || !Number.isFinite(scaleMm) || scaleMm <= 0 || candidates.length === 0) {
    return { pitch, scaleMm, frequencyHz, targetLb, family, match: null, tensionLb: null, targetPercent: null, withinFeelBand: false, lighter: null, heavier: null }
  }

  const closestIndex = candidates.reduce((best, candidate, index) =>
    Math.abs(Math.log(candidate.tension / targetLb)) < Math.abs(Math.log(candidates[best].tension / targetLb))
      ? index : best, 0)
  const closest = candidates[closestIndex]
  const targetPercent = closest.tension / targetLb * 100
  const isVerifiedRange = targetPercent >= 80 && targetPercent <= 120

  return {
    pitch,
    scaleMm,
    frequencyHz,
    targetLb,
    family,
    match: isVerifiedRange ? closest.item : null,
    tensionLb: isVerifiedRange ? closest.tension : null,
    targetPercent: isVerifiedRange ? targetPercent : null,
    withinFeelBand: isVerifiedRange && Math.abs(targetPercent - 100) <= FEEL_TOLERANCE_PERCENT,
    lighter: isVerifiedRange ? candidates[closestIndex - 1]?.item ?? null : null,
    heavier: isVerifiedRange ? candidates[closestIndex + 1]?.item ?? null : null,
  }
}

export type StringAdvisorProfile = 'custom' | 'guitar' | 'bass'

export function recommendStringForProfile(
  pitch: string,
  scaleMm: number,
  feel: StringFeel,
  profile: StringAdvisorProfile,
  preferWoundG3 = false,
): StringRecommendation {
  if (profile !== 'custom') {
    return recommendString(pitch, scaleMm, feel, preferWoundG3, profile)
  }

  // Custom instruments may mix guitar and bass singles. Around the overlap,
  // prefer guitar below 30 inches and bass at or above it, but fall back to
  // the other family when the preferred catalog has no verified match.
  const preferBass = scaleMm >= 30 * 25.4
  const primaryFamily: StringFamily = preferBass ? 'bass' : 'guitar'
  const fallbackFamily: StringFamily = preferBass ? 'guitar' : 'bass'
  const primary = recommendString(pitch, scaleMm, feel, preferWoundG3, primaryFamily)
  if (primary.match) return primary

  if (scaleMm < 28.5 * 25.4 || scaleMm > 31 * 25.4) return primary
  return recommendString(pitch, scaleMm, feel, preferWoundG3, fallbackFamily)
}

const STANDARD_SIX = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']

export function defaultGuitarPitches(strings: number): string[] {
  if (strings === 12) {
    return ['E2', 'E3', 'A2', 'A3', 'D3', 'D4', 'G3', 'G4', 'B3', 'B3', 'E4', 'E4']
  }
  const result = STANDARD_SIX.slice()
  let midi = pitchToMidi(result[0])!
  while (result.length < strings) {
    midi -= 5
    const note = NOTE_NAMES[((midi % 12) + 12) % 12]
    const octave = Math.floor(midi / 12) - 1
    result.unshift(`${note}${octave}`)
  }
  return result.slice(Math.max(0, result.length - strings))
}

export function defaultBassPitches(strings: number): string[] {
  const standardFive = ['B0', 'E1', 'A1', 'D2', 'G2']
  if (strings <= standardFive.length) {
    return standardFive.slice(standardFive.length - Math.max(1, strings))
  }

  const result = [...standardFive, 'C3']
  let midi = pitchToMidi(result[0])!
  while (result.length < strings) {
    midi -= 5
    const note = NOTE_NAMES[((midi % 12) + 12) % 12]
    const octave = Math.floor(midi / 12) - 1
    result.unshift(`${note}${octave}`)
  }
  return result.slice(result.length - strings)
}

const STANDARD_BASS_FOUR = ['E1', 'A1', 'D2', 'G2']

export function matchingBalancedBassSet(
  recommendations: StringRecommendation[],
  pitches: string[],
  scalesMm: number[],
  feel: StringFeel,
  profile: StringAdvisorProfile,
): BalancedBassSet | null {
  if (profile !== 'bass' || pitches.length !== 4 || recommendations.length !== 4) return null
  if (!pitches.every((pitch, index) => pitch === STANDARD_BASS_FOUR[index])) return null
  // Long-scale product recommendation only. Exact fit still depends on the
  // instrument's bridge-to-tuner winding length.
  if (!scalesMm.every(scale => scale >= 32 * 25.4 && scale <= 36.25 * 25.4)) return null

  const set = XL_BALANCED_BASS_SETS[feel]
  const target = BASS_FEEL_TARGETS_LB[feel]
  const fitsBand = set.gaugesBassToTreble.every((gauge, index) => {
    const item = XL_BASS_STRINGS.find(candidate => candidate.gaugeInches === gauge)
    const frequency = pitchFrequency(pitches[index])
    if (!item || !frequency) return false
    const percent = stringTensionLb(item.unitWeightLbPerInch, scalesMm[index], frequency) / target * 100
    return Math.abs(percent - 100) <= FEEL_TOLERANCE_PERCENT
  })
  return fitsBand ? set : null
}
