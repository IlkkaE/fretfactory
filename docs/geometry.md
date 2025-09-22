# FretFactory Geometry Guide

This document explains how scale lengths, string layout, and fret positions are computed in this project, including how curved (fan) frets are modeled. All units in the UI are millimeters (mm) unless noted. Code references point to files under `src/geom` and related utils.

## 1) String layout and board edges

Inputs:
- strings: number of strings
- stringSpanNut (mm): E–E distance at the nut between outer strings
- stringSpanBridge (mm): E–E distance at the bridge between outer strings
- overhang (mm): margin on each side beyond the outer strings

Computation (see `geom/core.ts:computeStringLayout`):
- Board widths at nut/bridge: `boardNut = stringSpanNut + 2*overhang`, `boardBr = stringSpanBridge + 2*overhang`.
- Edge X-coordinates (left/right): `edgeNut = [-boardNut/2, boardNut/2]`, `edgeBridge = [-boardBr/2, boardBr/2]`.
- String anchor X-positions at nut/bridge:
  - `nutStart = edgeNut[0] + overhang`, `brStart = edgeBridge[0] + overhang`
  - For each string index `i` in `[0..strings-1]`, with `t = i/(strings-1)`:
    - `nutY[i] = nutStart + stringSpanNut * t`
    - `bridgeY[i] = brStart + stringSpanBridge * t`

Notes:
- Indexing: `i=0` is the bass-most (left) string; `i=strings-1` is the treble-most (right).
- Overhang expands the board edges but does not change the E–E spacing.

## 2) Curved (fan) scale lengths per string

Inputs:
- scaleBass (mm), scaleTreble (mm): target scale lengths for bass (left) and treble (right)
- curvedExponent (>= 0.01): controls how the per-string scale transitions from bass to treble

Computation (see `geom/curved.ts:commonCurvedParams`):
- Interpolate in log-space to preserve geometric ratios across strings:
  - `logB = ln(scaleBass)`, `logT = ln(scaleTreble)`
  - For string `i`, let `u = i/(strings-1)` and `uu = 1 - (1 - u)^k` where `k = max(0.01, curvedExponent)`.
  - `Li[i] = exp(logB + (logT - logB) * uu)`

Properties:
- `k = 1` gives linear interpolation in log-space (standard multi-scale).
- `k > 1` biases the transition so bass side changes faster (more “fan”).

## 3) Fret positions along a given string (12-TET)

Given a string scale `L` and fret number `n` (1-based), the distance from the nut to fret `n` is:
- `dAtFret(L, n) = L - L / 2^(n/12)` (see `geom/curved.ts`)

For the anchor fret `A = anchorFret`, we precompute for each string i:
- `dA[i] = Li[i] - Li[i] / 2^(A/12)`

We use a coordinate system where the X-axis follows the E–E direction (left↔right) and the Y-axis follows “nut→bridge” along each string.

At fret n, for string i, the local point is:
- `y = dAtFret(Li[i], n) - dA[i]`
- `t = (y + dA[i]) / Li[i]` (normalized 0..1 from nut to bridge)
- `x = nutY[i] + t * (bridgeY[i] - nutY[i])`

This yields `ptsStrings[i] = { x, y }` for all strings. See `computeCurvedFretsRaw`.

## 4) Board edges and anchor alignment

We build left/right board edge lines that pass through the anchor fret on bass/treble scales:
- For bass edge (left) using scale `scaleBass`:
  - Anchor offset `dAb = scaleBass - scaleBass / 2^(A/12)`
  - Points: `leftA = (x = edgeNut[0], y = -dAb)`, `leftB = (x = edgeBridge[0], y = scaleBass - dAb)`
  - Edge line in form `x = bL * y + cL`.
- For treble edge (right) using `scaleTreble` similarly to get `x = bR * y + cR`.

At any fret, we extend the fret curve on both ends to intersect these edges. This ensures the nut/bridge and all frets line up at the `anchorFret` across strings.

Implementation detail (see `computeCurvedFretsRaw`): use the local slope from adjacent strings to find the intersection `(xL,yL)` with left edge and `(xR,yR)` with right edge, falling back to direct substitution when slope is degenerate.

## 5) Curved fret geometry and output

For each fret `n`, we construct a polyline through:
- Left edge intersection → all per-string points `{x,y}` from bass to treble → right edge intersection.
We then convert this polyline to a smoothed path using `pchipToBezierPath` (monotone Piecewise Cubic Hermite) for stable curvature in preview/export.

