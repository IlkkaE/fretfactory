export type Layout = {
  edgeNut: [number, number]
  edgeBridge: [number, number]
  nutY: number[]
  bridgeY: number[]
}

/**
 * Kielet sijoitetaan string-spanien mukaan.
 * Reunat = span + 2*overhang (symmetrinen keskiviivan ympäri).
 * Overhang ei muuta kielten paikkoja, vain reunojen paikkaa.
 */
export function computeStringLayout(
  strings: number,
  stringSpanNut: number,
  stringSpanBridge: number,
  overhang: number
): Layout {
  const spanNut = Math.max(0, stringSpanNut ?? 0)
  const spanBr  = Math.max(0, stringSpanBridge ?? 0)
  const oh      = Math.max(0, overhang ?? 0)

  const boardNut = spanNut + 2 * oh
  const boardBr  = spanBr  + 2 * oh

  const edgeNut: [number, number] = [-boardNut / 2, boardNut / 2]
  const edgeBridge: [number, number] = [-boardBr / 2, boardBr / 2]

  const nutStart = edgeNut[0] + oh
  const brStart  = edgeBridge[0] + oh

  const nutY: number[] = new Array(strings)
  const bridgeY: number[] = new Array(strings)

  if (strings <= 1) {
    nutY[0] = (nutStart + (edgeNut[1] - oh)) / 2
    bridgeY[0] = (brStart + (edgeBridge[1] - oh)) / 2
  } else {
    for (let i = 0; i < strings; i++) {
      const t = i / (strings - 1) // 0..1 bass(left) → treble(right)
      nutY[i] = nutStart + spanNut * t
      bridgeY[i] = brStart + spanBr * t
    }
  }

  return { edgeNut, edgeBridge, nutY, bridgeY }
}
