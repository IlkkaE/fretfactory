import { PRESETS } from '../presets/instruments'
import type { AppState } from '../types'
import { computeCurvedFretsRaw, computeCurvedNutBridge } from '../geom/curved'
import pchipToBezierPath, { pchipToBezierSegments } from '../geom/pchip'
import { getMargin, getUnitAttribute } from './units'
import { SVG_CONSTANTS, VECTOR_EFFECT } from './svg'

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  requestAnimationFrame(() => {
    a.click()
    setTimeout(() => {
      try { a.remove() } catch {}
      try { URL.revokeObjectURL(url) } catch {}
    }, 0)
  })
}
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const MM = (units: 'mm' | 'inch', vmm: number) => units === 'inch' ? vmm / 25.4 : vmm
const MARK_FRETS = [2,4,6,8,11,14,16,18,20]

export function exportSVG(s: AppState) {
  const canCurved = s.mode === 'curved' && !!(s.scaleTreble && s.scaleBass) && !!(s.stringSpanNut && s.stringSpanBridge && s.overhang != null)
  if (!canCurved) return

  const preset = PRESETS.find(p => p.id === s.selectedPresetId)
  const presetSlug = preset ? slug(`${preset.manufacturer}-${preset.model}`) : 'custom'
  const baseName = `fretfactory_${presetSlug}_curved_${s.units}`

  const unitAttr = getUnitAttribute('mm')
  const MARGIN = getMargin('mm')
  const { STROKE_WIDTHS: SW, COLORS: C } = SVG_CONSTANTS
  const VEC = VECTOR_EFFECT

  const markRadius = MM('mm', Math.max(1, Math.min(30, s.markerSize ?? 6))) / 2
  const markOffset = (s.markerOffset ?? 0)
  const GHOST_ON = Boolean(s.showGhostHelpers)

  {
    const rows = computeCurvedFretsRaw(
      s.strings, s.frets, s.scaleTreble!, s.scaleBass!, s.anchorFret ?? 12,
      s.stringSpanNut!, s.stringSpanBridge!, s.overhang!, s.curvedExponent ?? 1
    )
    const nb = computeCurvedNutBridge(
      s.strings, s.scaleTreble!, s.scaleBass!, s.anchorFret ?? 12,
      s.stringSpanNut!, s.stringSpanBridge!, s.overhang!, s.curvedExponent ?? 1
    )

    let minX = +Infinity, maxX = -Infinity, minY = +Infinity, maxY = -Infinity
    const eat = (p:{x:number,y:number}) => { if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x; if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y }
    rows.forEach(r => r.pts.forEach(eat)); nb.nut.pts.forEach(eat); nb.bridge.pts.forEach(eat)
    const W = (maxX - minX) + 2 * MARGIN, H = (maxY - minY) + 2 * MARGIN
    const sx = -minX + MARGIN, sy = -minY + MARGIN

    const lines: string[] = []
    lines.push(`<line ${VEC} x1="${nb.nut.x_left+sx}" y1="${nb.nut.y_left+sy}" x2="${nb.bridge.x_left+sx}" y2="${nb.bridge.y_left+sy}" stroke="${C.EDGE}" stroke-width="${SW.EDGE}"/>`)
    lines.push(`<line ${VEC} x1="${nb.nut.x_right+sx}" y1="${nb.nut.y_right+sy}" x2="${nb.bridge.x_right+sx}" y2="${nb.bridge.y_right+sy}" stroke="${C.EDGE}" stroke-width="${SW.EDGE}"/>`)
    for (let i = 0; i < s.strings; i++) {
      const pNut = nb.nut.pts[i + 1], pBr = nb.bridge.pts[i + 1]
      lines.push(`<line ${VEC} x1="${pNut.x+sx}" y1="${pNut.y+sy}" x2="${pBr.x+sx}" y2="${pBr.y+sy}" stroke="${C.STRING}" stroke-width="${SW.STRING}"/>`)
    }
    for (const r of rows) {
      if ((r as any).straight) {
        lines.push(`<line ${VEC} x1="${r.x_left+sx}" y1="${r.y_left+sy}" x2="${r.x_right+sx}" y2="${r.y_right+sy}" stroke="${C.FRET}" stroke-width="${SW.FRET}"/>`)
      } else {
        const d = pchipToBezierPath(r.pts.map(p => ({ x: p.x + sx, y: p.y + sy })))
        lines.push(`<path ${VEC} d="${d}" stroke="${C.FRET}" stroke-width="${SW.FRET}" fill="none"/>`)
      }
    }
    const dNut = pchipToBezierPath(nb.nut.pts.map(p => ({ x: p.x + sx, y: p.y + sy })))
    const dBr  = pchipToBezierPath(nb.bridge.pts.map(p => ({ x: p.x + sx, y: p.y + sy })))
    lines.push(`<path ${VEC} d="${dNut}" stroke="${C.NUT}" stroke-width="${SW.NUT}" fill="none"/>`)
    lines.push(`<path ${VEC} d="${dBr}"  stroke="${C.NUT}" stroke-width="${SW.NUT}" fill="none"/>`)

    const mid = (a:number,b:number)=> (a+b)/2
    const addCross = (cx:number, cy:number) => {
      lines.push(`<line ${VEC} x1="${cx-markRadius+sx}" y1="${cy+sy}" x2="${cx+markRadius+sx}" y2="${cy+sy}" stroke="${C.MARKER}" stroke-width="${SW.FRET}"/>`)
      lines.push(`<line ${VEC} x1="${cx+sx}" y1="${cy-markRadius+sy}" x2="${cx+sx}" y2="${cy+markRadius+sy}" stroke="${C.MARKER}" stroke-width="${SW.FRET}"/>`)
    }
    const marks = (s.markerFrets && s.markerFrets.length ? s.markerFrets : MARK_FRETS)
    for (const f of marks) {
      // treat as gaps: f between frets f and f+1, allow f=0
      if (f < 0 || f >= s.frets) continue
      // if doubles enabled, skip single at 12th gap
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
        // two crosses at ±d12 from center
        const addCross = (cx:number, cy:number) => {
          lines.push(`<line ${VEC} x1="${cx-markRadius+sx}" y1="${cy+sy}" x2="${cx+markRadius+sx}" y2="${cy+sy}" stroke="${C.MARKER}" stroke-width="${SW.FRET}"/>`)
          lines.push(`<line ${VEC} x1="${cx+sx}" y1="${cy-markRadius+sy}" x2="${cx+sx}" y2="${cy+markRadius+sy}" stroke="${C.MARKER}" stroke-width="${SW.FRET}"/>`)
        }
        addCross(cxCenter - d12 + markOffset, cy)
        addCross(cxCenter + d12 + markOffset, cy)
      }
    }

    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${W}${unitAttr}" height="${H}${unitAttr}" viewBox="0 0 ${W} ${H}">\n  <g fill="none">\n    ${lines.join('\n    ')}\n  </g>\n</svg>`
    download(`${baseName}.svg`, svg, 'image/svg+xml')
}
}

