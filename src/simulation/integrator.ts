import type { Atom } from './types'

// Conversion factor: 1 amu = 1.0364e-4 eV·fs²/Å²
const AMU_TO_INTERNAL = 1.0364e-4

/**
 * Velocity Verlet integrator - Position update step.
 * x(t+dt) = x(t) + v(t)*dt + 0.5*a(t)*dt²
 *
 * @param atoms - modified in place (positions updated)
 * @param dt - timestep in fs
 */
export function integratePositions(atoms: Atom[], dt: number): void {
  for (const atom of atoms) {
    const massInternal = atom.mass * AMU_TO_INTERNAL // eV·fs²/Å²

    for (let d = 0; d < 3; d++) {
      const acceleration = atom.force[d] / massInternal // Å/fs²
      atom.position[d] += atom.velocity[d] * dt + 0.5 * acceleration * dt * dt
    }
  }
}

/**
 * Velocity Verlet integrator - Velocity update step.
 * v(t+dt) = v(t) + 0.5*(a(t) + a(t+dt))*dt
 *
 * Call this AFTER computing new forces.
 *
 * @param atoms - modified in place (velocities updated)
 * @param oldForces - forces from previous step (eV/Å per atom)
 * @param dt - timestep in fs
 */
export function integrateVelocities(
  atoms: Atom[],
  oldForces: [number, number, number][],
  dt: number,
): void {
  for (let i = 0; i < atoms.length; i++) {
    const atom = atoms[i]
    const massInternal = atom.mass * AMU_TO_INTERNAL

    for (let d = 0; d < 3; d++) {
      const aOld = oldForces[i][d] / massInternal
      const aNew = atom.force[d] / massInternal
      atom.velocity[d] += 0.5 * (aOld + aNew) * dt
    }
  }
}
