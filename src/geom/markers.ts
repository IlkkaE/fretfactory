// src/geom/markers.ts
import type { BuildResult, DrawEl } from './build'
import { STROKES, COLORS } from './build'
import type { AppState } from '../types'

// Vihreä apuviiva – ei exporttiin (käytä build.COLORS.ghost)

/** Piirtää ristit + ghostit nauhaväliin (n-1 .. n). */
export function buildMarkers(s: AppState, built: BuildResult): DrawEl[] {
  const out: DrawEl[] = []

  // Interpret entries as gaps: n == gap between frets n and n+1. Allow 0 (nut–1 gap).
  const fretsBase = s.markerFrets?.length ? s.markerFrets : [2,4,6,8,11,14,16,18,20]
  const offset = s.markerOffset ?? 0
  const useDouble12 = Boolean(s.doubleAt12)
  const d12 = Math.max(0, s.double12Offset ?? 0)
  // If double-12 is on, avoid drawing single marker at the 12th gap (12..13)
  const frets = useDouble12 ? fretsBase.filter(n => n !== 12) : fretsBase

  // Cross diameter (mm). Default 6mm; controlled via UI.
  const dia = Math.max(1, Math.min(30, s.markerSize ?? 6))
  const r = dia / 2

  const showGhost = s.showGhostHelpers === true

  // ---------- CURVED: ghost = KÄYRÄ välin keskellä ----------
  if (s.mode === 'curved' && built.helpers.curved) {
    const { rows, nb, yAtX } = built.helpers.curved

    // reuna-funktiot x_left(y), x_right(y) (lineaarinen interp reunoilla)
    const yNutL = nb.nut.pts[0].y
    const yBridgeL = nb.bridge.pts[0].y
    const yNutR = nb.nut.pts[nb.nut.pts.length-1].y
    const yBridgeR = nb.bridge.pts[nb.bridge.pts.length-1].y

    const xLeftAtY = (y: number) => {
      const t = (y - yNutL) / (yBridgeL - yNutL)
      return nb.L.edgeNut[0] + t * (nb.L.edgeBridge[0] - nb.L.edgeNut[0])
    }
    const xRightAtY = (y: number) => {
      const t = (y - yNutR) / (yBridgeR - yNutR)
      return nb.L.edgeNut[1] + t * (nb.L.edgeBridge[1] - nb.L.edgeNut[1])
    }
    const xCenterAtY = (y: number) => 0.5 * (xLeftAtY(y) + xRightAtY(y))

    // rivinumero → rivi
    const byN = new Map<number, typeof rows[0]>()
    rows.forEach(rw => byN.set(rw.n, rw))

  for (const n of frets) {
      // gap between frets n and n+1 (allow n=0, which means nut..1)
      if (n < 0 || n >= s.frets) continue
      const rA = byN.get(n)     // fret n (nut when n=0)
      const rB = byN.get(n + 1) // fret n+1
      if (!rA || !rB) continue

      // X-alue jolla molemmille on y(x)
      const xStart = Math.max(rA.x_left,  rB.x_left)
      const xEnd   = Math.min(rA.x_right, rB.x_right)
      if (!(xEnd > xStart)) continue

      // Diskretisoidaan ghost-käyrä pisteiksi ja piirretään vihreä polylinja
      const pts: {x:number;y:number}[] = []
      const SAMPLES = 64
      for (let i = 0; i <= SAMPLES; i++) {
        const x = xStart + (xEnd - xStart) * (i / SAMPLES)
        const yG = 0.5 * (yAtX(rA.pts, x) + yAtX(rB.pts, x))
        pts.push({ x, y: yG })
      }
      if (showGhost) {
        for (let i = 1; i < pts.length; i++) {
          const p0 = pts[i-1], p1 = pts[i]
          out.push({ kind:'line', x1:p0.x, y1:p0.y, x2:p1.x, y2:p1.y, color:COLORS.ghost, w:STROKES.FRET })
        }
      }

      // Etsi ristin kohta: x*, jossa ghost x on lähimpänä leveyskeskilinjaa x_center(y_g(x))
      let best = { x: pts[0].x, y: pts[0].y, err: Math.abs(pts[0].x - xCenterAtY(pts[0].y)) }
      for (const p of pts) {
        const err = Math.abs(p.x - xCenterAtY(p.y))
        if (err < best.err) best = { x: p.x, y: p.y, err }
      }
  const xCross = best.x + offset
      const yCross = best.y

      // risti
  out.push({ kind:'line', x1:xCross - r, y1:yCross, x2:xCross + r, y2:yCross, color:COLORS.marker, w:STROKES.FRET })
  out.push({ kind:'line', x1:xCross,     y1:yCross - r, x2:xCross,     y2:yCross + r, color:COLORS.marker, w:STROKES.FRET })
    }

  // 12th gap doubles (between frets 12 and 13) in curved mode: use independent offset; two markers move opposite directions ±d12
    if (useDouble12) {
      const n = 12 // doubles in the 12..13 gap
      const rA = byN.get(n)
      const rB = byN.get(n + 1)
      if (rA && rB) {
        const xStart = Math.max(rA.x_left,  rB.x_left)
        const xEnd   = Math.min(rA.x_right, rB.x_right)
        if (xEnd > xStart) {
          const SAMPLES = 64
          let bestX = xStart
          let bestY = 0
          let bestErr = Number.POSITIVE_INFINITY
          for (let i = 0; i <= SAMPLES; i++) {
            const x = xStart + (xEnd - xStart) * (i / SAMPLES)
            const yG = 0.5 * (yAtX(rA.pts, x) + yAtX(rB.pts, x))
            const err = Math.abs(x - xCenterAtY(yG))
            if (err < bestErr) { bestErr = err; bestX = x; bestY = yG }
          }
          const xCenter = bestX
          const yCenter = bestY
          const xLft = xCenter - d12
          const xRgt = xCenter + d12
          // left cross
          out.push({ kind:'line', x1:xLft - r, y1:yCenter, x2:xLft + r, y2:yCenter, color:COLORS.marker, w:STROKES.FRET })
          out.push({ kind:'line', x1:xLft,     y1:yCenter - r, x2:xLft,     y2:yCenter + r, color:COLORS.marker, w:STROKES.FRET })
          // right cross
          out.push({ kind:'line', x1:xRgt - r, y1:yCenter, x2:xRgt + r, y2:yCenter, color:COLORS.marker, w:STROKES.FRET })
          out.push({ kind:'line', x1:xRgt,     y1:yCenter - r, x2:xRgt,     y2:yCenter + r, color:COLORS.marker, w:STROKES.FRET })
          if (showGhost) {
            // draw ghost across the gap
            const pts: {x:number;y:number}[] = []
            for (let i = 0; i <= SAMPLES; i++) {
              const x = xStart + (xEnd - xStart) * (i / SAMPLES)
              const yG = 0.5 * (yAtX(rA.pts, x) + yAtX(rB.pts, x))
              pts.push({ x, y: yG })
            }
            for (let i = 1; i < pts.length; i++) {
              const p0 = pts[i-1], p1 = pts[i]
              out.push({ kind:'line', x1:p0.x, y1:p0.y, x2:p1.x, y2:p1.y, color:COLORS.ghost, w:STROKES.FRET })
            }
          }
        }
      }
    }
    return out
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
