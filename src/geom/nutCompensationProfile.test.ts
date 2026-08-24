import { describe, expect, it } from 'vitest'
import {
  estimateGeneralNutCompensation,
  supportsGeneralNutCompensationProfile,
} from './nutCompensationProfile'

describe('general nut compensation profile', () => {
  it('reproduces the published 25.5-inch six-string starting pattern', () => {
    expect(estimateGeneralNutCompensation(6, 647.7, 647.7)).toEqual([
      1.067, 0.508, 0.457, 0.737, 0.457, 0.279,
    ])
  })

  it('keeps the six-string pattern on the treble side of seven- and eight-string guitars', () => {
    const seven = estimateGeneralNutCompensation(7, 647.7, 685.8)!
    const eight = estimateGeneralNutCompensation(8, 647.7, 711.2)!

    expect(seven).toHaveLength(7)
    expect(seven[0]).toBeGreaterThan(seven[1])
    expect(seven[seven.length - 1]).toBe(0.279)
    expect(eight).toHaveLength(8)
    expect(eight[0]).toBeGreaterThan(eight[1])
    expect(eight[eight.length - 1]).toBe(0.279)
  })

  it('limits the generic guitar profile to supported string counts', () => {
    expect(supportsGeneralNutCompensationProfile(6)).toBe(true)
    expect(supportsGeneralNutCompensationProfile(8)).toBe(true)
    expect(supportsGeneralNutCompensationProfile(5)).toBe(false)
    expect(supportsGeneralNutCompensationProfile(9)).toBe(false)
    expect(estimateGeneralNutCompensation(12, 647.7, 647.7)).toBeNull()
  })
})