Outputs (`geom/build.ts`):
- buildBoard returns `DrawEl[]` containing strings, edges, curved frets, nut, and bridge, plus helpers with `yAtX` for evaluating curves.

## 6) “Marker” positions (center crosses between frets)

Markers are defined in terms of gaps (n = gap between frets n and n+1; 0 = nut–1st gap). For gap n, we:
- Take frets `a = rows[n]` and `b = rows[n+1]` (their polylines).
- For a set of sample X positions in the common X-interval of `a` and `b`, compute the mid-curve point `yG(x) = 0.5*(y_a(x) + y_b(x))` using `yAtX`.
- Optionally draw the “ghost” mid-curve.
- Find `x*` where the mid-curve is closest to the midline `xCenter(y) = 0.5*(xLeftAtY(y) + xRightAtY(y))`; place a cross of radius = `markerSize/2` at `(x* + markerOffset, y*)`.

Double at 12th: if enabled, skip the single cross in gap 12 and draw two crosses centered at `xCenter(y)` separated by `±double12Offset` in X.

See `geom/markers.ts` and usage in preview/export.

## 7) Code examples

### 7.1 Compute per-string scales (mm)
```ts
import { /* internal */ } from 'src/geom/curved'
// Sketch: given bass/treble scales, exponent k, and string count
const strings = 6
const scaleBass = 660.4 // mm
const scaleTreble = 647.7 // mm
const k = 1.0
const logB = Math.log(scaleBass)
const logT = Math.log(scaleTreble)
const Li: number[] = []
for (let i = 0; i < strings; i++) {
  const u = strings === 1 ? 0 : i / (strings - 1)
  const uu = 1 - Math.pow(1 - u, Math.max(0.01, k))
  Li[i] = Math.exp(logB + (logT - logB) * uu)
}
```

### 7.2 Distance to fret n on a given string
```ts
function dAtFret(L: number, n: number) {
  return L - L / Math.pow(2, n / 12)
}
const L = 647.7
const n = 12
const d = dAtFret(L, n) // ~ L/2 (12th)
```

### 7.3 Map a point along a string into (x,y)
```ts
import { computeStringLayout } from 'src/geom/core'
const Lstr = 647.7
const anchor = 12
const layout = computeStringLayout(6, 35.8, 49.8, 3.0)
const i = 5 // treble-most
const dA = Lstr - Lstr / Math.pow(2, anchor / 12)
const y = dAtFret(Lstr, 5) - dA
const t = (y + dA) / Lstr
const x = layout.nutY[i] + t * (layout.bridgeY[i] - layout.nutY[i])
```

### 7.4 Build one curved fret polyline and smooth to Bezier path
```ts
import { computeCurvedFretsRaw } from 'src/geom/curved'
import pchipToBezierPath from 'src/geom/pchip'
const rows = computeCurvedFretsRaw(6, 22, 647.7, 660.4, 12, 35.8, 49.8, 3.0, 1.0)
const fret12 = rows.find(r => r.n === 12)!
const d = pchipToBezierPath(fret12.pts) // SVG path data for a smooth curve
```

### 7.5 Find marker center on a curved gap
```ts
import { buildCurvedPreviewBox } from 'src/geom/curved'
const { arcs, nb, L } = buildCurvedPreviewBox(6, 22, 647.7, 660.4, 12, 35.8, 49.8, 3.0, 1.0)
const yAtX = (pts: {x:number;y:number}[], x:number) => {
  // …see src/geom/build.ts (binary search + lerp)
}
const gap = 12 // between 12 and 13
const a = arcs[gap], b = arcs[gap+1]
// sample common X, compute mid-curve and choose closest to xCenter(y)
```

## 8) Edge cases and validation
- Single-string instruments: layout collapses to center; edge intersections use direct substitution.
- curvedExponent→1: scales match ends closely; warnings logged if spread is inconsistent.
- Frets indexing: n is 1..frets for fret numbers; marker gaps use 0..frets-1.
- Units: Internally mm; PDF tiling uses mm units; marker size and offsets are in mm.

## 9) Where to look in code
- `geom/core.ts`: string layout and edges.
- `geom/curved.ts`: per-string scales, curved frets, nut/bridge arcs, preview box.
- `geom/build.ts`: building preview elements and helper `yAtX`.
- `geom/markers.ts`: marker geometry and ghost mid-curves.
- `utils/exporters.ts` and `components/Exports.tsx`: export logic and marker rendering.
