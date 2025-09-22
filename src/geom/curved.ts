import { computeStringLayout } from './core'
import { TREBLE_STRING_INDEX, BASS_STRING_INDEX } from './naming'

// Naming is centralized in naming.ts; we import indices to avoid drift.

function dAtFret(L: number, n: number) {
  return L - L / Math.pow(2, n / 12)
}
function edgeLineXC(A: [number, number], B: [number, number]) {
  const b = (B[0] - A[0]) / (B[1] - A[1]) // x = b*y + c
  const c = A[0] - b * A[1]
  return { b, c }
}

export type CurvedFretRow = {
  n: number
  x_left: number;  y_left: number
  x_right: number; y_right: number
  straight: boolean
  pts: Array<{ x: number; y: number }>
}

function commonCurvedParams(
  strings: number,
  scaleTreble: number,
  scaleBass: number,
  anchorFret: number,
  stringSpanNut: number,
  stringSpanBridge: number,
  overhang: number,
  curvedExponent: number
) {
  const L = computeStringLayout(strings, stringSpanNut, stringSpanBridge, overhang)

  const logB = Math.log(scaleBass)
  const logT = Math.log(scaleTreble)
  const k = Math.max(0.01, curvedExponent)

  // Per-string scale lengths (log-space interpolation from Bass→Treble)
  const Li: number[] = new Array(strings)
  for (let i = 0; i < strings; i++) {
    // 0 = bass (left) .. 1 = treble (right)
    const u = strings === 1 ? 0 : i / (strings - 1)
    // Bias toward bass side for k>1 so bass end changes more sharply as exponent grows
    const uu = 1 - Math.pow(1 - u, k)
    Li[i] = Math.exp(logB + (logT - logB) * uu)
  }

  const dA: number[] = Li.map(Li1 => Li1 - Li1 / Math.pow(2, anchorFret / 12))

  // Edge lines (anchored at the anchor fret)
  const dAb = scaleBass   - scaleBass   / Math.pow(2, anchorFret / 12)
  const dAt = scaleTreble - scaleTreble / Math.pow(2, anchorFret / 12)
  const leftA:  [number, number] = [L.edgeNut[0],    -dAb]
  const leftB:  [number, number] = [L.edgeBridge[0],  scaleBass - dAb]
  const rightA: [number, number] = [L.edgeNut[1],    -dAt]
  const rightB: [number, number] = [L.edgeBridge[1],  scaleTreble - dAt]
  const { b: bL, c: cL } = edgeLineXC(leftA,  leftB)
  const { b: bR, c: cR } = edgeLineXC(rightA, rightB)

  return { L, Li, dA, bL, cL, bR, cR }
}

/**
 * Compute curved fret positions for multi-scale (fan-fret) instruments.
 * 
 * CRITICAL BEHAVIOR CONTRACTS:
 * - scaleTreble: Scale length for TREBLE strings (RIGHT SIDE, string index strings-1)
 * - scaleBass: Scale length for BASS strings (LEFT SIDE, string index 0)  
 * - curvedExponent: Controls interpolation curve (1.0 = linear, >1.0 = more curved/fan)
 *
 * String indexing: 0 = bass (left), strings-1 = treble (right)
 * @param strings Number of strings
 * @param frets Number of frets
 * @param scaleTreble Scale length for treble side (RIGHT, thinner strings)
 * @param scaleBass Scale length for bass side (LEFT, thicker strings)
 * @param anchorFret Fret where all strings converge (typically 7-12)
 * @param stringSpanNut String spacing at nut
 * @param stringSpanBridge String spacing at bridge  
 * @param overhang Board overhang beyond strings
 * @param curvedExponent Interpolation curve (1.0=linear, >1.0=more fan)
 */
