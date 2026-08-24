import { useMemo } from 'react'
import { useAppState } from '../store.state'
import type { StringFeel } from '../types'
import {
  FEEL_LABELS,
  NOTE_NAMES,
  recommendString,
  stringScaleLengths,
} from '../strings/advisor'
import { XL_NICKEL_CATALOG_SOURCE, XL_NICKEL_CATALOG_VERSION } from '../strings/catalog'
import { fromMillimeters } from '../utils/units'

const OCTAVES = Array.from({ length: 10 }, (_, index) => index - 1)

function splitPitch(pitch: string): { note: string; octave: number } {
  const match = /^([A-G]#?)(-?\d)$/.exec(pitch)
  return match ? { note: match[1], octave: Number(match[2]) } : { note: 'E', octave: 2 }
}

function gaugeLabel(gauge: number): string {
  return gauge.toFixed(4).replace(/^0/, '').replace(/0+$/, '').replace(/\.$/, '')
}

function matchStatus(percent: number): { label: string; className: string } {
  const delta = Math.abs(percent - 100)
  if (delta <= 4) return { label: 'Balanced', className: 'string-status-good' }
  if (percent < 100) return { label: `${Math.round(100 - percent)}% lighter`, className: 'string-status-near' }
  return { label: `${Math.round(percent - 100)}% firmer`, className: 'string-status-near' }
}

export default function StringAdvisor() {
  const s = useAppState()
  const set = useAppState(state => state.set)
  const scales = useMemo(() => stringScaleLengths(
    s.strings,
    s.scaleTreble ?? 647.7,
    s.scaleBass ?? 647.7,
    s.curvedExponent ?? 1,
  ), [s.strings, s.scaleTreble, s.scaleBass, s.curvedExponent])
  const pitches = Array.from({ length: s.strings }, (_, index) => s.stringPitches[index] ?? 'E2')
  const recommendations = pitches.map((pitch, index) =>
    recommendString(pitch, scales[index], s.stringFeel, s.preferWoundG3))
  const profileUnsupported = Math.max(...scales) > 30 * 25.4

  const setPitchPart = (index: number, part: 'note' | 'octave', value: string | number) => {
    const current = splitPitch(pitches[index])
    const next = part === 'note' ? `${value}${current.octave}` : `${current.note}${value}`
    const stringPitches = pitches.slice()
    stringPitches[index] = next
    set({ stringPitches })
  }

  return (
    <div className="card string-advisor-card">
      <div className="string-advisor-heading">
        <div>
          <div className="panel-group-title panel-group-title-strings">String selection</div>
          <div className="section-title">Balanced gauge advisor</div>
        </div>
        <span className="help-tooltip">
          <button type="button" className="help-button" aria-label="String advisor limitations" aria-describedby="string-advisor-help">?</button>
          <span id="string-advisor-help" className="help-tooltip-content help-tooltip-right" role="tooltip">
            Estimates open-string tension from pitch, each string&apos;s scale length and a versioned D&apos;Addario XL catalog. Equal calculated tension does not guarantee identical feel. Nut action, stiffness, winding and playing style are not modeled. Verify physical length and fit before ordering.
          </span>
        </span>
      </div>

      <label className="label">
        String family
        <select className="select" value="xl-nickel" disabled aria-label="String family">
          <option value="xl-nickel">XL nickel · plain / round wound</option>
        </select>
      </label>
      <label className="label">
        Target feel
        <select className="select" value={s.stringFeel} onChange={event => set({ stringFeel: event.target.value as StringFeel })}>
          {(Object.keys(FEEL_LABELS) as StringFeel[]).map(value => (
            <option key={value} value={value}>{FEEL_LABELS[value]}</option>
          ))}
        </select>
      </label>
      <label className="row-1fr-auto text small string-option-row">
        <span>Prefer a wound G3</span>
        <input type="checkbox" checked={s.preferWoundG3} onChange={event => set({ preferWoundG3: event.target.checked })} />
      </label>
      {profileUnsupported && (
        <div className="string-fit-warning" role="note">
          This scale exceeds the 30 in electric-guitar profile. Bass strings use different constructions and substantially different feel targets, so this version does not make a gauge recommendation.
        </div>
      )}

      {!profileUnsupported && <div className="string-list" role="table" aria-label="String gauge recommendations">
        {recommendations.map((recommendation, index) => {
          const pitch = splitPitch(pitches[index])
          const status = recommendation.targetPercent == null ? null : matchStatus(recommendation.targetPercent)
          return (
            <div className="string-row" role="row" key={index}>
              <div className="string-index" aria-label={`String ${index + 1}`}>
                <strong>{index + 1}</strong>
                <span>{index === 0 ? 'bass' : index === s.strings - 1 ? 'treble' : ''}</span>
              </div>
              <div className="pitch-editor">
                <select className="select string-note-select" aria-label={`String ${index + 1} note`} value={pitch.note} onChange={event => setPitchPart(index, 'note', event.target.value)}>
                  {NOTE_NAMES.map(note => <option key={note} value={note}>{note}</option>)}
                </select>
                <select className="select string-octave-select" aria-label={`String ${index + 1} octave`} value={pitch.octave} onChange={event => setPitchPart(index, 'octave', Number(event.target.value))}>
                  {OCTAVES.map(octave => <option key={octave} value={octave}>{octave}</option>)}
                </select>
              </div>
              <div className="string-result">
                {recommendation.match ? (
                  <>
                    <div className="string-gauge">
                      {gaugeLabel(recommendation.match.gaugeInches)}
                      <span>{recommendation.match.construction}</span>
                    </div>
                    <div className={`string-status ${status?.className}`}>{status?.label}</div>
                    <div className="string-alternatives">
                      {recommendation.lighter ? `↓ ${gaugeLabel(recommendation.lighter.gaugeInches)}` : '↓ —'}
                      <span>{fromMillimeters(recommendation.scaleMm, s.units).toFixed(s.units === 'inch' ? 2 : 0)} {s.units === 'inch' ? 'in' : 'mm'}</span>
                      {recommendation.heavier ? `↑ ${gaugeLabel(recommendation.heavier.gaugeInches)}` : '↑ —'}
                    </div>
                  </>
                ) : <div className="string-no-match">No verified match</div>}
              </div>
            </div>
          )
        })}
      </div>}
      <div className="caption-small string-advisor-footnote">
        Suggestions are starting points, not product-fit guarantees. Catalog: <a href={XL_NICKEL_CATALOG_SOURCE} target="_blank" rel="noreferrer">{XL_NICKEL_CATALOG_VERSION}</a>.
      </div>
    </div>
  )
}
