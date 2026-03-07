import { Canvas } from '@react-three/fiber'
import SceneSetup from './SceneSetup'
import Atoms from './Atoms'
import Bonds from './Bonds'
import ConfinementSphere from './ConfinementSphere'
import CanvasErrorBoundary from './CanvasErrorBoundary'
import { useSimulationStore } from '../../stores/simulationStore'
import Badge from '../ui/Badge'
import Logo from '../ui/Logo'
import { PRESETS } from '../../data/presets'

export default function MolecularViewer() {
  const isInitialized = useSimulationStore((s) => s.isInitialized)
  const isRunning = useSimulationStore((s) => s.isRunning)
  const atomCount = useSimulationStore((s) => s.elements.length)
  const bondCount = useSimulationStore((s) => s.bonds.length)
  const step = useSimulationStore((s) => s.step)
  const time = useSimulationStore((s) => s.time)
  const selectedPreset = useSimulationStore((s) => s.selectedPreset)
  const preset = PRESETS.find((entry) => entry.id === selectedPreset)
  const composition = preset?.molecules.map((molecule) => `${molecule.count} ${molecule.formula}`).join(' · ')

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#05070A]">
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
          style={{ background: '#05070A' }}
        >
          <color attach="background" args={['#05070A']} />
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

      <div className="viewer-vignette pointer-events-none absolute inset-0" />

      <div className="pointer-events-none absolute left-4 top-4 right-4 md:left-6 md:top-6 md:right-auto">
        <div className="w-full max-w-[520px] border-l border-white/[0.12] pl-4 md:pl-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isRunning ? 'success' : 'neutral'} pulse={isRunning}>
              {isRunning ? 'Live' : 'Staged'}
            </Badge>
            <span className="text-[11px] uppercase tracking-[0.2em] text-text-secondary">
              Chemistry simulation
            </span>
          </div>

          <h1 className="mt-4 max-w-[11ch] text-4xl font-semibold leading-[0.95] tracking-[-0.06em] text-text-primary md:text-[4.1rem]">
            {preset?.name ?? 'Nano Reactor'}
          </h1>

          {preset?.description && (
            <p className="mt-3 max-w-[32ch] text-[15px] leading-relaxed text-text-muted">
              {preset.description}
            </p>
          )}

          {composition && (
            <div className="mt-4 text-[11px] uppercase tracking-[0.16em] text-text-secondary/80">
              {composition}
            </div>
          )}

          {isInitialized && (
            <div className="mt-5 text-[12px] text-text-secondary">
              <span className="font-mono text-text-primary">{atomCount}</span> atoms
              <span className="mx-2 text-text-muted">/</span>
              <span className="font-mono text-text-primary">{bondCount}</span> bonds
              <span className="mx-2 text-text-muted">/</span>
              <span className="font-mono text-text-primary">{step > 0 ? time.toFixed(1) : '0.0'} fs</span>
            </div>
          )}
        </div>
      </div>

      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/70 backdrop-blur-sm">
          <div className="space-y-4 text-center">
            <div className="flex justify-center opacity-70">
              <Logo size="lg" showText={false} />
            </div>
            <div>
              <div className="mb-1 text-base font-medium text-text-secondary">Preparing simulation</div>
              <div className="text-sm text-text-muted">Select a preset from the left rail if you want to switch systems.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
