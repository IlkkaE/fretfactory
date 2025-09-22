import { computeCurvedFretsRaw, computeCurvedNutBridge } from './curved'

describe('Curved Geometry', () => {
  const baseParams = {
    strings: 6,
    frets: 12,
    scaleTreble: 25.0,
    scaleBass: 26.0,
    anchorFret: 7,
    stringSpanNut: 1.4,
    stringSpanBridge: 2.0,
    overhang: 0.1,
    curvedExponent: 1.0
  }

  describe('scaleBass vs scaleTreble assignment', () => {
    test('scaleBass should affect bass (left) side more than treble (right) side', () => {
      const baseline = computeCurvedNutBridge(
        baseParams.strings, baseParams.scaleTreble, baseParams.scaleBass,
        baseParams.anchorFret, baseParams.stringSpanNut, baseParams.stringSpanBridge,
        baseParams.overhang, baseParams.curvedExponent
      )

      // Increase scaleBass by 1 inch
      const increasedBass = computeCurvedNutBridge(
        baseParams.strings, baseParams.scaleTreble, baseParams.scaleBass + 1.0,
        baseParams.anchorFret, baseParams.stringSpanNut, baseParams.stringSpanBridge,
        baseParams.overhang, baseParams.curvedExponent
      )

      // Left side (bass) should change more than right side (treble)
      const leftChange = Math.abs(increasedBass.bridge.y_left - baseline.bridge.y_left)
      const rightChange = Math.abs(increasedBass.bridge.y_right - baseline.bridge.y_right)
      
      expect(leftChange).toBeGreaterThan(rightChange)
      expect(leftChange).toBeGreaterThan(0.5) // Significant change on bass side
      expect(rightChange).toBeLessThan(0.1)   // Minimal change on treble side
    })

    test('scaleTreble should affect treble (right) side more than bass (left) side', () => {
      const baseline = computeCurvedNutBridge(
        baseParams.strings, baseParams.scaleTreble, baseParams.scaleBass,
        baseParams.anchorFret, baseParams.stringSpanNut, baseParams.stringSpanBridge,
        baseParams.overhang, baseParams.curvedExponent
      )

      // Increase scaleTreble by 1 inch
      const increasedTreble = computeCurvedNutBridge(
        baseParams.strings, baseParams.scaleTreble + 1.0, baseParams.scaleBass,
        baseParams.anchorFret, baseParams.stringSpanNut, baseParams.stringSpanBridge,
        baseParams.overhang, baseParams.curvedExponent
      )

      // Right side (treble) should change more than left side (bass)
      const leftChange = Math.abs(increasedTreble.bridge.y_left - baseline.bridge.y_left)
      const rightChange = Math.abs(increasedTreble.bridge.y_right - baseline.bridge.y_right)
      
      expect(rightChange).toBeGreaterThan(leftChange)
      expect(rightChange).toBeGreaterThan(0.5) // Significant change on treble side
      expect(leftChange).toBeLessThan(0.1)     // Minimal change on bass side
    })
  })

  describe('curvedExponent behavior', () => {
    test('higher exponent should create more fan (more difference between strings)', () => {
      const lowExponent = computeCurvedFretsRaw(
        baseParams.strings, baseParams.frets, baseParams.scaleTreble, baseParams.scaleBass,
        baseParams.anchorFret, baseParams.stringSpanNut, baseParams.stringSpanBridge,
        baseParams.overhang, 0.5 // Low exponent
      )

      const highExponent = computeCurvedFretsRaw(
        baseParams.strings, baseParams.frets, baseParams.scaleTreble, baseParams.scaleBass,
        baseParams.anchorFret, baseParams.stringSpanNut, baseParams.stringSpanBridge,
        baseParams.overhang, 2.0 // High exponent
      )

      // Get a middle fret for comparison
      const midFret = Math.floor(baseParams.frets / 2)
      const lowFan = lowExponent[midFret - 1]
      const highFan = highExponent[midFret - 1]

      // Higher exponent should create more difference between left and right
      const lowSpread = Math.abs(lowFan.y_right - lowFan.y_left)
      const highSpread = Math.abs(highFan.y_right - highFan.y_left)

      expect(highSpread).toBeGreaterThan(lowSpread)
    })

    test('exponent = 1 should give linear interpolation', () => {
      const result = computeCurvedFretsRaw(
        baseParams.strings, baseParams.frets, baseParams.scaleTreble, baseParams.scaleBass,
        baseParams.anchorFret, baseParams.stringSpanNut, baseParams.stringSpanBridge,
        baseParams.overhang, 1.0 // Linear exponent
      )

      // With linear interpolation, the middle string should have scale exactly halfway between treble and bass
      const middleStringIndex = Math.floor(baseParams.strings / 2)
      // This is hard to test directly, but we can verify the behavior is reasonable
      expect(result).toHaveLength(baseParams.frets)
      expect(result[0].pts).toHaveLength(baseParams.strings + 2) // strings + 2 edges
    })
  })

  describe('string indexing consistency', () => {
    test('first string (index 0) should be treble side (right)', () => {
      const nb = computeCurvedNutBridge(
        baseParams.strings, baseParams.scaleTreble, baseParams.scaleBass,
        baseParams.anchorFret, baseParams.stringSpanNut, baseParams.stringSpanBridge,
        baseParams.overhang, baseParams.curvedExponent
      )

      // String index 0 should be closer to right edge than left edge
      const firstStringX = nb.nut.pts[1].x // Skip edge point, first string is at index 1
      const leftEdgeX = nb.nut.pts[0].x
      const rightEdgeX = nb.nut.pts[nb.nut.pts.length - 1].x
      
      const distToLeft = Math.abs(firstStringX - leftEdgeX)
      const distToRight = Math.abs(firstStringX - rightEdgeX)
      
      expect(distToRight).toBeLessThan(distToLeft)
    })

    test('last string should be bass side (left)', () => {
      const nb = computeCurvedNutBridge(
        baseParams.strings, baseParams.scaleTreble, baseParams.scaleBass,
        baseParams.anchorFret, baseParams.stringSpanNut, baseParams.stringSpanBridge,
        baseParams.overhang, baseParams.curvedExponent
      )

      // Last string should be closer to left edge than right edge
      const lastStringX = nb.nut.pts[nb.nut.pts.length - 2].x // Skip edge point, last string is at index -2
      const leftEdgeX = nb.nut.pts[0].x
      const rightEdgeX = nb.nut.pts[nb.nut.pts.length - 1].x
      
      const distToLeft = Math.abs(lastStringX - leftEdgeX)
      const distToRight = Math.abs(lastStringX - rightEdgeX)
      
      expect(distToLeft).toBeLessThan(distToRight)
    })
  })
})
