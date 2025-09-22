/**
 * SPEC-001 — FretFactory
 * Centralized defaults and guardrails derived from the technical spec.
 * NOTE: Keep values in sync with the official document.
 */

export const SPEC = {
  marker: {
  // Default fret intervals for center markers (between n and n+1)
  // Shifted one space toward the bridge so first is between 2 and 3
  defaultFrets: [2, 4, 6, 8, 11, 14, 16, 18, 20] as number[],
    // Default cross size: 6 mm diameter (used in preview & exports)
    defaultSizeMm: 6,
  },
  radius: {
    // Default compound radius (inches by default store units)
    defaultNutIn: 12,
    defaultBridgeIn: 16,
    // Allowed ranges
    minIn: 4,
    maxIn: 40,
    minMm: 100,
    maxMm: 1000,
  },
  curved: {
    // Typical anchor fret for multi-scale fan
    defaultAnchorFret: 12,
    // Baseline curvature exponent (>= 0.01 recommended)
    defaultExponent: 1,
  },
} as const

export type Spec = typeof SPEC
