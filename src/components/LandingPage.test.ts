import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import LandingPage from './LandingPage'

describe('landing workshop choices', () => {
  it('keeps both available editor destinations', () => {
    const html = renderToStaticMarkup(React.createElement(LandingPage))
    expect(html).toContain('href="/fretboard"')
    expect(html).toContain('href="/gtrfactory/"')
    expect(html).toContain('FretFactory')
    expect(html).toContain('GTRFactory')
  })

  it('links WireFactory to its native static route', () => {
    const html = renderToStaticMarkup(React.createElement(LandingPage))
    expect(html).toContain('href="/wirefactory/"')
    expect(html).toContain('WireFactory')
    expect(html).toContain('Explore guitar pickup wiring.')
    expect(html).toContain('Open Wiring Designer')
  })

  it('uses three illustrated sectors and a Y divider instead of a yin-yang seam', () => {
    const html = renderToStaticMarkup(React.createElement(LandingPage))
    expect(html.match(/class="selector-sector /g)).toHaveLength(3)
    expect(html).toContain('class="selector-seam" d="M360 24V360M69.015 528L360 360L650.985 528"')
    expect(html).toContain('clip-path="url(#wire-side)"')
    expect(html).not.toContain('yin-seam')
    expect(html).not.toContain('yin-yang-graphic')
  })
})
