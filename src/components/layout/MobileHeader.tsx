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
    <div className="md:hidden flex items-center justify-between h-12 px-3 bg-bg-surface/80 backdrop-blur-xl border-b border-border-subtle relative z-20">
      {/* Left: hamburger + logo */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSidebar}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/[0.05] transition-colors"
        >
          <Menu size={18} />
        </button>
        <Logo size="sm" />
      </div>

      {/* Center: quick play/pause + temp */}
      <div className="flex items-center gap-2">
        <button
          onClick={isRunning ? stop : start}
          disabled={!isInitialized}
          className={`
            w-8 h-8 flex items-center justify-center rounded-full transition-all
            ${isRunning
              ? 'bg-gradient-to-r from-accent-purple to-accent-blue text-white shadow-lg shadow-accent-purple/30'
              : 'glass text-text-secondary hover:text-text-primary'
            }
            ${!isInitialized ? 'opacity-40' : ''}
          `}
        >
          {isRunning ? <Pause size={14} /> : <Play size={14} />}
        </button>
        {isInitialized && (
          <span className="text-[11px] font-mono text-text-muted tabular-nums">
            {isNaN(temperature) ? '—' : `${temperature.toFixed(0)} K`}
          </span>
        )}
      </div>

      {/* Right: stats toggle */}
      <button
        onClick={toggleStatsPanel}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/[0.05] transition-colors"
      >
        <BarChart3 size={18} />
      </button>
    </div>
  )
}
