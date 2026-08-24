import React from 'react'
import '../styles/ui.css'
import { useAppState } from '../store.state'
import { SPEC } from '../spec'
import { fromDisplayLength, fromMillimeters, toDisplayLength, unitLabel } from '../utils/units'
import { STATE_LIMITS } from '../utils/stateValidation'
import {
	estimateGeneralNutCompensation,
	supportsGeneralNutCompensationProfile,
} from '../geom/nutCompensationProfile'
import { defaultGuitarPitches } from '../strings/advisor'

function Num({ label, value, onChange, step=0.1, min, max, suffix }:{
	label: string
	value: number | undefined
	onChange: (v:number)=>void
	step?: number
	min?: number
	max?: number
	suffix?: string
}){
	const [local, setLocal] = React.useState<string>(value == null ? '' : String(value))
	React.useEffect(()=>{ setLocal(value == null ? '' : String(value)) }, [value])
	return (
			<label className="row-1fr-auto text small">
			<span>{label}</span>
				<div className="flex-row">
						<input type="number" inputMode="decimal" value={local}
						onChange={(e)=>{
							setLocal(e.target.value)
							const raw = e.target.value.replace(',', '.')
							const value = Number(raw)
							if (!Number.isFinite(value)) return
							onChange(Math.min(max ?? Infinity, Math.max(min ?? -Infinity, value)))
						}}
					onInvalid={(e)=>{ e.currentTarget.setCustomValidity('Enter a valid value.'); }}
					onInput={(e)=>{ e.currentTarget.setCustomValidity(''); }}
					step={step} min={min} max={max}
							className="input w-90" />
					{suffix && <span className="small text">{suffix}</span>}
			</div>
		</label>
	)
}

export default function Controls() {
	const s = useAppState()
	const set = useAppState(state => state.set)

	const lengthStep = s.units === 'inch' ? 0.001 : 0.1
	const lengthSuffix = unitLabel(s.units)
	const displayLength = (valueMm: number | undefined) => toDisplayLength(valueMm, s.units)
	const displayLimit = (valueMm: number) => toDisplayLength(valueMm, s.units)
	const setLength = (key: keyof typeof s) => (value: number) => {
		const patch: Partial<typeof s> = { [key]: fromDisplayLength(value, s.units) }
		if (key === 'scaleTreble' || key === 'scaleBass') patch.nutCompensationProfile = 'custom'
		set(patch)
	}
	const setStringCount = (value: number) => {
		const strings = Math.round(value)
		set({
			strings,
			nutCompensationOffsets: Array.from({ length: strings }, (_, i) => s.nutCompensationOffsets?.[i] ?? 0),
			nutCompensationProfile: 'custom',
			stringPitches: defaultGuitarPitches(strings),
		})
	}
	return (
			<div className="card card-controls">
				<div className="grid-1">
				<Num label="Strings" value={s.strings} onChange={setStringCount} step={1} min={STATE_LIMITS.strings.min} max={STATE_LIMITS.strings.max} />
				<Check label="Remove strings" checked={s.removeStrings} onChange={(v)=> set({ removeStrings: v })} />
				<Num label="Frets" value={s.frets} onChange={(v)=> set({ frets: Math.round(v) })} step={1} min={STATE_LIMITS.frets.min} max={STATE_LIMITS.frets.max} />
				<Num label="Scale Treble" value={displayLength(s.scaleTreble)} onChange={setLength('scaleTreble')} step={lengthStep} min={displayLimit(100)} max={displayLimit(1000)} suffix={lengthSuffix} />
				<Num label="Scale Bass" value={displayLength(s.scaleBass)} onChange={setLength('scaleBass')} step={lengthStep} min={displayLimit(100)} max={displayLimit(1200)} suffix={lengthSuffix} />
				<Num label="Anchor Fret" value={s.anchorFret} onChange={(v)=> set({ anchorFret: Math.round(v) })} step={1} min={STATE_LIMITS.anchorFret.min} max={Math.min(s.frets, STATE_LIMITS.anchorFret.max)} />
				<Num label="Curved Exponent" value={s.curvedExponent} onChange={(v)=> set({ curvedExponent: v, nutCompensationProfile: 'custom' })} step={0.01} min={STATE_LIMITS.curvedExponent.min} max={STATE_LIMITS.curvedExponent.max} />
				<Num label="Nut Span (E–E)" value={displayLength(s.stringSpanNut)} onChange={setLength('stringSpanNut')} step={lengthStep} min={displayLimit(10)} max={displayLimit(100)} suffix={lengthSuffix} />
				<Num label="Bridge Span (E–E)" value={displayLength(s.stringSpanBridge)} onChange={setLength('stringSpanBridge')} step={lengthStep} min={displayLimit(10)} max={displayLimit(120)} suffix={lengthSuffix} />
				<Num label="Overhang" value={displayLength(s.overhang)} onChange={setLength('overhang')} step={lengthStep} min={0} max={displayLimit(20)} suffix={lengthSuffix} />
			</div>
		</div>
	)
}

