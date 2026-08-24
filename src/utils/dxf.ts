import { computeCurvedFretsRaw, computeCurvedNutBridge } from '../geom/curved'
import { pchipToBezierSegments } from '../geom/pchip'
import { computeNutCompensationLines } from '../geom/nutCompensation'
import { PRESETS } from '../presets/instruments'
import type { AppState } from '../types'
import { fromMillimeters } from './units'

type Point = { x: number; y: number }
type Line = { layer: string; a: Point; b: Point }
type Polyline = { layer: string; points: Point[] }

const MARK_FRETS = [2, 4, 6, 8, 11, 14, 16, 18, 20]
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

function flattenBezier(points: Point[], steps = 12): Point[] {
  const curves = pchipToBezierSegments(points)
  if (!curves.length) return points

  const flattened: Point[] = [{ ...curves[0].p0 }]
  for (const curve of curves) {
    for (let i = 1; i <= steps; i++) {
      const t = i / steps
      const mt = 1 - t
      flattened.push({
        x: (mt ** 3) * curve.p0.x + 3 * (mt ** 2) * t * curve.c1.x + 3 * mt * (t ** 2) * curve.c2.x + (t ** 3) * curve.p1.x,
        y: (mt ** 3) * curve.p0.y + 3 * (mt ** 2) * t * curve.c1.y + 3 * mt * (t ** 2) * curve.c2.y + (t ** 3) * curve.p1.y,
      })
    }
  }
  return flattened
}

function lineEntity(line: Line, convert: (value: number) => number): string[] {
  return [
    '0', 'LINE', '8', line.layer,
    '10', String(convert(line.a.x)), '20', String(convert(line.a.y)), '30', '0',
    '11', String(convert(line.b.x)), '21', String(convert(line.b.y)), '31', '0',
  ]
}

function polylineEntity(polyline: Polyline, convert: (value: number) => number): string[] {
  const entity = ['0', 'LWPOLYLINE', '8', polyline.layer, '90', String(polyline.points.length), '70', '0']
  for (const point of polyline.points) {
    entity.push('10', String(convert(point.x)), '20', String(convert(point.y)))
  }
  return entity
}

