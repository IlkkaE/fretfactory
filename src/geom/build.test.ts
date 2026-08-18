import { describe, expect, it } from 'vitest'
import { useAppState } from '../store.state'
import { buildBoard, STROKES } from './build'

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
})
