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
  const offsetMode = s.markerOffsetMode ?? 'mm'
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
  const { rows, nb } = built.helpers.curved

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

      // Rakennetaan ghost-käyrä pistepareista: keskipiste jokaiselle kielipisteelle (sis. reunat)
      const pts: {x:number;y:number}[] = rA.pts.map((p, i) => ({
        x: 0.5 * (p.x + rB.pts[i].x),
        y: 0.5 * (p.y + rB.pts[i].y)
      }))
      if (showGhost) {
        for (let i = 1; i < pts.length; i++) {
          const p0 = pts[i-1], p1 = pts[i]
          out.push({ kind:'line', x1:p0.x, y1:p0.y, x2:p1.x, y2:p1.y, color:COLORS.ghost, w:STROKES.FRET })
        }
      }

      // Etsi keskikohta leveyskeskilinjan perusteella
      let bestIdx = 0
      let bestErr = Math.abs(pts[0].x - xCenterAtY(pts[0].y))
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i]
        const err = Math.abs(p.x - xCenterAtY(p.y))
        if (err < bestErr) { bestErr = err; bestIdx = i }
      }

      // Siirrä along-curve arclengthilla (mm) ghost-käyrää pitkin
      const pointAlongPolyline = (arr: {x:number;y:number}[], startIndex: number, delta: number) => {
        if (!arr.length) return { x: 0, y: 0 }
        let i = Math.max(0, Math.min(startIndex, arr.length - 1))
        if (Math.abs(delta) < 1e-6) return { x: arr[i].x, y: arr[i].y }
        const dir = delta >= 0 ? 1 : -1
        let remain = Math.abs(delta)
        while (remain > 1e-6) {
          const j = i + dir
          if (j < 0 || j >= arr.length) return { x: arr[i].x, y: arr[i].y }
          const dx = arr[j].x - arr[i].x
          const dy = arr[j].y - arr[i].y
          const segLen = Math.hypot(dx, dy)
          if (remain <= segLen) {
            const t = segLen > 0 ? (remain / segLen) : 0
            return { x: arr[i].x + dx * t, y: arr[i].y + dy * t }
          }
          remain -= segLen
          i = j
        }
        return { x: arr[i].x, y: arr[i].y }
      }

      // Convert to absolute position along the ghost curve when in percent mode
      let pCross: { x:number; y:number }
      if (offsetMode === 'percent') {
        let total = 0
        for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i].x - pts[i-1].x, pts[i].y - pts[i-1].y)
        const t = Math.max(0, Math.min(1, (offset + 100) / 200)) // -100 -> 0, 0 -> 0.5, +100 -> 1
        const dist = t * total
        pCross = pointAlongPolyline(pts, 0, dist)
      } else {
        // mm mode: offset from width-center point
        pCross = pointAlongPolyline(pts, bestIdx, offset)
      }

      // risti
      out.push({ kind:'line', x1:pCross.x - r, y1:pCross.y, x2:pCross.x + r, y2:pCross.y, color:COLORS.marker, w:STROKES.FRET })
      out.push({ kind:'line', x1:pCross.x,     y1:pCross.y - r, x2:pCross.x,     y2:pCross.y + r, color:COLORS.marker, w:STROKES.FRET })
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
          const pts: {x:number;y:number}[] = rA.pts.map((p, i) => ({
            x: 0.5 * (p.x + rB.pts[i].x),
            y: 0.5 * (p.y + rB.pts[i].y)
          }))
          // find center index nearest width-center
          let bestIdx = 0
          let bestErr = Math.abs(pts[0].x - xCenterAtY(pts[0].y))
          for (let i = 1; i < pts.length; i++) {
            const p = pts[i]
            const err = Math.abs(p.x - xCenterAtY(p.y))
            if (err < bestErr) { bestErr = err; bestIdx = i }
          }
          const pointAlongPolyline = (arr: {x:number;y:number}[], startIndex: number, delta: number) => {
            if (!arr.length) return { x: 0, y: 0 }
            let i = Math.max(0, Math.min(startIndex, arr.length - 1))
            if (Math.abs(delta) < 1e-6) return { x: arr[i].x, y: arr[i].y }
            const dir = delta >= 0 ? 1 : -1
            let remain = Math.abs(delta)
            while (remain > 1e-6) {
              const j = i + dir
              if (j < 0 || j >= arr.length) return { x: arr[i].x, y: arr[i].y }
              const dx = arr[j].x - arr[i].x
              const dy = arr[j].y - arr[i].y
              const segLen = Math.hypot(dx, dy)
              if (remain <= segLen) {
                const t = segLen > 0 ? (remain / segLen) : 0
                return { x: arr[i].x + dx * t, y: arr[i].y + dy * t }
              }
              remain -= segLen
              i = j
            }
            return { x: arr[i].x, y: arr[i].y }
          }

          // Two markers along the curve at absolute positions when in percent mode
          let pL: {x:number;y:number}, pR: {x:number;y:number}
          if (offsetMode === 'percent') {
            let total = 0
            for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i].x - pts[i-1].x, pts[i].y - pts[i-1].y)
            const tMain = Math.max(0, Math.min(1, (offset + 100) / 200))
            const distMain = tMain * total
            const distSep = Math.max(0, Math.min(total, (d12 / 100) * total))
            pL = pointAlongPolyline(pts, 0, Math.max(0, distMain - distSep))
            pR = pointAlongPolyline(pts, 0, Math.min(total, distMain + distSep))
          } else {
            pL = pointAlongPolyline(pts, bestIdx, offset - d12)
            pR = pointAlongPolyline(pts, bestIdx, offset + d12)
          }
          // left cross
          out.push({ kind:'line', x1:pL.x - r, y1:pL.y, x2:pL.x + r, y2:pL.y, color:COLORS.marker, w:STROKES.FRET })
          out.push({ kind:'line', x1:pL.x,     y1:pL.y - r, x2:pL.x,     y2:pL.y + r, color:COLORS.marker, w:STROKES.FRET })
          // right cross
          out.push({ kind:'line', x1:pR.x - r, y1:pR.y, x2:pR.x + r, y2:pR.y, color:COLORS.marker, w:STROKES.FRET })
          out.push({ kind:'line', x1:pR.x,     y1:pR.y - r, x2:pR.x,     y2:pR.y + r, color:COLORS.marker, w:STROKES.FRET })
          if (showGhost) {
            // draw ghost across the gap (already sampled in pts)
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
