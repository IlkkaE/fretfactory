// Perustyypit
export type Units = 'mm'
export type Mode = 'curved'

// App-tila
export type AppState = {
  // yleiset
  mode: Mode
  units: Units
  strings: number
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

  // ── uutta: otelautamerkkien tila ──────────────────────────────
  markerFrets: number[]     // missä väleissä merkit
  markerOffset: number      // sivuttaissiirto (+ treble, − bass)
  markerSize?: number       // ristin halkaisija mm
  showGhostHelpers?: boolean // esikatsele apuviiva välin keskellä

  // 12th-fret doubles removed

  // 3D: compound radius in inches (nut and bridge), independent of UI units
  radiusNutIn?: number
  radiusBridgeIn?: number

  // Preview guide line position (0 = bass edge, 100 = treble edge)
  guidePosPct?: number

  // presetit
  selectedPresetId?: string
  presetKey?: string

  // toiminnot
  set: (patch: Partial<AppState>) => void
  applyPreset: (id: string) => void
}