/**
 * Export a multipage A4 PDF with guide rectangles (apuviivat), mm units only.
 * Tiling approach inspired by FretFind2D's getPDFMultipage.
 */
export async function exportPDFA4(s: AppState) {
  const canCurved = s.mode === 'curved' && !!(s.scaleTreble && s.scaleBass) && !!(s.stringSpanNut && s.stringSpanBridge && s.overhang != null)
  if (!canCurved) return

  const { STROKE_WIDTHS: SW } = SVG_CONSTANTS
  const preset = PRESETS.find(p => p.id === s.selectedPresetId)
  const presetSlug = preset ? slug(`${preset.manufacturer}-${preset.model}`) : 'custom'
  const baseName = `fretfactory_${presetSlug}_curved_${s.units}`

  // Accumulate geometry as line and cubic segments in mm in a [0..W]x[0..H] coordinate space
  type Seg = { x1:number, y1:number, x2:number, y2:number }
  const segs: Seg[] = []

  // Flatten a cubic Bezier to polyline segments (for reliable jsPDF rendering)
  const addCubicAsLines = (x0:number,y0:number,cx1:number,cy1:number,cx2:number,cy2:number,x1:number,y1:number, steps=24) => {
    const bez = (t:number) => {
      const mt = 1 - t
      const mt2 = mt*mt
      const t2 = t*t
      const a = mt2*mt
      const b = 3*mt2*t
      const c = 3*mt*t2
      const d = t*t2
      return {
        x: a*x0 + b*cx1 + c*cx2 + d*x1,
        y: a*y0 + b*cy1 + c*cy2 + d*y1
      }
    }
    let prev = { x: x0, y: y0 }
    for (let i = 1; i <= steps; i++) {
      const t = i/steps
      const p = bez(t)
      segs.push({ x1: prev.x, y1: prev.y, x2: p.x, y2: p.y })
      prev = p
    }
  }
  let W = 0, H = 0

  {
    const rows = computeCurvedFretsRaw(
      s.strings, s.frets, s.scaleTreble!, s.scaleBass!, s.anchorFret ?? 12,
      s.stringSpanNut!, s.stringSpanBridge!, s.overhang!, s.curvedExponent ?? 1
    )
    const nb = computeCurvedNutBridge(
      s.strings, s.scaleTreble!, s.scaleBass!, s.anchorFret ?? 12,
      s.stringSpanNut!, s.stringSpanBridge!, s.overhang!, s.curvedExponent ?? 1
    )

    let minX = +Infinity, maxX = -Infinity, minY = +Infinity, maxY = -Infinity
    const eat = (p:{x:number,y:number}) => { if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x; if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y }
    rows.forEach(r => r.pts.forEach(eat)); nb.nut.pts.forEach(eat); nb.bridge.pts.forEach(eat)
    W = (maxX - minX)
    H = (maxY - minY)
    const sx = -minX, sy = -minY

    // edges
    segs.push({ x1: nb.nut.x_left+sx, y1: nb.nut.y_left+sy, x2: nb.bridge.x_left+sx, y2: nb.bridge.y_left+sy })
    segs.push({ x1: nb.nut.x_right+sx, y1: nb.nut.y_right+sy, x2: nb.bridge.x_right+sx, y2: nb.bridge.y_right+sy })
    // strings
    for (let i = 0; i < s.strings; i++) {
      const pNut = nb.nut.pts[i + 1], pBr = nb.bridge.pts[i + 1]
      segs.push({ x1: pNut.x+sx, y1: pNut.y+sy, x2: pBr.x+sx, y2: pBr.y+sy })
    }
    // frets as cubic beziers (smoothed like SVG)
    for (const r of rows) {
      if (r.straight) {
        segs.push({ x1: r.x_left+sx, y1: r.y_left+sy, x2: r.x_right+sx, y2: r.y_right+sy })
      } else {
        const segsB = pchipToBezierSegments(r.pts.map(p => ({ x: p.x + sx, y: p.y + sy })))
        for (const c of segsB) {
          addCubicAsLines(c.p0.x, c.p0.y, c.c1.x, c.c1.y, c.c2.x, c.c2.y, c.p1.x, c.p1.y)
        }
      }
    }
    // nut and bridge as cubic beziers
    for (const c of pchipToBezierSegments(nb.nut.pts.map(p => ({ x: p.x + sx, y: p.y + sy })))) {
      addCubicAsLines(c.p0.x, c.p0.y, c.c1.x, c.c1.y, c.c2.x, c.c2.y, c.p1.x, c.p1.y)
    }
    for (const c of pchipToBezierSegments(nb.bridge.pts.map(p => ({ x: p.x + sx, y: p.y + sy })))) {
      addCubicAsLines(c.p0.x, c.p0.y, c.c1.x, c.c1.y, c.c2.x, c.c2.y, c.p1.x, c.p1.y)
    }
    }

  // jsPDF tiling on A4 with overlap guide box
  let jsPDFCtor: any
  try {
    const mod: any = await import('jspdf')
    // ESM build exports named { jsPDF }; some bundles expose default
    jsPDFCtor = mod?.jsPDF ?? mod?.default
  } catch (e) {
    console.error('[exportPDFA4] Failed to load jsPDF module', e)
    try { alert('PDF export failed: jsPDF module could not be loaded.') } catch {}
    return
  }
  if (!jsPDFCtor) {
    console.error('[exportPDFA4] jsPDF constructor not found on module (expected named export jsPDF)')
    try { alert('PDF export failed: incompatible jsPDF build.') } catch {}
    return
  }
  const doc = new jsPDFCtor('p', 'mm', 'a4')
  const pageWidth = 210
  const pageHeight = 297
  const pageOverlap = 12.7 // 0.5 inch in mm
  const printableWidth = pageWidth - (2 * pageOverlap)
  const printableHeight = pageHeight - (2 * pageOverlap)
  const xPages = Math.ceil(W / printableWidth)
  const yPages = Math.ceil(H / printableHeight)
  const lineWidth = 25.4 / 72 // ~0.353mm

  for (let yi = 0; yi < yPages; yi++) {
    for (let xi = 0; xi < xPages; xi++) {
      const yOffset = (pageHeight * yi) - (pageOverlap * (1 + (2 * yi)))
      const xOffset = (pageWidth * xi) - (pageOverlap * (1 + (2 * xi)))
      if (xi !== 0 || yi !== 0) doc.addPage()
      doc.setLineWidth(lineWidth)
      // guide rectangle
      doc.setDrawColor(192)
      doc.rect(pageOverlap, pageOverlap, printableWidth, printableHeight)
      doc.setDrawColor(0)

      // Draw all segments offset into this page
      for (const sg of segs) {
        doc.line(
          sg.x1 - xOffset,
          sg.y1 - yOffset,
          sg.x2 - xOffset,
          sg.y2 - yOffset
        )
      }
  // (No separate bezier drawing; curves were flattened into segs)
    }
  }

  // prefer jsPDF saver to keep consistency with other exports' filename format
  doc.save(`${baseName}.pdf`)
}

