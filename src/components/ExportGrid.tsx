import React from 'react'
import { useAppState } from '../store.state'
import { exportPDFA4, exportCSV, exportJSON, exportSVG } from '../utils/exporters'

export default function ExportGrid() {
  const s = useAppState()
  const canCurved = s.mode === 'curved' && !!(s.scaleTreble && s.scaleBass) && !!(s.stringSpanNut && s.stringSpanBridge && s.overhang != null)
  const enabled = canCurved

  const onSVG = React.useCallback(() => { if (enabled) exportSVG(useAppState.getState()) }, [enabled])
  const onPDF = React.useCallback(() => { if (enabled) exportPDFA4(useAppState.getState()) }, [enabled])
  const onCSV = React.useCallback(() => { if (enabled) exportCSV(useAppState.getState()) }, [enabled])
  const onJSON = React.useCallback(() => { if (enabled) exportJSON(useAppState.getState()) }, [enabled])

  const btn = (label: string, onClick: () => void) => (
    <button onClick={onClick} disabled={!enabled} className="btn btn-block" aria-label={label}>{label}</button>
  )

  return (
    <div className="card card-controls glass">
      <div className="grid-gap10-2cols">
        {btn('Export SVG', onSVG)}
        {btn('Export PDF (A4 tiles)', onPDF)}
        {btn('Export CSV', onCSV)}
        {btn('Export JSON', onJSON)}
      </div>
    </div>
  )
}
