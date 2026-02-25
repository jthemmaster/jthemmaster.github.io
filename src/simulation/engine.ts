import type { Atom, Bond, Species, SimConfig, Vec3 } from './types'
import { morsePairForce } from './potentials'
import { computeSoftConfinement } from './confinement'
import { integratePositions, integrateVelocities } from './integrator'
import { detectBonds, detectSpecies } from './bonds'
import { calculateTemperature, applyBerendsenThermostat, removeCOMVelocity } from './thermostat'
import { zero, addMut, lengthSq } from '../lib/vec3'

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

    // Energy minimization to resolve overlaps
    this.energyMinimize()

    // Compute initial forces for dynamics
    this.computeForces()
  }

  /**
   * Energy minimization using steepest descent.
   * Moves atoms along force vectors to reduce potential energy
   * without any kinetic energy / dynamics.
   */
  private energyMinimize(): void {
    const maxSteps = 500
    const initialStepSize = 0.005 // Å
    let stepSize = initialStepSize

    for (let iter = 0; iter < maxSteps; iter++) {
      this.computeForces()

      // Find max force magnitude
      let maxForceSq = 0
      for (const atom of this.atoms) {
        const fSq = atom.force[0] ** 2 + atom.force[1] ** 2 + atom.force[2] ** 2
        if (fSq > maxForceSq) maxForceSq = fSq
      }
      const maxForce = Math.sqrt(maxForceSq)

      // Converged if max force is small
      if (maxForce < 0.1) break

      // Normalize step size by max force to prevent overshooting
      const effectiveStep = Math.min(stepSize, 0.1 / maxForce)

      // Move atoms along force direction (steepest descent)
      for (const atom of this.atoms) {
        atom.position[0] += atom.force[0] * effectiveStep
        atom.position[1] += atom.force[1] * effectiveStep
        atom.position[2] += atom.force[2] * effectiveStep
      }

      // Adaptive step size
      if (iter > 0 && iter % 50 === 0) {
        stepSize *= 1.2 // Grow step size if making progress
      }
    }

    // After minimization, assign fresh thermal velocities
    const AMU_TO_INTERNAL = 103.6428
    const kB = 8.617333262e-5
    for (const atom of this.atoms) {
      const sigma = Math.sqrt(kB * this.config.targetTemp / (atom.mass * AMU_TO_INTERNAL))
      for (let d = 0; d < 3; d++) {
        // Box-Muller
        const u1 = Math.random() || 1e-10
        const u2 = Math.random()
        atom.velocity[d] = sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
      }
    }

    removeCOMVelocity(this.atoms)
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

    // 4. Cap velocities to prevent numerical instability
    this.capVelocities()

    // 5. Calculate temperature and apply thermostat
    const { temperature, kineticEnergy } = calculateTemperature(this.atoms)

    if (targetTemp > 0 && thermostatTau > 0) {
      applyBerendsenThermostat(this.atoms, targetTemp, temperature, dt, thermostatTau)
    }

    // 6. Detect bonds and species
    const bonds = detectBonds(this.atoms)
    const species = detectSpecies(this.atoms, bonds)

    // 7. Update counters
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
   * Cap atom velocities to prevent numerical instability.
   * Max velocity is set to prevent atoms from moving more than ~0.3 Å per step.
   */
  private capVelocities(): void {
    const maxVelComponent = 0.05 / this.config.dt // Å/fs - max ~0.05 Å per step
    for (const atom of this.atoms) {
      for (let d = 0; d < 3; d++) {
        if (atom.velocity[d] > maxVelComponent) atom.velocity[d] = maxVelComponent
        if (atom.velocity[d] < -maxVelComponent) atom.velocity[d] = -maxVelComponent
      }
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
