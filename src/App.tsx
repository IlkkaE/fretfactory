import React from 'react'
import './styles/ui.css'
import Preview from './components/Preview'
import Background from './components/Background'
import ExportGrid from './components/ExportGrid'
import PresetMenu from './components/PresetMenu'
import Controls, { MarkerControls, NutCompensationControls } from './components/Controls'
import AdsenseBlock from './components/Adsense'
import UnitSelector from './components/UnitSelector'
import StringAdvisor from './components/StringAdvisor'

export default function App() {
  // Ensure window/tab title reflects the new app name even during HMR
  React.useEffect(() => { try { document.title = 'FretFactory' } catch {} }, [])
  return (
    <div className="app-root">
      {/* animated paper.js background */}
      <Background />
  {/* DevGui removed; using new Controls panel */}
      <div className="app-grid">
        <div className="owner-credit" aria-label="Sivuston omistaja">
          @ilkka
        </div>
        <main className="panel-grid">
          <div className="panel-settings">
            <div className="panel-primary">
              <div className="panel-quick">
                <section className="panel-slot panel-units panel-geometry" aria-label="Measurement unit">
                  <UnitSelector />
                </section>
                <section className="panel-slot panel-preset panel-geometry" aria-label="Instrument preset">
                  <PresetMenu />
                </section>
                <section className="panel-slot panel-export panel-output" aria-label="Export options">
                  <ExportGrid />
                </section>
              </div>
              <section className="panel-slot panel-controls panel-geometry" aria-label="Fretboard settings">
                <Controls />
              </section>
            </div>
            <div className="panel-secondary">
              <section className="panel-slot panel-compensation panel-geometry" aria-label="Nut compensation settings">
                <NutCompensationControls />
              </section>
              <section className="panel-slot panel-markers panel-geometry" aria-label="Fretboard marker settings">
                <MarkerControls />
              </section>
            </div>
          </div>
          <section className="panel-slot panel-preview panel-output" aria-label="Fretboard preview">
            <Preview />
            {/* Advertising (optional): render only if VITE_GADS_PUBLISHER_ID is set */}
            {import.meta.env.VITE_GADS_PUBLISHER_ID ? (
              <div className="mt-8 ad-card">
                <AdsenseBlock />
              </div>
            ) : null}
          </section>
          <section className="panel-slot panel-string-advisor panel-strings" aria-label="String selection">
            <StringAdvisor />
          </section>
        </main>
      </div>
    </div>
  )
}
