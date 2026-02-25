import { useSimulationStore } from '../../stores/simulationStore'
import Slider from '../ui/Slider'

export default function TemperatureSlider() {
  const targetTemp = useSimulationStore((s) => s.config.targetTemp)
  const currentTemp = useSimulationStore((s) => s.temperature)
  const updateConfig = useSimulationStore((s) => s.updateConfig)

  return (
    <div className="space-y-1">
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
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] text-text-muted">Current</span>
        <span className="text-[10px] font-mono text-text-secondary tabular-nums">
          {currentTemp.toFixed(0)} K
        </span>
      </div>
    </div>
  )
}
