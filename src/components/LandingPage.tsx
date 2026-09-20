import React from 'react'
import guitarBlueprint from '../assets/landing-guitar.svg'
import '../styles/landing.css'

type Tool = 'fret' | 'gtr' | 'wire'

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

// Esquema decorativo: no representa un circuito listo para construir.
function WireDrawing() {
  return <g className="wire-drawing">
    <rect x="228" y="465" width="94" height="42" rx="8" />
    <rect x="398" y="465" width="94" height="42" rx="8" />
    {[244, 256, 268, 280, 292, 304, 414, 426, 438, 450, 462, 474].map(x => <circle key={x} cx={x} cy="486" r="2.5" />)}
    <path d="M275 507V550H325M445 507V550H395M360 575V612H450V585M325 550H300V612H270" />
    <circle cx="360" cy="550" r="25" /><path d="M360 550l13-16" />
    <circle cx="450" cy="570" r="15" /><path d="M450 570l7-8M262 603v18m-7-14v10m-7-7v4" />
    <circle className="wire-junction" cx="300" cy="550" r="3" />
    <path className="dimension-line" d="M228 447H492m-264-5v10m264-10v10" />
  </g>
}

function InstrumentSelector() {
  return <svg className="workshop-selector-graphic" viewBox="0 0 720 720" aria-hidden="true">
    <defs>
      <clipPath id="fret-side"><path d="M360 360V24A336 336 0 0 0 69.015 528Z" /></clipPath>
      <clipPath id="gtr-side"><path d="M360 360V24A336 336 0 0 1 650.985 528Z" /></clipPath>
      <clipPath id="wire-side"><path d="M360 360L69.015 528A336 336 0 0 0 650.985 528Z" /></clipPath>
      <pattern id="blueprint-grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="currentColor" strokeWidth=".7" /></pattern>
    </defs>
    <g className="selector-sector selector-fretboard" clipPath="url(#fret-side)">
      <rect className="half-wash" width="720" height="720" />
      <rect className="blueprint-grid" width="720" height="720" fill="url(#blueprint-grid)" />
      <g transform="translate(57 90) scale(.5)"><FretDrawing /></g>
    </g>
    <g className="selector-sector selector-guitar" clipPath="url(#gtr-side)">
      <rect className="half-wash" width="720" height="720" />
      <rect className="blueprint-grid" width="720" height="720" fill="url(#blueprint-grid)" />
      <g transform="translate(160 62) scale(.65)"><GuitarDrawing /></g>
    </g>
    <g className="selector-sector selector-wiring" clipPath="url(#wire-side)">
      <rect className="half-wash" width="720" height="720" />
      <rect className="blueprint-grid" width="720" height="720" fill="url(#blueprint-grid)" />
      <WireDrawing />
    </g>
    <path className="disc-ring disc-ring-fret" d="M360 24A336 336 0 0 0 69.015 528" />
    <path className="disc-ring disc-ring-gtr" d="M360 24A336 336 0 0 1 650.985 528" />
    <path className="disc-ring disc-ring-wire" d="M69.015 528A336 336 0 0 0 650.985 528" />
    <circle className="disc-guide" cx="360" cy="360" r="325" />
    <path className="selector-seam" d="M360 24V360M69.015 528L360 360L650.985 528" />
    <circle className="registration-dot" cx="360" cy="360" r="5" />
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
        <h1 id="landing-title"><span>Design your</span>{' '}<span>guitar</span></h1>
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
          <div className="tool-card-copy"><h2>FretFactory</h2><p>Design fretboards, scale lengths, and string layouts.</p></div>
          <span className="tool-cta">Open Fretboard Designer <b aria-hidden="true">→</b></span>
        </div>
      </a>
      <a className="tool-card tool-card-gtr" href="/gtrfactory/" {...activate('gtr')}>
        <div className="tool-card-shell">
          <svg className="card-thumbnail gtr-thumbnail" viewBox="438 68 190 558" aria-hidden="true"><GuitarDrawing /></svg>
          <div className="tool-card-copy"><h2>GTRFactory</h2><p>Design electric guitar bodies and templates.</p></div>
          <span className="tool-cta">Open Guitar Designer <b aria-hidden="true">→</b></span>
        </div>
      </a>
      <a className="tool-card tool-card-wire" href="/wirefactory/" {...activate('wire')}>
        <div className="tool-card-shell">
          <svg className="card-thumbnail wire-thumbnail" viewBox="215 440 290 190" aria-hidden="true"><WireDrawing /></svg>
          <div className="tool-card-copy"><h2>WireFactory</h2><p>Plan and check guitar pickup wiring.</p></div>
          <span className="tool-cta">Open Wiring Designer <b aria-hidden="true">→</b></span>
        </div>
      </a>
    </section>
  </main>
}
