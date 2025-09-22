/**
 * Unit utilities (mm-only)
 */
export const MM_PER_INCH = 25.4 // retained for reference only

/**
 * Get margin size based on units
 */
export function getMargin(_units?: 'mm' | 'inch'): number { return 5 }

/**
 * Get the unit attribute for SVG export
 */
export function getUnitAttribute(_units?: 'mm' | 'inch'): string { return 'mm' }
