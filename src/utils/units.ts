import type { Units } from '../types'

/**
 * Millimeters are the only internal geometry and state unit. `Units` controls
 * how lengths are presented to and read from the user.
 */
export const MM_PER_INCH = 25.4

export const unitLabel = (units: Units): string => units === 'inch' ? 'in' : 'mm'

export function toMillimeters(value: number, units: Units): number {
  return units === 'inch' ? value * MM_PER_INCH : value
}

export function fromMillimeters(valueMm: number, units: Units): number {
  return units === 'inch' ? valueMm / MM_PER_INCH : valueMm
}

export function lengthDecimals(units: Units): number {
  return units === 'inch' ? 3 : 1
}

export function roundLength(value: number, units: Units): number {
  const factor = 10 ** lengthDecimals(units)
  return Math.round(value * factor) / factor
}

export function toDisplayLength(valueMm: number | undefined, units: Units): number | undefined {
  return valueMm == null ? undefined : roundLength(fromMillimeters(valueMm, units), units)
}

export function fromDisplayLength(value: number, units: Units): number {
  return toMillimeters(value, units)
}

export function formatLength(valueMm: number, units: Units): string {
  const value = fromMillimeters(valueMm, units)
  return `${value.toFixed(lengthDecimals(units))} ${unitLabel(units)}`
}

/**
 * Get margin size based on units
 */
export function getMargin(_units?: Units): number { return 5 }

/**
 * Get the unit attribute for SVG export
 */
export function getUnitAttribute(units: Units = 'mm'): string { return units === 'inch' ? 'in' : 'mm' }
