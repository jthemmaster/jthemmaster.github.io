import type { Atom, Bond, Species } from './types'
import { distance } from '../lib/vec3'
import { ELEMENTS } from '../data/elements'

/**
 * Detect bonds between atoms based on distance criteria.
 * Two atoms are bonded if their distance < bondFactor * (cov_r_i + cov_r_j)
 */
export function detectBonds(atoms: Atom[], bondFactor: number = 1.3): Bond[] {
  const bonds: Bond[] = []
  const n = atoms.length

  for (let i = 0; i < n; i++) {
    const elemI = ELEMENTS[atoms[i].element]
    if (!elemI) continue

    for (let j = i + 1; j < n; j++) {
      const elemJ = ELEMENTS[atoms[j].element]
      if (!elemJ) continue

      const dist = distance(atoms[i].position, atoms[j].position)
      const bondThreshold = bondFactor * (elemI.covalentRadius + elemJ.covalentRadius)

      if (dist < bondThreshold) {
        // Estimate bond order from distance
        const singleBondDist = elemI.covalentRadius + elemJ.covalentRadius
        const ratio = dist / singleBondDist

        let order = 1
        if (ratio < 0.82) order = 3
        else if (ratio < 0.92) order = 2

        bonds.push({ i, j, order, length: dist })
      }
    }
  }

  return bonds
}

/**
 * Detect molecular species using graph traversal (connected components).
 * Returns a list of species with their molecular formulas and counts.
 */
export function detectSpecies(atoms: Atom[], bonds: Bond[]): Species[] {
  const n = atoms.length
  const visited = new Array(n).fill(false)

  // Build adjacency list
  const adj: number[][] = Array.from({ length: n }, () => [])
  for (const bond of bonds) {
    adj[bond.i].push(bond.j)
    adj[bond.j].push(bond.i)
  }

  const molecules: string[] = []

  // BFS to find connected components
  for (let start = 0; start < n; start++) {
    if (visited[start]) continue

    const component: number[] = []
    const queue = [start]
    visited[start] = true

    while (queue.length > 0) {
      const node = queue.shift()!
      component.push(node)

      for (const neighbor of adj[node]) {
        if (!visited[neighbor]) {
          visited[neighbor] = true
          queue.push(neighbor)
        }
      }
    }

    // Build molecular formula from component
    const formula = buildFormula(atoms, component)
    molecules.push(formula)
  }

  // Count occurrences of each formula
  const counts = new Map<string, number>()
  for (const formula of molecules) {
    counts.set(formula, (counts.get(formula) || 0) + 1)
  }

  // Convert to Species array, sorted by count (descending)
  const species: Species[] = []
  for (const [formula, count] of counts.entries()) {
    species.push({ formula, count })
  }
  species.sort((a, b) => b.count - a.count)

  return species
}

/**
 * Build molecular formula in Hill order:
 * C first, H second, then rest alphabetical.
 * If no C: all alphabetical.
 */
function buildFormula(atoms: Atom[], indices: number[]): string {
  const elementCounts = new Map<string, number>()

  for (const idx of indices) {
    const elem = atoms[idx].element
    elementCounts.set(elem, (elementCounts.get(elem) || 0) + 1)
  }

  // Hill order
  const elements = Array.from(elementCounts.keys())
  const hasCarbon = elementCounts.has('C')

  if (hasCarbon) {
    elements.sort((a, b) => {
      if (a === 'C') return -1
      if (b === 'C') return 1
      if (a === 'H') return -1
      if (b === 'H') return 1
      return a.localeCompare(b)
    })
  } else {
    elements.sort()
  }

  let formula = ''
  for (const elem of elements) {
    const count = elementCounts.get(elem)!
    formula += elem
    if (count > 1) formula += count.toString()
  }

  return formula
}