export function computeCurvedFretsRaw(
  strings: number,
  frets: number,
  scaleTreble: number,
  scaleBass: number,
  anchorFret: number,
  stringSpanNut: number,
  stringSpanBridge: number,
  overhang: number,
  curvedExponent: number
): CurvedFretRow[] {

  const { L, Li, dA, bL, cL, bR, cR } = commonCurvedParams(
    strings, scaleTreble, scaleBass, anchorFret,
    stringSpanNut, stringSpanBridge, overhang, curvedExponent
  )

  // VALIDATION: Ensure scaleBass affects bass side (left) and scaleTreble affects treble side (right)
  // Use constants to make expected behavior explicit
  const trebleStringScale = Li[TREBLE_STRING_INDEX(strings)]  // Should get scaleTreble
  const bassStringScale = Li[BASS_STRING_INDEX(strings)]      // Should get scaleBass
  
  if (Math.abs(curvedExponent - 1.0) < 0.01) { // Linear case - easiest to validate
    const tolerance = 0.01
    if (Math.abs(trebleStringScale - scaleTreble) > tolerance) {
  console.error(`❌ SCALE ASSIGNMENT BUG: Treble string (index ${TREBLE_STRING_INDEX(strings)}, RIGHT side) should get scaleTreble=${scaleTreble}, but got ${trebleStringScale}`)
    }
    if (Math.abs(bassStringScale - scaleBass) > tolerance) {
      console.error(`❌ SCALE ASSIGNMENT BUG: Bass string (index ${BASS_STRING_INDEX(strings)}, LEFT side) should get scaleBass=${scaleBass}, but got ${bassStringScale}`)
    }
  }
  
  // Exponent validation: higher exponent should create more spread
  if (strings > 1) {
    const spread = Math.abs(bassStringScale - trebleStringScale)
    const baseSpread = Math.abs(scaleBass - scaleTreble)
    if (curvedExponent > 1.0 && spread < baseSpread * 0.8) {
      console.warn(`⚠️ EXPONENT BUG: curvedExponent=${curvedExponent} > 1 should increase spread, but spread=${spread.toFixed(3)} < baseSpread=${baseSpread.toFixed(3)}`)
    }
  }

  const out: CurvedFretRow[] = []

  for (let n = 1; n <= frets; n++) {
    const ptsStrings: Array<{ x: number; y: number }> = []
    for (let i = 0; i < strings; i++) {
      const yA = dAtFret(Li[i], n) - dA[i]
      const t  = (yA + dA[i]) / Li[i]
      const x  = L.nutY[i] + t * (L.bridgeY[i] - L.nutY[i])
      ptsStrings.push({ x, y: yA })
    }

    // vasen reuna: kahden bassokielen (0 ja 1) paikallinen kulmakerroin
    let xL: number, yL: number
    if (strings >= 2) {
      const p0 = ptsStrings[0], p1 = ptsStrings[1]
      const m  = (p1.x !== p0.x) ? (p1.y - p0.y) / (p1.x - p0.x) : 0 // dy/dx
      const denom = (1 - bL * m)
      if (Math.abs(denom) < 1e-9) { yL = p0.y; xL = bL * yL + cL }
      else { xL = (bL * p0.y - bL * m * p0.x + cL) / denom; yL = p0.y + m * (xL - p0.x) }
    } else { yL = dAtFret(Li[0], n) - dA[0]; xL = bL * yL + cL }

    // oikea reuna: kahden diskanttikielen (N-2, N-1) paikallinen kulmakerroin
    let xR: number, yR: number
    if (strings >= 2) {
      const pN = ptsStrings[strings - 1], pN1 = ptsStrings[strings - 2]
      const m  = (pN.x !== pN1.x) ? (pN.y - pN1.y) / (pN.x - pN1.x) : 0
      const denom = (1 - bR * m)
      if (Math.abs(denom) < 1e-9) { yR = pN.y; xR = bR * yR + cR }
      else { xR = (bR * pN.y - bR * m * pN.x + cR) / denom; yR = pN.y + m * (xR - pN.x) }
    } else { yR = dAtFret(Li[0], n) - dA[0]; xR = bR * yR + cR }

    const ptsAll = [{ x: xL, y: yL }, ...ptsStrings, { x: xR, y: yR }].sort((a, b) => a.x - b.x)
    const straight = (n === anchorFret)

    out.push({ n, x_left: xL, y_left: yL, x_right: xR, y_right: yR, straight, pts: ptsAll })
  }

  return out
}

