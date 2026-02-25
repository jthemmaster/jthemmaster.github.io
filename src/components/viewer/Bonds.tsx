import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSimulationStore } from '../../stores/simulationStore'

const tempObject = new THREE.Object3D()
const UP = new THREE.Vector3(0, 1, 0)
const tempVec = new THREE.Vector3()
const tempVec2 = new THREE.Vector3()

export default function Bonds() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const showBonds = useSimulationStore((s) => s.showBonds)
  const bonds = useSimulationStore((s) => s.bonds)
  const positions = useSimulationStore((s) => s.positions)

  const maxBonds = useMemo(() => Math.max(bonds.length, 50), [bonds.length > 0])

  useFrame(() => {
    if (!meshRef.current || !showBonds) {
      if (meshRef.current) meshRef.current.count = 0
      return
    }

    const count = Math.min(bonds.length, maxBonds)

    for (let b = 0; b < count; b++) {
      const bond = bonds[b]
      const posI = positions[bond.i]
      const posJ = positions[bond.j]
      if (!posI || !posJ) continue

      tempVec.set(posI[0], posI[1], posI[2])
      tempVec2.set(posJ[0], posJ[1], posJ[2])

      // Position at midpoint
      tempObject.position.lerpVectors(tempVec, tempVec2, 0.5)

      // Orient along bond axis
      const dir = tempVec2.clone().sub(tempVec)
      const bondLength = dir.length()
      dir.normalize()

      // Quaternion to rotate Y axis to bond direction
      const quaternion = new THREE.Quaternion()
      quaternion.setFromUnitVectors(UP, dir)
      tempObject.quaternion.copy(quaternion)

      // Scale: radius based on bond order, height = bond length
      const bondRadius = 0.04 + bond.order * 0.02
      tempObject.scale.set(bondRadius, bondLength * 0.5, bondRadius)
      tempObject.updateMatrix()

      meshRef.current.setMatrixAt(b, tempObject.matrix)
    }

    meshRef.current.count = count
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  if (!showBonds) return null

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, maxBonds]}
      frustumCulled={false}
    >
      <cylinderGeometry args={[1, 1, 2, 8]} />
      <meshStandardMaterial
        color="#888899"
        metalness={0.2}
        roughness={0.6}
        transparent
        opacity={0.7}
      />
    </instancedMesh>
  )
}
