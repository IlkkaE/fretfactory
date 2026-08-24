export type Point = { x: number; y: number }

export type NutCompensationLine = {
  stringIndex: number
  nominal: Point
  compensated: Point
  offsetMm: number
}

type NutBridgeGeometry = {
  nut: { pts: Point[] }
  bridge: { pts: Point[] }
}

/**
 * Creates one offset indicator per string. Positive offsets travel from the
 * nominal nut contact point toward that string's bridge point, so the same
 * values work for straight-scale and fan-fret boards.
 */
export function computeNutCompensationLines(
  geometry: NutBridgeGeometry,
  strings: number,
  offsets: number[] | undefined,
): NutCompensationLine[] {
  return Array.from({ length: strings }, (_, stringIndex) => {
    const nominal = geometry.nut.pts[stringIndex + 1]
    const bridge = geometry.bridge.pts[stringIndex + 1]
    const offsetMm = offsets?.[stringIndex] ?? 0
    const dx = bridge.x - nominal.x
    const dy = bridge.y - nominal.y
    const length = Math.hypot(dx, dy)
    const ratio = length > 0 ? offsetMm / length : 0
    return {
      stringIndex,
      nominal,
      compensated: { x: nominal.x + dx * ratio, y: nominal.y + dy * ratio },
      offsetMm,
    }
  })
}
