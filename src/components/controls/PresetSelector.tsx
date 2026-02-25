import { useSimulationStore } from '../../stores/simulationStore'
import { PRESETS } from '../../data/presets'
import GlassCard from '../ui/GlassCard'

export default function PresetSelector() {
  const selectedPreset = useSimulationStore((s) => s.selectedPreset)
  const setPreset = useSimulationStore((s) => s.setPreset)

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-text-secondary uppercase tracking-wider px-1">
        Preset System
      </div>
      <div className="space-y-1">
        {PRESETS.map((preset) => (
          <GlassCard
            key={preset.id}
            padding="sm"
            hover
            className={`
              cursor-pointer transition-all duration-200
              ${
                selectedPreset === preset.id
                  ? 'border-accent-purple/40 bg-accent-purple/[0.08] shadow-[0_0_12px_rgba(139,92,246,0.1)]'
                  : ''
              }
            `}
          >
            <button
              onClick={() => setPreset(preset.id)}
              className="w-full text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{preset.emoji}</span>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-text-primary truncate">
                    {preset.name}
                  </div>
                  <div className="text-[10px] text-text-muted truncate">
                    {preset.description}
                  </div>
                </div>
              </div>
            </button>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
