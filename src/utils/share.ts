import type { AppState } from '../types'

// Keys kept small if we ever switch to query params; for now JSON in hash
export type ShareState = Partial<Pick<AppState,
  | 'mode' | 'units' | 'strings' | 'frets'
  | 'scaleTreble' | 'scaleBass' | 'anchorFret' | 'curvedExponent'
  | 'stringSpanNut' | 'stringSpanBridge' | 'overhang'
  | 'markerOffset' | 'markerFrets'
>>

export function pickShareableState(s: AppState): ShareState {
  return {
  // Force curved mode in shared state to avoid re-enabling equal via URL
  mode: 'curved',
    units: s.units,
    strings: s.strings,
    frets: s.frets,
    scaleTreble: s.scaleTreble,
    scaleBass: s.scaleBass,
    anchorFret: s.anchorFret,
    curvedExponent: s.curvedExponent,
    stringSpanNut: s.stringSpanNut,
    stringSpanBridge: s.stringSpanBridge,
    overhang: s.overhang,
    markerOffset: s.markerOffset,
  markerFrets: s.markerFrets,
  }
}

export function stateToHash(s: AppState): string {
  const payload = pickShareableState(s)
  const json = JSON.stringify(payload)
  // Use a prefix to identify our format
  return '#state=' + encodeURIComponent(json)
}

export function parseHash(hash: string): ShareState | null {
  if (!hash) return null
  const idx = hash.indexOf('#state=')
  if (idx !== 0) return null
  try {
    const enc = hash.slice('#state='.length)
    const json = decodeURIComponent(enc)
    const obj = JSON.parse(json)
    if (obj && typeof obj === 'object') {
      // Sanitize mode: only curved is supported
      if (obj.mode !== 'curved') obj.mode = 'curved'
      return obj as ShareState
    }
  } catch { /* ignore */ }
  return null
}
