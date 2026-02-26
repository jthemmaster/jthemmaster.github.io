import { useSimulationStore } from '../../stores/simulationStore'
import { PRESETS } from '../../data/presets'

export default function PresetSelector() {
  const selectedPreset = useSimulationStore((s) => s.selectedPreset)
  const setPreset = useSimulationStore((s) => s.setPreset)

  return (
    <div className="space-y-1.5">
      {PRESETS.map((preset) => {
        const isSelected = selectedPreset === preset.id

        return (
          <button
            key={preset.id}
            onClick={() => setPreset(preset.id)}
            className={`
              w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200
              relative overflow-hidden group
              ${isSelected
                ? 'bg-accent-purple/[0.1] border border-accent-purple/30 shadow-[0_0_16px_rgba(139,92,246,0.08)]'
                : 'glass glass-hover border border-transparent'
              }
            `}
          >
            {/* Left accent bar for selected */}
            {isSelected && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] rounded-r-full bg-gradient-to-b from-accent-purple to-accent-blue" />
            )}

            <div className="flex items-center gap-2.5">
              <span className="text-base flex-shrink-0">{preset.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className={`text-xs font-medium truncate ${isSelected ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'} transition-colors`}>
                  {preset.name}
                </div>
                <div className="text-[10px] text-text-muted truncate mt-0.5 leading-tight">
                  {preset.description}
                </div>
              </div>
              {isSelected && (
                <div className="w-1.5 h-1.5 rounded-full bg-accent-purple flex-shrink-0" />
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
