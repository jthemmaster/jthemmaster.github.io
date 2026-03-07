import { ChevronRight, ChevronLeft, X } from 'lucide-react'
import MetricsGrid from '../stats/MetricsGrid'
import EnergyPlot from '../stats/EnergyPlot'
import SpeciesPanel from '../stats/SpeciesPanel'
import { useSimulationStore } from '../../stores/simulationStore'
import Button from '../ui/Button'

interface StatsPanelProps {
  mobile?: boolean
}

function StatsPanelContent() {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-text-secondary">
          Insights
        </div>
        <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-text-primary">
          Live reaction analytics
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          Monitor thermal behavior, energy exchange, and species distribution as the system evolves.
        </p>
      </div>
      <MetricsGrid />
      <EnergyPlot />
      <SpeciesPanel />
    </div>
  )
}

export default function StatsPanel({ mobile }: StatsPanelProps) {
  const statsPanelOpen = useSimulationStore((s) => s.statsPanelOpen)
  const toggleStatsPanel = useSimulationStore((s) => s.toggleStatsPanel)
  const setStatsPanelOpen = useSimulationStore((s) => s.setStatsPanelOpen)

  if (mobile) {
    return (
      <aside className="h-full w-full overflow-y-auto bg-[linear-gradient(180deg,rgba(11,16,23,0.96),rgba(8,12,18,0.96))]">
        <div className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-text-secondary">
                Insights
              </div>
              <div className="mt-1 text-sm text-text-muted">
                Analytics for the current simulation.
              </div>
            </div>
            <button
              onClick={() => setStatsPanelOpen(false)}
              className="panel-soft panel-soft-hover flex h-9 w-9 items-center justify-center rounded-xl text-text-muted hover:text-text-primary"
            >
              <X size={16} />
            </button>
          </div>
          <StatsPanelContent />
        </div>
      </aside>
    )
  }

  return (
    <div className="relative flex">
      <div className="absolute -left-4 top-6 z-20">
        <Button
          variant="icon"
          size="sm"
          onClick={toggleStatsPanel}
          className="shadow-[0_14px_30px_rgba(0,0,0,0.24)]"
          title={statsPanelOpen ? 'Hide insights' : 'Show insights'}
        >
          {statsPanelOpen ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </Button>
      </div>

      <aside
        className={`
          h-full overflow-y-auto border-l border-white/[0.06] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))]
          transition-all duration-300 ease-out
          ${statsPanelOpen ? 'w-[320px] opacity-100' : 'w-0 opacity-0 overflow-hidden'}
        `}
      >
        <div className="w-[320px] p-5">
          <StatsPanelContent />
        </div>
      </aside>
    </div>
  )
}
