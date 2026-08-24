import { useMemo } from 'react'
import { useAppState } from '../store.state'
import type { StringFeel } from '../types'
import {
  FEEL_LABELS,
  matchingBalancedBassSet,
  NOTE_NAMES,
  recommendStringForProfile,
  stringScaleLengths,
} from '../strings/advisor'
import {
  XL_BASS_AVAILABILITY_SOURCE,
  XL_BASS_STRINGS,
  XL_NICKEL_AVAILABILITY_SOURCE,
  XL_NICKEL_CATALOG_COVERAGE,
  XL_NICKEL_CATALOG_SOURCE,
  XL_NICKEL_CATALOG_VERSION,
} from '../strings/catalog'
import { fromMillimeters } from '../utils/units'

const OCTAVES = Array.from({ length: 10 }, (_, index) => index - 1)

function splitPitch(pitch: string): { note: string; octave: number } {
  const match = /^([A-G]#?)(-?\d)$/.exec(pitch)
  return match ? { note: match[1], octave: Number(match[2]) } : { note: 'E', octave: 2 }
}

function gaugeLabel(gauge: number): string {
  return gauge.toFixed(4).replace(/^0/, '').replace(/0+$/, '').replace(/\.$/, '')
}

function feelName(feel: StringFeel): string {
  return feel.charAt(0).toUpperCase() + feel.slice(1)
}

function matchStatus(percent: number, feel: StringFeel, withinFeelBand: boolean): { label: string; className: string } {
  const delta = Math.abs(percent - 100)
  const direction = percent < 100 ? `${Math.round(100 - percent)}% lighter` : `${Math.round(percent - 100)}% firmer`
  if (delta <= 4) return { label: `${feelName(feel)} · target`, className: 'string-status-good' }
  if (withinFeelBand) return { label: `${feelName(feel)} · ${direction}`, className: 'string-status-good' }
  return { label: `Outside ${feelName(feel)} band · ${direction}`, className: 'string-status-near' }
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
    recommendStringForProfile(pitch, scales[index], s.stringFeel, s.stringAdvisorProfile, s.preferWoundG3))
  const packagedSet = matchingBalancedBassSet(
    recommendations,
    pitches,
    scales,
    s.stringFeel,
    s.stringAdvisorProfile,
  )
  const displayIndices = Array.from({ length: s.strings }, (_, displayIndex) => s.strings - 1 - displayIndex)
  const familyLabel = s.stringAdvisorProfile === 'bass'
    ? 'D’Addario XL Nickel Bass'
    : s.stringAdvisorProfile === 'guitar'
      ? 'D’Addario XL Nickel Guitar'
      : 'Custom set'

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
            Presets select a guitar or bass catalog automatically. Custom instruments may mix both catalogs per string: guitar is preferred below 30 in and bass at or above it, with an overlap fallback from 28.5–31 in. Each feel maps to one target tension for the selected family. An ±8% band is practical guidance, not a physical law, and calculated tension does not guarantee identical feel or product fit.
          </span>
        </span>
      </div>

      <label className="label">
        String family
        <select className="select" value={s.stringAdvisorProfile} disabled aria-label="String family">
          <option value={s.stringAdvisorProfile}>{familyLabel}</option>
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
      {s.stringAdvisorProfile !== 'bass' && <label className="row-1fr-auto text small string-option-row">
          <span>Prefer a wound G3</span>
          <input type="checkbox" checked={s.preferWoundG3} onChange={event => set({ preferWoundG3: event.target.checked })} />
        </label>}

      <div className={`string-set-summary ${packagedSet ? 'string-set-available' : ''}`} aria-live="polite">
        <span>{packagedSet ? 'Available set' : 'Set type'}</span>
        {packagedSet ? (
          <a href={packagedSet.source} target="_blank" rel="noreferrer">
            <strong>{packagedSet.item}</strong> · {packagedSet.label}
          </a>
        ) : <strong>Custom set</strong>}
      </div>

      <div className="string-list" role="table" aria-label="String gauge recommendations">
        {displayIndices.map((internalIndex, displayIndex) => {
          const recommendation = recommendations[internalIndex]
          const pitch = splitPitch(pitches[internalIndex])
          const stringNumber = displayIndex + 1
          const status = recommendation.targetPercent == null ? null : matchStatus(recommendation.targetPercent, s.stringFeel, recommendation.withinFeelBand)
          return (
            <div className="string-row" role="row" key={internalIndex}>
              <div className="string-index" aria-label={`String ${stringNumber}`}>
                <strong>{stringNumber}</strong>
                <span>{displayIndex === 0 ? 'treble' : displayIndex === s.strings - 1 ? 'bass' : ''}</span>
              </div>
              <div className="pitch-editor">
                <select className="select string-note-select" aria-label={`String ${stringNumber} note`} value={pitch.note} onChange={event => setPitchPart(internalIndex, 'note', event.target.value)}>
                  {NOTE_NAMES.map(note => <option key={note} value={note}>{note}</option>)}
                </select>
                <select className="select string-octave-select" aria-label={`String ${stringNumber} octave`} value={pitch.octave} onChange={event => setPitchPart(internalIndex, 'octave', Number(event.target.value))}>
                  {OCTAVES.map(octave => <option key={octave} value={octave}>{octave}</option>)}
                </select>
              </div>
              <div className="string-result">
                {recommendation.match ? (
                  <>
                    <div className="string-gauge">
                      {gaugeLabel(recommendation.match.gaugeInches)}
                      <span>{recommendation.match.family} · {recommendation.match.construction}{recommendation.match.evidence === 'published-unit-weight' ? '' : ' · derived'}</span>
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
      </div>
      <div className="caption-small string-advisor-footnote">
        Suggestions are starting points, not product-fit guarantees. The snapshot contains {XL_NICKEL_CATALOG_COVERAGE.calculable} guitar and {XL_BASS_STRINGS.length} long-scale bass tension entries. Sources: <a href={XL_NICKEL_CATALOG_SOURCE} target="_blank" rel="noreferrer">{XL_NICKEL_CATALOG_VERSION}</a>, <a href={XL_NICKEL_AVAILABILITY_SOURCE} target="_blank" rel="noreferrer">current guitar singles</a> and <a href={XL_BASS_AVAILABILITY_SOURCE} target="_blank" rel="noreferrer">current bass singles</a>. “Derived” values come from published dimensions or tension. Bass product fit also depends on winding length and bridge layout.
      </div>
    </div>
  )
}
