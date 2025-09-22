import React, { useMemo, useState } from 'react'
import { DRAW_CONSTANTS, BG_STRING_COLOR } from '../utils/constants'
import { THEME } from '../utils/theme'
import { useIsMobile } from '../hooks/useIsMobile'
import { useAppState } from '../store.state'
import '../styles/ui.css'
import { buildBoard } from '../geom/build'
import type { BuildResult, DrawEl } from '../geom/build'
import { buildMarkers } from '../geom/markers'
// export bar moved to App above the preview
declare global { interface Window { FretFactory?: { curvature?: () => unknown } } }
declare const importMetaEnv: { DEV?: boolean }

export default function Preview() {
  const s = useAppState()
  const isMobile = useIsMobile(768)
  const PREVIEW_STROKE = '#ffffff'
  // 2D-only preview

  const built = useMemo<BuildResult>(() => {
    try { return buildBoard(s) } catch {
      const fallback: BuildResult = { els: [], viewW: 100, viewH: 100, sx: 0, sy: 0, helpers: {} }
      return fallback
    }
  }, [
  s.mode, s.scaleTreble, s.scaleBass, s.anchorFret, s.curvedExponent,
  s.strings, s.frets, s.stringSpanNut, s.stringSpanBridge, s.overhang, s.units,
  s.radiusNutIn, s.radiusBridgeIn,
  s.markerOffset, s.markerFrets, s.doubleAt12, s.double12Offset
  ])

  const markerEls = useMemo(() => {
    try { return buildMarkers(s, built) } catch (err) {
      console.error('[Preview] markers build error', err)
      return []
    }
  }, [s, built])

  // One-time migration: if markerFrets match the old defaults, switch to new defaults (start at 2–3)
  React.useEffect(() => {
    const oldList = [3,5,7,9,12,15,17,19,21]
    const newList = [2,4,6,8,11,14,16,18,20]
    const eq = (a:number[], b:number[]) => a.length === b.length && a.every((v,i)=>v===b[i])
    if (Array.isArray(s.markerFrets) && eq(s.markerFrets, oldList)) {
      useAppState.setState({ markerFrets: newList })
    }
  }, [s.markerFrets])

  // Dev: expose a curvature test on window (call in console: FretFactory.curvature())
  React.useEffect(() => {
    const isDev = typeof document !== 'undefined' && window?.location?.hostname === 'localhost'
    if (!isDev) return
  window.FretFactory = window.FretFactory || {}
  window.FretFactory.curvature = () => {
  const state = useAppState.getState()
      // radii are stored in inches; convert to mm for calculations
      const inchTo = (vIn:number)=> vIn * 25.4
      const Rn = inchTo(state.radiusNutIn ?? 12)
      const Rb = inchTo(state.radiusBridgeIn ?? 16)
      const eps = 1e-4
      const base = buildBoard(state)
  const result = { radiusNutIn: state.radiusNutIn, radiusBridgeIn: state.radiusBridgeIn }
      const sagCircle = (x:number, xc:number, R:number) => {
        const xx = x - xc
        const disc = Math.max(0, R*R - xx*xx)
        return -(R - Math.sqrt(disc))
      }
  if (state.mode === 'curved' && base.helpers.curved) {
        const { nb } = base.helpers.curved
        const yNutL = nb.nut.pts[0].y, yBrL = nb.bridge.pts[0].y
        const yNutR = nb.nut.pts[nb.nut.pts.length-1].y, yBrR = nb.bridge.pts[nb.bridge.pts.length-1].y
        const y = (yNutL + yBrL) / 2
        const xLeftAtY = (yy: number) => {
          const t = (yy - yNutL) / Math.max(1e-6, yBrL - yNutL)
          return nb.L.edgeNut[0] + t * (nb.L.edgeBridge[0] - nb.L.edgeNut[0])
        }
        const xRightAtY = (yy: number) => {
          const t = (yy - yNutR) / Math.max(1e-6, yBrR - yNutR)
          return nb.L.edgeNut[1] + t * (nb.L.edgeBridge[1] - nb.L.edgeNut[1])
        }
        const xl = xLeftAtY(y), xr = xRightAtY(y)
        const w = Math.abs(xr - xl)
        const xc = (xl + xr) / 2
        const t = (y - yNutL) / Math.max(1e-6, yBrL - yNutL)
        const R = Rn + t * (Rb - Rn)
        const zL = sagCircle(xl, xc, R)
        const zC = sagCircle(xc, xc, R)
        const zR = sagCircle(xr, xc, R)
        const sagAbs = Math.max(Math.abs(zL - zC), Math.abs(zR - zC))
        return { ...result, ok:true, mode:'curved', y, width:w, R, z:{ left:zL, center:zC, right:zR }, sagAbs, curved: sagAbs > eps }
      }
      return { ...result, ok:false, msg:'no helpers' }
    }
  }, [s.mode, s.units, s.radiusNutIn, s.radiusBridgeIn])

  // ---- zoom & pan: HIDASTETTU 50 % ----
  const [zoom, setZoom] = useState(1)
  const [pan, setPan]   = useState({ x: 0, y: 0 })
  const [drag, setDrag] = useState<{x:number;y:number}|null>(null)
  // no 3D rotation drag

  const clamp = (v:number,min:number,max:number)=>Math.max(min,Math.min(max,v))

  // Puolta maltillisempi zoom: 0.95 / 1.05 (ennen 0.9 / 1.1)
  const wheel: React.WheelEventHandler<SVGSVGElement> = (e) => {
    e.preventDefault()
    setZoom(z => clamp(z * (e.deltaY > 0 ? 0.95 : 1.05), 0.2, 6))
  }

  const md: React.MouseEventHandler<SVGSVGElement> = (e) => {
    if (e.button !== 0) return
    setDrag({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  // Hidastetaan panningia: 50 % liikkeestä
  const mm: React.MouseEventHandler<SVGSVGElement> = (e) => {
    if (!drag) return
    setPan({ x: (e.clientX - drag.x) * 0.5, y: (e.clientY - drag.y) * 0.5 })
  }
  // Perus touch-pan (yksi sormi)
  const [touchStart, setTouchStart] = useState<{x:number;y:number}|null>(null)
  const onTouchStart: React.TouchEventHandler<SVGSVGElement> = (e) => {
    const t = e.touches[0]
    if (!t) return
    setTouchStart({ x: t.clientX - pan.x, y: t.clientY - pan.y })
  }
  const onTouchMove: React.TouchEventHandler<SVGSVGElement> = (e) => {
    const t = e.touches[0]
    if (!t) return
    if (!touchStart) return
    setPan({ x: (t.clientX - touchStart.x) * 0.5, y: (t.clientY - touchStart.y) * 0.5 })
  }
  const onTouchEnd: React.TouchEventHandler<SVGSVGElement> = () => { setTouchStart(null) }
  const mu: React.MouseEventHandler<SVGSVGElement> = () => { setDrag(null) }
  const ml: React.MouseEventHandler<SVGSVGElement> = () => { setDrag(null) }

  const key: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === '+') setZoom(z => clamp(z*1.05, 0.2, 6)) // hitaampi
    if (e.key === '-') setZoom(z => clamp(z/1.05, 0.2, 6))
  if (e.key === '0') { setZoom(1); setPan({x:0,y:0}) }
  }

  return (
  <div tabIndex={0} onKeyDown={key} className="card preview-card">
      <div className="grid-gap6 mb-6">
        <div className="justify-between">
          <div className="align-center">
            <label className="label-dark">Preview (2D)</label>
          </div>
          <div>
            <button className="btn btn-mr" title="Zoom out" onClick={() => setZoom(z => clamp(z/1.05, 0.2, 6))}>−</button>
            <button className="btn btn-mr" title="Zoom in" onClick={() => setZoom(z => clamp(z*1.05, 0.2, 6))}>+</button>
            <button className="btn" title="Reset view" onClick={() => { setZoom(1); setPan({x:0,y:0}) }}>reset</button>
          </div>
        </div>
      </div>

  <svg
    width="100%"
    height={isMobile ? '50vh' : '63vh'}
    viewBox={`0 0 ${built.viewW} ${built.viewH}`}
    preserveAspectRatio="xMidYMid meet"
    className={`svg-canvas ${drag ? 'grabbing' : 'grab'}`}
    onWheel={wheel} onMouseDown={md} onMouseMove={mm} onMouseUp={mu} onMouseLeave={ml}
    onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
  >
        <g transform={`translate(${built.sx}, ${built.sy})`}>
          <g transform={`translate(${pan.x/zoom}, ${pan.y/zoom}) scale(${zoom})`}>
            {built.els.map((el: DrawEl, i) => {
              if (el.kind === 'line') {
                return (
                  <line key={i} x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2}
                    stroke={PREVIEW_STROKE} fill="none"
                    vectorEffect="non-scaling-stroke" shapeRendering="geometricPrecision"
                    strokeWidth={el.w}
                    strokeLinecap="butt" />
                )
              }
              if (el.kind === 'path') {
                return (
                  <path key={i} d={el.d}
                    stroke={PREVIEW_STROKE} fill="none"
                    vectorEffect="non-scaling-stroke" shapeRendering="geometricPrecision"
                    strokeWidth={el.w}
                    strokeLinecap="butt" />
                )
              }
              if (el.kind === 'poly') {
                return (
                  <polygon key={i} points={el.pts.map((p)=>`${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke={PREVIEW_STROKE}
                    vectorEffect="non-scaling-stroke" shapeRendering="geometricPrecision"
                    strokeWidth={el.w ?? undefined} />
                )
              }
              return null
            })}

            {markerEls.map((el, i) => {
              if (el.kind==='line') {
                return (
                  <line key={`m-${i}`} x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2}
                    stroke={PREVIEW_STROKE} fill="none"
                    vectorEffect="non-scaling-stroke" shapeRendering="geometricPrecision"
                    strokeWidth={el.w}
                    strokeLinecap="butt" />
                )
              }
              if (el.kind==='path') {
                return (
                  <path key={`m-${i}`} d={el.d}
                    stroke={PREVIEW_STROKE} fill="none"
                    vectorEffect="non-scaling-stroke" shapeRendering="geometricPrecision"
                    strokeWidth={el.w}
                    strokeLinecap="butt" />
                )
              }
              return null
            })}
            {/* All preview text removed intentionally */}
          </g>
        </g>
      </svg>
      

  {/* Hint caption removed intentionally */}
    </div>
  )
}
