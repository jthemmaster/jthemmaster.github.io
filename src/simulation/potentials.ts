import type { Vec3 } from './types'
import { getMorseParams } from '../data/elements'
import { sub, length, scale } from '../lib/vec3'

const CUTOFF_SHORT = 0.4 // Å - prevent singularity
const CUTOFF_LONG = 6.0 // Å - ignore pairs beyond this

export interface ForceEnergy {
  force: Vec3 // force on atom i due to atom j
  energy: number
}

/**
 * Morse potential between two atoms.
 * V(r) = D_e * (1 - exp(-α(r - r_e)))² - D_e
 * F(r) = -dV/dr * r̂ = 2*D_e*α * (1 - exp(-α(r-r_e))) * exp(-α(r-r_e)) * r̂
 */
export function morsePairForce(
  posI: Vec3,
  posJ: Vec3,
  elemI: string,
  elemJ: string,
): ForceEnergy | null {
  const rij = sub(posJ, posI) // vector from i to j
  const r = length(rij)

  // Skip if too close or too far
  if (r < CUTOFF_SHORT || r > CUTOFF_LONG) {
    if (r < CUTOFF_SHORT && r > 0.01) {
      // Strong repulsion at very short range
      const repForce = 100.0 / (r * r)
      const dir = scale(rij, -1.0 / r) // points away from j
      return {
        force: scale(dir, repForce),
        energy: 100.0 / r,
      }
    }
    return null
  }

  const params = getMorseParams(elemI, elemJ)
  const { De, alpha, re } = params

  const expTerm = Math.exp(-alpha * (r - re))
  const energy = De * (1 - expTerm) * (1 - expTerm) - De

  // Force magnitude: F = 2*De*α*(1-exp(-α(r-re)))*exp(-α(r-re))
  // Positive force = attractive (toward j), negative = repulsive
  const forceMag = 2 * De * alpha * (1 - expTerm) * expTerm

  // Direction: rij/r points from i toward j
  // Positive forceMag means attractive, so force on i points toward j
  const forceVec: Vec3 = [
    (forceMag * rij[0]) / r,
    (forceMag * rij[1]) / r,
    (forceMag * rij[2]) / r,
  ]

  return { force: forceVec, energy }
}

/**
 * Smooth switching function for cutoffs
 * Goes from 1 to 0 between r_start and r_end
 */
export function switchingFunction(r: number, rStart: number, rEnd: number): number {
  if (r <= rStart) return 1.0
  if (r >= rEnd) return 0.0
  const x = (r - rStart) / (rEnd - rStart)
  return 1.0 - 3 * x * x + 2 * x * x * x
}
