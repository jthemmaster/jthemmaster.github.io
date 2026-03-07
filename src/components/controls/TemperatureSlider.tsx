import { useSimulationStore } from '../../stores/simulationStore'
import Slider from '../ui/Slider'

export default function TemperatureSlider() {
  const targetTemp = useSimulationStore((s) => s.config.targetTemp)
  const currentTemp = useSimulationStore((s) => s.temperature)
  const updateConfig = useSimulationStore((s) => s.updateConfig)

  return (
    <div className="space-y-2">
      <Slider
        label="Target Temperature"
        value={targetTemp}
        min={50}
        max={5000}
        step={50}
        unit="K"
        color="cyan"
        onChange={(v) => updateConfig({ targetTemp: v })}
        formatValue={(v) => v.toFixed(0)}
      />
      <div className="flex items-center justify-between rounded-[12px] border border-white/[0.05] bg-white/[0.02] px-3 py-2">
        <span className="text-[11px] text-text-muted">Current temperature</span>
        <span className="text-[11px] font-mono text-text-secondary tabular-nums">
          {isNaN(currentTemp) ? '—' : currentTemp.toFixed(0)} K
        </span>
      </div>
    </div>
  )
}
