import React from 'react'
import '../../styles/ui.css'

export function Stepper({
  value,
  min = -Infinity,
  max = Infinity,
  step = 1,
  onChange,
  ariaLabel,
}: {
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (val: number) => void
  ariaLabel?: string
}) {
  const dec = () => onChange(Math.max(min, Math.round((value - step))))
  const inc = () => onChange(Math.min(max, Math.round((value + step))))
  return (
    <div className="inline-flex-row" aria-label={ariaLabel}>
      <button onClick={dec} className="btn btn-round">−</button>
  <div className="center text minw-40">{value}</div>
      <button onClick={inc} className="btn btn-round">+</button>
    </div>
  )
}
 
