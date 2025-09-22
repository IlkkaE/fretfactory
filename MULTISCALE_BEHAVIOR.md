# Multi-Scale (Fan-Fret) Geometry - Critical Behavior Documentation

## Overview

This document defines the expected behavior for multi-scale guitar geometry to prevent regressions.

## Critical Behavior Contracts

### String Indexing Convention

- **Index 0**: Treble strings (RIGHT SIDE, thinner, higher pitch)
- **Index strings-1**: Bass strings (LEFT SIDE, thicker, lower pitch)

### Scale Length Parameters

- **`scaleTreble`**: Controls scale length for TREBLE side (RIGHT SIDE, string index 0)
- **`scaleBass`**: Controls scale length for BASS side (LEFT SIDE, string index strings-1)

### Expected Slider Behavior

- Moving `scaleBass` slider → Changes LEFT SIDE geometry
- Moving `scaleTreble` slider → Changes RIGHT SIDE geometry

### Curved Exponent Behavior

- **`curvedExponent = 1.0`**: Linear interpolation between scaleTreble and scaleBass
- **`curvedExponent > 1.0`**: More curved interpolation (more fan effect)
- **`curvedExponent < 1.0`**: Less curved interpolation (less fan effect)

## Validation

The code includes runtime validation that will log errors if these behaviors are violated:

1. **Scale Assignment Validation**: When `curvedExponent ≈ 1.0`, checks that:

   - String index 0 gets `scaleTreble`
   - String index `strings-1` gets `scaleBass`

2. **Exponent Direction Validation**: Checks that higher exponent values create more spread between bass and treble scales.

## Testing Multi-Scale Geometry

To manually verify correct behavior:

1. Set `curvedExponent = 1.0` (linear)
2. Set different `scaleTreble` and `scaleBass` values
3. Move `scaleBass` slider → Should see LEFT SIDE change more
4. Move `scaleTreble` slider → Should see RIGHT SIDE change more
5. Increase `curvedExponent` → Should see more fan effect
6. Check browser console for validation errors/warnings

## Files

- `src/geom/curved.ts` - Core multi-scale geometry calculations
- `src/geom/curved.test.ts` - Unit tests (when testing framework is added)
- `src/components/Controls.tsx` - UI sliders for scale parameters
