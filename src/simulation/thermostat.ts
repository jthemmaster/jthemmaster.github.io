import type { Atom } from './types'
import { lengthSq, scaleMut } from '../lib/vec3'

// Boltzmann constant in eV/K
const KB = 8.617333262e-5

// Conversion factor: 1 amu = 103.6428 eV·fs²/Å²
// Derived from: 1 amu = 1.66054e-27 kg, 1 eV·fs²/Å² = 1.60218e-29 kg
const AMU_TO_INTERNAL = 103.6428

/**
 * Calculate instantaneous temperature from kinetic energies.
 * T = 2*KE / (3*N*kB) for 3D system
 */
export function calculateTemperature(atoms: Atom[]): { temperature: number; kineticEnergy: number } {
  if (atoms.length === 0) return { temperature: 0, kineticEnergy: 0 }

  let kineticEnergy = 0

  for (const atom of atoms) {
    const v2 = lengthSq(atom.velocity)
    // KE = 0.5 * m * v^2 (m in amu, v in Å/fs, need to convert to eV)
    kineticEnergy += 0.5 * atom.mass * AMU_TO_INTERNAL * v2
  }

  const degreesOfFreedom = 3 * atoms.length
  const temperature = (2 * kineticEnergy) / (degreesOfFreedom * KB)

  return { temperature, kineticEnergy }
}

/**
 * Berendsen thermostat: rescale velocities to approach target temperature.
 *
 * v_new = v * sqrt(1 + dt/tau * (T_target/T_current - 1))
 *
 * @param atoms - mutable, velocities are modified in place
 * @param targetTemp - target temperature in K
 * @param currentTemp - current temperature in K
 * @param dt - timestep in fs
 * @param tau - coupling time constant in fs
 */
export function applyBerendsenThermostat(
  atoms: Atom[],
  targetTemp: number,
  currentTemp: number,
  dt: number,
  tau: number,
): void {
  if (currentTemp < 1e-10 || atoms.length === 0) return

  const ratio = targetTemp / currentTemp
  let lambda = Math.sqrt(1 + (dt / tau) * (ratio - 1))

  // Clamp lambda to prevent instability
  lambda = Math.max(0.9, Math.min(1.1, lambda))

  for (const atom of atoms) {
    scaleMut(atom.velocity, lambda)
  }
}

/**
 * Remove center of mass velocity (zero net momentum).
 * Prevents the whole system from drifting.
 */
export function removeCOMVelocity(atoms: Atom[]): void {
  if (atoms.length === 0) return

  let totalMass = 0
  const comVel: [number, number, number] = [0, 0, 0]

  for (const atom of atoms) {
    totalMass += atom.mass
    comVel[0] += atom.mass * atom.velocity[0]
    comVel[1] += atom.mass * atom.velocity[1]
    comVel[2] += atom.mass * atom.velocity[2]
  }

  comVel[0] /= totalMass
  comVel[1] /= totalMass
  comVel[2] /= totalMass

  for (const atom of atoms) {
    atom.velocity[0] -= comVel[0]
    atom.velocity[1] -= comVel[1]
    atom.velocity[2] -= comVel[2]
  }
}
