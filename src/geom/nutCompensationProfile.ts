const REFERENCE_SCALE_MM = 25.5 * 25.4

// Bass E -> treble E. Published as a general 25.5-inch starting pattern in
// US6433264B1. These are experimental defaults, not Earvana specifications.
const REFERENCE_OFFSETS_MM = [0.042, 0.020, 0.018, 0.029, 0.018, 0.011]
  .map(valueInches => valueInches * 25.4)

export const GENERAL_PROFILE_MIN_STRINGS = 6
export const GENERAL_PROFILE_MAX_STRINGS = 8

export function supportsGeneralNutCompensationProfile(strings: number): boolean {
  return Number.isInteger(strings)
    && strings >= GENERAL_PROFILE_MIN_STRINGS
    && strings <= GENERAL_PROFILE_MAX_STRINGS
}

function stringScaleLengths(
  strings: number,
  scaleTreble: number,
  scaleBass: number,
  curvedExponent: number,
): number[] {
  const logBass = Math.log(scaleBass)
  const logTreble = Math.log(scaleTreble)
  const exponent = Math.max(0.01, curvedExponent)
  return Array.from({ length: strings }, (_, index) => {
    const u = strings === 1 ? 0 : index / (strings - 1)
    const curvedPosition = 1 - Math.pow(1 - u, exponent)
    return Math.exp(logBass + (logTreble - logBass) * curvedPosition)
  })
}

/**
 * Returns editable starting offsets for a conventional 6-, 7- or 8-string
 * electric guitar. The six-string reference pattern is aligned to the treble
 * side; extra strings reuse the low-E reference and are scale-normalized.
 */
export function estimateGeneralNutCompensation(
  strings: number,
  scaleTreble: number,
  scaleBass: number,
  curvedExponent = 1,
): number[] | null {
  if (!supportsGeneralNutCompensationProfile(strings)) return null
  if (![scaleTreble, scaleBass, curvedExponent].every(Number.isFinite)) return null
  if (scaleTreble <= 0 || scaleBass <= 0 || curvedExponent <= 0) return null

  const scales = stringScaleLengths(strings, scaleTreble, scaleBass, curvedExponent)
  const extraBassStrings = strings - REFERENCE_OFFSETS_MM.length
  return scales.map((scale, index) => {
    const referenceIndex = Math.max(0, index - extraBassStrings)
    const scaleFactor = scale / REFERENCE_SCALE_MM
    return Number((REFERENCE_OFFSETS_MM[referenceIndex] * scaleFactor).toFixed(3))
  })
}
