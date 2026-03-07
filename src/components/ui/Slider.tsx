import { useCallback } from 'react'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  unit?: string
  color?: 'purple' | 'blue' | 'cyan'
  formatValue?: (value: number) => string
}

const colorMap = {
  purple: {
    thumb: '#8F7CFF',
    glow: 'rgba(143, 124, 255, 0.22)',
    gradient: 'from-[#A999FF] to-[#8F7CFF]',
  },
  blue: {
    thumb: '#6CB6FF',
    glow: 'rgba(108, 182, 255, 0.22)',
    gradient: 'from-[#89C7FF] to-[#6CB6FF]',
  },
  cyan: {
    thumb: '#63D4FF',
    glow: 'rgba(99, 212, 255, 0.22)',
    gradient: 'from-[#8AE0FF] to-[#63D4FF]',
  },
}

export default function Slider({
  label,
  value,
  min,
  max,
  step = 0.1,
  onChange,
  unit = '',
  color = 'purple',
  formatValue,
}: SliderProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parseFloat(e.target.value))
    },
    [onChange]
  )

  const displayValue = formatValue ? formatValue(value) : value.toFixed(step < 1 ? 1 : 0)
  const percentage = ((value - min) / (max - min)) * 100
  const colors = colorMap[color]

  return (
    <div className="space-y-2.5">
      <div className="flex items-end justify-between gap-3">
        <span className="min-w-0 text-[12px] font-medium text-text-secondary">
          {label}
        </span>
        <span className="shrink-0 text-[13px] font-mono font-medium text-text-primary tabular-nums">
          {displayValue}
          {unit && <span className="text-text-muted ml-1 text-[10px]">{unit}</span>}
        </span>
      </div>
      <div className="relative px-0.5 py-2">
        <div className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 rounded-full w-full bg-white/[0.08]" />
        <div
          className={`absolute top-1/2 -translate-y-1/2 left-0 h-1.5 rounded-full bg-gradient-to-r ${colors.gradient}`}
          style={{ width: `${percentage}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="relative z-10 w-full"
          style={
            {
              '--slider-color': colors.thumb,
              '--slider-glow': colors.glow,
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  )
}
