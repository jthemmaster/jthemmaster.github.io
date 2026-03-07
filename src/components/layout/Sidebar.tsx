import { X } from 'lucide-react'
import Logo from '../ui/Logo'
import PresetSelector from '../controls/PresetSelector'
import ForceSlider from '../controls/ForceSlider'
import RadiusSlider from '../controls/RadiusSlider'
import TemperatureSlider from '../controls/TemperatureSlider'
import SimulationControls from '../controls/SimulationControls'
import { useSimulationStore } from '../../stores/simulationStore'
import Slider from '../ui/Slider'

interface SidebarProps {
  onClose?: () => void
}

function SectionHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="space-y-1 px-1">
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-text-secondary">
        {title}
      </div>
      <p className="text-sm text-text-muted leading-relaxed">
        {description}
      </p>
    </div>
  )
}

function ToggleRow({
  label,
  detail,
  active,
  onToggle,
}: {
  label: string
  detail: string
  active: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="panel-soft panel-soft-hover flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-3 text-left"
    >
      <div className="min-w-0">
        <div className="text-sm font-medium text-text-primary">{label}</div>
        <div className="mt-1 text-[11px] leading-relaxed text-text-muted">{detail}</div>
      </div>
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] ${
          active
            ? 'bg-white/[0.08] text-text-primary'
            : 'bg-white/[0.04] text-text-muted'
        }`}
      >
        {active ? 'On' : 'Off'}
      </span>
    </button>
  )
}

export default function Sidebar({ onClose }: SidebarProps) {
  const showBonds = useSimulationStore((s) => s.showBonds)
  const showSphere = useSimulationStore((s) => s.showSphere)
  const toggleBonds = useSimulationStore((s) => s.toggleBonds)
  const toggleSphere = useSimulationStore((s) => s.toggleSphere)
  const stepsPerUpdate = useSimulationStore((s) => s.config.stepsPerUpdate)
  const updateConfig = useSimulationStore((s) => s.updateConfig)

  return (
    <aside className="h-full w-[300px] shrink-0 overflow-hidden border-r border-white/[0.06] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))]">
      <div className="border-b border-white/[0.06] px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-4">
            <Logo size="md" />
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-text-secondary">
                Reactive molecular workspace
              </div>
              <p className="mt-2 max-w-[230px] text-sm leading-relaxed text-text-muted">
                Focused controls for bond formation, energy transfer, and reactor tuning in real time.
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="panel-soft panel-soft-hover flex h-9 w-9 items-center justify-center rounded-xl text-text-muted hover:text-text-primary"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
        <div className="space-y-3">
          <SectionHeader
            title="Scenario"
            description="Choose the starting reaction system."
          />
          <PresetSelector />
        </div>

        <div className="panel-surface space-y-4 rounded-[24px] p-4">
          <SimulationControls />
        </div>

        <div className="panel-surface space-y-4 rounded-[24px] p-4">
          <SectionHeader
            title="Reactor"
            description="Adjust confinement, chamber size, and thermal target."
          />
          <div className="space-y-4">
            <ForceSlider />
            <RadiusSlider />
            <TemperatureSlider />
            <Slider
              label="Simulation Speed"
              value={stepsPerUpdate}
              min={1}
              max={50}
              step={1}
              unit="steps"
              color="blue"
              onChange={(v) => updateConfig({ stepsPerUpdate: Math.round(v) })}
              formatValue={(v) => v.toFixed(0)}
            />
          </div>
        </div>

        <div className="panel-surface space-y-4 rounded-[24px] p-4">
          <SectionHeader
            title="Display"
            description="Show only the information that helps you read the scene."
          />
          <div className="space-y-2">
            <ToggleRow
              label="Bond network"
              detail="Reveal live bond detection between nearby atoms."
              active={showBonds}
              onToggle={toggleBonds}
            />
            <ToggleRow
              label="Reaction boundary"
              detail="Show the confinement sphere that defines the chamber."
              active={showSphere}
              onToggle={toggleSphere}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.06] px-5 py-4">
        <p className="text-[11px] leading-relaxed text-text-muted">
          Morse potential, Velocity Verlet integration, and Berendsen thermostat tuned for an interactive research-style workflow.
        </p>
      </div>
    </aside>
  )
}
