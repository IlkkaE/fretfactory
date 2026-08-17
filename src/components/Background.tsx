import React, { useEffect, useRef } from 'react'
import '../styles/ui.css'
import { BG_STRING_COLOR } from '../utils/constants'

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let disposed = false
    let paperMod: any
    let strings: any
    let onMouseMove: ((ev: MouseEvent) => void) | null = null
    let onVisibilityChange: (() => void) | null = null
    let mouseFrame = 0
    let pendingMouse: { x: number; y: number } | null = null

    const setupCanvasSize = (paper: any, canvas: HTMLCanvasElement) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = window.innerWidth
      const h = window.innerHeight
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr)
        canvas.height = Math.floor(h * dpr)
      }
      if (canvas.style.width !== `${w}px`) canvas.style.width = `${w}px`
      if (canvas.style.height !== `${h}px`) canvas.style.height = `${h}px`
      paper.view.viewSize = new paper.Size(w, h)
    }

    const init = async () => {
      try {
        const mod = await import('paper/dist/paper-full')
        if (disposed) return
        paperMod = mod.default ?? (mod as any)
        const canvas = canvasRef.current!
        paperMod.setup(canvas)
        setupCanvasSize(paperMod, canvas)

        strings = new paperMod.Group()
        const N = 6
        const gap = 18
        for (let i = 0; i < N; i++) {
          const y = paperMod.view.center.y + (i - (N - 1) / 2) * gap
          const p = new paperMod.Path({
            strokeColor: new paperMod.Color(BG_STRING_COLOR),
            strokeWidth: 2 + (N - i) * 0.3,
            opacity: 0.7
          })
          p.add(new paperMod.Point(0, y))
          p.add(new paperMod.Point(paperMod.view.size.width / 2, y))
          p.add(new paperMod.Point(paperMod.view.size.width, y))
          ;(p as any).data = { baseY: y, offset: 6 + (N - i) * 0.4 }
          strings.addChild(p)
        }

        const pluck = (pt: any) => {
          const hit = strings.hitTest(pt, { stroke: true, tolerance: 12 } as any)
          if (hit && (hit as any).item) (hit as any).item.data.offset = 8
        }

        onMouseMove = (ev: MouseEvent) => {
          pendingMouse = { x: ev.clientX, y: ev.clientY }
          if (mouseFrame) return
          mouseFrame = window.requestAnimationFrame(() => {
            mouseFrame = 0
            if (!pendingMouse || disposed || document.hidden) return
            const pt = new paperMod.Point(pendingMouse.x, pendingMouse.y)
            pendingMouse = null
            pluck(paperMod.view.viewToProject(pt))
          })
        }

        const onFrame = (event: any) => {
          for (let i = 0; i < strings.children.length; i++) {
            const s = strings.children[i] as any
            const freq = 2 + i * 0.3
            const offset = (s as any).data.offset as number
            if (offset < 0.02) {
              s.segments[1].point.y = (s as any).data.baseY
              ;(s as any).data.offset = 0
              continue
            }
            const dy = Math.sin((event.time as number) * freq) * offset
            s.segments[1].point.y = (s as any).data.baseY + dy
            s.smooth()
            ;(s as any).data.offset = offset * 0.96
          }
        }

        const onResize = () => {
          const c = canvasRef.current!
          setupCanvasSize(paperMod, c)
          for (let i = 0; i < strings.children.length; i++) {
            const s = strings.children[i] as any
            s.segments[0].point.x = 0
            s.segments[1].point.x = paperMod.view.size.width / 2
            s.segments[2].point.x = paperMod.view.size.width
          }
        }

        paperMod.view.onFrame = onFrame as any
        paperMod.view.onResize = onResize as any
        onVisibilityChange = () => {
          paperMod.view.onFrame = document.hidden ? null : onFrame
          if (!document.hidden) paperMod.view.requestUpdate()
        }
        window.addEventListener('mousemove', onMouseMove, { passive: true })
        document.addEventListener('visibilitychange', onVisibilityChange)
        onResize()
      } catch (err) {
        console.error('Paper background init failed:', err)
      }
    }

    const cleanup = () => {
      try { if (paperMod) { paperMod.view.onFrame = null as any; paperMod.view.onResize = null as any } } catch {}
      if (mouseFrame) window.cancelAnimationFrame(mouseFrame)
      try { paperMod?.project?.activeLayer?.removeChildren() } catch {}
      try { paperMod?.project?.remove?.() } catch {}
      try { if (onMouseMove) window.removeEventListener('mousemove', onMouseMove) } catch {}
      try { if (onVisibilityChange) document.removeEventListener('visibilitychange', onVisibilityChange) } catch {}
    }

    init()
    return () => { disposed = true; cleanup() }
  }, [])

  return (
    <div className="bg-fixed">
      {/* Background image layer (slightly lightened) */}
  <div aria-hidden className="abs-fill bg-rock" />
      {/* Animated strings canvas on top */}
      <canvas ref={canvasRef} id="bg" className="abs-fill" />
    </div>
  )
}