export function exportCSV(s: AppState) {
  const rows = computeCurvedFretsRaw(s.strings, s.frets, s.scaleTreble!, s.scaleBass!, s.anchorFret ?? 12, s.stringSpanNut!, s.stringSpanBridge!, s.overhang!, s.curvedExponent ?? 1)
  const headerPts = rows[0]?.pts.map((_, i) => `x${i};y${i}`) ?? []
  const out = ['fret;x_left;y_left;x_right;y_right;' + headerPts.join(';')]
  rows.forEach(r => {
    const cells = [r.n, r.x_left.toFixed(5), r.y_left.toFixed(5), r.x_right.toFixed(5), r.y_right.toFixed(5)]
    r.pts.forEach(p => { cells.push(p.x.toFixed(5), p.y.toFixed(5)) })
    out.push(cells.join(';'))
  })
  const preset = PRESETS.find(p => p.id === s.selectedPresetId)
  const presetSlug = preset ? slug(`${preset.manufacturer}-${preset.model}`) : 'custom'
  const baseName = `fretfactory_${presetSlug}_curved_${s.units}`
  download(`${baseName}.csv`, out.join('\n'), 'text/csv')
}

export function exportJSON(s: AppState) {
  const frets = computeCurvedFretsRaw(s.strings, s.frets, s.scaleTreble!, s.scaleBass!, s.anchorFret ?? 12, s.stringSpanNut!, s.stringSpanBridge!, s.overhang!, s.curvedExponent ?? 1)
  const payload = {
    mode: 'curved', units: s.units, strings: s.strings, frets: s.frets,
    scaleTreble: s.scaleTreble, scaleBass: s.scaleBass, anchorFret: s.anchorFret, curvedExponent: s.curvedExponent,
    stringSpanNut: s.stringSpanNut, stringSpanBridge: s.stringSpanBridge, overhang: s.overhang, data: frets
  }
  const preset = PRESETS.find(p => p.id === s.selectedPresetId)
  const presetSlug = preset ? slug(`${preset.manufacturer}-${preset.model}`) : 'custom'
  const baseName = `fretfactory_${presetSlug}_curved_${s.units}`
  download(`${baseName}.json`, JSON.stringify(payload, null, 2), 'application/json')
}
