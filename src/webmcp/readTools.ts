import { PRESETS, type PresetInstrument } from '../presets/instruments'
import type { AppState, Units } from '../types'
import { toDisplayLength, toMillimeters } from '../utils/units'
import type { WebMcpTool } from './types'

const EMPTY_INPUT_SCHEMA = {
  type: 'object',
  properties: {},
  additionalProperties: false,
} as const

const READ_ONLY_ANNOTATIONS = {
  readOnlyHint: true,
  untrustedContentHint: false,
} as const

const json = (value: unknown) => JSON.stringify(value)

const displayLength = (valueMm: number | undefined, units: Units) =>
  valueMm == null ? undefined : toDisplayLength(valueMm, units)

const presetLength = (value: number | undefined, preset: PresetInstrument, units: Units) =>
  value == null ? undefined : displayLength(toMillimeters(value, preset.units), units)

const presetName = (preset: PresetInstrument) =>
  [preset.manufacturer, preset.model].filter(Boolean).join(' ')

function fretboardState(state: AppState) {
  return {
    app: 'FretFactory',
    schemaVersion: 1,
    lengthUnit: state.units === 'inch' ? 'in' : 'mm',
    selectedPresetId: state.selectedPresetId ?? null,
    mode: state.mode,
    strings: state.strings,
    stringsVisible: !state.removeStrings,
    frets: state.frets,
    lengths: {
      scaleTreble: displayLength(state.scaleTreble, state.units),
      scaleBass: displayLength(state.scaleBass, state.units),
      stringSpanNut: displayLength(state.stringSpanNut, state.units),
      stringSpanBridge: displayLength(state.stringSpanBridge, state.units),
      overhang: displayLength(state.overhang, state.units),
      markerSize: displayLength(state.markerSize, state.units),
      radiusNut: displayLength(state.radiusNut, state.units),
      radiusBridge: displayLength(state.radiusBridge, state.units),
      nutCompensationOffsets: state.nutCompensationOffsets.map(value =>
        displayLength(value, state.units),
      ),
    },
    geometry: {
      anchorFret: state.anchorFret,
      curvedExponent: state.curvedExponent,
      markerFrets: state.markerFrets,
      ghostHelpersVisible: Boolean(state.showGhostHelpers),
      guidePositionPercent: state.guidePosPct,
    },
    nutCompensation: {
      visible: state.showNutCompensation,
      profile: state.nutCompensationProfile,
    },
    stringSelection: {
      pitchesBassToTreble: state.stringPitches,
      feel: state.stringFeel,
      profile: state.stringAdvisorProfile,
      preferWoundG3: state.preferWoundG3,
    },
  }
}

function presetDetails(preset: PresetInstrument, units: Units) {
  const scale = preset.scale
  const scaleTreble = preset.scaleTreble ?? scale
  const scaleBass = preset.scaleBass ?? scale

  return {
    id: preset.id,
    name: presetName(preset),
    family: preset.instrumentFamily ?? 'guitar',
    manufacturer: preset.manufacturer ?? null,
    model: preset.model,
    artist: preset.artist ?? null,
    introduced: preset.introduced ?? null,
    country: preset.country ?? null,
    info: preset.info ?? null,
    players: preset.players ?? [],
    mode: preset.mode,
    strings: preset.strings,
    frets: preset.frets,
    lengthUnit: units === 'inch' ? 'in' : 'mm',
    lengths: {
      scaleTreble: presetLength(scaleTreble, preset, units),
      scaleBass: presetLength(scaleBass, preset, units),
      stringSpanNut: presetLength(preset.stringSpanNut, preset, units),
      stringSpanBridge: presetLength(preset.stringSpanBridge, preset, units),
      overhang: presetLength(preset.overhang, preset, units),
    },
    anchorFret: preset.anchorFret ?? null,
    curvedExponent: preset.curvedExponent ?? null,
  }
}

function normalizedQuery(input: Record<string, unknown>) {
  return typeof input.query === 'string' ? input.query.trim().toLocaleLowerCase() : ''
}

