import type { Vec3 } from './types'
import { getMorseParams, ELEMENTS } from '../data/elements'
import { sub, length, scale } from '../lib/vec3'

const CUTOFF_MIN = 0.3 // Å - hard core repulsion distance
const CUTOFF_NONBOND = 5.0 // Å - non-bonded interaction cutoff

export interface ForceEnergy {
  force: Vec3 // force on atom i due to atom j
  energy: number
}

/**
 * Morse potential for BONDED atom pairs.
 * V(r) = D_e * (1 - exp(-α(r - r_e)))² - D_e
 * F_on_i = dV/dr * rij_hat (toward j when attractive, away when repulsive)
 */
export function morseBondedForce(
  posI: Vec3,
  posJ: Vec3,
  elemI: string,
  elemJ: string,
): ForceEnergy | null {
  const rij = sub(posJ, posI)
  const r = length(rij)

  if (r < 0.01) return null

  // Hard core repulsion at very close range
  if (r < CUTOFF_MIN) {
    const repForce = 50.0 * (CUTOFF_MIN - r) / r
    return {
      force: [(-repForce * rij[0]) / r, (-repForce * rij[1]) / r, (-repForce * rij[2]) / r],
      energy: 25.0 * (CUTOFF_MIN - r) * (CUTOFF_MIN - r),
    }
  }

  const params = getMorseParams(elemI, elemJ)
  const { De, alpha, re } = params

  const expTerm = Math.exp(-alpha * (r - re))
  const energy = De * (1 - expTerm) * (1 - expTerm) - De

  // F_on_i = dV/dr * rij/r
  const dVdr = 2 * De * alpha * (1 - expTerm) * expTerm
  const forceVec: Vec3 = [
    (dVdr * rij[0]) / r,
    (dVdr * rij[1]) / r,
    (dVdr * rij[2]) / r,
  ]

  return { force: forceVec, energy }
}

/**
 * Repulsive potential for NON-BONDED atom pairs.
 * Uses a soft repulsive potential: V(r) = ε * (σ/r)^8
 * where σ = sum of van der Waals radii.
 * This prevents non-bonded atoms from overlapping without attracting them.
 */
export function repulsiveNonbondedForce(
  posI: Vec3,
  posJ: Vec3,
  elemI: string,
  elemJ: string,
): ForceEnergy | null {
  const rij = sub(posJ, posI)
  const r = length(rij)

  if (r < 0.01 || r > CUTOFF_NONBOND) return null

  const dataI = ELEMENTS[elemI]
  const dataJ = ELEMENTS[elemJ]
  if (!dataI || !dataJ) return null

  // σ = sum of vdW radii
  const sigma = (dataI.vdwRadius + dataJ.vdwRadius) * 0.85

  // Hard core repulsion
  if (r < CUTOFF_MIN) {
    const repForce = 50.0 * (CUTOFF_MIN - r) / r
    return {
      force: [(-repForce * rij[0]) / r, (-repForce * rij[1]) / r, (-repForce * rij[2]) / r],
      energy: 25.0 * (CUTOFF_MIN - r) * (CUTOFF_MIN - r),
    }
  }

  const epsilon = 0.02 // eV - interaction strength
  const ratio = sigma / r
  const ratio4 = ratio * ratio * ratio * ratio
  const ratio8 = ratio4 * ratio4

  const energy = epsilon * ratio8

  // Force: F = -dV/dr * r_hat = 8*ε*(σ^8/r^9) * rij/r
  // dV/dr = -8*ε*σ^8/r^9
  // F_on_i = -dV/dr * (-rij/r) = -8*ε*σ^8/(r^9) * rij/r (repulsive, away from j)
  // Actually: F_on_i = -∇_i V = -(dV/dr)(∂r/∂r_i) = -(dV/dr)(-rij/r) = (dV/dr)(rij/r)
  // dV/dr = -8*ε*(σ^8)/(r^9) < 0, so F_on_i points in -rij direction (away from j) ✓
  const dVdr = -8 * epsilon * ratio8 / r
  const forceVec: Vec3 = [
    (dVdr * rij[0]) / r,
    (dVdr * rij[1]) / r,
    (dVdr * rij[2]) / r,
  ]

  return { force: forceVec, energy }
}
