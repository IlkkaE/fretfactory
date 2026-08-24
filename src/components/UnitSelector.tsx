import { useAppState } from '../store.state'
import type { Units } from '../types'
import { Segmented } from './ui/Segmented'

const OPTIONS: { label: string; value: Units }[] = [
  { label: 'mm', value: 'mm' },
  { label: 'in', value: 'inch' },
]

export default function UnitSelector() {
  const units = useAppState(state => state.units)
  const setUnits = useAppState(state => state.setUnits)

  return (
    <div className="card card-controls glass">
      <div className="panel-group-title panel-group-title-geometry">Fretboard geometry</div>
      <div className="row-1fr-auto">
        <span className="label mb-0">Measurement unit</span>
        <Segmented value={units} options={OPTIONS} onChange={setUnits} ariaLabel="Measurement unit" />
      </div>
    </div>
  )
}
