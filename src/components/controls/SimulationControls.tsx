import { Play, Pause, RotateCcw, SkipForward, Zap } from 'lucide-react'
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
    <div className="space-y-3">
      {/* Main play/pause button */}
      <Button
        variant={isRunning ? 'primary' : 'secondary'}
        size="lg"
        className="w-full"
        onClick={isRunning ? stop : start}
        disabled={!isInitialized}
        glow={isRunning}
      >
        {isRunning ? (
          <>
            <Pause size={16} />
            <span className="font-semibold">Pause Simulation</span>
          </>
        ) : (
          <>
            <Play size={16} />
            <span className="font-semibold">Run Simulation</span>
          </>
        )}
      </Button>

      {/* Secondary controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={singleStep}
          disabled={!isInitialized || isRunning}
          title="Single Step (S)"
        >
          <SkipForward size={12} />
          <span>Step</span>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={reset}
          disabled={!isInitialized}
          title="Reset (R)"
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </Button>
      </div>
    </div>
  )
}
