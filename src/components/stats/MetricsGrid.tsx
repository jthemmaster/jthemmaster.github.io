import { Thermometer, Zap, Link2, Atom } from 'lucide-react'
import { useSimulationStore } from '../../stores/simulationStore'
import GlassCard from '../ui/GlassCard'

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string
  unit: string
  color: string
}

function MetricCard({ icon, label, value, unit, color }: MetricCardProps) {
  return (
    <GlassCard padding="sm" className="space-y-1">
      <div className="flex items-center gap-1.5">
        <span className={color}>{icon}</span>
        <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-mono font-semibold text-text-primary tabular-nums">
          {value}
        </span>
        <span className="text-[10px] text-text-muted">{unit}</span>
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
    <div className="grid grid-cols-2 gap-2">
      <MetricCard
        icon={<Thermometer size={12} />}
        label="Temperature"
        value={temperature.toFixed(0)}
        unit="K"
        color="text-error"
      />
      <MetricCard
        icon={<Zap size={12} />}
        label="Energy"
        value={totalEnergy.toFixed(2)}
        unit="eV"
        color="text-warning"
      />
      <MetricCard
        icon={<Link2 size={12} />}
        label="Bonds"
        value={bondCount.toString()}
        unit=""
        color="text-accent-purple"
      />
      <MetricCard
        icon={<Atom size={12} />}
        label="Atoms"
        value={atomCount.toString()}
        unit=""
        color="text-accent-blue"
      />
    </div>
  )
}
