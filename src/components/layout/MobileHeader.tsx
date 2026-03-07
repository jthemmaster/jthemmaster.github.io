import { Menu, BarChart3, Play, Pause } from 'lucide-react'
import { useSimulationStore } from '../../stores/simulationStore'
import Logo from '../ui/Logo'

export default function MobileHeader() {
  const toggleSidebar = useSimulationStore((s) => s.toggleSidebar)
  const toggleStatsPanel = useSimulationStore((s) => s.toggleStatsPanel)
  const isRunning = useSimulationStore((s) => s.isRunning)
  const isInitialized = useSimulationStore((s) => s.isInitialized)
  const start = useSimulationStore((s) => s.start)
  const stop = useSimulationStore((s) => s.stop)
  const temperature = useSimulationStore((s) => s.temperature)

  return (
    <div className="relative z-20 flex h-14 items-center justify-between border-b border-white/[0.06] px-3 md:hidden">
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSidebar}
          className="panel-soft panel-soft-hover flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary hover:text-text-primary"
        >
          <Menu size={18} />
        </button>
        <div>
          <Logo size="sm" />
          <div className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-text-muted">
            Molecular workspace
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={isRunning ? stop : start}
          disabled={!isInitialized}
          className={`
            flex h-10 items-center gap-2 rounded-xl border px-3 text-[11px] font-medium uppercase tracking-[0.16em] transition-all
            ${isRunning
              ? 'border-white/14 bg-white/[0.08] text-text-primary'
              : 'border-white/[0.08] bg-white/[0.04] text-text-secondary hover:text-text-primary'
            }
            ${!isInitialized ? 'opacity-40' : ''}
          `}
        >
          {isRunning ? <Pause size={14} /> : <Play size={14} />}
          <span>{isRunning ? 'Pause' : 'Run'}</span>
        </button>
        {isInitialized && temperature > 0 && (
          <span className="hidden text-[11px] font-mono text-text-muted tabular-nums sm:inline">
            {isNaN(temperature) ? '—' : `${temperature.toFixed(0)} K`}
          </span>
        )}
      </div>

      <button
        onClick={toggleStatsPanel}
        className="panel-soft panel-soft-hover flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary hover:text-text-primary"
      >
        <BarChart3 size={18} />
      </button>
    </div>
  )
}
