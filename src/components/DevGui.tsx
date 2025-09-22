import React, { useEffect } from 'react'
import { useAppState } from '../store.state'
import { THEME } from '../utils/theme'

export default function DevGui() {
  useEffect(() => {
    let gui: any
    const init = async () => {
      try {
        const mod = await import('lil-gui')
        const { GUI } = mod as any
  gui = new GUI({ width: 300, title: 'FretFactory (dev gui)' })
        // Move the panel to the left side of the screen
        const el: HTMLElement | undefined = (gui as any)?.domElement
        if (el) {
          el.style.position = 'fixed'
          el.style.left = '12px'
          el.style.right = 'auto'
          el.style.top = '12px'
          el.style.zIndex = '20'
          // Apply themed panel background and colors
          const PANEL_BG = THEME.panelBgAlphaDev
          const PANEL_BORDER = THEME.panelBorder
          const PANEL_TEXT = '#e6fffb'
          el.style.background = PANEL_BG
          el.style.border = `1px solid ${PANEL_BORDER}`
          el.style.color = PANEL_TEXT
          ;(el.style as any).backdropFilter = 'blur(2px)'
          ;(el.style as any).WebkitBackdropFilter = 'blur(2px)'
          // Global CSS override for lil-gui internals
          const styleId = 'lil-gui-site-theme'
          let style = document.getElementById(styleId) as HTMLStyleElement | null
          if (!style) {
            style = document.createElement('style')
            style.id = styleId
            document.head.appendChild(style)
          }
          style.textContent = `
              .lil-gui { background:${PANEL_BG} !important; color:${PANEL_TEXT} !important; box-shadow:none !important; border:1px solid ${PANEL_BORDER} !important; }
              .lil-gui .title, .lil-gui .folder .title { background:${PANEL_BG} !important; color:${PANEL_TEXT} !important; border-bottom:1px solid ${PANEL_BORDER} !important; }
              .lil-gui .controller, .lil-gui .name, .lil-gui .display { color:${PANEL_TEXT} !important; }
              .lil-gui .children { border-top:1px solid ${PANEL_BORDER} !important; }
              /* default inputs: high-contrast on light bg */
              .lil-gui input,
              .lil-gui textarea,
              .lil-gui .controller input,
              .lil-gui .controller .widget input {
                background:#ffffff !important;
                color:#0b3a3a !important;
                -webkit-text-fill-color:#0b3a3a !important;
                border:1px solid ${PANEL_BORDER} !important;
              }
              /* Selects: dark bg for options, readable foreground */
              .lil-gui select,
              .lil-gui .controller select,
              .lil-gui .controller .widget select {
                background:#0f2e2e !important;
                color:#cfe8ff !important;
                -webkit-text-fill-color:#cfe8ff !important;
                border:1px solid ${PANEL_BORDER} !important;
              }
              .lil-gui select option,
              .lil-gui .controller select option,
              .lil-gui .controller .widget select option {
                background:#0f2e2e !important;
                color:#cfe8ff !important;
              }
            `
        }

  const s = useAppState.getState()
  const set = useAppState.setState

  const optsUnits = { mm: 'mm' }

  const fGeneral = gui.addFolder('General')
  fGeneral.add(s, 'strings', 1, 12, 1).onChange((v: number) => set({ strings: Math.trunc(v) }))
  fGeneral.add(s, 'frets', 1, 30, 1).onChange((v: number) => set({ frets: Math.trunc(v) }))
  fGeneral.add(s, 'units', optsUnits).onChange((_v: 'mm') => set({ units: 'mm' }))

  const fCurved = gui.addFolder('Curved')
  fCurved.add(s, 'scaleTreble', 200, 900, 0.1).name('Scale Treble (mm)').onChange((v: number) => set({ scaleTreble: v }))
  fCurved.add(s, 'scaleBass', 200, 900, 0.1).name('Scale Bass (mm)').onChange((v: number) => set({ scaleBass: v }))
        fCurved.add(s, 'anchorFret', 0, 24, 1).onChange((v: number) => set({ anchorFret: Math.trunc(v) }))
        fCurved.add(s, 'curvedExponent', 0.1, 3, 0.01).onChange((v: number) => set({ curvedExponent: v }))

        const fDims = gui.addFolder('Dimensions')
        fDims.add(s, 'stringSpanNut', 0, 100, 0.01).onChange((v: number) => set({ stringSpanNut: v }))
        fDims.add(s, 'stringSpanBridge', 0, 120, 0.01).onChange((v: number) => set({ stringSpanBridge: v }))
        fDims.add(s, 'overhang', 0, 20, 0.01).onChange((v: number) => set({ overhang: v }))

        const fMarkers = gui.addFolder('Markers')
        fMarkers.add(s, 'markerOffset', -20, 20, 0.01).onChange((v: number) => set({ markerOffset: v }))
        fMarkers.add(s, 'doubleAt12').onChange((v: boolean) => set({ doubleAt12: v }))
        fMarkers.add(s, 'double12Offset', 0, 20, 0.01).onChange((v: number) => set({ double12Offset: v }))

  // Export section removed; export buttons are shown under the control panel in ExportGrid

        gui.close() // start collapsed
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('DevGui init failed', e)
      }
    }
    init()
    return () => { try { gui?.destroy?.() } catch {} }
  }, [])
  return null
}
