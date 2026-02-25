import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'
import { useSimulationStore } from '../../stores/simulationStore'
import Button from '../ui/Button'

export default function SimulationControls() {
  const isRunning = useSimulationStore((s) => s.isRunning)
  const isInitialized = useSimulationStore((s) => s.isInitialized)
  const start = useSimulationStore((s) => s.start)
  const stop = useSimulationStore((s) => s.stop)
  const singleStep = useSimulationStore((s) => s.singleStep)
  const reset = useSimulationStore((s) => s.reset)

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-text-secondary uppercase tracking-wider px-1">
        Simulation
      </div>
      <div className="flex items-center gap-2">
        {/* Play / Pause */}
        <Button
          variant={isRunning ? 'primary' : 'secondary'}
          size="md"
          className="flex-1"
          onClick={isRunning ? stop : start}
          disabled={!isInitialized}
          glow={isRunning}
        >
          {isRunning ? (
            <>
              <Pause size={14} />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play size={14} />
              <span>Run</span>
            </>
          )}
        </Button>

        {/* Step */}
        <Button
          variant="icon"
          size="md"
          onClick={singleStep}
          disabled={!isInitialized || isRunning}
          title="Single Step (S)"
        >
          <SkipForward size={14} />
        </Button>

        {/* Reset */}
        <Button
          variant="icon"
          size="md"
          onClick={reset}
          disabled={!isInitialized}
          title="Reset (R)"
        >
          <RotateCcw size={14} />
        </Button>
      </div>
    </div>
  )
}
