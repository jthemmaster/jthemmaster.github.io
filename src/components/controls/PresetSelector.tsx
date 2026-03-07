import { useSimulationStore } from '../../stores/simulationStore'
import { PRESETS } from '../../data/presets'

export default function PresetSelector() {
  const selectedPreset = useSimulationStore((s) => s.selectedPreset)
  const setPreset = useSimulationStore((s) => s.setPreset)

  return (
    <div className="space-y-2">
      {PRESETS.map((preset, index) => {
        const isSelected = selectedPreset === preset.id

        return (
          <button
            key={preset.id}
            onClick={() => setPreset(preset.id)}
            className={`
              w-full text-left px-4 py-3.5 rounded-[22px] transition-all duration-200
              relative overflow-hidden group border
              ${isSelected
                ? 'border-white/14 bg-white/[0.06] shadow-[0_14px_36px_rgba(0,0,0,0.18)]'
                : 'border-white/[0.06] bg-white/[0.025] hover:bg-white/[0.04] hover:border-white/[0.12]'
              }
            `}
          >
            <div
              className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent transition-opacity ${
                isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            />

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-text-muted">
                  Preset {String(index + 1).padStart(2, '0')}
                </div>
                <div
                  className={`text-sm font-medium truncate ${
                    isSelected ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'
                  } transition-colors`}
                >
                  {preset.name}
                </div>
                <div className="mt-1 text-[11px] text-text-muted leading-relaxed">
                  {preset.description}
                </div>
              </div>
              <div
                className={`mt-1 rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] ${
                  isSelected
                    ? 'bg-white/[0.08] text-text-primary'
                    : 'bg-white/[0.04] text-text-muted group-hover:text-text-secondary'
                }`}
              >
                {isSelected ? 'Live' : 'Load'}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
