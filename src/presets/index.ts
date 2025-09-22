// src/presets/index.ts

// Paikallinen tyyppi tälle tiedostolle (ettei tarvitse ../types-riippuvuutta)
export type DemoPreset = {
  id: string
  name: string
  mode: 'equal' | 'fanfret' | 'curved'
  units: 'inch' | 'mm'
  strings: number
  frets: number
  // equal
  scale?: number
  // fanfret
  scaleTop?: number
  scaleBottom?: number
  // yhteiset
  neckWidthNut: number
  neckWidthBridge: number
  overhang: number
}

// Huom: tämä on demo-/legacy-lista, ei liity instruments.ts-presetteihin.
export const PRESETS: DemoPreset[] = [
  { id: 'strat-25-5',   name: 'Guitar • Strat-style 25.5"',   mode: 'equal',  units: 'inch', strings: 6, frets: 22, scale: 25.5, neckWidthNut: 1.65, neckWidthBridge: 2.20, overhang: 0.12 },
  { id: 'lespaul-24-75',name: 'Guitar • LP-style 24.75"',     mode: 'equal',  units: 'inch', strings: 6, frets: 22, scale: 24.75, neckWidthNut: 1.69, neckWidthBridge: 2.16, overhang: 0.12 },
  { id: 'rgms7-25-5-27',name: 'FanFret • 7-string 25.5–27"',  mode: 'fanfret',units: 'inch', strings: 7, frets: 24, scaleTop: 25.5, scaleBottom: 27.0, neckWidthNut: 1.89, neckWidthBridge: 2.64, overhang: 0.12 },
  { id: 'boden8-26-5-28',name:'FanFret • 8-string 26.5–28"',  mode: 'fanfret',units: 'inch', strings: 8, frets: 24, scaleTop: 26.5, scaleBottom: 28.0, neckWidthNut: 2.17, neckWidthBridge: 2.95, overhang: 0.12 },
  { id: 'bass-34',      name: 'Bass • 34"',                   mode: 'equal',  units: 'inch', strings: 4, frets: 20, scale: 34.0,  neckWidthNut: 1.65, neckWidthBridge: 2.36, overhang: 0.12 },
  { id: 'curved-demo',  name: 'Curved • 6-string demo (anchor @ 12)', mode: 'curved', units: 'mm', strings: 6, frets: 24, scale: 648, neckWidthNut: 42, neckWidthBridge: 56, overhang: 3.0 }
]

export function getPresetById(id: string) {
  return PRESETS.find(p => p.id === id)
}
