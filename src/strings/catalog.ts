export type StringConstruction = 'plain' | 'wound'
export type StringFamily = 'guitar' | 'bass'

export type CatalogString = {
  item: string
  gaugeInches: number
  unitWeightLbPerInch: number
  construction: StringConstruction
  family: StringFamily
  evidence: 'published-unit-weight' | 'derived-plain-steel' | 'derived-published-tension'
}

// D'Addario published unit weights for plain steel and XL nickel-plated steel
// round-wound electric-guitar strings. Keep this snapshot versioned: tension
// recommendations must not depend on a live product-page request.
export const XL_NICKEL_CATALOG_SOURCE =
  'https://www.daddario.com/globalassets/pdfs/accessories/tension_chart_13934.pdf'

export const XL_NICKEL_CATALOG_VERSION = 'DAddario tension chart 13934'

export const XL_NICKEL_AVAILABILITY_SOURCE =
  'https://www.daddario.com/products/xl-nickel-wound-singles'

export const XL_PLAIN_AVAILABILITY_SOURCE =
  'https://www.daddario.com/products/high-carbon-steel-single-guitar-strings'

export const XL_NICKEL_AVAILABLE_GAUGES = {
  plain: [.007, .008, .0085, .009, .0095, .010, .0105, .011, .0115, .012,
    .0125, .013, .0135, .014, .015, .0155, .016, .0165, .017, .018, .019,
    .020, .021, .022, .024, .026],
  wound: [.017, .018, .019, .020, .021, .022, .023, .024, .025, .026, .028,
    .030, .032, .034, .036, .037, .038, .039, .040, .042, .044, .046, .048,
    .049, .050, .052, .054, .056, .059, .060, .062, .064, .065, .066, .068,
    .070, .072, .074, .080, .090],
} as const

export const XL_NICKEL_STRINGS: CatalogString[] = [
  ['PL007', .007, .00001085, 'plain'],
  ['PL008', .008, .00001418, 'plain'],
  ['PL0085', .0085, .00001601, 'plain'],
  ['PL009', .009, .00001794, 'plain'],
  ['PL0095', .0095, .00001999, 'plain'],
  ['PL010', .010, .00002215, 'plain'],
  ['PL0105', .0105, .00002442, 'plain'],
  ['PL011', .011, .00002680, 'plain'],
  ['PL0115', .0115, .00002930, 'plain'],
  ['PL012', .012, .00003190, 'plain'],
  ['PL0125', .0125, .00003461, 'plain', 'derived-plain-steel'],
  ['PL013', .013, .00003744, 'plain'],
  ['PL0135', .0135, .00004037, 'plain'],
  ['PL014', .014, .00004342, 'plain'],
  ['PL015', .015, .00004984, 'plain'],
  ['PL0155', .0155, .00005322, 'plain', 'derived-plain-steel'],
  ['PL016', .016, .00005671, 'plain'],
  ['PL0165', .0165, .00006030, 'plain', 'derived-plain-steel'],
  ['PL017', .017, .00006402, 'plain'],
  ['PL018', .018, .00007177, 'plain'],
  ['PL019', .019, .00007997, 'plain'],
  ['PL020', .020, .00008861, 'plain'],
  ['PL021', .021, .00009768, 'plain', 'derived-plain-steel'],
  ['PL022', .022, .00010722, 'plain'],
  ['PL024', .024, .00012760, 'plain'],
  ['PL026', .026, .00014975, 'plain'],
  ['NW017', .017, .00005524, 'wound'],
  ['NW018', .018, .00006215, 'wound'],
  ['NW019', .019, .00006947, 'wound'],
  ['NW020', .020, .00007495, 'wound'],
  ['NW021', .021, .00008293, 'wound'],
  ['NW022', .022, .00009184, 'wound'],
  ['NW024', .024, .00010857, 'wound'],
  // Unit weight derived from D'Addario's published 17.2 lb at D3 / 25.5 in.
  ['NW025', .025, .00011852, 'wound', 'derived-published-tension'],
  ['NW026', .026, .00012671, 'wound'],
  ['NW028', .028, .00014666, 'wound'],
  ['NW030', .030, .00017236, 'wound'],
  ['NW032', .032, .00019347, 'wound'],
  ['NW034', .034, .00021590, 'wound'],
  ['NW036', .036, .00023964, 'wound'],
  ['NW038', .038, .00026471, 'wound'],
  ['NW039', .039, .00027932, 'wound'],
  ['NW042', .042, .00032279, 'wound'],
  ['NW044', .044, .00035182, 'wound'],
  ['NW046', .046, .00038216, 'wound'],
  ['NW048', .048, .00041382, 'wound'],
  ['NW049', .049, .00043014, 'wound'],
  ['NW054', .054, .00053838, 'wound'],
  ['NW056', .056, .00057598, 'wound'],
  ['NW059', .059, .00064191, 'wound'],
  ['NW060', .060, .00066542, 'wound'],
  ['NW062', .062, .00070697, 'wound'],
  ['NW064', .064, .00074984, 'wound'],
  ['NW066', .066, .00079889, 'wound'],
  ['NW068', .068, .00084614, 'wound'],
  ['NW070', .070, .00089304, 'wound'],
  ['NW072', .072, .00094124, 'wound'],
  ['NW074', .074, .00098869, 'wound'],
  ['NW080', .080, .00115011, 'wound'],
].map(([item, gaugeInches, unitWeightLbPerInch, construction, evidence]) => ({
  item: item as string,
  gaugeInches: gaugeInches as number,
  unitWeightLbPerInch: unitWeightLbPerInch as number,
  construction: construction as StringConstruction,
  family: 'guitar',
  evidence: (evidence ?? 'published-unit-weight') as CatalogString['evidence'],
}))

