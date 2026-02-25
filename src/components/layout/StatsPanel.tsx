import { ChevronRight, ChevronLeft } from 'lucide-react'
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
          className="!rounded-full shadow-lg"
        >
          {statsPanelOpen ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </Button>
      </div>

      {/* Panel */}
      <aside
        className={`
          h-full bg-bg-surface border-l border-border-subtle overflow-y-auto
          transition-all duration-300 ease-out
          ${statsPanelOpen ? 'w-[300px] opacity-100' : 'w-0 opacity-0 overflow-hidden'}
        `}
      >
        <div className="w-[300px] p-4 space-y-4">
          <div className="text-xs font-semibold text-text-primary uppercase tracking-wider">
            Monitoring
          </div>

          <MetricsGrid />
          <EnergyPlot />
          <SpeciesPanel />
        </div>
      </aside>
    </div>
  )
}
