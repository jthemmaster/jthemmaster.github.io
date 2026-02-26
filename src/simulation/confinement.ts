import type { Vec3 } from './types'
import { length, scale, normalize } from '../lib/vec3'

export interface ConfinementResult {
  force: Vec3
  energy: number
}

/**
 * Harmonic confinement potential (nano reactor wall).
 *
 * V(r) = 0.5 * k * max(0, |r| - R)^2
 * F(r) = -k * (|r| - R) * r̂  when |r| > R
 * F(r) = 0                    when |r| <= R
 *
 * This creates a soft spherical wall at radius R.
 * Atoms inside the sphere feel no force.
 * Atoms outside are pushed back with force proportional to displacement.
 */
export function computeConfinement(
  position: Vec3,
  radius: number,
  forceConstant: number,
): ConfinementResult {
  const r = length(position)

  if (r <= radius || forceConstant <= 0) {
    return { force: [0, 0, 0], energy: 0 }
  }

  const displacement = r - radius
  const energy = 0.5 * forceConstant * displacement * displacement

  // Force points inward (toward center)
  const dir = normalize(position)
  const forceMag = -forceConstant * displacement
  const force = scale(dir, forceMag)

  return { force, energy }
}

/**
 * Soft confinement with smooth onset.
 * Uses a quintic switching function near the boundary.
 * Starts applying force at 0.9*R and reaches full force at R.
 */
export function computeSoftConfinement(
  position: Vec3,
  radius: number,
  forceConstant: number,
): ConfinementResult {
  const r = length(position)
  const onset = radius * 0.9

  if (r <= onset || forceConstant <= 0) {
    return { force: [0, 0, 0], energy: 0 }
  }

  // How far past the onset
  let displacement: number
  let k: number

  if (r <= radius) {
    // In the transition zone: ramp up force smoothly
    const t = (r - onset) / (radius - onset) // 0 to 1
    const smooth = t * t * t * (10 - 15 * t + 6 * t * t) // quintic smoothstep
    displacement = r - onset
    k = forceConstant * smooth
  } else {
    // Past the wall: full force
    displacement = r - onset
    k = forceConstant
  }

  const energy = 0.5 * k * displacement * displacement
  const dir = normalize(position)
  const forceMag = -k * displacement
  const force = scale(dir, forceMag)

  return { force, energy }
}
