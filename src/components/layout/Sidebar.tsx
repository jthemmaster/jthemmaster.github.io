import { Eye, EyeOff, Link2, CircleDot, Beaker, Flame, Gauge, Sliders } from 'lucide-react'
import Logo from '../ui/Logo'
import PresetSelector from '../controls/PresetSelector'
import ForceSlider from '../controls/ForceSlider'
import RadiusSlider from '../controls/RadiusSlider'
import TemperatureSlider from '../controls/TemperatureSlider'
import SimulationControls from '../controls/SimulationControls'
import { useSimulationStore } from '../../stores/simulationStore'
import Slider from '../ui/Slider'

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 px-1 mb-3">
      <span className="text-text-muted opacity-60">{icon}</span>
      <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
        {title}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-border-subtle to-transparent" />
    </div>
  )
}

function ToggleRow({
  label,
  icon,
  active,
  onToggle,
}: {
  label: string
  icon: React.ReactNode
  active: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={`
        flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-xs
        transition-all duration-200
        ${active
          ? 'bg-white/[0.05] text-text-primary border border-white/[0.06]'
          : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.02]'}
      `}
    >
      <span className="w-4 h-4 flex items-center justify-center opacity-70">{icon}</span>
      <span className="flex-1 text-left font-medium">{label}</span>
      <span className={`transition-opacity ${active ? 'opacity-100' : 'opacity-40'}`}>
        {active ? <Eye size={12} /> : <EyeOff size={12} />}
      </span>
    </button>
  )
}

export default function Sidebar() {
  const showBonds = useSimulationStore((s) => s.showBonds)
  const showSphere = useSimulationStore((s) => s.showSphere)
  const toggleBonds = useSimulationStore((s) => s.toggleBonds)
  const toggleSphere = useSimulationStore((s) => s.toggleSphere)
  const stepsPerUpdate = useSimulationStore((s) => s.config.stepsPerUpdate)
  const updateConfig = useSimulationStore((s) => s.updateConfig)

  return (
    <aside className="w-[280px] h-full flex flex-col bg-bg-surface/80 backdrop-blur-xl border-r border-border-subtle overflow-hidden">
      {/* Logo header */}
      <div className="px-5 py-4 border-b border-border-subtle">
        <Logo size="md" />
        <p className="text-[10px] text-text-muted mt-2 leading-relaxed">
          Interactive Reactive Molecular Dynamics
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {/* Presets */}
        <div>
          <SectionHeader icon={<Beaker size={12} />} title="Molecular System" />
          <PresetSelector />
        </div>

        {/* Reactor Controls */}
        <div>
          <SectionHeader icon={<Flame size={12} />} title="Reactor Controls" />
          <div className="space-y-4">
            <ForceSlider />
            <RadiusSlider />
          </div>
        </div>

        {/* Environment */}
        <div>
          <SectionHeader icon={<Gauge size={12} />} title="Environment" />
          <div className="space-y-4">
            <TemperatureSlider />
            <Slider
              label="Sim Speed"
              value={stepsPerUpdate}
              min={1}
              max={50}
              step={1}
              unit="steps/frame"
              color="blue"
              onChange={(v) => updateConfig({ stepsPerUpdate: Math.round(v) })}
              formatValue={(v) => v.toFixed(0)}
            />
          </div>
        </div>

        {/* Simulation Controls */}
        <div>
          <SimulationControls />
        </div>

        {/* Visualization Toggles */}
        <div>
          <SectionHeader icon={<Sliders size={12} />} title="Display" />
          <div className="space-y-1">
            <ToggleRow
              label="Show Bonds"
              icon={<Link2 size={12} />}
              active={showBonds}
              onToggle={toggleBonds}
            />
            <ToggleRow
              label="Show Confinement"
              icon={<CircleDot size={12} />}
              active={showSphere}
              onToggle={toggleSphere}
            />
          </div>
        </div>
      </div>

      {/* Bottom attribution */}
      <div className="px-4 py-3 border-t border-border-subtle bg-bg-primary/50">
        <div className="text-[9px] text-text-muted text-center space-y-0.5">
          <div className="font-medium">Morse Potential · Velocity Verlet · Berendsen</div>
          <div className="opacity-60">Reactive Bond-Order Force Field</div>
        </div>
      </div>
    </aside>
  )
}
