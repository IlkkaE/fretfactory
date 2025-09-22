import React from 'react'
import { useAppState } from '../store.state'
import { computeCurvedFretsRaw, computeCurvedNutBridge } from '../geom/curved'
import pchipToBezierPath from '../geom/pchip'
import { PRESETS } from '../presets/instruments'
import { isScaleValid, isNeckDimensionsValid } from '../utils/constants'
import { getMargin, getUnitAttribute } from '../utils/units'
import { SVG_CONSTANTS, VECTOR_EFFECT } from '../utils/svg'
import { exportPDFA4 } from '../utils/exporters'

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  // Defer cleanup to ensure the browser processes the click
  requestAnimationFrame(() => {
    a.click()
    setTimeout(() => {
      try { a.remove() } catch {}
      try { URL.revokeObjectURL(url) } catch {}
    }, 0)
  })
}
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// --- apurit ---
const MM = (_units: 'mm' | 'inch', vmm: number) => vmm
const MARK_FRETS = [2,4,6,8,11,14,16,18,20]
// Moved to SVG_CONSTANTS in utils/svg.ts

// Icons and buttons removed for inline usage; non-inline fallback remains for now

// OBJ icon removed

export default function Exports({ inline = false }:{ inline?: boolean }) {
  const s = useAppState()

  // Ghost mode for debugging/development
  const GHOST_ON = Boolean(s.showGhostHelpers)

  const canCurved = isScaleValid(s) && isNeckDimensionsValid(s)

  const unitAttr = getUnitAttribute('mm')
  const MARGIN = getMargin('mm')
  const { STROKE_WIDTHS: SW, COLORS: C } = SVG_CONSTANTS
  const VEC = VECTOR_EFFECT

  const preset = PRESETS.find(p => p.id === s.selectedPresetId)
  const presetSlug = preset ? slug(`${preset.manufacturer}-${preset.model}`) : 'custom'
  const baseName = `fretfactory_${presetSlug}_curved_${s.units}`

  // PDF export removed

  // JSON and CSV only (OBJ removed)

  // ---- Measurement table (builder-friendly distances along each string) ----
  // Returns rows: [{ n, distances: number[] }] where distances[i] is from nut to fret n on string i (mm)
  const measurementRows = React.useMemo(() => {
    if (!canCurved) return [] as Array<{ n: number; distances: number[] }>
    const strings = s.strings
    const k = Math.max(0.01, s.curvedExponent ?? 1)
    const logB = Math.log(s.scaleBass!)
    const logT = Math.log(s.scaleTreble!)
    const Li: number[] = new Array(strings)
    for (let i = 0; i < strings; i++) {
      const u = strings === 1 ? 0 : i / (strings - 1)
      const uu = 1 - Math.pow(1 - u, k)
      Li[i] = Math.exp(logB + (logT - logB) * uu)
    }
    const rows: Array<{ n: number; distances: number[] }> = []
    for (let n = 1; n <= s.frets; n++) {
      const distances = Li.map(L => L - L / Math.pow(2, n / 12))
      rows.push({ n, distances })
    }
    return rows
  }, [canCurved, s])

  const handleMeasuresCSV = React.useCallback(() => {
    if (!canCurved) return
    const header = ['fret', ...Array.from({ length: s.strings }, (_, i) => `S${i + 1}`)].join(';')
    const lines = [header]
    for (const r of measurementRows) {
      lines.push([r.n, ...r.distances.map(v => v.toFixed(5))].join(';'))
    }
    download(`${baseName}_measurements.csv`, lines.join('\n'), 'text/csv')
  }, [baseName, canCurved, measurementRows, s.strings])

  const handleSVG = React.useCallback(() => {
    if (!canCurved) return

  const markRadius = MM('mm', Math.max(1, Math.min(30, s.markerSize ?? 6))) / 2
    const markOffset = (s.markerOffset ?? 0)
    const rows = computeCurvedFretsRaw(
      s.strings, s.frets, s.scaleTreble!, s.scaleBass!, s.anchorFret ?? 12,
      s.stringSpanNut!, s.stringSpanBridge!, s.overhang!, s.curvedExponent ?? 1
    )
    const nb = computeCurvedNutBridge(
      s.strings, s.scaleTreble!, s.scaleBass!, s.anchorFret ?? 12,
      s.stringSpanNut!, s.stringSpanBridge!, s.overhang!, s.curvedExponent ?? 1
    )

    let minX = +Infinity, maxX = -Infinity, minY = +Infinity, maxY = -Infinity
    const eat = (p:{x:number,y:number}) => {
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y
    }
    rows.forEach(r => r.pts.forEach(eat)); nb.nut.pts.forEach(eat); nb.bridge.pts.forEach(eat)
    const W = (maxX - minX) + 2 * MARGIN, H = (maxY - minY) + 2 * MARGIN
    const sx = -minX + MARGIN, sy = -minY + MARGIN

    const lines: string[] = []
    // edges
    lines.push(`<line ${VEC} x1="${nb.nut.x_left+sx}" y1="${nb.nut.y_left+sy}" x2="${nb.bridge.x_left+sx}" y2="${nb.bridge.y_left+sy}" stroke="${C.EDGE}" stroke-width="${SW.EDGE}"/>`)
    lines.push(`<line ${VEC} x1="${nb.nut.x_right+sx}" y1="${nb.nut.y_right+sy}" x2="${nb.bridge.x_right+sx}" y2="${nb.bridge.y_right+sy}" stroke="${C.EDGE}" stroke-width="${SW.EDGE}"/>`)
    // strings
    for (let i = 0; i < s.strings; i++) {
      const pNut = nb.nut.pts[i + 1], pBr = nb.bridge.pts[i + 1]
      lines.push(`<line ${VEC} x1="${pNut.x+sx}" y1="${pNut.y+sy}" x2="${pBr.x+sx}" y2="${pBr.y+sy}" stroke="${C.STRING}" stroke-width="${SW.STRING}"/>`)
    }
    // frets
    for (const r of rows) {
      if (r.straight) {
        lines.push(`<line ${VEC} x1="${r.x_left+sx}" y1="${r.y_left+sy}" x2="${r.x_right+sx}" y2="${r.y_right+sy}" stroke="${C.FRET}" stroke-width="${SW.FRET}"/>`)
      } else {
        const d = pchipToBezierPath(r.pts.map(p => ({ x: p.x + sx, y: p.y + sy })))
        lines.push(`<path ${VEC} d="${d}" stroke="${C.FRET}" stroke-width="${SW.FRET}" fill="none"/>`)
      }
    }
    // nut and bridge curves
    const dNut = pchipToBezierPath(nb.nut.pts.map(p => ({ x: p.x + sx, y: p.y + sy })))
    const dBr  = pchipToBezierPath(nb.bridge.pts.map(p => ({ x: p.x + sx, y: p.y + sy })))
    lines.push(`<path ${VEC} d="${dNut}" stroke="${C.NUT}" stroke-width="${SW.NUT}" fill="none"/>`)
    lines.push(`<path ${VEC} d="${dBr}"  stroke="${C.NUT}" stroke-width="${SW.NUT}" fill="none"/>`)

  // ghost + crosses
  const mid = (a:number,b:number)=> (a+b)/2
    const addCross = (cx:number, cy:number) => {
      lines.push(`<line ${VEC} x1="${cx-markRadius+sx}" y1="${cy+sy}" x2="${cx+markRadius+sx}" y2="${cy+sy}" stroke="${C.MARKER}" stroke-width="${SW.FRET}"/>`)
      lines.push(`<line ${VEC} x1="${cx+sx}" y1="${cy-markRadius+sy}" x2="${cx+sx}" y2="${cy+markRadius+sy}" stroke="${C.MARKER}" stroke-width="${SW.FRET}"/>`)
    }
    const marks = (s.markerFrets && s.markerFrets.length ? s.markerFrets : MARK_FRETS)
    for (const f of marks) {
      // treat as gaps: f between frets f and f+1; allow f=0
      if (f < 0 || f >= s.frets) continue
      // skip single cross if doubles are enabled at 12th gap
      if (s.doubleAt12 && f === 12) continue
      const a = rows[f], b = rows[f+1]
      if (!a || !b) continue
      if (GHOST_ON) {
        const ghostPts = a.pts.map((p, i) => ({ x: mid(p.x, b.pts[i].x) + sx, y: mid(p.y, b.pts[i].y) + sy }))
        const dGhost = pchipToBezierPath(ghostPts)
        lines.push(`<path ${VEC} d="${dGhost}" stroke="${C.GHOST}" stroke-width="${SW.GHOST}" fill="none"/>`)
      }
      const midIdx = Math.floor(a.pts.length/2)
      const cy = mid(a.pts[midIdx].y, b.pts[midIdx].y)
      const gL = mid(a.x_left,  b.x_left)
      const gR = mid(a.x_right, b.x_right)
      const cx = (gL + gR)/2 + markOffset
      addCross(cx, cy)
    }

    // draw double at 12th gap if enabled
    if (s.doubleAt12) {
      const f = 12
      const a = rows[f], b = rows[f+1]
      if (a && b) {
        const mid = (a:number,b:number)=> (a+b)/2
        const midIdx = Math.floor(a.pts.length/2)
        const cy = mid(a.pts[midIdx].y, b.pts[midIdx].y)
        const gL = mid(a.x_left,  b.x_left)
        const gR = mid(a.x_right, b.x_right)
        const cxCenter = (gL + gR)/2
        const d12 = Math.max(0, s.double12Offset ?? 0)
        addCross(cxCenter - d12 + markOffset, cy)
        addCross(cxCenter + d12 + markOffset, cy)
      }
    }

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}${unitAttr}" height="${H}${unitAttr}" viewBox="0 0 ${W} ${H}">
  <g fill="none">
    ${lines.join('\n    ')}
  </g>
</svg>`
    download(`${baseName}.svg`, svg, 'image/svg+xml')
  }, [baseName, canCurved, s, unitAttr, GHOST_ON])

  const handleCSV = React.useCallback(() => {
    const rows = computeCurvedFretsRaw(s.strings, s.frets, s.scaleTreble!, s.scaleBass!, s.anchorFret ?? 12, s.stringSpanNut!, s.stringSpanBridge!, s.overhang!, s.curvedExponent ?? 1)
    const headerPts = rows[0]?.pts.map((_, i) => `x${i};y${i}`) ?? []
    const out = ['fret;x_left;y_left;x_right;y_right;' + headerPts.join(';')]
    rows.forEach(r => {
      const cells = [r.n, r.x_left.toFixed(5), r.y_left.toFixed(5), r.x_right.toFixed(5), r.y_right.toFixed(5)]
      r.pts.forEach(p => { cells.push(p.x.toFixed(5), p.y.toFixed(5)) })
      out.push(cells.join(';'))
    })
    download(`${baseName}.csv`, out.join('\n'), 'text/csv')
  }, [baseName, s.anchorFret, s.curvedExponent, s.frets, s.scaleBass, s.scaleTreble, s.stringSpanBridge, s.stringSpanNut, s.overhang, s.strings])

  const handleJSON = React.useCallback(() => {
    const frets = computeCurvedFretsRaw(s.strings, s.frets, s.scaleTreble!, s.scaleBass!, s.anchorFret ?? 12, s.stringSpanNut!, s.stringSpanBridge!, s.overhang!, s.curvedExponent ?? 1)
    const payload = {
      mode: 'curved', units: s.units, strings: s.strings, frets: s.frets,
      scaleTreble: s.scaleTreble, scaleBass: s.scaleBass, anchorFret: s.anchorFret, curvedExponent: s.curvedExponent,
      stringSpanNut: s.stringSpanNut, stringSpanBridge: s.stringSpanBridge, overhang: s.overhang, data: frets
    }
    download(`${baseName}.json`, JSON.stringify(payload, null, 2), 'application/json')
  }, [baseName, s.anchorFret, s.curvedExponent, s.frets, s.scaleBass, s.scaleTreble, s.stringSpanBridge, s.stringSpanNut, s.overhang, s.units, s.strings])

  const handlePDF = React.useCallback(() => {
    // Delegate to centralized PDF exporter (mm-only, A4 tiled)
    exportPDFA4(s)
  }, [s])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey
      if (ctrl && !e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault(); handleSVG()
      } else if (ctrl && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault(); handleCSV()
      } else if (ctrl && e.shiftKey && e.key.toLowerCase() === 'j') {
        e.preventDefault(); handleJSON()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleCSV, handleJSON, handleSVG])

  const barInline: React.CSSProperties = { display:'none' }
  return (
    inline ? (
      <div className="hidden" />
    ) : (
      <div className="card">
        <div className="bar-end">
          <ToolButton onClick={handleSVG}  disabled={!canCurved} label="Export SVG  (Ctrl+S)" />
          <ToolButton onClick={handlePDF}  disabled={!canCurved} label="Export PDF A4 (tiled with guides)" />
          <ToolButton onClick={handleCSV}  disabled={!canCurved} label="Export CSV  (Ctrl+Shift+C)" />
          <ToolButton onClick={handleJSON} disabled={!canCurved} label="Export JSON (Ctrl+Shift+J)" />
          <ToolButton onClick={handleMeasuresCSV} disabled={!canCurved} label="Export Measurements CSV" />
        </div>
        {/* Quick preview of first 6 frets for builder measurements */}
  {canCurved && measurementRows.length > 0 && (
          <div className="mt-8 ox-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="th center">mm</th>
                  {Array.from({ length: s.strings }, (_, i) => (
                    <th key={i} className="th center">{`S${i + 1}`}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {measurementRows.slice(0, 6).map(r => (
                  <tr key={r.n}>
                    <td className="td right">{r.distances[0]?.toFixed(2)}</td>
                    {r.distances.map((v, idx) => (
                      <td key={idx} className="td right">{v.toFixed(2)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="caption-small">Values in mm (nut → fret). Row label = S1 distance.</div>
          </div>
        )}
      </div>
    )
  )
}

function ToolButton({ onClick, disabled, label }:{ onClick: () => void; disabled?: boolean; label: string }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-label={label} className="btn btn-block">
      {label}
    </button>
  )
}

const bar: React.CSSProperties = { display:'flex', justifyContent:'flex-end', gap:8 }
const cellBase: React.CSSProperties = { border:'1px solid var(--card-border)', padding:'2px 6px', textAlign:'right' }
const th: React.CSSProperties = { ...cellBase, textAlign:'center', background:'var(--panel-muted)' }
const td: React.CSSProperties = cellBase
// styles removed
