import { useEffect } from 'react'
import Sidebar from './components/layout/Sidebar'
import StatsPanel from './components/layout/StatsPanel'
import StatusBar from './components/layout/StatusBar'
import MolecularViewer from './components/viewer/MolecularViewer'
import { useSimulationStore } from './stores/simulationStore'

function App() {
  const initSimulation = useSimulationStore((s) => s.initSimulation)
  const cleanup = useSimulationStore((s) => s.cleanup)
  const isInitialized = useSimulationStore((s) => s.isInitialized)
  const start = useSimulationStore((s) => s.start)
  const stop = useSimulationStore((s) => s.stop)
  const singleStep = useSimulationStore((s) => s.singleStep)
  const reset = useSimulationStore((s) => s.reset)
  const isRunning = useSimulationStore((s) => s.isRunning)

  // Initialize simulation on mount
  useEffect(() => {
    initSimulation()
    return () => cleanup()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          if (isRunning) stop()
          else if (isInitialized) start()
          break
        case 'KeyR':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault()
            reset()
          }
          break
        case 'KeyS':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault()
            if (!isRunning) singleStep()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isRunning, isInitialized, start, stop, singleStep, reset])

  return (
    <div className="w-full h-full flex flex-col bg-bg-primary relative">
      {/* Subtle mesh gradient background */}
      <div className="mesh-gradient" />

      {/* Main content area */}
      <div className="flex-1 flex min-h-0 relative z-10">
        {/* Left sidebar */}
        <Sidebar />

        {/* Center: 3D viewer */}
        <main className="flex-1 min-w-0 relative">
          <MolecularViewer />
        </main>

        {/* Right: stats panel */}
        <StatsPanel />
      </div>

      {/* Bottom status bar */}
      <StatusBar />
    </div>
  )
}

export default App
