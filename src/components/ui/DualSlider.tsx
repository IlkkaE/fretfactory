import React from 'react'
import '../../styles/ui.css'

export type DualSliderProps = {
  value?: number
  min: number
  max: number
  step?: number
  unitLabel?: string
  onChange: (val: number) => void
  ariaLabel?: string
}

/**
 * Dual control: range slider + numeric input.
 * Optimized for mobile while allowing precise entry.
 */
export function DualSlider({ value, min, max, step = 0.1, unitLabel, onChange, ariaLabel }: DualSliderProps) {
  const v = value ?? 0
  const clamp = (x:number)=> Math.min(max, Math.max(min, x))
  const onRange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const next = clamp(parseFloat(e.target.value))
    onChange(next)
  }
  const onNumber: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const raw = e.target.value.replace(',', '.')
    const num = parseFloat(raw)
    if (!isNaN(num)) onChange(clamp(num))
  }

  return (
    <div className="row-1fr-auto" aria-label={ariaLabel}>
      <input type="range" min={min} max={max} step={step} value={v}
        onChange={onRange}
        aria-label={ariaLabel ? `${ariaLabel} range` : 'range'}
      />
      <div className="flex-row">
        <input
          type="number"
          inputMode="decimal"
          step={step}
          value={Number.isFinite(v) ? v : ''}
          onChange={onNumber}
          className="input"
          aria-label={ariaLabel ? `${ariaLabel} input` : 'number input'}
          placeholder={ariaLabel ?? 'value'}
        />
        {unitLabel ? <span className="muted small">{unitLabel}</span> : null}
      </div>
    </div>
  )
}
