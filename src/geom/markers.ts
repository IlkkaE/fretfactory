// src/geom/markers.ts
import type { BuildResult, DrawEl } from './build'
import { STROKES, COLORS } from './build'
import type { AppState } from '../types'
import pchipToBezierPath from './pchip'

// Vihreä apuviiva – ei exporttiin (käytä build.COLORS.ghost)

/**
 * Build markers where the red guide line intersects the ghost curves (midlines) between frets.
 * For each selected gap f in s.markerFrets, we compute the ghost polyline between rows[f] and rows[f+1]
 * and intersect it against the guide line (nut→bridge) at s.guidePosPct.
 */
export function buildMarkers(s: AppState, built: BuildResult): DrawEl[] {
  const out: DrawEl[] = []
  const helpers = built.helpers.curved
  if (!helpers) return out

  const { nb } = helpers
  const t = Math.max(0, Math.min(1, (s.guidePosPct ?? 50) / 100))
  const lerp = (a:number,b:number,u:number)=> a + (b-a)*u
  const nutBass = { x: nb.L.edgeNut[0], y: nb.nut.pts[0].y }
  const nutTreb = { x: nb.L.edgeNut[1], y: nb.nut.pts[nb.nut.pts.length-1].y }
  const brBass  = { x: nb.L.edgeBridge[0], y: nb.bridge.pts[0].y }
  const brTreb  = { x: nb.L.edgeBridge[1], y: nb.bridge.pts[nb.bridge.pts.length-1].y }
  const P0 = { x: lerp(nutBass.x, nutTreb.x, t), y: lerp(nutBass.y, nutTreb.y, t) }
  const P1 = { x: lerp(brBass.x,  brTreb.x,  t), y: lerp(brBass.y,  brTreb.y,  t) }

  // Segment intersection helper
  const segInt = (a:{x:number;y:number}, b:{x:number;y:number}, c:{x:number;y:number}, d:{x:number;y:number}) => {
    const r = { x: b.x - a.x, y: b.y - a.y }
    const sV = { x: d.x - c.x, y: d.y - c.y }
    const denom = r.x * sV.y - r.y * sV.x
    if (Math.abs(denom) < 1e-9) return null
    const u = ((c.x - a.x) * r.y - (c.y - a.y) * r.x) / denom
    const t = ((c.x - a.x) * sV.y - (c.y - a.y) * sV.x) / denom
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return { x: a.x + t * r.x, y: a.y + t * r.y, t, u }
    }
    return null
  }

  const rows = helpers.rows
  const marks = (s.markerFrets && s.markerFrets.length ? s.markerFrets : [])
  const size = Math.max(1, Math.min(30, s.markerSize ?? 6))
  const r = size / 2

  const mid = (a:number,b:number)=> (a+b)/2
  for (const f of marks) {
    if (f < 0 || f >= s.frets) continue
    // Correct mapping: f=0 -> (nut, fret1), otherwise (fret f, fret f+1) in 1-based terms
    let ghost: {x:number;y:number}[] = []
    if (f === 0) {
      const aNut = nb.nut.pts
      const bF1  = rows[0]?.pts
      if (!bF1) continue
      ghost = aNut.map((p, i) => ({ x: mid(p.x, bF1[i].x), y: mid(p.y, bF1[i].y) }))
    } else {
      const a = rows[f - 1]
      const b = rows[f]
      if (!a || !b) continue
      ghost = a.pts.map((p, i) => ({ x: mid(p.x, b.pts[i].x), y: mid(p.y, b.pts[i].y) }))
    }

    // Optionally render the ghost curve (preview only; color ignored in Preview renderer)
    if (s.showGhostHelpers) {
      out.push({ kind:'path', d: pchipToBezierPath(ghost), color: COLORS.ghost, w: STROKES.FRET })
    }

    // Find intersection with guide line segment
    let hit: { x:number;y:number } | null = null
    for (let i = 0; i + 1 < ghost.length; i++) {
      const h = segInt(P0, P1, ghost[i], ghost[i+1])
      if (h) { hit = { x: h.x, y: h.y }; break }
    }
    if (!hit) continue

    // Draw a cross centered at the intersection
    out.push({ kind:'line', x1: hit.x - r, y1: hit.y, x2: hit.x + r, y2: hit.y, color: COLORS.marker, w: STROKES.FRET })
    out.push({ kind:'line', x1: hit.x, y1: hit.y - r, x2: hit.x, y2: hit.y + r, color: COLORS.marker, w: STROKES.FRET })
  }

  return out
}

/** Optional: derive approximate marker centers from cross pairs in buildMarkers output. */
export function extractMarkerCenters(markers: DrawEl[]): { x: number; y: number; r: number }[] {
  const out: { x: number; y: number; r: number }[] = []
  for (let i = 0; i + 1 < markers.length; i += 2) {
    const a = markers[i]
    const b = markers[i + 1]
    if (a.kind === 'line' && b.kind === 'line') {
      const ax = 0.5 * (a.x1 + a.x2)
      const ay = 0.5 * (a.y1 + a.y2)
      const bx = 0.5 * (b.x1 + b.x2)
      const by = 0.5 * (b.y1 + b.y2)
      const cx = 0.5 * (ax + bx)
      const cy = 0.5 * (ay + by)
      const rx = 0.5 * Math.hypot(a.x2 - a.x1, a.y2 - a.y1) * 0.3
      // heuristic radius fraction
      out.push({ x: cx, y: cy, r: rx })
    }
  }
  return out
}
