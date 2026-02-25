export type Vec3 = [number, number, number]

export interface Atom {
  id: number
  element: string // 'H', 'C', 'N', 'O'
  position: Vec3
  velocity: Vec3
  force: Vec3
  mass: number
}

export interface Bond {
  i: number // atom index
  j: number // atom index
  order: number // 1, 2, 3
  length: number // current distance in Å
}

export interface Species {
  formula: string
  count: number
}

export interface EnergyRecord {
  step: number
  kinetic: number
  potential: number
  total: number
}

export interface SimulationState {
  atoms: Atom[]
  bonds: Bond[]
  species: Species[]
  step: number
  time: number // femtoseconds
  dt: number
  temperature: number // current T in K
  targetTemp: number
  kineticEnergy: number
  potentialEnergy: number
  totalEnergy: number
  confinementRadius: number
  confinementForce: number
  isRunning: boolean
  stepsPerSecond: number
}

export interface SimConfig {
  dt: number // timestep in fs
  targetTemp: number // target temperature in K
  confinementRadius: number // reactor radius in Å
  confinementForce: number // confinement force constant in eV/Å²
  thermostatTau: number // thermostat coupling time in fs
  stepsPerUpdate: number // simulation steps between UI updates
}

export const DEFAULT_CONFIG: SimConfig = {
  dt: 0.5,
  targetTemp: 300,
  confinementRadius: 10,
  confinementForce: 2.0,
  thermostatTau: 20,
  stepsPerUpdate: 10,
}
