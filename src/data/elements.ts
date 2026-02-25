export interface ElementData {
  symbol: string
  name: string
  mass: number // amu
  covalentRadius: number // Å
  vdwRadius: number // Å
  color: string // hex color (CPK convention)
}

export const ELEMENTS: Record<string, ElementData> = {
  H: {
    symbol: 'H',
    name: 'Hydrogen',
    mass: 1.008,
    covalentRadius: 0.31,
    vdwRadius: 1.2,
    color: '#FFFFFF',
  },
  C: {
    symbol: 'C',
    name: 'Carbon',
    mass: 12.011,
    covalentRadius: 0.77,
    vdwRadius: 1.7,
    color: '#505050',
  },
  N: {
    symbol: 'N',
    name: 'Nitrogen',
    mass: 14.007,
    covalentRadius: 0.75,
    vdwRadius: 1.55,
    color: '#3050F8',
  },
  O: {
    symbol: 'O',
    name: 'Oxygen',
    mass: 15.999,
    covalentRadius: 0.73,
    vdwRadius: 1.52,
    color: '#FF0D0D',
  },
}

// Morse potential parameters for atom pairs
// V(r) = D_e * (1 - exp(-alpha * (r - r_e)))^2 - D_e
export interface MorseParams {
  De: number // Dissociation energy in eV
  alpha: number // Width parameter in Å⁻¹
  re: number // Equilibrium distance in Å
}

// Key for pair parameters: sorted alphabetically, e.g., "C-H", "H-O"
function pairKey(a: string, b: string): string {
  return [a, b].sort().join('-')
}

const MORSE_PARAMS: Record<string, MorseParams> = {
  'H-H': { De: 4.52, alpha: 1.94, re: 0.74 },
  'C-C': { De: 3.60, alpha: 1.80, re: 1.54 },
  'C-H': { De: 4.30, alpha: 1.85, re: 1.09 },
  'C-N': { De: 3.17, alpha: 1.75, re: 1.47 },
  'C-O': { De: 3.64, alpha: 2.00, re: 1.43 },
  'H-N': { De: 3.92, alpha: 1.90, re: 1.01 },
  'H-O': { De: 4.80, alpha: 2.10, re: 0.96 },
  'N-N': { De: 9.79, alpha: 2.70, re: 1.10 },
  'N-O': { De: 2.68, alpha: 1.80, re: 1.40 },
  'O-O': { De: 5.12, alpha: 2.68, re: 1.21 },
}

// Default parameters for unlisted pairs (weak van der Waals)
const DEFAULT_MORSE: MorseParams = { De: 0.05, alpha: 1.0, re: 3.0 }

export function getMorseParams(elemA: string, elemB: string): MorseParams {
  const key = pairKey(elemA, elemB)
  return MORSE_PARAMS[key] || DEFAULT_MORSE
}

// Visual radius for 3D rendering (slightly larger than covalent for aesthetics)
export function getVisualRadius(element: string): number {
  const data = ELEMENTS[element]
  if (!data) return 0.5
  return Math.max(data.covalentRadius * 0.6, 0.25)
}
