import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSimulationStore } from '../../stores/simulationStore'

export default function ConfinementSphere() {
  const meshRef = useRef<THREE.Mesh>(null)
  const wireRef = useRef<THREE.LineSegments>(null)

  const showSphere = useSimulationStore((s) => s.showSphere)
  const radius = useSimulationStore((s) => s.config.confinementRadius)
  const force = useSimulationStore((s) => s.config.confinementForce)
  const isRunning = useSimulationStore((s) => s.isRunning)

  useFrame(({ clock }) => {
    if (!meshRef.current || !wireRef.current) return

    // Smooth radius transition
    const currentScale = meshRef.current.scale.x
    const targetScale = radius
    const newScale = currentScale + (targetScale - currentScale) * 0.1

    meshRef.current.scale.setScalar(newScale)
    wireRef.current.scale.setScalar(newScale)

    // Pulse when active
    if (isRunning && force > 0) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 2) * 0.005 * force
      meshRef.current.scale.multiplyScalar(pulse)
      wireRef.current.scale.multiplyScalar(pulse)
    }

    // Opacity based on force strength
    const material = meshRef.current.material as THREE.MeshStandardMaterial
    material.opacity = Math.min(0.04 + force * 0.004, 0.15)

    const wireMaterial = wireRef.current.material as THREE.LineBasicMaterial
    wireMaterial.opacity = Math.min(0.08 + force * 0.008, 0.25)
  })

  if (!showSphere) return null

  return (
    <group>
      {/* Transparent fill */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial
          color="#8B5CF6"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Wireframe overlay */}
      <lineSegments ref={wireRef}>
        <wireframeGeometry args={[new THREE.SphereGeometry(1, 24, 24)]} />
        <lineBasicMaterial
          color="#8B5CF6"
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  )
}
