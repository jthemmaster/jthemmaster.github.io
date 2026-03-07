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
    <div className="panel-surface min-w-[140px] rounded-2xl px-3 py-2.5 text-xs shadow-xl">
      <div className="mb-2 text-[10px] font-mono text-text-muted">Step {label}</div>
      {payload.map((entry: TooltipEntry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
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
    <GlassCard padding="sm" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-text-secondary">
            Energy
          </div>
          <div className="mt-1 text-xs text-text-muted">
            Kinetic, potential, and total energy over time.
          </div>
        </div>
        {data.length > 0 && (
          <div className="flex items-center gap-3 text-[10px]">
            <div className="flex items-center gap-1">
              <div className="h-0.5 w-3 rounded bg-[#6CB6FF]" />
              <span className="text-text-muted">KE</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-0.5 w-3 rounded bg-[#EF7A7A]" />
              <span className="text-text-muted">PE</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-0.5 w-3 rounded bg-[#8F7CFF]" />
              <span className="text-text-muted">Total</span>
            </div>
          </div>
        )}
      </div>
      <div className="h-[180px]">
        {data.length > 2 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 6, bottom: 0, left: -18 }}>
              <XAxis
                dataKey="step"
                tick={{ fontSize: 10, fill: '#7F8897' }}
                stroke="transparent"
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                tickCount={5}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#7F8897' }}
                stroke="transparent"
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v.toFixed(0)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="KE"
                stroke="#6CB6FF"
                strokeWidth={1.75}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="PE"
                stroke="#EF7A7A"
                strokeWidth={1.75}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="Total"
                stroke="#8F7CFF"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm text-text-muted">Run the simulation to generate energy traces.</div>
              <div className="mt-1 text-[11px] text-text-muted/70">Press Space to start.</div>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  )
}
