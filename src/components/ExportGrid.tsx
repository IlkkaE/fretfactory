import React from 'react'
import { useAppState } from '../store.state'
import { exportDXF, exportPDFA4, exportPDFSinglePage, exportSVG } from '../utils/exporters'

export default function ExportGrid() {
  const s = useAppState()
  const canCurved = s.mode === 'curved' && !!(s.scaleTreble && s.scaleBass) && !!(s.stringSpanNut && s.stringSpanBridge && s.overhang != null)
  const enabled = canCurved

  const onSVG = React.useCallback(() => { if (enabled) exportSVG(useAppState.getState()) }, [enabled])
  const onPDF = React.useCallback(() => { if (enabled) exportPDFA4(useAppState.getState()) }, [enabled])
  const onPDFSinglePage = React.useCallback(() => { if (enabled) exportPDFSinglePage(useAppState.getState()) }, [enabled])
  const onDXF = React.useCallback(() => { if (enabled) exportDXF(useAppState.getState()) }, [enabled])

  const btn = (label: string, onClick: () => void) => (
    <button onClick={onClick} disabled={!enabled} className="btn btn-block" aria-label={label}>{label}</button>
  )

  return (
    <div className="card card-controls glass">
      <div className="grid-gap10-2cols">
        {btn('Export SVG', onSVG)}
        {btn('Export PDF (A4 tiles)', onPDF)}
        {btn('Export PDF (single page)', onPDFSinglePage)}
        {btn('Export DXF', onDXF)}
      </div>
    </div>
  )
}
