// src/geom/pchip.ts
// Monotoniikkaa säilyttävä PCHIP (Fritsch–Carlson) ja muunto cubic Bézier -poluksi (SVG).

export type Pt = { x: number; y: number }

/** Varmista, että x-arvot kasvavat tiukasti. */
function isStrictlyIncreasing(xs: number[]): boolean {
  for (let i = 1; i < xs.length; i++) if (!(xs[i] > xs[i - 1])) return false
  return true
}

/** Laske PCHIP-kaltevuudet (m[i]) Fritsch–Carlson -algoritmilla. */
function pchipSlopes(xs: number[], ys: number[]): number[] {
  const n = xs.length
  if (n < 2) return new Array(n).fill(0)

  const h: number[] = new Array(n - 1)
  const delta: number[] = new Array(n - 1)
  for (let i = 0; i < n - 1; i++) {
    h[i] = xs[i + 1] - xs[i]
    delta[i] = (ys[i + 1] - ys[i]) / h[i]
  }

  const m = new Array(n).fill(0)

  // Sisäpisteiden kaltevuudet
  for (let i = 1; i <= n - 2; i++) {
    const d1 = delta[i - 1]
    const d2 = delta[i]
    if (d1 === 0 || d2 === 0 || Math.sign(d1) !== Math.sign(d2)) m[i] = 0
    else {
      const w1 = 2 * h[i] + h[i - 1]
      const w2 = h[i] + 2 * h[i - 1]
      m[i] = (w1 + w2) / (w1 / d1 + w2 / d2) // harmoninen painotettu keskiarvo
    }
  }

  // Päät (Fritsch–Butland -tyyliin)
  m[0] = delta[0]
  if (n > 2) {
    if (Math.sign(m[0]) !== Math.sign(delta[1])) m[0] = 0
    else if (Math.abs(m[0]) > 2 * Math.abs(delta[1])) m[0] = 2 * delta[1]
  }

  m[n - 1] = delta[n - 2]
  if (n > 2) {
    if (Math.sign(m[n - 1]) !== Math.sign(delta[n - 3])) m[n - 1] = 0
    else if (Math.abs(m[n - 1]) > 2 * Math.abs(delta[n - 3])) m[n - 1] = 2 * delta[n - 3]
  }

  return m
}

/** Hermite-segmentti → cubic Bézier -kontrollipisteet. */
function hermiteToBezier(p0: Pt, p1: Pt, m0: number, m1: number): [Pt, Pt] {
  const h = p1.x - p0.x
  return [
    { x: p0.x + h / 3, y: p0.y + (m0 * h) / 3 },
    { x: p1.x - h / 3, y: p1.y - (m1 * h) / 3 },
  ]
}

/**
 * Luo SVG path -merkkijono PCHIP-käyrästä.
 * Jos x ei kasva tiukasti, fallback polylineen.
 */
export function pchipToBezierPath(points: Pt[]): string {
  if (!points || points.length === 0) return ''
  if (points.length === 1) {
    const p = points[0]
    return `M ${p.x} ${p.y}`
  }

  const xs = points.map(p => p.x)
  const ys = points.map(p => p.y)

  if (!isStrictlyIncreasing(xs)) {
    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) d += ` L ${points[i].x} ${points[i].y}`
    return d
  }

  const m = pchipSlopes(xs, ys)

  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i]
    const p1 = points[i + 1]
    const [c1, c2] = hermiteToBezier(p0, p1, m[i], m[i + 1])
    d += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p1.x} ${p1.y}`
  }
  return d
}

/** Sama kuin pchipToBezierPath, mutta palauttaa cubic Bézier -segmentit. */
export function pchipToBezierSegments(points: Pt[]): Array<{ p0: Pt; c1: Pt; c2: Pt; p1: Pt }>{
  const out: Array<{ p0: Pt; c1: Pt; c2: Pt; p1: Pt }> = []
  if (!points || points.length < 2) return out

  const xs = points.map(p => p.x)
  const ys = points.map(p => p.y)

  if (!isStrictlyIncreasing(xs)) {
    // Fallback: treat as straight segments
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i]
      const p1 = points[i + 1]
      out.push({ p0, c1: { ...p0 }, c2: { ...p1 }, p1 })
    }
    return out
  }

  const m = pchipSlopes(xs, ys)
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i]
    const p1 = points[i + 1]
    const [c1, c2] = hermiteToBezier(p0, p1, m[i], m[i + 1])
    out.push({ p0, c1, c2, p1 })
  }
  return out
}

/** Apuri: tee pisteet taulukoista ja palauta path. */
export function pchipPathFromXY(x: number[], y: number[]): string {
  if (!x || !y || x.length !== y.length) return ''
  const pts: Pt[] = x.map((xi, i) => ({ x: xi, y: y[i] }))
  return pchipToBezierPath(pts)
}

// Salli myös default-import
export default pchipToBezierPath
