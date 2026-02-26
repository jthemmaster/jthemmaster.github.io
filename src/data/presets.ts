import type { Atom, Vec3 } from '../simulation/types'
import { ELEMENTS } from './elements'
import { randomInSphere, randomVelocity } from '../lib/vec3'

export interface PresetInfo {
  id: string
  name: string
  description: string
  emoji: string
  molecules: { formula: string; count: number }[]
}

export const PRESETS: PresetInfo[] = [
  {
    id: 'hydrogen-combustion',
    name: 'Hydrogen Combustion',
    description: '10 H₂ + 5 O₂ → potential water formation',
    emoji: '🔥',
    molecules: [
      { formula: 'H2', count: 10 },
      { formula: 'O2', count: 5 },
    ],
  },
  {
    id: 'methane-combustion',
    name: 'Methane Combustion',
    description: '5 CH₄ + 10 O₂ → CO₂ + H₂O',
    emoji: '💥',
    molecules: [
      { formula: 'CH4', count: 5 },
      { formula: 'O2', count: 10 },
    ],
  },
  {
    id: 'water-formation',
    name: 'Water Formation',
    description: '8 H₂ + 4 O₂ → H₂O',
    emoji: '💧',
    molecules: [
      { formula: 'H2', count: 8 },
      { formula: 'O2', count: 4 },
    ],
  },
  {
    id: 'ammonia-synthesis',
    name: 'Ammonia Synthesis',
    description: '5 N₂ + 15 H₂ → NH₃',
    emoji: '⚡',
    molecules: [
      { formula: 'N2', count: 5 },
      { formula: 'H2', count: 15 },
    ],
  },
  {
    id: 'organic-mix',
    name: 'Organic Mix',
    description: '3 CH₄ + 3 H₂O + 2 CO₂',
    emoji: '🧪',
    molecules: [
      { formula: 'CH4', count: 3 },
      { formula: 'H2O', count: 3 },
      { formula: 'CO2', count: 2 },
    ],
  },
]

// Molecule templates: positions relative to center
interface MoleculeTemplate {
  atoms: { element: string; offset: Vec3 }[]
}

const MOLECULE_TEMPLATES: Record<string, MoleculeTemplate> = {
  H2: {
    atoms: [
      { element: 'H', offset: [-0.37, 0, 0] },
      { element: 'H', offset: [0.37, 0, 0] },
    ],
  },
  O2: {
    atoms: [
      { element: 'O', offset: [-0.6, 0, 0] },
      { element: 'O', offset: [0.6, 0, 0] },
    ],
  },
  N2: {
    atoms: [
      { element: 'N', offset: [-0.55, 0, 0] },
      { element: 'N', offset: [0.55, 0, 0] },
    ],
  },
  CH4: {
    atoms: [
      { element: 'C', offset: [0, 0, 0] },
      { element: 'H', offset: [0.63, 0.63, 0.63] },
      { element: 'H', offset: [-0.63, -0.63, 0.63] },
      { element: 'H', offset: [-0.63, 0.63, -0.63] },
      { element: 'H', offset: [0.63, -0.63, -0.63] },
    ],
  },
  H2O: {
    atoms: [
      { element: 'O', offset: [0, 0, 0] },
      { element: 'H', offset: [0.76, 0.59, 0] },
      { element: 'H', offset: [-0.76, 0.59, 0] },
    ],
  },
  CO2: {
    atoms: [
      { element: 'C', offset: [0, 0, 0] },
      { element: 'O', offset: [-1.16, 0, 0] },
      { element: 'O', offset: [1.16, 0, 0] },
    ],
  },
  NH3: {
    atoms: [
      { element: 'N', offset: [0, 0, 0.38] },
      { element: 'H', offset: [0.94, 0, -0.13] },
      { element: 'H', offset: [-0.47, 0.81, -0.13] },
      { element: 'H', offset: [-0.47, -0.81, -0.13] },
    ],
  },
}

/**
 * Generate atoms for a preset system.
 * Places molecules randomly within the reactor sphere.
 */
export function generatePreset(
  presetId: string,
  reactorRadius: number,
  temperature: number = 300,
): Atom[] {
  const preset = PRESETS.find((p) => p.id === presetId)
  if (!preset) return []

  const atoms: Atom[] = []
  let atomId = 0
  const placedCenters: Vec3[] = []
  const MIN_MOL_DISTANCE = 3.5 // Å - minimum distance between molecule centers

  // Place each molecule
  for (const mol of preset.molecules) {
    const template = MOLECULE_TEMPLATES[mol.formula]
    if (!template) continue

    for (let i = 0; i < mol.count; i++) {
      // Random center position with rejection sampling to avoid overlaps
      let center: Vec3
      let attempts = 0
      do {
        center = randomInSphere(reactorRadius * 0.65)
        attempts++
        if (attempts > 200) break // Give up after many attempts
      } while (
        placedCenters.some((c) => {
          const dx = c[0] - center[0]
          const dy = c[1] - center[1]
          const dz = c[2] - center[2]
          return Math.sqrt(dx * dx + dy * dy + dz * dz) < MIN_MOL_DISTANCE
        })
      )
      placedCenters.push(center)

      // Random rotation (simple: pick random axis and angle)
      const angle = Math.random() * Math.PI * 2
      const cosA = Math.cos(angle)
      const sinA = Math.sin(angle)
      const axis = Math.floor(Math.random() * 3)

      for (const atomTemplate of template.atoms) {
        const elem = ELEMENTS[atomTemplate.element]
        const offset = [...atomTemplate.offset] as Vec3

        // Simple rotation around random axis
        if (axis === 0) {
          // Rotate around X
          const y = offset[1] * cosA - offset[2] * sinA
          const z = offset[1] * sinA + offset[2] * cosA
          offset[1] = y
          offset[2] = z
        } else if (axis === 1) {
          // Rotate around Y
          const x = offset[0] * cosA - offset[2] * sinA
          const z = offset[0] * sinA + offset[2] * cosA
          offset[0] = x
          offset[2] = z
        } else {
          // Rotate around Z
          const x = offset[0] * cosA - offset[1] * sinA
          const y = offset[0] * sinA + offset[1] * cosA
          offset[0] = x
          offset[1] = y
        }

        const position: Vec3 = [
          center[0] + offset[0],
          center[1] + offset[1],
          center[2] + offset[2],
        ]

        const velocity = randomVelocity(temperature, elem.mass)

        atoms.push({
          id: atomId++,
          element: atomTemplate.element,
          position,
          velocity,
          force: [0, 0, 0],
          mass: elem.mass,
        })
      }
    }
  }

  return atoms
}
