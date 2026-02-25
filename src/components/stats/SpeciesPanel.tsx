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
    <GlassCard padding="sm" className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
          Species
        </span>
        <span className="text-[10px] font-mono text-text-muted tabular-nums">
          {totalMolecules} molecules
        </span>
      </div>

      {species.length > 0 ? (
        <div className="space-y-1 max-h-[200px] overflow-y-auto">
          {species.map((sp) => {
            const percentage = totalMolecules > 0 ? (sp.count / totalMolecules) * 100 : 0

            return (
              <div
                key={sp.formula}
                className="flex items-center justify-between py-1 px-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FormulaDisplay formula={sp.formula} />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent-purple to-accent-blue transition-all duration-300"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-text-secondary tabular-nums w-6 text-right">
                    {sp.count}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-text-muted text-xs text-center py-4">
          No species detected
        </div>
      )}
    </GlassCard>
  )
}
