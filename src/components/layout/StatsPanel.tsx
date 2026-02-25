import { ChevronRight, ChevronLeft, BarChart3 } from 'lucide-react'
import MetricsGrid from '../stats/MetricsGrid'
import EnergyPlot from '../stats/EnergyPlot'
import SpeciesPanel from '../stats/SpeciesPanel'
import { useSimulationStore } from '../../stores/simulationStore'
import Button from '../ui/Button'

export default function StatsPanel() {
  const statsPanelOpen = useSimulationStore((s) => s.statsPanelOpen)
  const toggleStatsPanel = useSimulationStore((s) => s.toggleStatsPanel)

  return (
    <div className="relative flex">
      {/* Toggle button */}
      <div className="absolute -left-3 top-4 z-10">
        <Button
          variant="icon"
          size="sm"
          onClick={toggleStatsPanel}
          className="!rounded-full shadow-lg shadow-black/20"
          title={statsPanelOpen ? 'Hide Stats' : 'Show Stats'}
        >
          {statsPanelOpen ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </Button>
      </div>

      {/* Panel */}
      <aside
        className={`
          h-full bg-bg-surface/80 backdrop-blur-xl border-l border-border-subtle overflow-y-auto
          transition-all duration-300 ease-out
          ${statsPanelOpen ? 'w-[300px] opacity-100' : 'w-0 opacity-0 overflow-hidden'}
        `}
      >
        <div className="w-[300px] p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <BarChart3 size={14} className="text-text-muted" />
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
              Monitoring
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-border-subtle to-transparent" />
          </div>

          <MetricsGrid />
          <EnergyPlot />
          <SpeciesPanel />
        </div>
      </aside>
    </div>
  )
}
