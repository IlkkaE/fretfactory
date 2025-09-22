/**
 * SVG drawing constants and helper functions
 */

export const SVG_CONSTANTS = {
  STROKE_WIDTHS: {
    EDGE: '0.20mm',
    FRET: '0.20mm',
    STRING: '0.12mm',
    NUT: '0.35mm',
    GHOST: '0.20mm',
  },
  COLORS: {
    EDGE: '#000000',
    FRET: '#000000',
    STRING: '#666666',
    NUT: '#000000',
    GHOST: '#16a34a',
    MARKER: '#9ca3af',
  },
}

export const VECTOR_EFFECT =
  'vector-effect="non-scaling-stroke" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="2"'

/** Create an SVG line element with standard attributes */
export function createSVGLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  strokeWidth: string,
): string {
  return `<line ${VECTOR_EFFECT} x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${strokeWidth}"/>`
}

/** Create an SVG path element with standard attributes */
export function createSVGPath(d: string, color: string, strokeWidth: string): string {
  return `<path ${VECTOR_EFFECT} d="${d}" stroke="${color}" stroke-width="${strokeWidth}" fill="none"/>`
}