export const XL_BASS_CATALOG_SOURCE = XL_NICKEL_CATALOG_SOURCE
export const XL_BASS_AVAILABILITY_SOURCE =
  'https://www.daddario.com/products/xl-nickel-round-wound-singles'

// Long-scale XL bass singles. The three balanced-set gauges use unit weights
// derived from D'Addario's current per-string tension tables at 34 inches.
// Other entries retain the published unit weights from tension chart 13934.
export const XL_BASS_STRINGS: CatalogString[] = [
  ['XLB018P', .018, .00007265, 'plain'],
  ['XLB020P', .020, .00009093, 'plain'],
  ['XLB028W', .028, .00015433, 'wound'],
  ['XLB032', .032, .00019000, 'wound'],
  ['XLB035', .035, .00022362, 'wound'],
  ['XLB040', .040, .00028192, 'wound', 'derived-published-tension'],
  ['XLB042', .042, .00032252, 'wound'],
  ['XLB045', .045, .00036980, 'wound', 'derived-published-tension'],
  ['XLB050', .050, .00043767, 'wound', 'derived-published-tension'],
  ['XLB052', .052, .00051322, 'wound'],
  ['XLB055', .055, .00053798, 'wound', 'derived-published-tension'],
  ['XLB060', .060, .00063410, 'wound', 'derived-published-tension'],
  ['XLB065', .065, .00079569, 'wound'],
  ['XLB067', .067, .00079224, 'wound', 'derived-published-tension'],
  ['XLB070', .070, .00086188, 'wound', 'derived-published-tension'],
  ['XLB075', .075, .00104973, 'wound'],
  ['XLB080', .080, .00110774, 'wound', 'derived-published-tension'],
  ['XLB085', .085, .00133702, 'wound'],
  ['XLB090', .090, .00140885, 'wound', 'derived-published-tension'],
  ['XLB095', .095, .00156031, 'wound', 'derived-published-tension'],
  ['XLB100', .100, .00179687, 'wound'],
  ['XLB105', .105, .00198395, 'wound'],
  ['XLB107', .107, .00193932, 'wound', 'derived-published-tension'],
  ['XLB110', .110, .00227440, 'wound'],
  ['XLB120', .120, .00242168, 'wound', 'derived-published-tension'],
  ['XLB125', .125, .00274810, 'wound'],
  ['XLB130', .130, .00301941, 'wound'],
  ['XLB135', .135, .00315944, 'wound'],
  ['XLB145', .145, .00363204, 'wound'],
].map(([item, gaugeInches, unitWeightLbPerInch, construction, evidence]) => ({
  item: item as string,
  gaugeInches: gaugeInches as number,
  unitWeightLbPerInch: unitWeightLbPerInch as number,
  construction: construction as StringConstruction,
  family: 'bass',
  evidence: (evidence ?? 'published-unit-weight') as CatalogString['evidence'],
}))

export type BalancedBassSet = {
  item: string
  label: string
  gaugesBassToTreble: readonly number[]
  source: string
}

export const XL_BALANCED_BASS_SETS: Record<'loose' | 'regular' | 'firm', BalancedBassSet> = {
  loose: {
    item: 'EXL220BT',
    label: '40–95 Super Light Balanced Tension',
    gaugesBassToTreble: [.095, .070, .055, .040],
    source: 'https://www.daddario.com/products/exl220bt-xl-nickel-wound-bass-guitar-strings-balanced-tension-super-light-40-95-long-scale',
  },
  regular: {
    item: 'EXL170BT',
    label: '45–107 Regular Light Balanced Tension',
    gaugesBassToTreble: [.107, .080, .060, .045],
    source: 'https://www.daddario.com/products/exl170bt-xl-nickel-wound-balanced-tension-bass-guitar-strings-regular-light-45-107-long-scale',
  },
  firm: {
    item: 'EXL160BT',
    label: '50–120 Medium Balanced Tension',
    gaugesBassToTreble: [.120, .090, .067, .050],
    source: 'https://www.daddario.com/products/exl160bt-xl-nickel-wound-bass-guitar-strings-balanced-tension-medium-50-120-long-scale',
  },
}

export const XL_NICKEL_CATALOG_COVERAGE = {
  available: XL_NICKEL_AVAILABLE_GAUGES.plain.length + XL_NICKEL_AVAILABLE_GAUGES.wound.length,
  calculable: XL_NICKEL_STRINGS.length,
  unavailableForCalculation: [
    { gaugeInches: .023, construction: 'wound' },
    { gaugeInches: .037, construction: 'wound' },
    { gaugeInches: .040, construction: 'wound' },
    { gaugeInches: .050, construction: 'wound' },
    { gaugeInches: .052, construction: 'wound' },
    { gaugeInches: .065, construction: 'wound' },
    { gaugeInches: .090, construction: 'wound' },
  ] as const,
}
