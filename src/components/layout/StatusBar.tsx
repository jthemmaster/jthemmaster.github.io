import { useSimulationStore } from '../../stores/simulationStore'
import Badge from '../ui/Badge'

export default function StatusBar() {
  const isRunning = useSimulationStore((s) => s.isRunning)
  const isInitialized = useSimulationStore((s) => s.isInitialized)
  const step = useSimulationStore((s) => s.step)
  const time = useSimulationStore((s) => s.time)
  const dt = useSimulationStore((s) => s.config.dt)
  const temperature = useSimulationStore((s) => s.temperature)
  const atomCount = useSimulationStore((s) => s.elements.length)
  const stepsPerSecond = useSimulationStore((s) => s.stepsPerSecond)

  return (
    <div className="h-9 flex items-center justify-between px-4 bg-bg-surface border-t border-border-subtle text-[11px] font-mono">
      {/* Left: status */}
      <div className="flex items-center gap-3">
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

      {/* Center: simulation info */}
      <div className="flex items-center gap-4 text-text-secondary">
        <span className="tabular-nums">
          Step <span className="text-text-primary">{step.toLocaleString()}</span>
        </span>
        <span className="text-text-muted">·</span>
        <span className="tabular-nums">
          dt = <span className="text-text-primary">{dt}</span> fs
        </span>
        <span className="text-text-muted">·</span>
        <span className="tabular-nums">
          T = <span className="text-text-primary">{temperature.toFixed(0)}</span> K
        </span>
        <span className="text-text-muted">·</span>
        <span className="tabular-nums">
          <span className="text-text-primary">{atomCount}</span> atoms
        </span>
      </div>

      {/* Right: performance */}
      <div className="flex items-center gap-3 text-text-muted">
        <span className="tabular-nums">
          {stepsPerSecond > 0 ? `${stepsPerSecond.toFixed(0)} steps/s` : '—'}
        </span>
      </div>
    </div>
  )
}
