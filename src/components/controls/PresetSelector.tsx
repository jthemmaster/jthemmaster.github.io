import { useSimulationStore } from '../../stores/simulationStore'
import { PRESETS } from '../../data/presets'

export default function PresetSelector() {
  const selectedPreset = useSimulationStore((s) => s.selectedPreset)
  const setPreset = useSimulationStore((s) => s.setPreset)

  return (
    <div className="space-y-1.5">
      {PRESETS.map((preset) => {
        const isSelected = selectedPreset === preset.id
        const summary = preset.molecules.map((m) => `${m.count} ${m.formula}`).join(' · ')

        return (
          <button
            key={preset.id}
            onClick={() => setPreset(preset.id)}
            className={`
              w-full rounded-2xl border px-3.5 py-3 text-left transition-all duration-200
              ${isSelected
                ? 'border-white/14 bg-white/[0.07]'
                : 'border-transparent bg-transparent hover:border-white/[0.08] hover:bg-white/[0.03]'
              }
            `}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div
                  className={`text-sm font-medium truncate ${
                    isSelected ? 'text-text-primary' : 'text-text-secondary'
                  }`}
                >
                  {preset.name}
                </div>
                <div className="mt-1 text-[11px] text-text-muted">
                  {summary}
                </div>
              </div>
              <div
                className={`rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] ${
                  isSelected
                    ? 'bg-white/[0.1] text-text-primary'
                    : 'bg-white/[0.04] text-text-muted'
                }`}
              >
                {isSelected ? 'On' : 'Use'}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
