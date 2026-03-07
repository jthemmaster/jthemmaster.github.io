import { useSimulationStore } from '../../stores/simulationStore'
import GlassCard from '../ui/GlassCard'

/**
 * Convert formula string like "H2O" to formatted JSX with subscripts
 */
function FormulaDisplay({ formula }: { formula: string }) {
  const parts: React.ReactNode[] = []
  let i = 0

  while (i < formula.length) {
    if (/[A-Z]/.test(formula[i])) {
      let element = formula[i]
      i++
      // Check for lowercase continuation (e.g., "He", "Na")
      while (i < formula.length && /[a-z]/.test(formula[i])) {
        element += formula[i]
        i++
      }
      parts.push(<span key={`elem-${i}`}>{element}</span>)
    } else if (/[0-9]/.test(formula[i])) {
      let num = ''
      while (i < formula.length && /[0-9]/.test(formula[i])) {
        num += formula[i]
        i++
      }
      parts.push(
        <sub key={`num-${i}`} className="text-[0.7em]">
          {num}
        </sub>
      )
    } else {
      i++
    }
  }

  return <span className="font-mono">{parts}</span>
}

export default function SpeciesPanel() {
  const species = useSimulationStore((s) => s.species)

  const totalMolecules = species.reduce((sum, s) => sum + s.count, 0)

  return (
    <GlassCard padding="sm" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-text-secondary">
            Species
          </div>
          <div className="mt-1 text-xs text-text-muted">
            Product distribution detected in the current chamber.
          </div>
        </div>
        <span className="text-[11px] font-mono text-text-muted tabular-nums">
          {totalMolecules} molecules
        </span>
      </div>

      {species.length > 0 ? (
        <div className="max-h-[220px] space-y-2 overflow-y-auto">
          {species.map((sp) => {
            const percentage = totalMolecules > 0 ? (sp.count / totalMolecules) * 100 : 0

            return (
              <div
                key={sp.formula}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.025] px-3 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <FormulaDisplay formula={sp.formula} />
                  <span className="w-10 text-right text-sm font-mono text-text-secondary tabular-nums">
                    {sp.count}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent-purple to-accent-blue transition-all duration-300"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="py-5 text-center text-sm text-text-muted">
          No species detected
        </div>
      )}
    </GlassCard>
  )
}
