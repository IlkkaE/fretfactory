# FretFactory AI Coding Instructions

## Project Overview
FretFactory is a specialized web app for designing multi-scale (fan-fret) guitar fretboards using React + TypeScript + Vite. It generates precise geometric calculations for luthiers and builders.

## Critical Domain Knowledge

### Multi-Scale Geometry (Core Business Logic)
- **String Indexing**: Index 0 = treble side (RIGHT, thinner strings), Index N-1 = bass side (LEFT, thicker strings)
- **Scale Parameters**: `scaleTreble` controls RIGHT side, `scaleBass` controls LEFT side
- **Curved Exponent**: 1.0 = linear interpolation, >1.0 = more fan effect
- **Anchor Fret**: Where all strings converge (typically 7-12)
- **Critical Files**: `src/geom/curved.ts` contains core calculations with validation contracts

### State Management Pattern
- Uses Zustand store (`src/store.state.ts`) with single `AppState` type
- All measurements stored in millimeters internally, regardless of UI units
- Preset system applies instrument configurations via `applyPreset()` method
- State updates use `set()` with partial patches: `set({ scaleTreble: 650 })`

### Component Architecture
```
App.tsx (layout grid)
├── PresetMenu.tsx (instrument selection)
├── Controls.tsx (parameter inputs)
├── ExportGrid.tsx (SVG/PDF/CSV/JSON exports)
└── Preview.tsx (real-time visualization)
```

### Export System (`src/utils/exporters.ts`)
- **SVG**: Vector graphics with PCHIP-smoothed curved frets
- **PDF**: Multi-page A4 tiling for large fretboards
- **CSV**: Numerical coordinates for CNC
- **JSON**: Complete geometry data
- Uses Paper.js for background animation, jsPDF for PDF generation

## Development Conventions

### Units & Measurements
- Internal storage: Always millimeters (mm)
- UI helpers: `mm1()` rounds to 0.1mm precision
- Export utilities: Convert between mm/inch via `MM()` function
- Geometry expects positive Y toward bridge, X left-to-right

### Naming Conventions
- Finnish comments preserved in some files (historical)
- Component files: PascalCase with `.tsx` extension
- Utility functions: camelCase, prefixed by domain (`computeCurved*`, `export*`)
- Constants: UPPER_SNAKE_CASE in `src/spec/index.ts`

### Critical File Patterns
- **Geometry**: `src/geom/*.ts` - Pure math functions, no React dependencies
- **Types**: `src/types.ts` - Central type definitions
- **Presets**: `src/presets/instruments.ts` - Instrument database with manufacturer specs
- **Utils**: Domain-specific helpers (exporters, units, svg, theme)

## Testing & Validation
- Vitest configured for unit tests (`npm run test`, `npm run test:ui`)
- Geometry validation built into `curved.ts` with console warnings
- Manual testing: Use linear exponent (1.0) to verify scale assignments

## Build & Deploy
- **Dev**: `npm run dev` (Vite with HMR)
- **Build**: `npm run build` (TypeScript compilation + Vite bundling)
- **Deploy**: GitHub Actions to Pages (`.github/workflows/deploy.yml`)
- **Base Path**: Configured via `VITE_BASE` environment variable

## External Dependencies
- **React**: Standard functional components with hooks
- **Paper.js**: Canvas-based background animation
- **Zustand**: Lightweight state management
- **jsPDF**: PDF generation (dynamic import)
- **Lil-gui**: Debug controls (when needed)

## When Making Changes
1. **Geometry changes**: Update tests and validation in `curved.ts`
2. **New exports**: Follow naming pattern in `exporters.ts`
3. **State changes**: Update `AppState` type and store methods
4. **UI components**: Use existing patterns from `Controls.tsx`
5. **New presets**: Add to `instruments.ts` with proper units/mode