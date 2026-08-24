// Perustyypit
export type Units = 'mm' | 'inch'
export type Mode = 'curved'
export type StringFeel = 'loose' | 'regular' | 'firm'
export type StringAdvisorProfile = 'custom' | 'guitar' | 'bass'

// App-tila
export type AppState = {
  // yleiset
  mode: Mode
  units: Units
  strings: number
  removeStrings: boolean
  frets: number

  // curved
  scaleTreble?: number
  scaleBass?: number
  anchorFret?: number
  curvedExponent?: number

  // yhteiset mitat
  stringSpanNut?: number
  stringSpanBridge?: number
  overhang?: number

  // Per-string offset from the nominal nut contact point toward the bridge.
  showNutCompensation: boolean
  nutCompensationOffsets: number[]
  nutCompensationProfile: 'custom' | 'general-electric-guitar'

  // String advisor. Pitches run bass to treble; the profile is selected by a
  // preset or uses per-string family selection for custom instruments.
  stringPitches: string[]
  stringFeel: StringFeel
  stringAdvisorProfile: StringAdvisorProfile
  preferWoundG3: boolean

  // ── uutta: otelautamerkkien tila ──────────────────────────────
  markerFrets: number[]     // missä väleissä merkit
  markerSize?: number       // ristin halkaisija mm
  showGhostHelpers?: boolean // esikatsele apuviiva välin keskellä

  // 12th-fret doubles removed

  // 3D: compound radius in millimeters, like every other stored length
  radiusNut?: number
  radiusBridge?: number

  // Preview guide line position (0 = bass edge, 100 = treble edge)
  guidePosPct?: number

  // presetit
  selectedPresetId?: string
  presetKey?: string

  // toiminnot
  set: (patch: Partial<AppState>) => void
  setUnits: (units: Units) => void
  applyPreset: (id: string) => void
}
