import { OrbitControls, Stars } from '@react-three/drei'

export default function SceneSetup() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.0}
        color="#ffffff"
      />
      <directionalLight
        position={[-5, -5, -5]}
        intensity={0.3}
        color="#8B5CF6"
      />
      <pointLight position={[0, 0, 0]} intensity={0.2} color="#3B82F6" />

      {/* Subtle star background for depth */}
      <Stars
        radius={100}
        depth={50}
        count={1000}
        factor={2}
        saturation={0}
        fade
        speed={0.5}
      />

      {/* Camera controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={50}
        enablePan
        panSpeed={0.5}
        rotateSpeed={0.5}
      />

      {/* Fog for depth */}
      <fog attach="fog" args={['#09090B', 30, 60]} />
    </>
  )
}
