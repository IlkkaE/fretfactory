import React from 'react'
import '../styles/ui.css'
import { useAppState } from '../store.state'
import { THEME } from '../utils/theme'
import { SPEC } from '../spec'

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
					onChange={(e)=>{ setLocal(e.target.value); const raw = e.target.value.replace(',', '.'); const v = parseFloat(raw); if (!Number.isNaN(v)) onChange(v) }}
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

	const mm1 = (v:number) => Math.round(v*10)/10
	const setNum = (k: keyof typeof s) => (v:number) => set({ [k]: v } as any)

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
				<Num label="Strings" value={s.strings} onChange={(v)=> set({ strings: Math.max(1, Math.round(v)) })} step={1} />
				<Num label="Frets" value={s.frets} onChange={(v)=> set({ frets: Math.max(1, Math.round(v)) })} step={1} />
				<Num label="Scale Treble" value={s.scaleTreble} onChange={(v)=> set({ scaleTreble: mm1(v) })} step={0.1} min={100} max={1000} suffix="mm" />
				<Num label="Scale Bass" value={s.scaleBass} onChange={(v)=> set({ scaleBass: mm1(v) })} step={0.1} min={100} max={1200} suffix="mm" />
				<Num label="Anchor Fret" value={s.anchorFret} onChange={(v)=> set({ anchorFret: Math.max(0, Math.round(v)) })} step={1} />
				<Num label="Curved Exponent" value={s.curvedExponent} onChange={(v)=> set({ curvedExponent: Math.max(0.01, v) })} step={0.01} />
				<Num label="Nut Span (E–E)" value={s.stringSpanNut} onChange={(v)=> set({ stringSpanNut: mm1(v) })} step={0.1} min={10} max={100} suffix="mm" />
				<Num label="Bridge Span (E–E)" value={s.stringSpanBridge} onChange={(v)=> set({ stringSpanBridge: mm1(v) })} step={0.1} min={10} max={120} suffix="mm" />
				<Num label="Overhang" value={s.overhang} onChange={(v)=> set({ overhang: mm1(v) })} step={0.1} min={0} max={20} suffix="mm" />

						{/* ── Fret markers ───────────────────────────────────────── */}
					<div className="hr-thin" />
					<div className="section-title">Fretboard markers</div>

										<Num label="Marker size" value={s.markerSize} onChange={(v)=> set({ markerSize: mm1(v) })} step={0.1} min={1} max={30} suffix="mm" />
										{/* Guide line driven marker position */}
										<Num label="Fretboard marker offset" value={s.guidePosPct} onChange={(v)=> set({ guidePosPct: Math.max(0, Math.min(100, Math.round(v))) })} step={1} min={0} max={100} />

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

