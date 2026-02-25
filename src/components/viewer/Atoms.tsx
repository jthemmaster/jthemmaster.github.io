import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSimulationStore } from '../../stores/simulationStore'
import { ELEMENTS } from '../../data/elements'
import { getVisualRadius } from '../../data/elements'

const tempObject = new THREE.Object3D()
const tempColor = new THREE.Color()

interface AtomGroupProps {
  element: string
}

function AtomGroup({ element }: AtomGroupProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const elemData = ELEMENTS[element]

  const positions = useSimulationStore((s) => s.positions)
  const elements = useSimulationStore((s) => s.elements)

  const radius = getVisualRadius(element)
  const color = elemData?.color || '#888888'

  // Get indices of atoms with this element
  const atomIndices = useMemo(() => {
    const indices: number[] = []
    for (let i = 0; i < elements.length; i++) {
      if (elements[i] === element) {
        indices.push(i)
      }
    }
    return indices
  }, [elements, element])

  // Update instance matrices each frame
  useFrame(() => {
    if (!meshRef.current || atomIndices.length === 0) return

    for (let i = 0; i < atomIndices.length; i++) {
      const idx = atomIndices[i]
      const pos = positions[idx]
      if (!pos) continue

      tempObject.position.set(pos[0], pos[1], pos[2])
      tempObject.scale.setScalar(radius)
      tempObject.updateMatrix()
      meshRef.current.setMatrixAt(i, tempObject.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
    meshRef.current.count = atomIndices.length
  })

  // Set colors on mount
  useEffect(() => {
    if (!meshRef.current) return
    tempColor.set(color)
    for (let i = 0; i < atomIndices.length; i++) {
      meshRef.current.setColorAt(i, tempColor)
    }
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  }, [atomIndices.length, color])

  if (atomIndices.length === 0) return null

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, Math.max(atomIndices.length, 1)]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={color}
        metalness={0.3}
        roughness={0.4}
        envMapIntensity={0.5}
      />
    </instancedMesh>
  )
}

export default function Atoms() {
  const elements = useSimulationStore((s) => s.elements)

  // Find unique elements
  const uniqueElements = useMemo(() => {
    return [...new Set(elements)]
  }, [elements])

  return (
    <>
      {uniqueElements.map((elem) => (
        <AtomGroup key={elem} element={elem} />
      ))}
    </>
  )
}
