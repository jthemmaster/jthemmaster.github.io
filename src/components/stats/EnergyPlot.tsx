import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useSimulationStore } from '../../stores/simulationStore'
import GlassCard from '../ui/GlassCard'

interface TooltipEntry {
  name: string
  value: number
  color: string
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) => {
  if (!active || !payload?.length) return null

  return (
    <div className="glass rounded-lg px-3 py-2 text-xs space-y-1 min-w-[130px] shadow-xl">
      <div className="text-text-muted font-mono text-[10px] mb-1.5">Step {label}</div>
      {payload.map((entry: TooltipEntry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-text-secondary">{entry.name}</span>
          </div>
          <span className="font-mono tabular-nums text-text-primary">
            {entry.value?.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function EnergyPlot() {
  const energyHistory = useSimulationStore((s) => s.energyHistory)

  const data = useMemo(() => {
    return energyHistory.map((e) => ({
      step: e.step,
      KE: e.kinetic,
      PE: e.potential,
      Total: e.total,
    }))
  }, [energyHistory])

  return (
    <GlassCard padding="sm" className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
          Energy
        </span>
        {data.length > 0 && (
          <div className="flex items-center gap-3 text-[9px]">
            <div className="flex items-center gap-1">
              <div className="w-2 h-0.5 rounded bg-[#3B82F6]" />
              <span className="text-text-muted">KE</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-0.5 rounded bg-[#EF4444]" />
              <span className="text-text-muted">PE</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-0.5 rounded bg-[#8B5CF6]" />
              <span className="text-text-muted">Total</span>
            </div>
          </div>
        )}
      </div>
      <div className="h-[150px]">
        {data.length > 2 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -15 }}>
              <XAxis
                dataKey="step"
                tick={{ fontSize: 9, fill: '#52525B' }}
                stroke="transparent"
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                tickCount={5}
              />
              <YAxis
                tick={{ fontSize: 9, fill: '#52525B' }}
                stroke="transparent"
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v.toFixed(0)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="KE"
                stroke="#3B82F6"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="PE"
                stroke="#EF4444"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="Total"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-text-muted text-xs">Run simulation to see energy data</div>
              <div className="text-text-muted text-[10px] mt-1 opacity-60">Press Space to start</div>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  )
}
