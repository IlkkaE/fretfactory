import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppState } from '../store.state'
import { exportPDFSinglePage } from './exporters'

const pdf = vi.hoisted(() => ({
  constructorArgs: [] as unknown[][],
  lines: [] as number[][],
  lineWidths: [] as number[],
  savedAs: [] as string[],
}))

vi.mock('jspdf', () => ({
  jsPDF: class MockJsPDF {
    constructor(...args: unknown[]) { pdf.constructorArgs.push(args) }
    setLineWidth(width: number) { pdf.lineWidths.push(width) }
    setDrawColor() {}
    line(...args: number[]) { pdf.lines.push(args) }
    save(filename: string) { pdf.savedAs.push(filename) }
  },
}))

describe('exportPDFSinglePage', () => {
  beforeEach(() => {
    pdf.constructorArgs.length = 0
    pdf.lines.length = 0
    pdf.lineWidths.length = 0
    pdf.savedAs.length = 0
  })

  it('creates one custom-size millimeter page at full scale', async () => {
    await exportPDFSinglePage({ ...useAppState.getState(), removeStrings: false })

    expect(pdf.constructorArgs).toHaveLength(1)
    const options = pdf.constructorArgs[0][0] as { unit: string; format: number[] }
    expect(options.unit).toBe('mm')
    expect(Math.max(...options.format)).toBeGreaterThan(600)
    expect(pdf.savedAs[0]).toMatch(/_single-page\.pdf$/)
  })

  it('omits string lines from the single-page PDF when requested', async () => {
    const state = useAppState.getState()
    await exportPDFSinglePage({ ...state, removeStrings: false })
    const visibleLineCount = pdf.lines.length

    pdf.lines.length = 0
    await exportPDFSinglePage({ ...state, removeStrings: true })

    expect(pdf.lines).toHaveLength(visibleLineCount - state.strings)
  })

  it('uses a 1mm line width for red compensation guides', async () => {
    await exportPDFSinglePage({
      ...useAppState.getState(),
      showNutCompensation: true,
      nutCompensationOffsets: [0.5, 0, 0, 0, 0, 0],
    })

    expect(pdf.lineWidths).toContain(1)
    expect(pdf.lineWidths).toContain(25.4 / 72)
  })
})
