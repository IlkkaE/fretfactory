import { computeCurvedFretsRaw } from '../curved'
import { MM_PER_INCH, toMillimeters } from '../../utils/units'

describe('geometry unit invariants', () => {
  test('inch inputs and equivalent millimeter inputs produce the same physical geometry', () => {
    const inch = {
      scaleTreble: 25.5,
      scaleBass: 27,
      stringSpanNut: 1.77,
      stringSpanBridge: 2.28,
      overhang: 0.12,
    }

    const rowsIn = computeCurvedFretsRaw(
      7, 24, inch.scaleTreble, inch.scaleBass, 12,
      inch.stringSpanNut, inch.stringSpanBridge, inch.overhang, 1.2,
    )
    const rowsMm = computeCurvedFretsRaw(
      7, 24,
      toMillimeters(inch.scaleTreble, 'inch'),
      toMillimeters(inch.scaleBass, 'inch'),
      12,
      toMillimeters(inch.stringSpanNut, 'inch'),
      toMillimeters(inch.stringSpanBridge, 'inch'),
      toMillimeters(inch.overhang, 'inch'),
      1.2,
    )

    expect(rowsMm).toHaveLength(rowsIn.length)
    rowsMm.forEach((rowMm, rowIndex) => {
      const rowIn = rowsIn[rowIndex]
      expect(rowMm.x_left).toBeCloseTo(rowIn.x_left * MM_PER_INCH, 8)
      expect(rowMm.y_left).toBeCloseTo(rowIn.y_left * MM_PER_INCH, 8)
      expect(rowMm.x_right).toBeCloseTo(rowIn.x_right * MM_PER_INCH, 8)
      expect(rowMm.y_right).toBeCloseTo(rowIn.y_right * MM_PER_INCH, 8)
      rowMm.pts.forEach((pointMm, pointIndex) => {
        expect(pointMm.x).toBeCloseTo(rowIn.pts[pointIndex].x * MM_PER_INCH, 8)
        expect(pointMm.y).toBeCloseTo(rowIn.pts[pointIndex].y * MM_PER_INCH, 8)
      })
    })
  })
})
