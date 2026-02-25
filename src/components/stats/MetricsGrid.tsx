import { Thermometer, Zap, Link2, Atom } from 'lucide-react'
import { useSimulationStore } from '../../stores/simulationStore'
import GlassCard from '../ui/GlassCard'

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string
  unit: string
  color: string
  bgGlow?: string
}

function MetricCard({ icon, label, value, unit, color, bgGlow }: MetricCardProps) {
  return (
    <GlassCard padding="sm" className="relative overflow-hidden group">
      {/* Subtle background glow */}
      {bgGlow && (
        <div
          className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-[0.07] blur-xl transition-opacity group-hover:opacity-[0.12]"
          style={{ background: bgGlow }}
        />
      )}
      <div className="relative space-y-1.5">
        <div className="flex items-center gap-1.5">
          <span className={`${color} opacity-70`}>{icon}</span>
          <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
            {label}
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-mono font-semibold text-text-primary tabular-nums leading-none">
            {value}
          </span>
          {unit && <span className="text-[10px] text-text-muted">{unit}</span>}
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

  // Color-code temperature
  const tempColor = temperature > 2000 ? 'text-error' : temperature > 1000 ? 'text-warning' : 'text-accent-cyan'

  return (
    <div className="grid grid-cols-2 gap-2">
      <MetricCard
        icon={<Thermometer size={12} />}
        label="Temperature"
        value={isNaN(temperature) ? '—' : temperature.toFixed(0)}
        unit="K"
        color={tempColor}
        bgGlow={temperature > 1000 ? '#EF4444' : '#06B6D4'}
      />
      <MetricCard
        icon={<Zap size={12} />}
        label="Energy"
        value={isNaN(totalEnergy) ? '—' : totalEnergy.toFixed(1)}
        unit="eV"
        color="text-warning"
        bgGlow="#F59E0B"
      />
      <MetricCard
        icon={<Link2 size={12} />}
        label="Bonds"
        value={bondCount.toString()}
        unit=""
        color="text-accent-purple"
        bgGlow="#8B5CF6"
      />
      <MetricCard
        icon={<Atom size={12} />}
        label="Atoms"
        value={atomCount.toString()}
        unit=""
        color="text-accent-blue"
        bgGlow="#3B82F6"
      />
    </div>
  )
}
