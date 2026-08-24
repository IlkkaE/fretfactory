export type StringConstruction = 'plain' | 'wound'

export type CatalogString = {
  item: string
  gaugeInches: number
  unitWeightLbPerInch: number
  construction: StringConstruction
}

// D'Addario published unit weights for plain steel and XL nickel-plated steel
// round-wound electric-guitar strings. Keep this snapshot versioned: tension
// recommendations must not depend on a live product-page request.
export const XL_NICKEL_CATALOG_SOURCE =
  'https://www.daddario.com/globalassets/pdfs/accessories/tension_chart_13934.pdf'

export const XL_NICKEL_CATALOG_VERSION = 'DAddario tension chart 13934'

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
  ['PL013', .013, .00003744, 'plain'],
  ['PL0135', .0135, .00004037, 'plain'],
  ['PL014', .014, .00004342, 'plain'],
  ['PL015', .015, .00004984, 'plain'],
  ['PL016', .016, .00005671, 'plain'],
  ['PL017', .017, .00006402, 'plain'],
  ['PL018', .018, .00007177, 'plain'],
  ['PL019', .019, .00007997, 'plain'],
  ['PL020', .020, .00008861, 'plain'],
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
  ['NW025', .025, .00011852, 'wound'],
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
].map(([item, gaugeInches, unitWeightLbPerInch, construction]) => ({
  item: item as string,
  gaugeInches: gaugeInches as number,
  unitWeightLbPerInch: unitWeightLbPerInch as number,
  construction: construction as StringConstruction,
}))
