import React from 'react'
import guitarBlueprint from '../assets/landing-guitar.svg'
import '../styles/landing.css'

type Tool = 'fret' | 'gtr'

// Illustrative blueprint only; manufacturing geometry stays in the editor.
function FretDrawing() {
  const frets = [45, 100, 152, 201, 247, 290, 331, 370, 407, 442, 475, 506, 535, 563, 589, 614, 638, 660]
  return <g className="fret-drawing">
    <path className="board-outline" d="M236 0H308L338 700H202Z" />
    {Array.from({ length: 6 }, (_, i) => <path className="instrument-string" key={i} d={`M${243 + i * 11.6} 0L${213 + i * 22.8} 700`} />)}
    {frets.map(y => <path className="fret-wire" key={y} d={`M${236 - y * 34 / 700} ${y}H${308 + y * 30 / 700}`} />)}
    {[176, 268, 350, 425, 490, 577].map(y => <circle key={y} cx="271" cy={y} r="4" />)}
    <circle cx="250" cy="624" r="4" /><circle cx="291" cy="624" r="4" />
    <path className="dimension-line" d="M182 80V660m-6-580h12m-12 580h12M215 680H327m-112-6v12m112-12v12" />
  </g>
}

function GuitarDrawing() {
  return <g className="guitar-drawing">
    <image className="imported-guitar" href={guitarBlueprint} x="445" y="88" width="166" height="522" />
  </g>
}

function InstrumentSelector() {
  return <svg className="yin-yang-graphic" viewBox="0 0 720 720" aria-hidden="true">
    <defs>
      <clipPath id="fret-side"><path d="M360 24A336 336 0 0 0 360 696C280 610 230 500 360 360C410 260 490 160 360 24Z" /></clipPath>
      <clipPath id="gtr-side"><path d="M360 24A336 336 0 0 1 360 696C280 610 230 500 360 360C410 260 490 160 360 24Z" /></clipPath>
      <pattern id="blueprint-grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="currentColor" strokeWidth=".7" /></pattern>
    </defs>
    <g className="selector-half selector-fretboard" clipPath="url(#fret-side)">
      <rect className="half-wash" width="720" height="720" />
      <rect className="blueprint-grid" width="720" height="720" fill="url(#blueprint-grid)" />
      <FretDrawing />
    </g>
    <g className="selector-half selector-guitar" clipPath="url(#gtr-side)">
      <rect className="half-wash" width="720" height="720" />
      <rect className="blueprint-grid" width="720" height="720" fill="url(#blueprint-grid)" />
      <GuitarDrawing />
    </g>
    <path className="disc-ring disc-ring-fret" d="M360 24A336 336 0 0 0 360 696" />
    <path className="disc-ring disc-ring-gtr" d="M360 24A336 336 0 0 1 360 696" />
    <circle className="disc-guide" cx="360" cy="360" r="325" />
    <path className="yin-seam" d="M360 24C490 160 410 260 360 360C230 500 280 610 360 696" />
    <circle className="registration-dot" cx="380" cy="314" r="5" />
  </svg>
}

export default function LandingPage() {
  const [hoveredTool, setHoveredTool] = React.useState<Tool | null>(null)
  const [focusedTool, setFocusedTool] = React.useState<Tool | null>(null)
  const activeTool = focusedTool ?? hoveredTool
  const activate = (tool: Tool) => ({
    onPointerEnter: () => setHoveredTool(tool),
    onPointerLeave: () => setHoveredTool(null),
    onFocus: () => setFocusedTool(tool),
    onBlur: () => setFocusedTool(null),
  })

  return <main className="landing-page" data-active-tool={activeTool ?? 'idle'}>
    <div className="landing-backdrop" aria-hidden="true" />
    <div className="landing-screen" aria-hidden="true" />
    <div className="landing-scene-light" aria-hidden="true" />
    <aside className="landing-japan-strip" aria-hidden="true"><span>選択</span><span>設計</span><span>精度</span></aside>
    <header className="landing-header">
      <a className="landing-wordmark" href="/" aria-label="FretFactory home"><span>FRET</span><span>FACTORY</span></a>
      <p className="landing-chapter">CH. 01 — CHOOSE YOUR WORKSHOP</p>
    </header>
    <section className="landing-hero" aria-labelledby="landing-title">
      <div className="landing-copy">
        <p className="landing-eyebrow"><span lang="ja" aria-hidden="true">選択</span> SELECT</p>
        <h1 id="landing-title"><span>Design your</span>{' '}<span>dream</span>{' '}<span>instrument.</span></h1>
        <p className="landing-intro">Precision guitar-design tools for the workshop, from the fretboard outward.</p>
      </div>
      <div className="choice-stage" aria-hidden="true">
        <p className="technical-note note-scale">SCALE<br />648.0 mm<br />(25.5 in)</p>
        <InstrumentSelector />
        <p className="vertical-label vertical-fret">指板</p>
        <p className="technical-note note-contour">DESIGN<br />MEASURE<br />VISUALIZE<br />REALIZE</p>
      </div>
    </section>
    <section className="tool-choice-grid" aria-label="Available design tools">
      <a className="tool-card tool-card-fret" href="/fretboard" {...activate('fret')}>
        <div className="tool-card-shell">
          <svg className="card-thumbnail fret-thumbnail" viewBox="172 0 190 710" aria-hidden="true"><FretDrawing /></svg>
          <div className="tool-card-copy"><h2>FretFactory</h2><p>Shape the fretboard.</p></div>
          <span className="tool-cta">Open Fretboard Designer <b aria-hidden="true">→</b></span>
        </div>
      </a>
      <a className="tool-card tool-card-gtr" href="/gtrfactory/" {...activate('gtr')}>
        <div className="tool-card-shell">
          <svg className="card-thumbnail gtr-thumbnail" viewBox="438 68 190 558" aria-hidden="true"><GuitarDrawing /></svg>
          <div className="tool-card-copy"><h2>GTRFactory</h2><p>Shape the whole instrument.</p></div>
          <span className="tool-cta">Open Guitar Designer <b aria-hidden="true">→</b></span>
        </div>
      </a>
    </section>
  </main>
}
