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
  markerOffsetMode?: 'mm' | 'percent' // mm (absolute) or percent of gap-curve length
  markerSize?: number       // ristin halkaisija mm
  showGhostHelpers?: boolean // esikatsele apuviiva välin keskellä

  // 12th-fret doubles option
  doubleAt12?: boolean       // draw two centered markers at the 12th position; unaffected by markerOffset
  double12Offset?: number    // half-separation from center for the 12th pair, in current UI units

  // 3D: compound radius in inches (nut and bridge), independent of UI units
  radiusNutIn?: number
  radiusBridgeIn?: number

  // presetit
  selectedPresetId?: string
  presetKey?: string

  // toiminnot
  set: (patch: Partial<AppState>) => void
  applyPreset: (id: string) => void
}
