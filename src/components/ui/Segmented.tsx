import React from 'react'
import '../../styles/ui.css'

export type SegmentedOption<T extends string | number> = {
  label: string
  value: T
}

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T
  options: SegmentedOption<T>[]
  onChange: (val: T) => void
  ariaLabel?: string
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="inline-flex-row seg">
      {options.map(opt => {
        const active = opt.value === value
        return (
          <button key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            className={`seg-btn ${active ? 'seg-active' : ''}`}
          >{opt.label}</button>
        )
      })}
    </div>
  )
}
