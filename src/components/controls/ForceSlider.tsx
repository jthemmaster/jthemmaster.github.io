import { useSimulationStore } from '../../stores/simulationStore'
import Slider from '../ui/Slider'

export default function ForceSlider() {
  const force = useSimulationStore((s) => s.config.confinementForce)
  const updateConfig = useSimulationStore((s) => s.updateConfig)

  return (
    <Slider
      label="Confinement Force"
      value={force}
      min={0}
      max={50}
      step={0.5}
      unit="eV/Å²"
      color="purple"
      onChange={(v) => updateConfig({ confinementForce: v })}
    />
  )
}
