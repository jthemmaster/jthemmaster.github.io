import { useEffect } from 'react'
import Sidebar from './components/layout/Sidebar'
import StatsPanel from './components/layout/StatsPanel'
import StatusBar from './components/layout/StatusBar'
import MobileHeader from './components/layout/MobileHeader'
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
  const sidebarOpen = useSimulationStore((s) => s.sidebarOpen)
  const setSidebarOpen = useSimulationStore((s) => s.setSidebarOpen)
  const statsPanelOpen = useSimulationStore((s) => s.statsPanelOpen)
  const setStatsPanelOpen = useSimulationStore((s) => s.setStatsPanelOpen)

  // Initialize simulation on mount
  useEffect(() => {
    initSimulation()
    return () => cleanup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      switch (e.code) {
        case 'Space':
          e.preventDefault()
          if (isRunning) stop()
          else if (isInitialized) start()
          break
        case 'KeyR':
          if (!e.metaKey && !e.ctrlKey) { e.preventDefault(); reset() }
          break
        case 'KeyS':
          if (!e.metaKey && !e.ctrlKey) { e.preventDefault(); if (!isRunning) singleStep() }
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isRunning, isInitialized, start, stop, singleStep, reset])

  return (
    <div className="w-full h-full flex flex-col bg-bg-primary relative overflow-hidden">
      {/* Subtle mesh gradient background */}
      <div className="mesh-gradient" />

      {/* Mobile header — visible only on small screens */}
      <MobileHeader />

      {/* Main content area */}
      <div className="flex-1 flex min-h-0 relative z-10">
        {/* Sidebar — fixed on desktop, overlay on mobile */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
              className="absolute left-0 top-0 bottom-0 w-[300px] max-w-[85vw] animate-slide-in-left"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Center: 3D viewer */}
        <main className="flex-1 min-w-0 relative">
          <MolecularViewer />
        </main>

        {/* Stats panel — fixed on desktop, overlay on mobile */}
        <div className="hidden md:block">
          <StatsPanel />
        </div>

        {/* Mobile stats overlay */}
        {statsPanelOpen && (
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setStatsPanelOpen(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
              className="absolute right-0 top-0 bottom-0 w-[300px] max-w-[85vw] animate-slide-in-right"
              onClick={(e) => e.stopPropagation()}
            >
              <StatsPanel mobile />
            </div>
          </div>
        )}
      </div>

      {/* Bottom status bar */}
      <StatusBar />
    </div>
  )
}

export default App
