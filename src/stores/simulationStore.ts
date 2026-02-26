import { create } from 'zustand'
import type { Bond, Species, SimConfig, EnergyRecord, Vec3 } from '../simulation/types'
import type { WorkerCommand, WorkerResponse } from '../simulation/workerMessages'
import { DEFAULT_CONFIG } from '../simulation/types'
import { generatePreset, PRESETS } from '../data/presets'

const MAX_ENERGY_HISTORY = 200

interface SimulationStore {
  // Simulation state
  positions: Vec3[]
  forces: Vec3[]
  elements: string[]
  bonds: Bond[]
  species: Species[]
  step: number
  time: number
  temperature: number
  kineticEnergy: number
  potentialEnergy: number
  totalEnergy: number
  stepsPerSecond: number
  isRunning: boolean
  isInitialized: boolean

  // Config
  config: SimConfig

  // Energy history for plotting
  energyHistory: EnergyRecord[]

  // UI state
  selectedPreset: string
  showBonds: boolean
  showForces: boolean
  showSphere: boolean
  statsPanelOpen: boolean
  sidebarOpen: boolean

  // Worker ref
  worker: Worker | null

  // Actions
  initSimulation: (presetId?: string) => void
  start: () => void
  stop: () => void
  singleStep: () => void
  reset: () => void
  updateConfig: (config: Partial<SimConfig>) => void
  setPreset: (presetId: string) => void
  toggleBonds: () => void
  toggleForces: () => void
  toggleSphere: () => void
  toggleStatsPanel: () => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setStatsPanelOpen: (open: boolean) => void
  cleanup: () => void
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  // Initial state
  positions: [],
  forces: [],
  elements: [],
  bonds: [],
  species: [],
  step: 0,
  time: 0,
  temperature: 0,
  kineticEnergy: 0,
  potentialEnergy: 0,
  totalEnergy: 0,
  stepsPerSecond: 0,
  isRunning: false,
  isInitialized: false,
  config: { ...DEFAULT_CONFIG },
  energyHistory: [],
  selectedPreset: PRESETS[0].id,
  showBonds: true,
  showForces: false,
  showSphere: true,
  statsPanelOpen: typeof window !== 'undefined' && window.innerWidth >= 768,
  sidebarOpen: false,
  worker: null,

  initSimulation: (presetId?: string) => {
    const state = get()
    const preset = presetId || state.selectedPreset

    // Clean up existing worker
    if (state.worker) {
      state.worker.terminate()
    }

    // Create new worker
    const worker = new Worker(new URL('../simulation/worker.ts', import.meta.url), {
      type: 'module',
    })

    // Handle messages from worker
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data

      if (msg.type === 'STATE_UPDATE') {
        set((s) => {
          const newRecord: EnergyRecord = {
            step: msg.step,
            kinetic: msg.kineticEnergy,
            potential: msg.potentialEnergy,
            total: msg.totalEnergy,
          }

          const energyHistory = [...s.energyHistory, newRecord].slice(-MAX_ENERGY_HISTORY)

          return {
            positions: msg.positions,
            forces: msg.forces,
            elements: msg.elements,
            bonds: msg.bonds,
            species: msg.species,
            step: msg.step,
            time: msg.time,
            temperature: msg.temperature,
            kineticEnergy: msg.kineticEnergy,
            potentialEnergy: msg.potentialEnergy,
            totalEnergy: msg.totalEnergy,
            stepsPerSecond: msg.stepsPerSecond,
            energyHistory,
          }
        })
      }
    }

    worker.onerror = (err) => {
      console.error('Worker error:', err)
    }

    // Generate atoms and init
    const config = get().config
    const atoms = generatePreset(preset, config.confinementRadius, config.targetTemp)

    const initMsg: WorkerCommand = {
      type: 'INIT',
      atoms,
      config,
    }

    worker.postMessage(initMsg)

    set({
      worker,
      selectedPreset: preset,
      isInitialized: true,
      isRunning: false,
      energyHistory: [],
      step: 0,
      time: 0,
    })
  },

  start: () => {
    const { worker, isInitialized } = get()
    if (!worker || !isInitialized) return
    worker.postMessage({ type: 'START' } as WorkerCommand)
    set({ isRunning: true })
  },

  stop: () => {
    const { worker } = get()
    if (!worker) return
    worker.postMessage({ type: 'STOP' } as WorkerCommand)
    set({ isRunning: false })
  },

  singleStep: () => {
    const { worker, isInitialized, isRunning } = get()
    if (!worker || !isInitialized || isRunning) return
    worker.postMessage({ type: 'STEP' } as WorkerCommand)
  },

  reset: () => {
    const state = get()
    state.stop()
    state.initSimulation(state.selectedPreset)
  },

  updateConfig: (configUpdate: Partial<SimConfig>) => {
    const { worker, config } = get()
    const newConfig = { ...config, ...configUpdate }
    set({ config: newConfig })

    if (worker) {
      worker.postMessage({ type: 'UPDATE_CONFIG', config: configUpdate } as WorkerCommand)
    }
  },

  setPreset: (presetId: string) => {
    const state = get()
    state.stop()
    set({ selectedPreset: presetId })
    state.initSimulation(presetId)
  },

  toggleBonds: () => set((s) => ({ showBonds: !s.showBonds })),
  toggleForces: () => set((s) => ({ showForces: !s.showForces })),
  toggleSphere: () => set((s) => ({ showSphere: !s.showSphere })),
  toggleStatsPanel: () => set((s) => ({ statsPanelOpen: !s.statsPanelOpen })),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setStatsPanelOpen: (open) => set({ statsPanelOpen: open }),

  cleanup: () => {
    const { worker } = get()
    if (worker) {
      worker.terminate()
      set({ worker: null, isInitialized: false, isRunning: false })
    }
  },
}))
