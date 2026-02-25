import { useSimulationStore } from '../../stores/simulationStore'
import Slider from '../ui/Slider'

export default function RadiusSlider() {
  const radius = useSimulationStore((s) => s.config.confinementRadius)
  const updateConfig = useSimulationStore((s) => s.updateConfig)

  return (
    <Slider
      label="Reactor Radius"
      value={radius}
      min={2}
      max={20}
      step={0.5}
      unit="Å"
      color="blue"
      onChange={(v) => updateConfig({ confinementRadius: v })}
    />
  )
}
