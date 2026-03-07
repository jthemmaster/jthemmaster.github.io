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
        <div className="w-full max-w-[300px] rounded-[24px] border border-white/[0.08] bg-black/14 px-4 py-4 backdrop-blur-xl md:px-5 md:py-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isRunning ? 'success' : 'neutral'} pulse={isRunning}>
              {isRunning ? 'Live' : 'Staged'}
            </Badge>
            <span className="text-[11px] uppercase tracking-[0.2em] text-text-secondary">
              Molecular dynamics
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-text-primary md:text-[2.7rem]">
            {preset?.name ?? 'Nano Reactor'}
          </h1>

          {composition && (
            <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-text-secondary/80">
              {composition}
            </div>
          )}

          {isInitialized && (
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="data-pill rounded-full px-3 py-1.5 text-[11px] text-text-secondary">
                <span className="text-text-muted">Atoms</span>{' '}
                <span className="font-mono text-text-primary">{atomCount}</span>
              </div>
              <div className="data-pill rounded-full px-3 py-1.5 text-[11px] text-text-secondary">
                <span className="text-text-muted">Bonds</span>{' '}
                <span className="font-mono text-text-primary">{bondCount}</span>
              </div>
              <div className="data-pill rounded-full px-3 py-1.5 text-[11px] text-text-secondary">
                <span className="text-text-muted">Time</span>{' '}
                <span className="font-mono text-text-primary">
                  {step > 0 ? time.toFixed(1) : '0.0'} fs
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute right-6 top-6 hidden lg:block">
        <div className="rounded-full border border-white/[0.08] bg-black/20 px-4 py-2 text-[11px] text-text-muted backdrop-blur-xl">
          Drag to orbit · Scroll to zoom · Space to run
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
