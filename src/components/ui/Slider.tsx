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
    thumb: '#8B5CF6',
    glow: 'rgba(139, 92, 246, 0.4)',
    gradient: 'from-[#8B5CF6] to-[#6D28D9]',
  },
  blue: {
    thumb: '#3B82F6',
    glow: 'rgba(59, 130, 246, 0.4)',
    gradient: 'from-[#3B82F6] to-[#2563EB]',
  },
  cyan: {
    thumb: '#06B6D4',
    glow: 'rgba(6, 182, 212, 0.4)',
    gradient: 'from-[#06B6D4] to-[#0891B2]',
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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
          {label}
        </span>
        <span className="text-xs font-mono font-medium text-text-primary tabular-nums">
          {displayValue}
          {unit && <span className="text-text-muted ml-1">{unit}</span>}
        </span>
      </div>
      <div className="relative">
        <div className="absolute top-1/2 -translate-y-1/2 left-0 h-1 rounded-full w-full bg-white/[0.06]" />
        <div
          className={`absolute top-1/2 -translate-y-1/2 left-0 h-1 rounded-full bg-gradient-to-r ${colors.gradient}`}
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
