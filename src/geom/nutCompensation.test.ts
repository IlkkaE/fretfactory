import { describe, expect, it } from 'vitest'
import { computeCurvedNutBridge } from './curved'
import { computeNutCompensationLines } from './nutCompensation'

const fanFretGeometry = () => computeCurvedNutBridge(6, 647.7, 685.8, 12, 36, 50, 3, 1)

describe('computeNutCompensationLines', () => {
  it('keeps zero compensation at the nominal nut points', () => {
    const lines = computeNutCompensationLines(fanFretGeometry(), 6, [0, 0, 0, 0, 0, 0])
    expect(lines).toHaveLength(6)
    lines.forEach(line => expect(line.compensated).toEqual(line.nominal))
  })

  it('moves each contact point by the requested distance along its own fan-fret string line', () => {
    const geometry = fanFretGeometry()
    const offsets = [0.5, -0.25, 0, 0, 0, 0]
    const lines = computeNutCompensationLines(geometry, 6, offsets)

    expect(Math.hypot(
      lines[0].compensated.x - lines[0].nominal.x,
      lines[0].compensated.y - lines[0].nominal.y,
    )).toBeCloseTo(0.5, 8)
    expect(Math.hypot(
      lines[1].compensated.x - lines[1].nominal.x,
      lines[1].compensated.y - lines[1].nominal.y,
    )).toBeCloseTo(0.25, 8)

    for (const line of [lines[0], lines[1]]) {
      const bridge = geometry.bridge.pts[line.stringIndex + 1]
      const stringDx = bridge.x - line.nominal.x
      const stringDy = bridge.y - line.nominal.y
      const compensationDx = line.compensated.x - line.nominal.x
      const compensationDy = line.compensated.y - line.nominal.y
      expect(stringDx * compensationDy - stringDy * compensationDx).toBeCloseTo(0, 8)
    }
  })
})
