import { useSimulationStore } from '../../stores/simulationStore'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

export default function SimulationControls() {
  const isRunning = useSimulationStore((s) => s.isRunning)
  const isInitialized = useSimulationStore((s) => s.isInitialized)
  const start = useSimulationStore((s) => s.start)
  const stop = useSimulationStore((s) => s.stop)
  const singleStep = useSimulationStore((s) => s.singleStep)
  const reset = useSimulationStore((s) => s.reset)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-text-secondary">
            Simulation
          </div>
        </div>
        <Badge variant={isRunning ? 'success' : isInitialized ? 'warning' : 'neutral'} pulse={isRunning}>
          {isRunning ? 'Running' : isInitialized ? 'Paused' : 'Ready'}
        </Badge>
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={isRunning ? stop : start}
        disabled={!isInitialized}
        glow={isRunning}
      >
        <span className="font-semibold">{isRunning ? 'Pause simulation' : 'Run simulation'}</span>
      </Button>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={singleStep}
          disabled={!isInitialized || isRunning}
          title="Single Step (S)"
        >
          <span>Step once</span>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={reset}
          disabled={!isInitialized}
          title="Reset (R)"
        >
          <span>Reset</span>
        </Button>
      </div>
    </div>
  )
}
