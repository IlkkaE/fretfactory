import { PRESETS } from '../presets/instruments'
import { useAppState } from '../store.state'
import type { AppState } from '../types'
import { createFretFactoryReadTools } from './readTools'
import { registerFretFactoryWebMcpTools } from './register'
import type { WebMcpModelContext, WebMcpTool } from './types'

const execute = async (
  tools: WebMcpTool[],
  name: string,
  input: Record<string, unknown> = {},
) => {
  const tool = tools.find(item => item.name === name)
  if (!tool) throw new Error(`Missing tool: ${name}`)
  return JSON.parse(await tool.execute(input))
}

describe('FretFactory WebMCP read tools', () => {
  const baseState = useAppState.getState()

  afterEach(() => {
    useAppState.setState(baseState, true)
  })

  test('returns current state lengths in the user-selected unit', async () => {
    const state = {
      ...baseState,
      units: 'inch',
      scaleTreble: 647.7,
      scaleBass: 660.4,
      removeStrings: true,
    } satisfies AppState
    const result = await execute(
      createFretFactoryReadTools(() => state),
      'get_fretboard_state',
    )

    expect(result.lengthUnit).toBe('in')
    expect(result.lengths.scaleTreble).toBe(25.5)
    expect(result.lengths.scaleBass).toBe(26)
    expect(result.stringsVisible).toBe(false)
  })

  test('searches and limits preset summaries', async () => {
    const tools = createFretFactoryReadTools(() => baseState)
    const result = await execute(tools, 'list_fretboard_presets', {
      query: 'fender',
      family: 'bass',
      limit: 2,
    })

    expect(result.totalMatches).toBeGreaterThan(2)
    expect(result.presets).toHaveLength(2)
    expect(result.presets.every((preset: { family: string }) => preset.family === 'bass')).toBe(true)
  })

  test('returns preset measurements in the current display unit', async () => {
    const state = { ...baseState, units: 'mm' } satisfies AppState
    const result = await execute(
      createFretFactoryReadTools(() => state),
      'get_fretboard_preset',
      { presetId: 'fender-stratocaster-clapton' },
    )

    expect(result.lengthUnit).toBe('mm')
    expect(result.lengths.scaleTreble).toBe(647.7)
    expect(result.lengths.scaleBass).toBe(647.7)
  })

  test('returns a bounded error for an unknown preset', async () => {
    const result = await execute(
      createFretFactoryReadTools(() => baseState),
      'get_fretboard_preset',
      { presetId: 'does-not-exist' },
    )

    expect(result).toEqual({ error: 'preset_not_found', presetId: 'does-not-exist' })
  })

  test('reports the unit selected for SVG and DXF exports', async () => {
    const state = { ...baseState, units: 'inch' } satisfies AppState
    const result = await execute(
      createFretFactoryReadTools(() => state),
      'get_export_capabilities',
    )

    expect(result.selectedLengthUnit).toBe('in')
    expect(result.downloadsStarted).toBe(false)
  })

  test('keeps every tool read-only and output concise', async () => {
    const tools = createFretFactoryReadTools(() => baseState)

    expect(tools).toHaveLength(4)
    for (const tool of tools) {
      expect(tool.annotations.readOnlyHint).toBe(true)
      expect(tool.name.length).toBeLessThanOrEqual(30)
      expect(tool.description.length).toBeLessThanOrEqual(500)
    }

    const listOutput = await tools
      .find(tool => tool.name === 'list_fretboard_presets')!
      .execute({ limit: 10 })
    expect(listOutput.length).toBeLessThanOrEqual(1500)
    expect(PRESETS.length).toBeGreaterThan(10)
  })
})

describe('FretFactory WebMCP registration', () => {
  test('does nothing when the browser does not support WebMCP', () => {
    expect(registerFretFactoryWebMcpTools(undefined)).toBeNull()
  })

  test('registers all tools and aborts their lifecycle on dispose', async () => {
    const registered: WebMcpTool[] = []
    const signals: AbortSignal[] = []
    const modelContext: WebMcpModelContext = {
      registerTool: async (tool, options) => {
        registered.push(tool)
        if (options?.signal) signals.push(options.signal)
      },
    }

    const registration = registerFretFactoryWebMcpTools(modelContext)!
    await registration.ready

    expect(registered.map(tool => tool.name)).toEqual([
      'get_fretboard_state',
      'list_fretboard_presets',
      'get_fretboard_preset',
      'get_export_capabilities',
    ])
    expect(signals.every(signal => !signal.aborted)).toBe(true)

    registration.dispose()
    expect(signals.every(signal => signal.aborted)).toBe(true)
  })
})
