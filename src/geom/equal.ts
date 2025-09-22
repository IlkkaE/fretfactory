export function fretPositions(scale: number, frets: number): number[] {
  const out: number[] = []
  for (let n = 1; n <= frets; n++) {
    const y = scale - scale / Math.pow(2, n / 12)
    out.push(y)
  }
  return out
}
