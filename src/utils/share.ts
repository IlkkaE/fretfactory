import type { AppState } from '../types'
import { sanitizeStatePatch } from './stateValidation'

const MAX_HASH_LENGTH = 12_000
const SHAREABLE_KEYS = new Set([
  'mode', 'units', 'strings', 'removeStrings', 'frets',
  'scaleTreble', 'scaleBass', 'anchorFret', 'curvedExponent',
  'stringSpanNut', 'stringSpanBridge', 'overhang',
  'markerFrets', 'markerSize', 'radiusNut', 'radiusBridge',
  'showNutCompensation', 'nutCompensationOffsets',
  'nutCompensationProfile',
  'stringPitches', 'stringFeel', 'preferWoundG3',
])

// Keys kept small if we ever switch to query params; for now JSON in hash
export type ShareState = Partial<Pick<AppState,
  | 'mode' | 'units' | 'strings' | 'removeStrings' | 'frets'
  | 'scaleTreble' | 'scaleBass' | 'anchorFret' | 'curvedExponent'
  | 'stringSpanNut' | 'stringSpanBridge' | 'overhang'
  | 'markerFrets' | 'markerSize' | 'radiusNut' | 'radiusBridge'
  | 'showNutCompensation' | 'nutCompensationOffsets'
  | 'nutCompensationProfile'
  | 'stringPitches' | 'stringFeel' | 'preferWoundG3'
>>

export function pickShareableState(s: AppState): ShareState {
  return {
  // Force curved mode in shared state to avoid re-enabling equal via URL
  mode: 'curved',
    units: s.units,
    strings: s.strings,
    removeStrings: s.removeStrings,
    frets: s.frets,
    scaleTreble: s.scaleTreble,
    scaleBass: s.scaleBass,
    anchorFret: s.anchorFret,
    curvedExponent: s.curvedExponent,
    stringSpanNut: s.stringSpanNut,
    stringSpanBridge: s.stringSpanBridge,
    overhang: s.overhang,
    markerFrets: s.markerFrets,
    markerSize: s.markerSize,
    radiusNut: s.radiusNut,
    radiusBridge: s.radiusBridge,
    showNutCompensation: s.showNutCompensation,
    nutCompensationOffsets: s.nutCompensationOffsets,
    nutCompensationProfile: s.nutCompensationProfile,
    stringPitches: s.stringPitches,
    stringFeel: s.stringFeel,
    preferWoundG3: s.preferWoundG3,
  }
}

export function stateToHash(s: AppState): string {
  const payload = pickShareableState(s)
  const json = JSON.stringify(payload)
  // Use a prefix to identify our format
  return '#state=' + encodeURIComponent(json)
}

export function parseHash(hash: string): ShareState | null {
  if (!hash || hash.length > MAX_HASH_LENGTH) return null
  const idx = hash.indexOf('#state=')
  if (idx !== 0) return null
  try {
    const enc = hash.slice('#state='.length)
    const json = decodeURIComponent(enc)
    const safe = sanitizeStatePatch(JSON.parse(json))
    const shared = Object.fromEntries(
      Object.entries(safe).filter(([key]) => SHAREABLE_KEYS.has(key))
    ) as ShareState
    return Object.keys(shared).length ? shared : null
  } catch { /* ignore */ }
  return null
}
