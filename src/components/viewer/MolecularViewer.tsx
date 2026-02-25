import { Canvas } from '@react-three/fiber'
import SceneSetup from './SceneSetup'
import Atoms from './Atoms'
import Bonds from './Bonds'
import ConfinementSphere from './ConfinementSphere'
import { useSimulationStore } from '../../stores/simulationStore'
import Badge from '../ui/Badge'

export default function MolecularViewer() {
  const isInitialized = useSimulationStore((s) => s.isInitialized)
  const atomCount = useSimulationStore((s) => s.elements.length)
  const bondCount = useSimulationStore((s) => s.bonds.length)

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{
          position: [15, 10, 15],
          fov: 50,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#09090B' }}
      >
        <color attach="background" args={['#09090B']} />
        <SceneSetup />
        {isInitialized && (
          <>
            <Atoms />
            <Bonds />
            <ConfinementSphere />
          </>
        )}
      </Canvas>

      {/* Overlay badges */}
      {isInitialized && (
        <div className="absolute bottom-4 left-4 flex gap-2">
          <Badge variant="accent">
            {atomCount} atoms
          </Badge>
          <Badge variant="neutral">
            {bondCount} bonds
          </Badge>
        </div>
      )}

      {/* Empty state */}
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-text-muted text-sm mb-2">No simulation loaded</div>
            <div className="text-text-muted text-xs">Select a preset to begin</div>
          </div>
        </div>
      )}
    </div>
  )
}
