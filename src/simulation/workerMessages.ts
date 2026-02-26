import type { Atom, SimConfig, Bond, Species, Vec3 } from './types'

// Messages from main thread to worker
export type WorkerCommand =
  | { type: 'INIT'; atoms: Atom[]; config: SimConfig }
  | { type: 'START' }
  | { type: 'STOP' }
  | { type: 'STEP' }
  | { type: 'UPDATE_CONFIG'; config: Partial<SimConfig> }
  | { type: 'RESET'; atoms: Atom[]; config: SimConfig }

// Messages from worker to main thread
export type WorkerResponse =
  | {
      type: 'STATE_UPDATE'
      positions: Vec3[]
      forces: Vec3[]
      elements: string[]
      bonds: Bond[]
      species: Species[]
      temperature: number
      kineticEnergy: number
      potentialEnergy: number
      totalEnergy: number
      step: number
      time: number
      stepsPerSecond: number
    }
  | { type: 'READY' }
  | { type: 'ERROR'; message: string }