function normalizedFamily(input: Record<string, unknown>) {
  return input.family === 'guitar' || input.family === 'bass' ? input.family : 'all'
}

function normalizedLimit(input: Record<string, unknown>) {
  if (typeof input.limit !== 'number' || !Number.isFinite(input.limit)) return 8
  return Math.max(1, Math.min(10, Math.floor(input.limit)))
}

export function createFretFactoryReadTools(
  getState: () => AppState,
): WebMcpTool[] {
  return [
    {
      name: 'get_fretboard_state',
      title: 'Get fretboard state',
      description: 'Return the current FretFactory configuration. Every value in lengths uses lengthUnit and follows the unit selected by the user.',
      inputSchema: EMPTY_INPUT_SCHEMA,
      annotations: READ_ONLY_ANNOTATIONS,
      execute: () => json(fretboardState(getState())),
    },
    {
      name: 'list_fretboard_presets',
      title: 'List fretboard presets',
      description: 'Search FretFactory instrument presets. Results contain stable preset IDs that can be passed to get_fretboard_preset.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Optional text matched against manufacturer, model, artist, and preset ID.',
            maxLength: 100,
          },
          family: {
            type: 'string',
            enum: ['all', 'guitar', 'bass'],
            description: 'Optional instrument family filter.',
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 10,
            description: 'Maximum number of results. Defaults to 8.',
          },
        },
        additionalProperties: false,
      },
      annotations: READ_ONLY_ANNOTATIONS,
      execute: input => {
        const query = normalizedQuery(input)
        const family = normalizedFamily(input)
        const limit = normalizedLimit(input)
        const matches = PRESETS.filter(preset => {
          const presetFamily = preset.instrumentFamily ?? 'guitar'
          if (family !== 'all' && family !== presetFamily) return false
          if (!query) return true
          return [preset.id, preset.manufacturer, preset.model, preset.artist]
            .filter(Boolean)
            .join(' ')
            .toLocaleLowerCase()
            .includes(query)
        })

        return json({
          query,
          family,
          totalMatches: matches.length,
          presets: matches.slice(0, limit).map(preset => ({
            id: preset.id,
            name: presetName(preset),
            family: preset.instrumentFamily ?? 'guitar',
            strings: preset.strings,
            frets: preset.frets,
          })),
        })
      },
    },
    {
      name: 'get_fretboard_preset',
      title: 'Get fretboard preset',
      description: 'Return one FretFactory preset by ID. Lengths are converted to the unit currently selected by the user.',
      inputSchema: {
        type: 'object',
        properties: {
          presetId: {
            type: 'string',
            description: 'Exact preset ID returned by list_fretboard_presets.',
            maxLength: 100,
          },
        },
        required: ['presetId'],
        additionalProperties: false,
      },
      annotations: READ_ONLY_ANNOTATIONS,
      execute: input => {
        const presetId = typeof input.presetId === 'string' ? input.presetId : ''
        const preset = PRESETS.find(item => item.id === presetId)
        if (!preset) return json({ error: 'preset_not_found', presetId })
        return json(presetDetails(preset, getState().units))
      },
    },
    {
      name: 'get_export_capabilities',
      title: 'Get export capabilities',
      description: 'Return FretFactory export formats and their physical-unit behavior. This tool does not start a download.',
      inputSchema: EMPTY_INPUT_SCHEMA,
      annotations: READ_ONLY_ANNOTATIONS,
      execute: () => json({
        selectedLengthUnit: getState().units === 'inch' ? 'in' : 'mm',
        formats: [
          { id: 'svg', layout: 'single-page', physicalUnits: ['mm', 'in'], namedFretLayer: true },
          { id: 'dxf', layout: 'single-page', physicalUnits: ['mm', 'in'] },
          { id: 'pdf', layout: 'a4-tiles', physicalUnits: ['mm'], printScale: '100%' },
          { id: 'pdf', layout: 'single-page', physicalUnits: ['mm'], printScale: '100%' },
        ],
        removeStringsSupported: true,
        downloadsStarted: false,
      }),
    },
  ]
}
