import React from 'react'
import '../styles/ui.css'
import { useAppState } from '../store.state'
import { THEME } from '../utils/theme'
import { SPEC } from '../spec'
import { fromDisplayLength, toDisplayLength, unitLabel } from '../utils/units'
import { STATE_LIMITS } from '../utils/stateValidation'

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
	const setLength = (key: keyof typeof s) => (value: number) =>
		set({ [key]: fromDisplayLength(value, s.units) } as any)

	// Helpers for marker frets parse/format
		// Display as 1-based gap numbers for the user (1 = nut–1, 2 = 1–2, 3 = 2–3, ...)
		const fretsToStr = (arr: number[]) => (arr ?? []).map(n => n + 1).join(',')
		const parseFrets = (txt: string, maxFret: number) => {
		const nums = txt
			.split(/[^0-9]+/)
				.map(t => parseInt(t, 10))
				// accept user-friendly 1..maxFret, map to internal 0..(maxFret-1)
				.filter(n => Number.isFinite(n) && n >= 1 && n <= maxFret)
				.map(n => n - 1)
		// dedupe & sort
		const uniq = Array.from(new Set(nums)).sort((a,b) => a-b)
		return uniq
	}

	return (
			<div className="card card-controls">
				<div className="grid-1">
				<Num label="Strings" value={s.strings} onChange={(v)=> set({ strings: Math.round(v) })} step={1} min={STATE_LIMITS.strings.min} max={STATE_LIMITS.strings.max} />
				<Num label="Frets" value={s.frets} onChange={(v)=> set({ frets: Math.round(v) })} step={1} min={STATE_LIMITS.frets.min} max={STATE_LIMITS.frets.max} />
				<Num label="Scale Treble" value={displayLength(s.scaleTreble)} onChange={setLength('scaleTreble')} step={lengthStep} min={displayLimit(100)} max={displayLimit(1000)} suffix={lengthSuffix} />
				<Num label="Scale Bass" value={displayLength(s.scaleBass)} onChange={setLength('scaleBass')} step={lengthStep} min={displayLimit(100)} max={displayLimit(1200)} suffix={lengthSuffix} />
				<Num label="Anchor Fret" value={s.anchorFret} onChange={(v)=> set({ anchorFret: Math.round(v) })} step={1} min={STATE_LIMITS.anchorFret.min} max={Math.min(s.frets, STATE_LIMITS.anchorFret.max)} />
				<Num label="Curved Exponent" value={s.curvedExponent} onChange={(v)=> set({ curvedExponent: v })} step={0.01} min={STATE_LIMITS.curvedExponent.min} max={STATE_LIMITS.curvedExponent.max} />
				<Num label="Nut Span (E–E)" value={displayLength(s.stringSpanNut)} onChange={setLength('stringSpanNut')} step={lengthStep} min={displayLimit(10)} max={displayLimit(100)} suffix={lengthSuffix} />
				<Num label="Bridge Span (E–E)" value={displayLength(s.stringSpanBridge)} onChange={setLength('stringSpanBridge')} step={lengthStep} min={displayLimit(10)} max={displayLimit(120)} suffix={lengthSuffix} />
				<Num label="Overhang" value={displayLength(s.overhang)} onChange={setLength('overhang')} step={lengthStep} min={0} max={displayLimit(20)} suffix={lengthSuffix} />

						{/* ── Fret markers ───────────────────────────────────────── */}
					<div className="hr-thin" />
					<div className="section-title">Fretboard markers</div>

										<Num label="Marker size" value={displayLength(s.markerSize)} onChange={setLength('markerSize')} step={lengthStep} min={displayLimit(1)} max={displayLimit(30)} suffix={lengthSuffix} />
										{/* Guide line driven marker position */}
										<Num label="Guide position %" value={s.guidePosPct} onChange={(v)=> set({ guidePosPct: Math.max(0, Math.min(100, Math.round(v))) })} step={1} min={0} max={100} />

						{/* Frets list */}
						<FretsEditor
							  label="Marker gaps (1 = nut–1)"
							value={fretsToStr(s.markerFrets)}
							onCommit={(txt)=> set({ markerFrets: parseFrets(txt, s.frets) })}
							onReset={()=> set({ markerFrets: SPEC.marker.defaultFrets.slice() })}
						/>

	                    {/* Double-12 controls removed */}

						{/* Ghost helpers */}
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

