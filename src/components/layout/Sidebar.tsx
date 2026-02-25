import { Eye, EyeOff, Link2, Crosshair, CircleDot } from 'lucide-react'
import Logo from '../ui/Logo'
import PresetSelector from '../controls/PresetSelector'
import ForceSlider from '../controls/ForceSlider'
import RadiusSlider from '../controls/RadiusSlider'
import TemperatureSlider from '../controls/TemperatureSlider'
import SimulationControls from '../controls/SimulationControls'
import { useSimulationStore } from '../../stores/simulationStore'
import Slider from '../ui/Slider'

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
        flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs
        transition-all duration-200
        ${active ? 'bg-white/[0.05] text-text-primary' : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.02]'}
      `}
    >
      <span className="w-4 h-4 flex items-center justify-center">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      <span className="text-[10px]">
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
    <aside className="w-[280px] h-full flex flex-col bg-bg-surface border-r border-border-subtle overflow-hidden">
      {/* Logo header */}
      <div className="px-4 py-4 border-b border-border-subtle">
        <Logo size="md" />
        <p className="text-[10px] text-text-muted mt-1.5">
          Interactive Reactive Molecular Dynamics
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Presets */}
        <PresetSelector />

        {/* Divider */}
        <div className="h-px bg-border-subtle" />

        {/* Reactor Controls */}
        <div className="space-y-4">
          <div className="text-xs font-medium text-text-secondary uppercase tracking-wider px-1">
            Reactor Controls
          </div>
          <ForceSlider />
          <RadiusSlider />
        </div>

        {/* Divider */}
        <div className="h-px bg-border-subtle" />

        {/* Environment */}
        <div className="space-y-4">
          <div className="text-xs font-medium text-text-secondary uppercase tracking-wider px-1">
            Environment
          </div>
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

        {/* Divider */}
        <div className="h-px bg-border-subtle" />

        {/* Simulation Controls */}
        <SimulationControls />

        {/* Divider */}
        <div className="h-px bg-border-subtle" />

        {/* Visualization Toggles */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-text-secondary uppercase tracking-wider px-1">
            Visualization
          </div>
          <div className="space-y-0.5">
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
      <div className="px-4 py-3 border-t border-border-subtle">
        <div className="text-[10px] text-text-muted text-center">
          Morse Potential · Velocity Verlet · Berendsen
        </div>
      </div>
    </aside>
  )
}
