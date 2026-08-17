// src/geom/units.ts
// Yksikkömuunnokset: inch ↔ mm

import type { Units } from '../types'
import { MM_PER_INCH } from '../utils/units'

export type { Units }
export { MM_PER_INCH }

export function convert(value: number, from: Units, to: Units): number {
  if (!Number.isFinite(value)) return value
  if (from === to) return value
  return from === 'inch' ? value * MM_PER_INCH : value / MM_PER_INCH
}

/**
 * Muunna useita numeerisia kenttiä kerralla.
 * - obj: lähdearvot (esim. store-tila)
 * - keys: mitkä kentät muunnetaan
 * Palauttaa uudet arvot (ei muuta alkuperäistä oliota).
 */
export function convertFields<T extends Record<string, any>>(
  obj: T,
  from: Units,
  to: Units,
  keys: (keyof T)[]
): Partial<T> {
  const out: Partial<T> = {}
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'number' && Number.isFinite(v)) {
      ;(out as any)[k] = convert(v, from, to)
    }
  }
  return out
}
