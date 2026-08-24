import { create } from 'zustand'
import { SPEC } from './spec'
import { PRESETS } from './presets/instruments'
import type { AppState } from './types'
import { toMillimeters } from './utils/units'
import { sanitizeStatePatch } from './utils/stateValidation'

export const useAppState = create<AppState>()((set, get) => ({
  // perus
  mode: 'curved',
  units: 'mm',
  strings: 6,
  removeStrings: false,
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

  showNutCompensation: false,
  nutCompensationOffsets: [0, 0, 0, 0, 0, 0],
  nutCompensationProfile: 'custom',

  // ── merkit (uudet) ────────────────────────────────────────────
  markerFrets: SPEC.marker.defaultFrets.slice(),
  markerSize: SPEC.marker.defaultSizeMm,            // mm
  showGhostHelpers: false,

  // 12th-fret doubles removed

  // 3D compound radius (millimeters, 12" and 16")
  radiusNut: 12 * 25.4,
  radiusBridge: 16 * 25.4,

  // Red guide line position (percentage across width)
  guidePosPct: 50,

  selectedPresetId: undefined,

  set: (patch) => set(sanitizeStatePatch(patch, get())),

  // Only the presentation unit changes. Internal millimeter values remain
  // untouched, which prevents cumulative conversion and rounding drift.
  setUnits: (units) => set(sanitizeStatePatch({ units }, get())),

  // Presettien sovitus (yksinkertaistettu baseline)
  applyPreset: (id: string) => {
    const p = PRESETS.find(pp => pp.id === id)
    if (!p) return
    const toMm = (v?: number) => v == null ? undefined : toMillimeters(v, p.units)

    // Base numeric params (always mm)
    const strings = p.strings
    const frets = p.frets
    const stringSpanNut = toMm(p.stringSpanNut)
    const stringSpanBridge = toMm(p.stringSpanBridge)
    const overhang = toMm(p.overhang)

    // Scales → curved-only
    let scaleTreble = toMm(p.scaleTreble)
    let scaleBass = toMm(p.scaleBass)
    if (scaleTreble == null || scaleBass == null) {
      // Fallback for equal-mode presets: use one scale for both sides
      const sc = toMm(p.scale)
      scaleTreble = sc
      scaleBass = sc
    }
    const anchorFret = p.anchorFret ?? SPEC.curved.defaultAnchorFret
    const curvedExponent = p.curvedExponent ?? SPEC.curved.defaultExponent

    set(sanitizeStatePatch({
      selectedPresetId: id,
      mode: 'curved',
      strings, frets,
      stringSpanNut, stringSpanBridge, overhang,
      scaleTreble, scaleBass, anchorFret, curvedExponent,
      nutCompensationOffsets: Array.from({ length: strings }, (_, i) => get().nutCompensationOffsets?.[i] ?? 0),
      nutCompensationProfile: 'custom',
    }, get()))
  },
}))
