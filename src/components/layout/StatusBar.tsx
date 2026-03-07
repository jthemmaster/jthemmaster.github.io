import { useSimulationStore } from '../../stores/simulationStore'
import Badge from '../ui/Badge'

export default function StatusBar() {
  const isRunning = useSimulationStore((s) => s.isRunning)
  const isInitialized = useSimulationStore((s) => s.isInitialized)
  const step = useSimulationStore((s) => s.step)
  const dt = useSimulationStore((s) => s.config.dt)
  const temperature = useSimulationStore((s) => s.temperature)
  const atomCount = useSimulationStore((s) => s.elements.length)
  const bondCount = useSimulationStore((s) => s.bonds.length)
  const stepsPerSecond = useSimulationStore((s) => s.stepsPerSecond)

  return (
    <div className="relative z-20 flex h-11 items-center justify-between border-t border-white/[0.06] px-4 text-[11px]">
      <div className="flex items-center gap-2">
        {isInitialized ? (
          isRunning ? (
            <Badge variant="success" pulse>Running</Badge>
          ) : (
            <Badge variant="warning">Paused</Badge>
          )
        ) : (
          <Badge variant="neutral">Ready</Badge>
        )}
      </div>

      <div className="hidden items-center gap-2 text-text-secondary sm:flex">
        <span className="text-text-muted">Step</span>
        <span className="tabular-nums text-text-primary">{step.toLocaleString()}</span>
        <span className="text-border-hover">/</span>
        <span className="text-text-muted">Temp</span>
        <span className="tabular-nums text-text-primary">
          {isNaN(temperature) ? '—' : temperature.toFixed(0)} K
        </span>
        <span className="hidden text-border-hover md:inline">/</span>
        <span className="hidden text-text-muted md:inline">dt</span>
        <span className="hidden tabular-nums text-text-primary md:inline">{dt} fs</span>
      </div>

      <div className="flex items-center gap-2 text-text-muted">
        <span className="hidden tabular-nums md:inline">
          <span className="text-text-primary">{atomCount}</span> atoms
        </span>
        <span className="hidden text-border-hover md:inline">/</span>
        <span className="hidden tabular-nums md:inline">
          <span className="text-text-primary">{bondCount}</span> bonds
        </span>
        <span className="hidden text-border-hover sm:inline">/</span>
        <span className="tabular-nums">
          <span className="text-text-primary">{stepsPerSecond > 0 ? stepsPerSecond.toFixed(0) : '—'}</span>{' '}
          steps/s
        </span>
      </div>
    </div>
  )
}
