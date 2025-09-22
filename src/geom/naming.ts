/**
 * Internal fretboard naming conventions and invariants (2D/3D-ready).
 *
 * Canonical semantics (stable across handedness and camera):
 * - Sides: TrebleSide (high pitch, thinner strings), BassSide (low pitch, thicker strings)
 * - Edges: NutEdge (zero fret side), BridgeEdge (edge after last fret)
 * - String indices: BassStringIndex = 0 (left); TrebleStringIndex = strings - 1 (right)
 * - Coordinates: +X TrebleSide → BassSide, +Y NutEdge → BridgeEdge, +Z out of board plane
 * - Handedness: affects rendering transforms only; names and contracts DO NOT change
 * - Params: scaleTreble applies to TrebleSide; scaleBass applies to BassSide
 *
 * Testable invariants:
 * - Fret(anchorFret) is straight/aligned across strings
 * - curvedExponent > 1 increases spread compared to linear
 * - Lefty/righty flips must not change which side is Treble/Bass semantically
 */

export type Side = 'TrebleSide' | 'BassSide'
export type Edge = 'NutEdge' | 'BridgeEdge'

// Canonical indices: 0 = Bass (left), strings-1 = Treble (right)
export const BASS_STRING_INDEX = (_strings: number) => 0
export const TREBLE_STRING_INDEX = (strings: number) => Math.max(0, strings - 1)

export const TrebleSide: Side = 'TrebleSide'
export const BassSide: Side = 'BassSide'
export const NutEdge: Edge = 'NutEdge'
export const BridgeEdge: Edge = 'BridgeEdge'

/** Get the canonical side for a string index (0-based). */
export function sideOfString(index: number, totalStrings: number): Side {
  if (index === BASS_STRING_INDEX(totalStrings)) return BassSide
  if (index === TREBLE_STRING_INDEX(totalStrings)) return TrebleSide
  return index < totalStrings / 2 ? TrebleSide : BassSide
}
