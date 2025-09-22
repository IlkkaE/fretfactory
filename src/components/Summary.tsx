import React from 'react'
import { useAppState } from '../store.state'

export default function Summary() {
  const s = useAppState()
  const data: any = {
    mode: s.mode,
    units: s.units,
    strings: s.strings,
    frets: s.frets,
    stringSpanNut: s.stringSpanNut,
    stringSpanBridge: s.stringSpanBridge,
    overhang: s.overhang,
    scaleTreble: s.scaleTreble,
    scaleBass: s.scaleBass,
    anchorFret: s.anchorFret,
    curvedExponent: s.curvedExponent,
  }

  return (
    <div className="card">
      <div className="bold mb-8">State / summary</div>
      <pre className="pre-block">
{JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
