import { create } from 'zustand'
import { SPEC } from './spec'
import { PRESETS } from './presets/instruments'
import type { AppState } from './types'

export const useAppState = create<AppState>()((set, get) => ({
  // perus
  mode: 'curved',
  units: 'mm',
  strings: 6,
  frets: 22,
  
  // curved oletukset
  scaleTreble: 647.7, // mm
  scaleBass: 660.4,   // mm (26.0 in)
  anchorFret: SPEC.curved.defaultAnchorFret,
  curvedExponent: SPEC.curved.defaultExponent,

  // mitat
  stringSpanNut: 35.814,   // mm (1.41 in)
  stringSpanBridge: 49.784, // mm (1.96 in)
  overhang: 3.048,         // mm (0.12 in)

  // ── merkit (uudet) ────────────────────────────────────────────
  markerFrets: SPEC.marker.defaultFrets.slice(),
  markerOffset: 0,
  markerOffsetMode: 'mm',
  markerSize: SPEC.marker.defaultSizeMm,            // mm
  showGhostHelpers: false,

  // 12th-fret doubles (off by default)
  doubleAt12: false,
  double12Offset: 5.08, // mm (0.2 in)

  // 3D compound radius (inches)
  radiusNutIn: 12,
  radiusBridgeIn: 16,

  selectedPresetId: undefined,

  set: (patch) => set(patch),

  // Presettien sovitus (yksinkertaistettu baseline)
  applyPreset: (id: string) => {
    const p = PRESETS.find(pp => pp.id === id)
    if (!p) return
    // Helpers
    const inchToMm1 = (v?: number) => (v == null ? undefined : Math.round(v * 25.4 * 10) / 10)
    const mm1 = (v?: number) => (v == null ? undefined : Math.round(v * 10) / 10)
    const toMm1 = (v?: number) => (p.units === 'inch' ? inchToMm1(v) : mm1(v))

    // Base numeric params (always mm)
    const strings = p.strings
    const frets = p.frets
    const stringSpanNut = toMm1(p.stringSpanNut)
    const stringSpanBridge = toMm1(p.stringSpanBridge)
    const overhang = toMm1(p.overhang)

    // Scales → curved-only
    let scaleTreble = toMm1(p.scaleTreble)
    let scaleBass = toMm1(p.scaleBass)
    if (scaleTreble == null || scaleBass == null) {
      // Fallback for equal-mode presets: use one scale for both sides
      const sc = toMm1(p.scale)
      scaleTreble = sc
      scaleBass = sc
    }
    const anchorFret = p.anchorFret ?? SPEC.curved.defaultAnchorFret
    const curvedExponent = p.curvedExponent ?? SPEC.curved.defaultExponent

    set({
      selectedPresetId: id,
      mode: 'curved',
      units: 'mm',
      strings, frets,
      stringSpanNut, stringSpanBridge, overhang,
      scaleTreble, scaleBass, anchorFret, curvedExponent,
    })
  },
}))
