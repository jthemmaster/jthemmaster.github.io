import type { Atom, Bond, Species, SimConfig, Vec3 } from './types'
import { morsePairForce } from './potentials'
import { computeSoftConfinement } from './confinement'
import { integratePositions, integrateVelocities } from './integrator'
import { detectBonds, detectSpecies } from './bonds'
import { calculateTemperature, applyBerendsenThermostat, removeCOMVelocity } from './thermostat'
import { zero, addMut } from '../lib/vec3'

export interface StepResult {
  atoms: Atom[]
  bonds: Bond[]
  species: Species[]
  temperature: number
  kineticEnergy: number
  potentialEnergy: number
  totalEnergy: number
  step: number
  time: number
}

export class SimulationEngine {
  private atoms: Atom[] = []
  private config: SimConfig
  private step = 0
  private time = 0

  constructor(config: SimConfig) {
    this.config = { ...config }
  }

  init(atoms: Atom[]): void {
    // Deep copy atoms
    this.atoms = atoms.map((a) => ({
      ...a,
      position: [...a.position] as Vec3,
      velocity: [...a.velocity] as Vec3,
      force: [0, 0, 0] as Vec3,
    }))
    this.step = 0
    this.time = 0

    // Remove COM velocity
    removeCOMVelocity(this.atoms)

    // Compute initial forces
    this.computeForces()
  }

  updateConfig(config: Partial<SimConfig>): void {
    Object.assign(this.config, config)
  }

  getConfig(): SimConfig {
    return { ...this.config }
  }

  /**
   * Perform one integration step using Velocity Verlet.
   */
  doStep(): StepResult {
    const { dt, targetTemp, thermostatTau, confinementRadius, confinementForce } = this.config

    // Save old forces for Velocity Verlet
    const oldForces: Vec3[] = this.atoms.map((a) => [...a.force] as Vec3)

    // 1. Update positions: x(t+dt) = x(t) + v(t)*dt + 0.5*a(t)*dt²
    integratePositions(this.atoms, dt)

    // 2. Compute new forces at new positions
    const potentialEnergy = this.computeForces()

    // 3. Update velocities: v(t+dt) = v(t) + 0.5*(a_old + a_new)*dt
    integrateVelocities(this.atoms, oldForces, dt)

    // 4. Calculate temperature and apply thermostat
    const { temperature, kineticEnergy } = calculateTemperature(this.atoms)

    if (targetTemp > 0 && thermostatTau > 0) {
      applyBerendsenThermostat(this.atoms, targetTemp, temperature, dt, thermostatTau)
    }

    // 5. Detect bonds and species
    const bonds = detectBonds(this.atoms)
    const species = detectSpecies(this.atoms, bonds)

    // 6. Update counters
    this.step++
    this.time += dt

    // Compute final temperature after thermostat
    const finalThermo = calculateTemperature(this.atoms)

    return {
      atoms: this.atoms,
      bonds,
      species,
      temperature: finalThermo.temperature,
      kineticEnergy: finalThermo.kineticEnergy,
      potentialEnergy,
      totalEnergy: finalThermo.kineticEnergy + potentialEnergy,
      step: this.step,
      time: this.time,
    }
  }

  /**
   * Compute all forces on all atoms.
   * Returns total potential energy.
   */
  private computeForces(): number {
    const n = this.atoms.length
    let potentialEnergy = 0

    // Reset forces
    for (const atom of this.atoms) {
      atom.force = zero()
    }

    // Pairwise Morse forces
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const result = morsePairForce(
          this.atoms[i].position,
          this.atoms[j].position,
          this.atoms[i].element,
          this.atoms[j].element,
        )

        if (result) {
          addMut(this.atoms[i].force, result.force)
          // Newton's third law: equal and opposite
          this.atoms[j].force[0] -= result.force[0]
          this.atoms[j].force[1] -= result.force[1]
          this.atoms[j].force[2] -= result.force[2]
          potentialEnergy += result.energy
        }
      }
    }

    // Confinement forces
    const { confinementRadius, confinementForce } = this.config
    if (confinementForce > 0) {
      for (const atom of this.atoms) {
        const confinement = computeSoftConfinement(
          atom.position,
          confinementRadius,
          confinementForce,
        )
        addMut(atom.force, confinement.force)
        potentialEnergy += confinement.energy
      }
    }

    return potentialEnergy
  }
}
