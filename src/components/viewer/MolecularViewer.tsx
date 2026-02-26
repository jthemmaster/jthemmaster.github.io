import { Canvas } from '@react-three/fiber'
import SceneSetup from './SceneSetup'
import Atoms from './Atoms'
import Bonds from './Bonds'
import ConfinementSphere from './ConfinementSphere'
import CanvasErrorBoundary from './CanvasErrorBoundary'
import { useSimulationStore } from '../../stores/simulationStore'
import Badge from '../ui/Badge'
import Logo from '../ui/Logo'

export default function MolecularViewer() {
  const isInitialized = useSimulationStore((s) => s.isInitialized)
  const isRunning = useSimulationStore((s) => s.isRunning)
  const atomCount = useSimulationStore((s) => s.elements.length)
  const bondCount = useSimulationStore((s) => s.bonds.length)
  const step = useSimulationStore((s) => s.step)

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 3D Canvas */}
      <CanvasErrorBoundary>
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
      </CanvasErrorBoundary>

      {/* Top-left: step counter */}
      {isInitialized && step > 0 && (
        <div className="absolute top-4 left-4 pointer-events-none">
          <span className="text-[10px] font-mono text-text-muted tabular-nums">
            t = {(step * 0.5).toFixed(0)} fs
          </span>
        </div>
      )}

      {/* Bottom-left: overlay badges */}
      {isInitialized && (
        <div className="absolute bottom-4 left-4 flex gap-2">
          <Badge variant="accent">
            {atomCount} atoms
          </Badge>
          <Badge variant="neutral">
            {bondCount} bonds
          </Badge>
          {isRunning && (
            <Badge variant="success" pulse>
              Live
            </Badge>
          )}
        </div>
      )}

      {/* Top-right: keyboard hints — desktop only */}
      <div className="absolute top-4 right-4 pointer-events-none hidden md:block">
        <div className="flex gap-1.5 text-[9px] text-text-muted font-mono">
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08]">Space</kbd>
          <span className="opacity-60">Play/Pause</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] ml-2">R</kbd>
          <span className="opacity-60">Reset</span>
        </div>
      </div>

      {/* Empty state */}
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <div className="flex justify-center opacity-30">
              <Logo size="lg" showText={false} />
            </div>
            <div>
              <div className="text-text-secondary text-sm font-medium mb-1">No Simulation</div>
              <div className="text-text-muted text-xs">Select a preset from the sidebar to begin</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
