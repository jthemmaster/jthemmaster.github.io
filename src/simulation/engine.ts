import type { Atom, Bond, Species, SimConfig, Vec3 } from './types'
import { morseBondedForce, repulsiveNonbondedForce } from './potentials'
import { computeSoftConfinement } from './confinement'
import { integratePositions, integrateVelocities } from './integrator'
import { detectSpecies } from './bonds'
import { calculateTemperature, applyBerendsenThermostat, removeCOMVelocity } from './thermostat'
import { zero, addMut, distance } from '../lib/vec3'
import { ELEMENTS } from '../data/elements'

// Max bonds per element (valence)
const MAX_VALENCE: Record<string, number> = {
  H: 1,
  C: 4,
  N: 3,
  O: 2,
}

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
  // Active bond set: key = "i-j" where i < j
  private bondSet: Map<string, Bond> = new Map()
  // Bond count per atom
  private bondCounts: number[] = []

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

    // Initialize bond tracking
    this.bondSet = new Map()
    this.bondCounts = new Array(this.atoms.length).fill(0)

    // Detect initial bonds from distances
    this.detectAndFormInitialBonds()

    // Remove COM velocity
    removeCOMVelocity(this.atoms)

    // Energy minimization
    this.energyMinimize()

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
   * Perform one integration step.
   */
  doStep(): StepResult {
    const { dt, targetTemp, thermostatTau } = this.config

    // Save old forces
    const oldForces: Vec3[] = this.atoms.map((a) => [...a.force] as Vec3)

    // 1. Update positions
    integratePositions(this.atoms, dt)

    // 2. Update bonds (break/form)
    this.updateBonds()

    // 3. Compute new forces
    const potentialEnergy = this.computeForces()

    // 4. Update velocities
    integrateVelocities(this.atoms, oldForces, dt)

    // 5. Cap velocities
    this.capVelocities()

    // 6. Thermostat
    const { temperature, kineticEnergy } = calculateTemperature(this.atoms)
    if (targetTemp > 0 && thermostatTau > 0) {
      applyBerendsenThermostat(this.atoms, targetTemp, temperature, dt, thermostatTau)
    }

    // 7. Detect species
    const bonds = Array.from(this.bondSet.values())
    const species = detectSpecies(this.atoms, bonds)

    this.step++
    this.time += dt

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
   * Detect and form initial bonds based on distance criteria.
   */
  private detectAndFormInitialBonds(): void {
    const n = this.atoms.length
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const r = distance(this.atoms[i].position, this.atoms[j].position)
        const elemI = this.atoms[i].element
        const elemJ = this.atoms[j].element
        const covI = ELEMENTS[elemI]?.covalentRadius || 0.7
        const covJ = ELEMENTS[elemJ]?.covalentRadius || 0.7
        const formThreshold = 1.3 * (covI + covJ)

        if (r < formThreshold) {
          this.tryFormBond(i, j, r)
        }
      }
    }
  }

  /**
   * Try to form a bond between atoms i and j.
   * Only forms if both atoms have available valence.
   */
  private tryFormBond(i: number, j: number, r: number): boolean {
    const key = i < j ? `${i}-${j}` : `${j}-${i}`
    if (this.bondSet.has(key)) return false

    const valI = MAX_VALENCE[this.atoms[i].element] || 1
    const valJ = MAX_VALENCE[this.atoms[j].element] || 1

    if (this.bondCounts[i] >= valI || this.bondCounts[j] >= valJ) return false

    // Estimate bond order
    const covI = ELEMENTS[this.atoms[i].element]?.covalentRadius || 0.7
    const covJ = ELEMENTS[this.atoms[j].element]?.covalentRadius || 0.7
    const singleDist = covI + covJ
    const ratio = r / singleDist
    let order = 1
    if (ratio < 0.82) order = 3
    else if (ratio < 0.92) order = 2

    this.bondSet.set(key, { i: Math.min(i, j), j: Math.max(i, j), order, length: r })
    this.bondCounts[i]++
    this.bondCounts[j]++
    return true
  }

  /**
   * Break a bond between atoms i and j.
   */
  private breakBond(i: number, j: number): void {
    const key = i < j ? `${i}-${j}` : `${j}-${i}`
    if (!this.bondSet.has(key)) return
    this.bondSet.delete(key)
    this.bondCounts[i]--
    this.bondCounts[j]--
  }

  /**
   * Update bonds: check for breaking and formation.
   */
  private updateBonds(): void {
    // Check for bond breaking
    const toBreak: [number, number][] = []
    for (const [, bond] of this.bondSet) {
      const r = distance(this.atoms[bond.i].position, this.atoms[bond.j].position)
      bond.length = r

      const covI = ELEMENTS[this.atoms[bond.i].element]?.covalentRadius || 0.7
      const covJ = ELEMENTS[this.atoms[bond.j].element]?.covalentRadius || 0.7
      const breakThreshold = 2.0 * (covI + covJ)

      if (r > breakThreshold) {
        toBreak.push([bond.i, bond.j])
      }
    }

    for (const [i, j] of toBreak) {
      this.breakBond(i, j)
    }

    // Check for bond formation
    const n = this.atoms.length
    for (let i = 0; i < n; i++) {
      if (this.bondCounts[i] >= (MAX_VALENCE[this.atoms[i].element] || 1)) continue

      for (let j = i + 1; j < n; j++) {
        if (this.bondCounts[j] >= (MAX_VALENCE[this.atoms[j].element] || 1)) continue

        const key = `${i}-${j}`
        if (this.bondSet.has(key)) continue

        const r = distance(this.atoms[i].position, this.atoms[j].position)
        const covI = ELEMENTS[this.atoms[i].element]?.covalentRadius || 0.7
        const covJ = ELEMENTS[this.atoms[j].element]?.covalentRadius || 0.7
        const formThreshold = 1.2 * (covI + covJ)

        if (r < formThreshold) {
          this.tryFormBond(i, j, r)
        }
      }
    }
  }

  /**
   * Cap velocities to prevent runaway.
   */
  private capVelocities(): void {
    const maxVel = 0.05 / this.config.dt
    for (const atom of this.atoms) {
      for (let d = 0; d < 3; d++) {
        atom.velocity[d] = Math.max(-maxVel, Math.min(maxVel, atom.velocity[d]))
      }
    }
  }

  /**
   * Energy minimization via steepest descent.
   */
  private energyMinimize(): void {
    for (let iter = 0; iter < 300; iter++) {
      this.computeForces()

      let maxForceSq = 0
      for (const atom of this.atoms) {
        const fSq = atom.force[0] ** 2 + atom.force[1] ** 2 + atom.force[2] ** 2
        if (fSq > maxForceSq) maxForceSq = fSq
      }

      if (Math.sqrt(maxForceSq) < 0.5) break

      const stepSize = Math.min(0.01, 0.2 / Math.sqrt(maxForceSq))

      for (const atom of this.atoms) {
        atom.position[0] += atom.force[0] * stepSize
        atom.position[1] += atom.force[1] * stepSize
        atom.position[2] += atom.force[2] * stepSize
      }
    }

    // Re-detect bonds after minimization (geometry may have changed)
    this.bondSet = new Map()
    this.bondCounts = new Array(this.atoms.length).fill(0)
    this.detectAndFormInitialBonds()

    // Assign fresh Maxwell-Boltzmann velocities
    const AMU_TO_INTERNAL = 103.6428
    const kB = 8.617333262e-5
    for (const atom of this.atoms) {
      const sigma = Math.sqrt(kB * this.config.targetTemp / (atom.mass * AMU_TO_INTERNAL))
      for (let d = 0; d < 3; d++) {
        const u1 = Math.random() || 1e-10
        const u2 = Math.random()
        atom.velocity[d] = sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
      }
    }
    removeCOMVelocity(this.atoms)
  }

  /**
   * Compute all forces.
   * Bonded pairs: Morse potential
   * Non-bonded pairs: repulsive potential
   */
  private computeForces(): number {
    const n = this.atoms.length
    let potentialEnergy = 0

    // Reset forces
    for (const atom of this.atoms) {
      atom.force = zero()
    }

    // Create set of bonded pair keys for fast lookup
    const bondedKeys = new Set(this.bondSet.keys())

    // Pairwise forces
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const key = `${i}-${j}`
        const isBonded = bondedKeys.has(key)

        let result
        if (isBonded) {
          // Bonded: Morse potential (attractive + repulsive)
          result = morseBondedForce(
            this.atoms[i].position,
            this.atoms[j].position,
            this.atoms[i].element,
            this.atoms[j].element,
          )
        } else {
          // Non-bonded: repulsive only
          result = repulsiveNonbondedForce(
            this.atoms[i].position,
            this.atoms[j].position,
            this.atoms[i].element,
            this.atoms[j].element,
          )
        }

        if (result) {
          addMut(this.atoms[i].force, result.force)
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
        const conf = computeSoftConfinement(atom.position, confinementRadius, confinementForce)
        addMut(atom.force, conf.force)
        potentialEnergy += conf.energy
      }
    }

    return potentialEnergy
  }
}