export function NutCompensationControls() {
	const s = useAppState()
	const set = useAppState(state => state.set)
	const lengthSuffix = unitLabel(s.units)
	const displayLimit = (valueMm: number) => toDisplayLength(valueMm, s.units)
	const displayCompensation = (valueMm: number) => Number(
		fromMillimeters(valueMm, s.units).toFixed(s.units === 'inch' ? 4 : 2)
	)
	const setNutCompensation = (index: number) => (value: number) => {
		const offsets = Array.from({ length: s.strings }, (_, i) => s.nutCompensationOffsets?.[i] ?? 0)
		offsets[index] = fromDisplayLength(value, s.units)
		set({ nutCompensationOffsets: offsets, nutCompensationProfile: 'custom' })
	}
	const canApplyGeneralProfile = supportsGeneralNutCompensationProfile(s.strings)
	const applyGeneralCompensation = () => {
		if (!s.scaleTreble || !s.scaleBass) return
		const offsets = estimateGeneralNutCompensation(
			s.strings, s.scaleTreble, s.scaleBass, s.curvedExponent ?? 1,
		)
		if (!offsets) return
		set({
			showNutCompensation: true,
			nutCompensationOffsets: offsets,
			nutCompensationProfile: 'general-electric-guitar',
		})
	}

	return (
		<div className="card card-controls">
			<div className="grid-1">
				<div className="section-title-row">
					<div className="section-title">Compensated nut</div>
					<span className="help-tooltip">
						<button type="button" className="help-button" aria-label="Compensated nut limitations" aria-describedby="nut-compensation-help">?</button>
						<span id="nut-compensation-help" className="help-tooltip-content" role="tooltip">
							Experimental estimate for 6–8-string electric guitars. Assumes a conventional string set, standard-style tuning and typical first-fret action. It does not account for exact string construction, setup or fretting pressure. Verify and adjust before manufacturing.
						</span>
					</span>
				</div>
				<Check label="Show compensation guides" checked={s.showNutCompensation} onChange={(v)=> set({ showNutCompensation: v })} />
				<button type="button" className="btn btn-block" onClick={applyGeneralCompensation} disabled={!canApplyGeneralProfile}>
					Use estimated defaults
				</button>
				{s.nutCompensationProfile !== 'general-electric-guitar' && (
					<div className="caption-small">
						{canApplyGeneralProfile
							? 'Uses the current per-string scale lengths. All values remain editable.'
							: 'Estimated defaults are available for 6–8-string electric guitars.'}
					</div>
				)}
				{s.showNutCompensation && Array.from({ length: s.strings }, (_, displayIndex) => {
					const internalIndex = s.strings - 1 - displayIndex
					const stringNumber = displayIndex + 1
					return <Num key={internalIndex} label={`String ${stringNumber}${displayIndex === 0 ? ' (treble)' : displayIndex === s.strings - 1 ? ' (bass)' : ''} offset (+ toward bridge)`}
						value={displayCompensation(s.nutCompensationOffsets?.[internalIndex] ?? 0)}
						onChange={setNutCompensation(internalIndex)} step={s.units === 'inch' ? 0.0001 : 0.01}
						min={displayLimit(-5)} max={displayLimit(5)} suffix={lengthSuffix} />
				})}
			</div>
		</div>
	)
}

export function MarkerControls() {
	const s = useAppState()
	const set = useAppState(state => state.set)
	const lengthStep = s.units === 'inch' ? 0.001 : 0.1
	const lengthSuffix = unitLabel(s.units)
	const displayLength = (valueMm: number | undefined) => toDisplayLength(valueMm, s.units)
	const displayLimit = (valueMm: number) => toDisplayLength(valueMm, s.units)
	const setLength = (key: keyof typeof s) => (value: number) => set({ [key]: fromDisplayLength(value, s.units) })
	const fretsToStr = (arr: number[]) => (arr ?? []).map(n => n + 1).join(',')
	const parseFrets = (txt: string, maxFret: number) => Array.from(new Set(
		txt.split(/[^0-9]+/)
			.map(t => parseInt(t, 10))
			.filter(n => Number.isFinite(n) && n >= 1 && n <= maxFret)
			.map(n => n - 1),
	)).sort((a,b) => a-b)

	return (
		<div className="card card-controls">
			<div className="grid-1">
				<div className="section-title">Fretboard markers</div>
				<Num label="Marker size" value={displayLength(s.markerSize)} onChange={setLength('markerSize')} step={lengthStep} min={displayLimit(1)} max={displayLimit(30)} suffix={lengthSuffix} />
				<Num label="Guide position %" value={s.guidePosPct} onChange={(v)=> set({ guidePosPct: Math.max(0, Math.min(100, Math.round(v))) })} step={1} min={0} max={100} />
				<FretsEditor
					label="Marker gaps (1 = nut–1)"
					value={fretsToStr(s.markerFrets)}
					onCommit={(txt)=> set({ markerFrets: parseFrets(txt, s.frets) })}
					onReset={()=> set({ markerFrets: SPEC.marker.defaultFrets.slice() })}
				/>
				<Check label="Show ghost helpers" checked={Boolean(s.showGhostHelpers)} onChange={(v)=> set({ showGhostHelpers: v })} />
			</div>
		</div>
	)
}

		function Check({ label, checked, onChange }:{ label:string; checked:boolean; onChange:(v:boolean)=>void }){
			return (
					<label className="row-1fr-auto text small">
					<span>{label}</span>
					<input type="checkbox" checked={checked} onChange={e=> onChange(e.target.checked)} />
				</label>
			)
		}

		function FretsEditor({ label, value, onCommit, onReset }:{ label:string; value:string; onCommit:(txt:string)=>void; onReset:()=>void }){
			const [local, setLocal] = React.useState<string>(value ?? '')
			React.useEffect(()=>{ setLocal(value ?? '') }, [value])
			return (
					<label className="row-1fr-auto text small">
					<span>{label}</span>
						<div className="flex-row">
								<input
							type="text"
							value={local}
							onChange={(e)=> setLocal(e.target.value)}
							onBlur={()=> onCommit(local)}
								placeholder="e.g. 3,5,7,9,12,15,17,19,21 (gap k = between (k-1) and k)"
									className="input w-150 h-32"
						/>
							<button type="button" onClick={onReset} className="btn" title="Reset to defaults">Reset</button>
					</div>
				</label>
			)
		}

