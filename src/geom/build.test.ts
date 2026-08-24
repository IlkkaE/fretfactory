import { describe, expect, it } from 'vitest'
import { useAppState } from '../store.state'
import { buildBoard, COLORS, STROKES } from './build'

describe('buildBoard string visibility', () => {
  it('shows strings by default and removes only string lines when requested', () => {
    const state = useAppState.getState()
    const visible = buildBoard({ ...state, removeStrings: false })
    const removed = buildBoard({ ...state, removeStrings: true })

    const stringLineCount = (result: ReturnType<typeof buildBoard>) =>
      result.els.filter(el => el.kind === 'line' && el.w === STROKES.STRING).length

    expect(stringLineCount(visible)).toBe(state.strings)
    expect(stringLineCount(removed)).toBe(0)
    expect(removed.els.length).toBe(visible.els.length - state.strings)
  })

  it('uses the requested preview colors and 10px yellow compensation guides', () => {
    const state = useAppState.getState()
    const result = buildBoard({
      ...state,
      showNutCompensation: true,
      nutCompensationOffsets: [0.5, 0, 0, 0, 0, 0],
    })
    const compensation = result.els.find(
      el => el.kind === 'line' && el.color === '#facc15',
    )

    expect(COLORS.edge).toBe('#ffffff')
    expect(COLORS.fret).toBe('#ffffff')
    expect(COLORS.string).toBe('#ffffff')
    expect(COLORS.marker).toBe('#ffffff')
    expect(compensation?.w).toBe(10)
  })
})