export function createDXF(s: AppState): { filename: string; content: string } | null {
  const canCurved = s.mode === 'curved' && !!(s.scaleTreble && s.scaleBass) && !!(s.stringSpanNut && s.stringSpanBridge && s.overhang != null)
  if (!canCurved) return null

  const rows = computeCurvedFretsRaw(
    s.strings, s.frets, s.scaleTreble!, s.scaleBass!, s.anchorFret ?? 12,
    s.stringSpanNut!, s.stringSpanBridge!, s.overhang!, s.curvedExponent ?? 1,
  )
  const nb = computeCurvedNutBridge(
    s.strings, s.scaleTreble!, s.scaleBass!, s.anchorFret ?? 12,
    s.stringSpanNut!, s.stringSpanBridge!, s.overhang!, s.curvedExponent ?? 1,
  )
  const compensation = s.showNutCompensation
    ? computeNutCompensationLines(nb, s.strings, s.nutCompensationOffsets).filter(line => Math.abs(line.offsetMm) >= 1e-6)
    : []

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  const include = (point: Point) => {
    minX = Math.min(minX, point.x)
    maxX = Math.max(maxX, point.x)
    minY = Math.min(minY, point.y)
    maxY = Math.max(maxY, point.y)
  }
  rows.forEach(row => row.pts.forEach(include))
  nb.nut.pts.forEach(include)
  nb.bridge.pts.forEach(include)
  compensation.forEach(line => include(line.compensated))

  const shift = (point: Point): Point => ({ x: point.x - minX, y: point.y - minY })
  const lines: Line[] = [
    { layer: 'EDGES', a: shift({ x: nb.nut.x_left, y: nb.nut.y_left }), b: shift({ x: nb.bridge.x_left, y: nb.bridge.y_left }) },
    { layer: 'EDGES', a: shift({ x: nb.nut.x_right, y: nb.nut.y_right }), b: shift({ x: nb.bridge.x_right, y: nb.bridge.y_right }) },
  ]
  const polylines: Polyline[] = []

  if (!s.removeStrings) {
    for (let i = 0; i < s.strings; i++) {
      lines.push({ layer: 'STRINGS', a: shift(nb.nut.pts[i + 1]), b: shift(nb.bridge.pts[i + 1]) })
    }
  }
  compensation.forEach(line => lines.push({
    layer: 'NUT_COMPENSATION', a: shift(line.nominal), b: shift(line.compensated),
  }))

  for (const row of rows) {
    if (row.straight) {
      lines.push({ layer: 'FRETS', a: shift({ x: row.x_left, y: row.y_left }), b: shift({ x: row.x_right, y: row.y_right }) })
    } else {
      polylines.push({ layer: 'FRETS', points: flattenBezier(row.pts).map(shift) })
    }
  }
  polylines.push({ layer: 'NUT_BRIDGE', points: flattenBezier(nb.nut.pts).map(shift) })
  polylines.push({ layer: 'NUT_BRIDGE', points: flattenBezier(nb.bridge.pts).map(shift) })

  const clamp01 = (value: number) => Math.max(0, Math.min(1, value))
  const guide = clamp01((s.guidePosPct ?? 50) / 100)
  const lerp = (a: number, b: number, t: number) => a + ((b - a) * t)
  const p0 = {
    x: lerp(nb.L.edgeNut[0], nb.L.edgeNut[1], guide),
    y: lerp(nb.nut.pts[0].y, nb.nut.pts[nb.nut.pts.length - 1].y, guide),
  }
  const p1 = {
    x: lerp(nb.L.edgeBridge[0], nb.L.edgeBridge[1], guide),
    y: lerp(nb.bridge.pts[0].y, nb.bridge.pts[nb.bridge.pts.length - 1].y, guide),
  }
  const intersection = (a: Point, b: Point, c: Point, d: Point): Point | null => {
    const r = { x: b.x - a.x, y: b.y - a.y }
    const q = { x: d.x - c.x, y: d.y - c.y }
    const denominator = (r.x * q.y) - (r.y * q.x)
    if (Math.abs(denominator) < 1e-9) return null
    const u = (((c.x - a.x) * r.y) - ((c.y - a.y) * r.x)) / denominator
    const t = (((c.x - a.x) * q.y) - ((c.y - a.y) * q.x)) / denominator
    return t >= 0 && t <= 1 && u >= 0 && u <= 1
      ? { x: a.x + (t * r.x), y: a.y + (t * r.y) }
      : null
  }
  const markerSize = Math.max(1, Math.min(30, s.markerSize ?? 6))
  const markerRadius = markerSize / 2
  const markerFrets = s.markerFrets?.length ? s.markerFrets : MARK_FRETS
  for (const fret of markerFrets) {
    if (fret < 0 || fret >= s.frets) continue
    const before = fret === 0 ? nb.nut.pts : rows[fret - 1]?.pts
    const after = rows[fret]?.pts
    if (!before || !after) continue
    const ghost = before.map((point, index) => ({
      x: (point.x + after[index].x) / 2,
      y: (point.y + after[index].y) / 2,
    }))
    let hit: Point | null = null
    for (let i = 0; i + 1 < ghost.length; i++) {
      hit = intersection(p0, p1, ghost[i], ghost[i + 1])
      if (hit) break
    }
    if (!hit) continue
    lines.push({ layer: 'MARKERS', a: shift({ x: hit.x - markerRadius, y: hit.y }), b: shift({ x: hit.x + markerRadius, y: hit.y }) })
    lines.push({ layer: 'MARKERS', a: shift({ x: hit.x, y: hit.y - markerRadius }), b: shift({ x: hit.x, y: hit.y + markerRadius }) })
  }

  const convert = (value: number) => Number(fromMillimeters(value, s.units).toFixed(s.units === 'inch' ? 6 : 4))
  const unitsCode = s.units === 'inch' ? '1' : '4'
  const measurement = s.units === 'inch' ? '0' : '1'
  const layers: Array<[string, string, string?]> = [
    ['EDGES', '7'], ['STRINGS', '8'], ['FRETS', '1'], ['NUT_BRIDGE', '3'], ['MARKERS', '5'], ['NUT_COMPENSATION', '1', '100'],
  ]
  const dxf: string[] = [
    '0', 'SECTION', '2', 'HEADER',
    '9', '$ACADVER', '1', 'AC1015',
    '9', '$INSUNITS', '70', unitsCode,
    '9', '$MEASUREMENT', '70', measurement,
    '9', '$EXTMIN', '10', '0', '20', '0', '30', '0',
    '9', '$EXTMAX', '10', String(convert(maxX - minX)), '20', String(convert(maxY - minY)), '30', '0',
    '0', 'ENDSEC',
    '0', 'SECTION', '2', 'TABLES',
    '0', 'TABLE', '2', 'LAYER', '70', String(layers.length),
  ]
  for (const [name, color, lineweight] of layers) {
    dxf.push('0', 'LAYER', '2', name, '70', '0', '62', color, '6', 'CONTINUOUS')
    if (lineweight) dxf.push('370', lineweight)
  }
  dxf.push('0', 'ENDTAB', '0', 'ENDSEC', '0', 'SECTION', '2', 'ENTITIES')
  lines.forEach(line => dxf.push(...lineEntity(line, convert)))
  polylines.forEach(polyline => dxf.push(...polylineEntity(polyline, convert)))
  dxf.push('0', 'ENDSEC', '0', 'EOF', '')

  const preset = PRESETS.find(item => item.id === s.selectedPresetId)
  const presetSlug = preset ? slug(`${preset.manufacturer}-${preset.model}`) : 'custom'
  return {
    filename: `fretfactory_${presetSlug}_curved_${s.units}.dxf`,
    content: dxf.join('\r\n'),
  }
}
