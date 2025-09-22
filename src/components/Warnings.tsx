import React from 'react'
import { useAppState } from '../store.state'
import { computeStringLayout } from '../geom/core'

export default function Warnings() {
  const s = useAppState()
  const [visible, setVisible] = React.useState(true)

  // Compute nut/bridge width with current values (both modes)
  const layoutOk = s.stringSpanNut != null && s.stringSpanBridge != null && s.overhang != null
  const L = layoutOk ? computeStringLayout(s.strings, s.stringSpanNut!, s.stringSpanBridge!, s.overhang!) : null
  const nutW = L ? (L.edgeNut[1] - L.edgeNut[0]) : undefined
  const brW  = L ? (L.edgeBridge[1] - L.edgeBridge[0]) : undefined
  const unitLabel = 'mm'

  const msg = (nutW != null && brW != null)
    ? `Nut width ≈ ${nutW.toFixed(2)} ${unitLabel} · Bridge width ≈ ${brW.toFixed(2)} ${unitLabel}`
    : 'Check the values.'

  // Autohide aina kun teksti vaihtuu
  React.useEffect(() => {
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(t)
  }, [msg])

  if (!visible) return null

  return (
    <div role="status" aria-live="polite" className="card align-center gap-10">
      <span className="chip chip-ok">OK</span>
      <span className="muted">{msg}</span>
    </div>
  )
}
