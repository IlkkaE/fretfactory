import { describe, expect, it } from 'vitest'
import { useAppState } from '../store.state'
import { createDXF } from './dxf'

const layerEntityCount = (content: string, layer: string) =>
  content.split('\r\n').filter((value, index, all) => value === layer && all[index - 1] === '8').length

const extMaxX = (content: string) => {
  const values = content.split('\r\n')
  const extMaxIndex = values.indexOf('$EXTMAX')
  const xCodeIndex = values.indexOf('10', extMaxIndex)
  return Number(values[xCodeIndex + 1])
}

describe('createDXF', () => {
  it('creates a millimeter DXF with separate drawing layers', () => {
    const result = createDXF({ ...useAppState.getState(), units: 'mm', removeStrings: false })!

    expect(result.filename).toMatch(/_mm\.dxf$/)
    expect(result.content).toContain('9\r\n$INSUNITS\r\n70\r\n4')
    expect(layerEntityCount(result.content, 'EDGES')).toBe(2)
    expect(layerEntityCount(result.content, 'STRINGS')).toBe(6)
    expect(layerEntityCount(result.content, 'FRETS')).toBeGreaterThan(0)
    expect(layerEntityCount(result.content, 'NUT_BRIDGE')).toBe(2)
  })

  it('uses inches and omits string entities when requested', () => {
    const state = useAppState.getState()
    const millimeters = createDXF({ ...state, units: 'mm', removeStrings: true })!
    const result = createDXF({ ...state, units: 'inch', removeStrings: true })!

    expect(result.filename).toMatch(/_inch\.dxf$/)
    expect(result.content).toContain('9\r\n$INSUNITS\r\n70\r\n1')
    expect(layerEntityCount(result.content, 'STRINGS')).toBe(0)
    expect(extMaxX(result.content)).toBeCloseTo(extMaxX(millimeters.content) / 25.4, 5)
  })
})
