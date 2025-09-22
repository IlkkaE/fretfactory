import React from 'react'
import { PRESETS } from '../presets/instruments'
import { useAppState } from '../store.state'

export default function PresetMenu() {
  const s = useAppState()
  const set = useAppState(state => state.set)
  const applyPreset = useAppState(state => state.applyPreset)

  const onChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const id = e.target.value
    if (id) applyPreset(id)
  }

  // Build display labels. We don't convert values here; applyPreset does mm conversion with 0.1 precision.
  const abbr = (name?: string) => {
    if (!name) return ''
    const consonants = name.replace(/[^BCDFGHJKLMNPQRSTVWXYZ]/gi, '').toUpperCase()
    return (consonants + 'XXXX').slice(0, 4)
  }
  const options = React.useMemo(() => PRESETS.map(p => ({
    id: p.id,
    label: `${abbr(p.manufacturer)} ${p.model}`.trim()
  })), [])

  return (
    <div className="card card-controls glass">
      <label htmlFor="preset-select" className="label">Preset</label>
      <select id="preset-select" value={s.selectedPresetId ?? ''} onChange={onChange} className="select">
        <option value="">Custom (no preset)</option>
        {options.map(opt => (
          <option key={opt.id} value={opt.id}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}
