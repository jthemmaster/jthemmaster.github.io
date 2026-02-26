import type { Vec3 } from '../simulation/types'

export function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}

export function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

export function scale(v: Vec3, s: number): Vec3 {
  return [v[0] * s, v[1] * s, v[2] * s]
}

export function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

export function length(v: Vec3): number {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
}

export function lengthSq(v: Vec3): number {
  return v[0] * v[0] + v[1] * v[1] + v[2] * v[2]
}

export function normalize(v: Vec3): Vec3 {
  const len = length(v)
  if (len < 1e-10) return [0, 0, 0]
  return [v[0] / len, v[1] / len, v[2] / len]
}

export function distance(a: Vec3, b: Vec3): number {
  return length(sub(a, b))
}

export function zero(): Vec3 {
  return [0, 0, 0]
}

export function addMut(target: Vec3, v: Vec3): void {
  target[0] += v[0]
  target[1] += v[1]
  target[2] += v[2]
}

export function scaleMut(target: Vec3, s: number): void {
  target[0] *= s
  target[1] *= s
  target[2] *= s
}

export function randomInSphere(radius: number): Vec3 {
  // Uniform random point inside a sphere
  while (true) {
    const x = (Math.random() * 2 - 1) * radius
    const y = (Math.random() * 2 - 1) * radius
    const z = (Math.random() * 2 - 1) * radius
    if (x * x + y * y + z * z < radius * radius) {
      return [x, y, z]
    }
  }
}

export function randomVelocity(temperature: number, mass: number): Vec3 {
  // Maxwell-Boltzmann distribution
  // k_B = 8.617e-5 eV/K, mass in amu
  // v_rms = sqrt(k_B * T / m) in Å/fs
  // mass in internal units: mass_amu * 103.6428 eV·fs²/Å²
  const kB = 8.617e-5 // eV/K
  const AMU_TO_INTERNAL = 103.6428
  const sigma = Math.sqrt(kB * temperature / (mass * AMU_TO_INTERNAL))

  // Box-Muller transform for normal distribution
  const u1 = Math.random()
  const u2 = Math.random()
  const u3 = Math.random()
  const u4 = Math.random()
  const u5 = Math.random()
  const u6 = Math.random()

  return [
    sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2),
    sigma * Math.sqrt(-2 * Math.log(u3)) * Math.cos(2 * Math.PI * u4),
    sigma * Math.sqrt(-2 * Math.log(u5)) * Math.cos(2 * Math.PI * u6),
  ]
}
