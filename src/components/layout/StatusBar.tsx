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
    <div className="h-9 flex items-center justify-between px-4 bg-bg-surface/60 backdrop-blur-sm border-t border-border-subtle text-[11px] font-mono relative z-10">
      {/* Left: status */}
      <div className="flex items-center gap-3 min-w-[100px]">
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
      <div className="flex items-center gap-3 text-text-secondary">
        <span className="tabular-nums">
          <span className="text-text-muted">Step</span>{' '}
          <span className="text-text-primary">{step.toLocaleString()}</span>
        </span>
        <span className="text-border-hover">|</span>
        <span className="tabular-nums">
          <span className="text-text-muted">dt</span>{' '}
          <span className="text-text-primary">{dt}</span>
          <span className="text-text-muted"> fs</span>
        </span>
        <span className="text-border-hover">|</span>
        <span className="tabular-nums">
          <span className="text-text-muted">T</span>{' '}
          <span className="text-text-primary">{isNaN(temperature) ? '—' : temperature.toFixed(0)}</span>
          <span className="text-text-muted"> K</span>
        </span>
        <span className="text-border-hover">|</span>
        <span className="tabular-nums">
          <span className="text-text-primary">{atomCount}</span>
          <span className="text-text-muted"> atoms</span>
        </span>
        <span className="text-border-hover">|</span>
        <span className="tabular-nums">
          <span className="text-text-primary">{bondCount}</span>
          <span className="text-text-muted"> bonds</span>
        </span>
      </div>

      {/* Right: performance */}
      <div className="flex items-center gap-2 text-text-muted min-w-[100px] justify-end">
        <span className="tabular-nums">
          {stepsPerSecond > 0 ? (
            <>
              <span className="text-text-secondary">{stepsPerSecond.toFixed(0)}</span> steps/s
            </>
          ) : '—'}
        </span>
      </div>
    </div>
  )
}
