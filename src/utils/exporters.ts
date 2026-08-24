import { PRESETS } from '../presets/instruments'
import type { AppState } from '../types'
import { computeCurvedFretsRaw, computeCurvedNutBridge } from '../geom/curved'
import pchipToBezierPath, { pchipToBezierSegments } from '../geom/pchip'
import { fromMillimeters, getMargin, getUnitAttribute } from './units'
import { SVG_CONSTANTS, VECTOR_EFFECT } from './svg'
import { createDXF } from './dxf'

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
const MARK_FRETS = [2,4,6,8,11,14,16,18,20]

export function exportDXF(s: AppState) {
  const result = createDXF(s)
  if (!result) return
  download(result.filename, result.content, 'application/dxf')
}

export function createSVG(s: AppState): { filename: string; content: string } | null {
  const canCurved = s.mode === 'curved' && !!(s.scaleTreble && s.scaleBass) && !!(s.stringSpanNut && s.stringSpanBridge && s.overhang != null)
  if (!canCurved) return null

  const preset = PRESETS.find(p => p.id === s.selectedPresetId)
  const presetSlug = preset ? slug(`${preset.manufacturer}-${preset.model}`) : 'custom'
  const baseName = `fretfactory_${presetSlug}_curved_${s.units}`

  const unitAttr = getUnitAttribute(s.units)
  const MARGIN = getMargin('mm')
  const { STROKE_WIDTHS: SW, COLORS: C } = SVG_CONSTANTS
  const VEC = VECTOR_EFFECT

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

    const drawingElements: string[] = []
    const fretElements: string[] = []
    drawingElements.push(`<line ${VEC} x1="${nb.nut.x_left+sx}" y1="${nb.nut.y_left+sy}" x2="${nb.bridge.x_left+sx}" y2="${nb.bridge.y_left+sy}" stroke="${C.EDGE}" stroke-width="${SW.EDGE}"/>`)
    drawingElements.push(`<line ${VEC} x1="${nb.nut.x_right+sx}" y1="${nb.nut.y_right+sy}" x2="${nb.bridge.x_right+sx}" y2="${nb.bridge.y_right+sy}" stroke="${C.EDGE}" stroke-width="${SW.EDGE}"/>`)
    if (!s.removeStrings) {
      for (let i = 0; i < s.strings; i++) {
        const pNut = nb.nut.pts[i + 1], pBr = nb.bridge.pts[i + 1]
        drawingElements.push(`<line ${VEC} x1="${pNut.x+sx}" y1="${pNut.y+sy}" x2="${pBr.x+sx}" y2="${pBr.y+sy}" stroke="${C.STRING}" stroke-width="${SW.STRING}"/>`)
      }
    }
    rows.forEach((r, index) => {
      const fretNumber = index + 1
      const identity = `id="fret-${fretNumber}" data-name="Fret ${fretNumber}" inkscape:label="Fret ${fretNumber}"`
      if ((r as any).straight) {
        fretElements.push(`<line ${identity} ${VEC} x1="${r.x_left+sx}" y1="${r.y_left+sy}" x2="${r.x_right+sx}" y2="${r.y_right+sy}" stroke="${C.FRET}" stroke-width="${SW.FRET}"/>`)
      } else {
        const d = pchipToBezierPath(r.pts.map(p => ({ x: p.x + sx, y: p.y + sy })))
        fretElements.push(`<path ${identity} ${VEC} d="${d}" stroke="${C.FRET}" stroke-width="${SW.FRET}" fill="none"/>`)
      }
    })
    const dNut = pchipToBezierPath(nb.nut.pts.map(p => ({ x: p.x + sx, y: p.y + sy })))
    const dBr  = pchipToBezierPath(nb.bridge.pts.map(p => ({ x: p.x + sx, y: p.y + sy })))
    drawingElements.push(`<path ${VEC} d="${dNut}" stroke="${C.NUT}" stroke-width="${SW.NUT}" fill="none"/>`)
    drawingElements.push(`<path ${VEC} d="${dBr}"  stroke="${C.NUT}" stroke-width="${SW.NUT}" fill="none"/>`)

    // Fret markers: intersection of guide line with ghost midlines
    const clamp01 = (v:number)=> Math.max(0, Math.min(1, v))
    const tGuide = clamp01(((s as any).guidePosPct ?? 50) / 100)
    const lerp = (a:number,b:number,t:number)=> a + (b-a)*t
    const nutBass = { x: nb.L.edgeNut[0], y: nb.nut.pts[0].y }
    const nutTreb = { x: nb.L.edgeNut[1], y: nb.nut.pts[nb.nut.pts.length-1].y }
    const brBass  = { x: nb.L.edgeBridge[0], y: nb.bridge.pts[0].y }
    const brTreb  = { x: nb.L.edgeBridge[1], y: nb.bridge.pts[nb.bridge.pts.length-1].y }
    const P0 = { x: lerp(nutBass.x, nutTreb.x, tGuide), y: lerp(nutBass.y, nutTreb.y, tGuide) }
    const P1 = { x: lerp(brBass.x,  brTreb.x,  tGuide), y: lerp(brBass.y,  brTreb.y,  tGuide) }
    const segInt = (a:{x:number;y:number}, b:{x:number;y:number}, c:{x:number;y:number}, d:{x:number;y:number}) => {
      const r = { x: b.x - a.x, y: b.y - a.y }
      const sV = { x: d.x - c.x, y: d.y - c.y }
      const denom = r.x * sV.y - r.y * sV.x
      if (Math.abs(denom) < 1e-9) return null
      const u = ((c.x - a.x) * r.y - (c.y - a.y) * r.x) / denom
      const t = ((c.x - a.x) * sV.y - (c.y - a.y) * sV.x) / denom
      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return { x: a.x + t * r.x, y: a.y + t * r.y }
      return null
    }
    const mid = (a:number,b:number)=> (a+b)/2
    const marks = (s.markerFrets && s.markerFrets.length ? s.markerFrets : MARK_FRETS)
    const size = Math.max(1, Math.min(30, s.markerSize ?? 6))
    const r = size / 2
    for (const f of marks) {
      if (f < 0 || f >= s.frets) continue
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
      let hit: {x:number;y:number}|null = null
      for (let i = 0; i + 1 < ghost.length; i++) {
        const h = segInt(P0, P1, ghost[i], ghost[i+1])
        if (h) { hit = h; break }
      }
      if (!hit) continue
      const cx = hit.x + sx, cy = hit.y + sy
      drawingElements.push(`<line ${VEC} x1="${cx-r}" y1="${cy}" x2="${cx+r}" y2="${cy}" stroke="${C.MARKER}" stroke-width="${SW.FRET}"/>`)
      drawingElements.push(`<line ${VEC} x1="${cx}" y1="${cy-r}" x2="${cx}" y2="${cy+r}" stroke="${C.MARKER}" stroke-width="${SW.FRET}"/>`)
    }

    const physicalW = fromMillimeters(W, s.units)
    const physicalH = fromMillimeters(H, s.units)
    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="${physicalW}${unitAttr}" height="${physicalH}${unitAttr}" viewBox="0 0 ${W} ${H}">\n  <g id="fretboard" data-name="Fretboard" inkscape:groupmode="layer" inkscape:label="Fretboard" fill="none">\n    ${drawingElements.join('\n    ')}\n  </g>\n  <g id="frets" data-name="Frets" inkscape:groupmode="layer" inkscape:label="Frets" fill="none">\n    ${fretElements.join('\n    ')}\n  </g>\n</svg>`
    return { filename: `${baseName}.svg`, content: svg }
}
}

export function exportSVG(s: AppState) {
  const result = createSVG(s)
  if (!result) return
  download(result.filename, result.content, 'image/svg+xml')
}

/**
 * Export a multipage A4 PDF with guide rectangles (apuviivat), mm units only.
 * Tiling approach inspired by FretFind2D's getPDFMultipage.
 */
type PDFLayout = 'a4-tiles' | 'single-page'

export function exportPDFA4(s: AppState) {
  return exportPDF(s, 'a4-tiles')
}

export function exportPDFSinglePage(s: AppState) {
  return exportPDF(s, 'single-page')
}

async function exportPDF(s: AppState, layout: PDFLayout) {
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
    if (!s.removeStrings) {
      for (let i = 0; i < s.strings; i++) {
        const pNut = nb.nut.pts[i + 1], pBr = nb.bridge.pts[i + 1]
        segs.push({ x1: pNut.x+sx, y1: pNut.y+sy, x2: pBr.x+sx, y2: pBr.y+sy })
      }
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
    // markers as small crosses at guide/ghost intersections
    const clamp01 = (v:number)=> Math.max(0, Math.min(1, v))
    const tGuide = clamp01(((s as any).guidePosPct ?? 50) / 100)
    const lerp = (a:number,b:number,t:number)=> a + (b-a)*t
    const nutBass = { x: nb.L.edgeNut[0], y: nb.nut.pts[0].y }
    const nutTreb = { x: nb.L.edgeNut[1], y: nb.nut.pts[nb.nut.pts.length-1].y }
    const brBass  = { x: nb.L.edgeBridge[0], y: nb.bridge.pts[0].y }
    const brTreb  = { x: nb.L.edgeBridge[1], y: nb.bridge.pts[nb.bridge.pts.length-1].y }
    const P0 = { x: lerp(nutBass.x, nutTreb.x, tGuide), y: lerp(nutBass.y, nutTreb.y, tGuide) }
    const P1 = { x: lerp(brBass.x,  brTreb.x,  tGuide), y: lerp(brBass.y,  brTreb.y,  tGuide) }
    const segInt = (a:{x:number;y:number}, b:{x:number;y:number}, c:{x:number;y:number}, d:{x:number;y:number}) => {
      const rV = { x: b.x - a.x, y: b.y - a.y }
      const sV = { x: d.x - c.x, y: d.y - c.y }
      const denom = rV.x * sV.y - rV.y * sV.x
      if (Math.abs(denom) < 1e-9) return null
      const u = ((c.x - a.x) * rV.y - (c.y - a.y) * rV.x) / denom
      const t = ((c.x - a.x) * sV.y - (c.y - a.y) * sV.x) / denom
      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return { x: a.x + t * rV.x, y: a.y + t * rV.y }
      return null
    }
    const mid = (a:number,b:number)=> (a+b)/2
    const marks = (s.markerFrets && s.markerFrets.length ? s.markerFrets : MARK_FRETS)
    const size = Math.max(1, Math.min(30, s.markerSize ?? 6))
    const r = size / 2
    for (const f of marks) {
      if (f < 0 || f >= s.frets) continue
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
      let hit: {x:number;y:number}|null = null
      for (let i = 0; i + 1 < ghost.length; i++) {
        const h = segInt(P0, P1, ghost[i], ghost[i+1])
        if (h) { hit = h; break }
      }
      if (!hit) continue
      // add two line segments for the cross, with page offsets applied later when drawing
      segs.push({ x1: hit.x - r + sx, y1: hit.y + sy, x2: hit.x + r + sx, y2: hit.y + sy })
      segs.push({ x1: hit.x + sx, y1: hit.y - r + sy, x2: hit.x + sx, y2: hit.y + r + sy })
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
  const lineWidth = 25.4 / 72 // ~0.353mm

  if (layout === 'single-page') {
    const pageMargin = 5
    const pageWidth = W + (2 * pageMargin)
    const pageHeight = H + (2 * pageMargin)
    const orientation = pageWidth >= pageHeight ? 'landscape' : 'portrait'
    const doc = new jsPDFCtor({ orientation, unit: 'mm', format: [pageWidth, pageHeight] })
    doc.setLineWidth(lineWidth)
    doc.setDrawColor(0)
    for (const sg of segs) {
      doc.line(
        sg.x1 + pageMargin,
        sg.y1 + pageMargin,
        sg.x2 + pageMargin,
        sg.y2 + pageMargin,
      )
    }
    doc.save(`${baseName}_single-page.pdf`)
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
  // Index segments by page once. This avoids sending every off-page segment
  // through jsPDF for every tile while preserving overlap between pages.
  const pageSegments: Seg[][] = Array.from({ length: xPages * yPages }, () => [])
  for (const sg of segs) {
    const minX = Math.min(sg.x1, sg.x2)
    const maxX = Math.max(sg.x1, sg.x2)
    const minY = Math.min(sg.y1, sg.y2)
    const maxY = Math.max(sg.y1, sg.y2)
    const minXi = Math.max(0, Math.ceil((minX + pageOverlap - pageWidth) / printableWidth))
    const maxXi = Math.min(xPages - 1, Math.floor((maxX + pageOverlap) / printableWidth))
    const minYi = Math.max(0, Math.ceil((minY + pageOverlap - pageHeight) / printableHeight))
    const maxYi = Math.min(yPages - 1, Math.floor((maxY + pageOverlap) / printableHeight))
    for (let yi = minYi; yi <= maxYi; yi++) {
      for (let xi = minXi; xi <= maxXi; xi++) {
        pageSegments[(yi * xPages) + xi].push(sg)
      }
    }
  }

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

      // Draw only segments that intersect this page.
      for (const sg of pageSegments[(yi * xPages) + xi]) {
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
