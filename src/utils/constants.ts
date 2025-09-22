import { type AppState } from '../types'

/**
 * Common constants for drawing
 */
export const DRAW_CONSTANTS = {
  STROKES: {
    EDGE: 1.0,
    FRET: 0.6,
    STRING: 0.8,
    NUT: 1.0,
  },
  COLORS: {
  edge: '#000000',
  fret: '#d9dde6',
  string: '#000000',
  nut: '#e5e7eb',
  }
} as const

// Color shared by the animated background strings and preview borders
export const BG_STRING_COLOR = '#5a6b60'

/**
 * Common validation functions for AppState
 */

/**
 * Check if scale length is valid
 */
export function isScaleValid(state: AppState, _requireCurved = false): boolean {
  // App uses curved mode only; require treble and bass scales
  return !!state.scaleTreble && !!state.scaleBass
}

/**
 * Check if neck dimensions are valid
 */
export function isNeckDimensionsValid(state: AppState): boolean {
  return !!(state.stringSpanNut && state.stringSpanBridge && state.overhang != null)
}

/**
 * Check if base parameters are valid
 */
export function isBaseParamsValid(state: AppState): boolean {
  return !!(state.strings > 0 && state.frets > 0)
}

/**
 * Check if marker positions are valid
 */
export function areMarkersValid(state: AppState): boolean {
  // Markers computed between frets n and n+1, allow 0 = nut–1 gap; require 0 <= n < frets
  return state.markerFrets.every(fret => fret >= 0 && fret < state.frets)
}
