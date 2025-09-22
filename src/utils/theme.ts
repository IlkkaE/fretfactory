export const THEME = {
  // Light desaturated green/stone palette to harmonize with rock background
  surface: '#dfe7e3',     // panels background
  surfaceAlt: '#d6e1dc',  // inner blocks (svg, etc.)
  border: '#0b4d4d',      // darker teal border (edges)
  text: '#142018',        // near-black green text
  // Preview background override (from user-provided swatch)
  previewBg: '#80DEEA',
  // Export panel background (darker teal, from provided darker swatch)
  panelBg: '#0b6a6e',
  panelBorder: '#084a4d',
  // Semi-transparent variants for overlays
  panelBgAlpha: 'rgba(11, 106, 110, 0.9)',
  // Control panel (DevGui) can be more transparent
  panelBgAlphaDev: 'rgba(11, 106, 110, 0.65)',
  button: {
    bg: '#B2EBF2',        // lighter buttons
    text: '#0b3a3a',      // deep teal for contrast
    border: '#0b4d4d',
    hoverBg: '#9fe3ec',   // optional hover
  },
} as const

export type Theme = typeof THEME
