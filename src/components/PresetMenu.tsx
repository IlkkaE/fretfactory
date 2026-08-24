import React from 'react'
import { PRESETS } from '../presets/instruments'
import { presetMeasurements, presetScaleLabel } from '../presets/display'
import { useAppState } from '../store.state'

export default function PresetMenu() {
  const s = useAppState()
  const set = useAppState(state => state.set)
  const applyPreset = useAppState(state => state.applyPreset)

  const onChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const id = e.target.value
    if (id) applyPreset(id)
    else set({ selectedPresetId: undefined, stringAdvisorProfile: 'custom' })
  }

  const abbr = (name?: string) => {
    if (!name) return ''
    const consonants = name.replace(/[^BCDFGHJKLMNPQRSTVWXYZ]/gi, '').toUpperCase()
    return (consonants + 'XXXX').slice(0, 4)
  }
  const options = React.useMemo(() => PRESETS.map(p => ({
    id: p.id,
    label: `${`${abbr(p.manufacturer)} ${p.model}`.trim()} · ${presetScaleLabel(p, s.units)}`
  })), [s.units])
  const selectedPreset = PRESETS.find(p => p.id === s.selectedPresetId)
  const details = selectedPreset ? presetMeasurements(selectedPreset, s.units) : null

  return (
    <div className="card card-controls glass">
      <label htmlFor="preset-select" className="label">Preset</label>
      <select id="preset-select" value={s.selectedPresetId ?? ''} onChange={onChange} className="select">
        <option value="">Custom (no preset)</option>
        {options.map(opt => (
          <option key={opt.id} value={opt.id}>{opt.label}</option>
        ))}
      </select>
      {details ? (
        <div className="preset-details" aria-live="polite">
          <div>Scale: {details.scale}</div>
          <div>Nut E–E: {details.nutSpan} · Bridge E–E: {details.bridgeSpan}</div>
          <div>Overhang: {details.overhang}</div>
        </div>
      ) : null}
    </div>
  )
}
