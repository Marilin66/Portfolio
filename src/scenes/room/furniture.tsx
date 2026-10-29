import * as THREE from 'three'
import { C } from '../../components/three/palette'

/** Suspension au-dessus de la pièce : donne l'échelle et une lumière chaude. */
export function PendantLamp() {
  return (
    <group position={[0.6, 0, 0.2]}>
      <mesh position={[0, 3.92, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.56, 6]} />
        <meshStandardMaterial color="#4A5A72" roughness={0.6} />
      </mesh>
      <mesh position={[0, 3.42, 0]}>
        <coneGeometry args={[0.3, 0.34, 24, 1, true]} />
        <meshStandardMaterial color="#F7F0E4" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 3.27, 0]}>
        <sphereGeometry args={[0.085, 16, 16]} />
        <meshBasicMaterial color="#FFE7BF" toneMapped={false} />
      </mesh>
      <pointLight position={[0, 3.2, 0]} intensity={4} distance={8} decay={2} color="#FFE6C0" />
    </group>
  )
}

/** Chaise de bureau, en retrait pour laisser voir les écrans. */
export function Chair() {
  return (
    <group position={[4.1, 0, -3.55]} rotation={[0, 0.42, 0]}>
      <mesh position={[0, 0.46, 0]}>
        <boxGeometry args={[0.52, 0.07, 0.5]} />
        <meshStandardMaterial color={C.wood} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.74, 0.23]} rotation={[-0.08, 0, 0]}>
        <boxGeometry args={[0.5, 0.54, 0.06]} />
        <meshStandardMaterial color="#3E4C80" roughness={0.92} />
      </mesh>
      {[
        [-0.21, -0.2],
        [0.21, -0.2],
        [-0.21, 0.2],
        [0.21, 0.2],
      ].map(([x, z], index) => (
        <mesh key={index} position={[x, 0.22, z]}>
          <cylinderGeometry args={[0.018, 0.018, 0.44, 8]} />
          <meshStandardMaterial color="#5E6E86" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}
