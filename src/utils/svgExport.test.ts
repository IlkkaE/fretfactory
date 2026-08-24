import { describe, expect, it } from 'vitest'
import { useAppState } from '../store.state'
import { createSVG } from './exporters'

describe('createSVG fret layer', () => {
  it('places every numbered fret in its own named element on the Frets layer', () => {
    const state = useAppState.getState()
    const result = createSVG(state)!

    expect(result.content).toContain('xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"')
    expect(result.content).toContain('id="frets" data-name="Frets" inkscape:groupmode="layer" inkscape:label="Frets"')

    const fretIds = [...result.content.matchAll(/id="fret-(\d+)"/g)].map(match => Number(match[1]))
    expect(fretIds).toEqual(Array.from({ length: state.frets }, (_, index) => index + 1))

    for (let fret = 1; fret <= state.frets; fret++) {
      expect(result.content).toContain(`data-name="Fret ${fret}" inkscape:label="Fret ${fret}"`)
    }
  })
})
