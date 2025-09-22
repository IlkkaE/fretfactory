import React from 'react'
import './styles/ui.css'
import { useIsMobile } from './hooks/useIsMobile'
import Preview from './components/Preview'
import Background from './components/Background'
import ExportGrid from './components/ExportGrid'
import PresetMenu from './components/PresetMenu'
import Controls from './components/Controls'
import AdsenseBlock from './components/Adsense'

export default function App() {
  const isMobile = useIsMobile(768)
  // Ensure window/tab title reflects the new app name even during HMR
  React.useEffect(() => { try { document.title = 'FretFactory' } catch {} }, [])
  return (
    <div className="app-root">
      {/* animated paper.js background */}
      <Background />
  {/* DevGui removed; using new Controls panel */}
      {/* Two-column desktop: left = preset+controls+export, right = preview */}
      <div className={`app-grid ${isMobile ? 'cols-1 pad-8' : 'cols-2 pad-16'}` }>
        {/* LEFT COLUMN */}
  <div className="grid-1">
          <PresetMenu />
          <Controls />
          <ExportGrid />
        </div>
        {/* RIGHT COLUMN */}
        <div>
          <Preview />
          {/* Advertising (optional): render only if VITE_GADS_PUBLISHER_ID is set */}
          {import.meta.env.VITE_GADS_PUBLISHER_ID ? (
            <div className="mt-8 ad-card">
              <AdsenseBlock />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
