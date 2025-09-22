import type { AppState } from '../types'
import { computeStringLayout } from './core'
import { computeCurvedFretsRaw, computeCurvedNutBridge } from './curved'
import pchipToBezierPath from './pchip'

/** Piirtoalkiot — yhteinen formaatti (preview, export, testit) */
export type DrawEl =
  | { kind:'line'; x1:number;y1:number;x2:number;y2:number; color:string; w:number }
  | { kind:'path'; d:string; color:string; w:number }
  | { kind:'poly'; pts:{x:number;y:number}[]; fill:string; stroke?:string; w?:number; fillOpacity?:number }

export type BuildResult = {
  els: DrawEl[]
  viewW: number
  viewH: number
  sx: number
  sy: number
  helpers: {
    curved?: {
      rows: { n:number; pts:{x:number;y:number}[]; x_left:number; x_right:number }[]
      nb: ReturnType<typeof computeCurvedNutBridge>
      yAtX: (pts:{x:number;y:number}[], x:number)=>number
    }
  }
}

/** Viivapaksuudet px */
export const STROKES = {
  EDGE:   1.0,
  FRET:   0.6,
  STRING: 0.8,
  NUT:    1.2,
}

/** Värit */
export const COLORS = {
  edge:   '#000000',
  fret:   '#000000',
  string: '#000000',
  // Use a dark nut/saddle color so they are clearly visible on the light preview background
  nut:    '#000000',
  // preview-only helpers
  marker: '#000000',   // ristit (keskimerkit)
  ghost:  '#16a34a',   // apuviiva keskellä väliä (ei exporttiin)
}

/** Rakenna otelauta annetusta app-tilasta. */
export function buildBoard(s: AppState): BuildResult {
  const els: DrawEl[] = []
  const MARGIN = 5
  let viewW = 100, viewH = 100, sx = 0, sy = 0

  // ---- curved only ----
  const ok = !!s.scaleTreble && !!s.scaleBass && s.stringSpanNut != null && s.stringSpanBridge != null && s.overhang != null
  if (!ok) return { els, viewW, viewH, sx, sy, helpers:{} }

  const rows = computeCurvedFretsRaw(
    s.strings, s.frets, s.scaleTreble!, s.scaleBass!, s.anchorFret ?? 12,
    s.stringSpanNut!, s.stringSpanBridge!, s.overhang!, s.curvedExponent ?? 1
  )
  const nb = computeCurvedNutBridge(
    s.strings, s.scaleTreble!, s.scaleBass!, s.anchorFret ?? 12,
    s.stringSpanNut!, s.stringSpanBridge!, s.overhang!, s.curvedExponent ?? 1
  )

  // viewBox-rajat
  let minX = +Infinity, maxX = -Infinity, minY = +Infinity, maxY = -Infinity
  const eat = (p:{x:number;y:number}) => { if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x; if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y }
  rows.forEach(r => r.pts.forEach(eat)); nb.nut.pts.forEach(eat); nb.bridge.pts.forEach(eat)

  viewW = (maxX - minX) + 2*MARGIN
  viewH = (maxY - minY) + 2*MARGIN
  sx = -minX + MARGIN
  sy = -minY + MARGIN

  // Layered ordering: strings (background) -> edges -> frets -> nut & bridge (top)
  const stringsEls: DrawEl[] = []
  const edgeEls: DrawEl[] = []
  const fretEls: DrawEl[] = []
  const nutBridgeEls: DrawEl[] = []

  // Strings in background
  for (let i = 0; i < s.strings; i++) {
  // nb.nut.pts / nb.bridge.pts include edges at indices 0 and length-1.
  // Actual string lines are at indices 1..strings, so offset by +1 here.
  const a = nb.nut.pts[i + 1]
  const b = nb.bridge.pts[i + 1]
    stringsEls.push({ kind:'line', x1:a.x, y1:a.y, x2:b.x, y2:b.y, color:COLORS.string, w:STROKES.STRING })
  }

  // Edges
  edgeEls.push({ kind:'line', x1:nb.L.edgeNut[0], y1:nb.nut.pts[0].y, x2:nb.L.edgeBridge[0], y2:nb.bridge.pts[0].y, color:COLORS.edge, w:STROKES.EDGE })
  edgeEls.push({ kind:'line', x1:nb.L.edgeNut[1], y1:nb.nut.pts[nb.nut.pts.length-1].y, x2:nb.L.edgeBridge[1], y2:nb.bridge.pts[nb.bridge.pts.length-1].y, color:COLORS.edge, w:STROKES.EDGE })

  // Curved frets
  for (const r of rows) fretEls.push({ kind:'path', d:pchipToBezierPath(r.pts), color:COLORS.fret, w:STROKES.FRET })

  // Nut & bridge topmost
  nutBridgeEls.push({ kind:'path', d:pchipToBezierPath(nb.nut.pts), color:COLORS.nut, w:STROKES.NUT })
  nutBridgeEls.push({ kind:'path', d:pchipToBezierPath(nb.bridge.pts), color:COLORS.nut, w:STROKES.NUT })

  els.push(...stringsEls, ...edgeEls, ...fretEls, ...nutBridgeEls)

  // y(x) apuri polylinelle
  const yAtX = (pts: {x:number;y:number}[], x: number): number => {
    if (!pts.length) return 0
    if (x <= pts[0].x) return pts[0].y
    if (x >= pts[pts.length-1].x) return pts[pts.length-1].y
    let lo = 0, hi = pts.length - 1
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1
      if (pts[mid].x <= x) lo = mid; else hi = mid
    }
    const p0 = pts[lo], p1 = pts[hi]
    const t = (x - p0.x) / (p1.x - p0.x)
    return p0.y + t * (p1.y - p0.y)
  }

  return { els, viewW, viewH, sx, sy, helpers: { curved: { rows, nb, yAtX } } }
}
