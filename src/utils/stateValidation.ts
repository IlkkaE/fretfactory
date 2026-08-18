import type { AppState } from '../types'

export const STATE_LIMITS = {
  strings: { min: 1, max: 12 },
  frets: { min: 1, max: 36 },
  scaleTreble: { min: 100, max: 1000 },
  scaleBass: { min: 100, max: 1200 },
  anchorFret: { min: 0, max: 36 },
  curvedExponent: { min: 0.01, max: 10 },
  stringSpanNut: { min: 10, max: 100 },
  stringSpanBridge: { min: 10, max: 120 },
  overhang: { min: 0, max: 20 },
  markerSize: { min: 1, max: 30 },
  radiusNut: { min: 25.4, max: 2540 },
  radiusBridge: { min: 25.4, max: 2540 },
  guidePosPct: { min: 0, max: 100 },
} as const

type StatePatch = Partial<AppState>
type NumericStateKey = keyof typeof STATE_LIMITS

const hasOwn = (value: object, key: PropertyKey) =>
  Object.prototype.hasOwnProperty.call(value, key)

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const INTEGER_KEYS = new Set<NumericStateKey>(['strings', 'frets', 'anchorFret', 'guidePosPct'])

/**
 * Accept only known data fields and normalize every value before it reaches
 * geometry code. Action functions and unknown URL fields are never copied.
 */
export function sanitizeStatePatch(
  input: unknown,
  current?: Pick<AppState, 'frets' | 'anchorFret' | 'markerFrets'>,
): StatePatch {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {}
  const source = input as Record<string, unknown>
  const safe: StatePatch = {}

  if (hasOwn(source, 'mode')) safe.mode = 'curved'
  if (source.units === 'mm' || source.units === 'inch') safe.units = source.units
  if (typeof source.removeStrings === 'boolean') safe.removeStrings = source.removeStrings

  for (const key of Object.keys(STATE_LIMITS) as NumericStateKey[]) {
    const value = source[key]
    if (typeof value !== 'number' || !Number.isFinite(value)) continue
    const limits = STATE_LIMITS[key]
    const normalized = INTEGER_KEYS.has(key) ? Math.round(value) : value
    ;(safe as Record<string, unknown>)[key] = clamp(normalized, limits.min, limits.max)
  }

  const effectiveFrets = typeof safe.frets === 'number'
    ? safe.frets
    : current?.frets ?? STATE_LIMITS.frets.max

  if (typeof safe.anchorFret === 'number') {
    safe.anchorFret = Math.min(safe.anchorFret, effectiveFrets)
  } else if (typeof safe.frets === 'number' && typeof current?.anchorFret === 'number') {
    safe.anchorFret = Math.min(current.anchorFret, effectiveFrets)
  }

  if (Array.isArray(source.markerFrets)) {
    safe.markerFrets = Array.from(new Set(
      source.markerFrets
        .slice(0, STATE_LIMITS.frets.max)
        .filter((value): value is number => Number.isInteger(value))
        .filter(value => value >= 0 && value < effectiveFrets)
    )).sort((a, b) => a - b)
  } else if (typeof safe.frets === 'number' && current?.markerFrets) {
    safe.markerFrets = current.markerFrets.filter(value => value >= 0 && value < effectiveFrets)
  }

  if (typeof source.showGhostHelpers === 'boolean') safe.showGhostHelpers = source.showGhostHelpers

  if (typeof source.selectedPresetId === 'string' && source.selectedPresetId.length <= 100) {
    safe.selectedPresetId = source.selectedPresetId
  } else if (hasOwn(source, 'selectedPresetId') && source.selectedPresetId == null) {
    safe.selectedPresetId = undefined
  }

  if (typeof source.presetKey === 'string' && source.presetKey.length <= 100) {
    safe.presetKey = source.presetKey
  } else if (hasOwn(source, 'presetKey') && source.presetKey == null) {
    safe.presetKey = undefined
  }

  return safe
}
