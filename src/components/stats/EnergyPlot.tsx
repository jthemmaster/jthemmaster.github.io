import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useSimulationStore } from '../../stores/simulationStore'
import GlassCard from '../ui/GlassCard'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null

  return (
    <div className="glass rounded-lg p-2 text-xs space-y-1 min-w-[120px]">
      <div className="text-text-muted font-mono text-[10px]">Step {label}</div>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex justify-between gap-3">
          <span style={{ color: entry.color }} className="font-medium">
            {entry.name}
          </span>
          <span className="font-mono tabular-nums text-text-secondary">
            {entry.value?.toFixed(3)}
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
      Kinetic: e.kinetic,
      Potential: e.potential,
      Total: e.total,
    }))
  }, [energyHistory])

  return (
    <GlassCard padding="sm" className="space-y-2">
      <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">
        Energy
      </div>
      <div className="h-[160px]">
        {data.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <XAxis
                dataKey="step"
                tick={{ fontSize: 9, fill: '#52525B' }}
                stroke="#27272A"
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: '#52525B' }}
                stroke="#27272A"
                tickLine={false}
                tickFormatter={(v) => v.toFixed(1)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '10px' }}
                iconType="circle"
                iconSize={6}
              />
              <Line
                type="monotone"
                dataKey="Kinetic"
                stroke="#3B82F6"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="Potential"
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
          <div className="h-full flex items-center justify-center text-text-muted text-xs">
            Run simulation to see energy data
          </div>
        )}
      </div>
    </GlassCard>
  )
}
