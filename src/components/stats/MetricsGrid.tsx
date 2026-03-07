import { useSimulationStore } from '../../stores/simulationStore'
import GlassCard from '../ui/GlassCard'

interface MetricCardProps {
  label: string
  value: string
  unit: string
  tone?: 'default' | 'warm' | 'cool'
}

function MetricCard({ label, value, unit, tone = 'default' }: MetricCardProps) {
  const toneClass = {
    default: 'from-white/[0.08] to-transparent',
    warm: 'from-warning/18 to-transparent',
    cool: 'from-accent-blue/18 to-transparent',
  }[tone]

  return (
    <GlassCard padding="sm" className="relative overflow-hidden">
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${toneClass}`} />
      <div className="space-y-2">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-text-muted">
          {label}
        </div>
        <div className="flex items-end justify-between gap-2">
          <span className="text-xl font-mono font-semibold leading-none text-text-primary tabular-nums">
            {value}
          </span>
          {unit && <span className="text-[11px] text-text-muted">{unit}</span>}
        </div>
      </div>
    </GlassCard>
  )
}

export default function MetricsGrid() {
  const temperature = useSimulationStore((s) => s.temperature)
  const totalEnergy = useSimulationStore((s) => s.totalEnergy)
  const bondCount = useSimulationStore((s) => s.bonds.length)
  const atomCount = useSimulationStore((s) => s.elements.length)

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <MetricCard
        label="Temperature"
        value={isNaN(temperature) ? '—' : temperature.toFixed(0)}
        unit="K"
        tone={temperature > 1000 ? 'warm' : 'cool'}
      />
      <MetricCard
        label="Energy"
        value={isNaN(totalEnergy) ? '—' : totalEnergy.toFixed(1)}
        unit="eV"
        tone="warm"
      />
      <MetricCard
        label="Bonds"
        value={bondCount.toString()}
        unit=""
      />
      <MetricCard
        label="Atoms"
        value={atomCount.toString()}
        unit=""
        tone="cool"
      />
    </div>
  )
}