export function computeCurvedNutBridge(
  strings: number,
  scaleTreble: number,
  scaleBass: number,
  anchorFret: number,
  stringSpanNut: number,
  stringSpanBridge: number,
  overhang: number,
  curvedExponent: number
) {
  const { L, Li, dA, bL, cL, bR, cR } = commonCurvedParams(
    strings, scaleTreble, scaleBass, anchorFret,
    stringSpanNut, stringSpanBridge, overhang, curvedExponent
  )

  // NUT (t=0)
  const nutStrings = Array.from({ length: strings }, (_, i) => ({ x: L.nutY[i], y: -dA[i] }))
  let xLn: number, yLn: number, xRn: number, yRn: number
  if (strings >= 2) {
    const p0 = nutStrings[0], p1 = nutStrings[1]
    const m  = (p1.x !== p0.x) ? (p1.y - p0.y) / (p1.x - p0.x) : 0
    const denomL = (1 - bL * m)
    if (Math.abs(denomL) < 1e-9) { yLn = p0.y; xLn = bL * yLn + cL }
    else { xLn = (bL * p0.y - bL * m * p0.x + cL) / denomL; yLn = p0.y + m * (xLn - p0.x) }

    const pN = nutStrings[strings - 1], pN1 = nutStrings[strings - 2]
    const mR = (pN.x !== pN1.x) ? (pN.y - pN1.y) / (pN.x - pN1.x) : 0
    const denomR = (1 - bR * mR)
    if (Math.abs(denomR) < 1e-9) { yRn = pN.y; xRn = bR * yRn + cR }
    else { xRn = (bR * pN.y - bR * mR * pN.x + cR) / denomR; yRn = pN.y + mR * (xRn - pN.x) }
  } else {
    yLn = -dA[0]; xLn = bL * yLn + cL
    yRn = -dA[0]; xRn = bR * yRn + cR
  }
  const nutPts = [{ x: xLn, y: yLn }, ...nutStrings, { x: xRn, y: yRn }].sort((a, b) => a.x - b.x)

  // BRIDGE (t=1)
  const brStrings = Array.from({ length: strings }, (_, i) => ({ x: L.bridgeY[i], y: Li[i] - dA[i] }))
  let xLb: number, yLb: number, xRb: number, yRb: number
  if (strings >= 2) {
    const p0 = brStrings[0], p1 = brStrings[1]
    const m  = (p1.x !== p0.x) ? (p1.y - p0.y) / (p1.x - p0.x) : 0
    const denomL = (1 - bL * m)
    if (Math.abs(denomL) < 1e-9) { yLb = p0.y; xLb = bL * yLb + cL }
    else { xLb = (bL * p0.y - bL * m * p0.x + cL) / denomL; yLb = p0.y + m * (xLb - p0.x) }

    const pN = brStrings[strings - 1], pN1 = brStrings[strings - 2]
    const mR = (pN.x !== pN1.x) ? (pN.y - pN1.y) / (pN.x - pN1.x) : 0
    const denomR = (1 - bR * mR)
    if (Math.abs(denomR) < 1e-9) { yRb = pN.y; xRb = bR * yRb + cR }
    else { xRb = (bR * pN.y - bR * mR * pN.x + cR) / denomR; yRb = pN.y + mR * (xRb - pN.x) }
  } else {
    yLb = Li[0] - dA[0]; xLb = bL * yLb + cL
    yRb = Li[0] - dA[0]; xRb = bR * yRb + cR
  }
  const bridgePts = [{ x: xLb, y: yLb }, ...brStrings, { x: xRb, y: yRb }].sort((a, b) => a.x - b.x)

  return {
    L,
    nut:    { x_left: xLn, y_left: yLn, x_right: xRn, y_right: yRn, pts: nutPts },
    bridge: { x_left: xLb, y_left: yLb, x_right: xRb, y_right: yRb, pts: bridgePts }
  }
}

export function buildCurvedPreviewBox(
  strings: number, frets: number,
  scaleTreble: number, scaleBass: number, anchorFret: number,
  stringSpanNut: number, stringSpanBridge: number, overhang: number,
  curvedExponent: number
) {
  const arcs = computeCurvedFretsRaw(
    strings, frets, scaleTreble, scaleBass, anchorFret,
    stringSpanNut, stringSpanBridge, overhang, curvedExponent
  )
  const nb = computeCurvedNutBridge(
    strings, scaleTreble, scaleBass, anchorFret,
    stringSpanNut, stringSpanBridge, overhang, curvedExponent
  )
  const L = nb.L

  let minX = Math.min(L.edgeNut[0], L.edgeBridge[0])
  let maxX = Math.max(L.edgeNut[1], L.edgeBridge[1])
  let minY = Infinity, maxY = -Infinity
  const eat = (p:{x:number,y:number}) => { if (p.x<minX) minX=p.x; if (p.x>maxX) maxX=p.x; if (p.y<minY) minY=p.y; if (p.y>maxY) maxY=p.y }
  for (const a of arcs) a.pts.forEach(eat)
  nb.nut.pts.forEach(eat)
  nb.bridge.pts.forEach(eat)

  return { minX, maxX, minY, maxY, L, arcs }
}
