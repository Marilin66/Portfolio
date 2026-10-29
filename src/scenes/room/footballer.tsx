import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { C } from '../../components/three/palette'
import { useInteractive, useIsActive } from '../../components/three/useInteractive'
import { useExperience } from '../../store/useExperience'

/**
 * Saynète « football » de la pièce : une silhouette stylisée de Marilin près
 * de son portrait, et, dans le coin culture, une paire de crampons posée sur
 * un plateau avec un ballon. Aucun visage réaliste : la photo reste la seule
 * référence d'identité.
 */

const SKIN = '#B07E67'
const SKIN_SHADE = '#966553'
const HAIR = '#241A18'
const JERSEY = '#2F568D'
const JERSEY_DARK = '#24436E'
const SHORTS = '#1B2A44'
const SOCK = '#EFE9DC'
const BOOT = '#F2EEE4'
const RUBBER = '#1E2A3C'
const MOUTH = '#7A4A42'

/** Crampon stylisé, pointe vers +z, semelle posée sur y = 0. */
function Boot({ accent = C.cyan }: { accent?: string }) {
  return (
    <group>
      {[
        [-0.03, 0.075],
        [0.03, 0.075],
        [-0.03, 0.01],
        [0.03, 0.01],
        [-0.026, 0.11],
        [0.026, 0.11],
      ].map(([x, z], index) => (
        <mesh key={index} position={[x, 0.006, z]}>
          <cylinderGeometry args={[0.012, 0.01, 0.012, 8]} />
          <meshStandardMaterial color={accent} roughness={0.35} metalness={0.2} />
        </mesh>
      ))}

      <mesh position={[0, 0.019, 0.01]}>
        <boxGeometry args={[0.1, 0.018, 0.28]} />
        <meshStandardMaterial color={RUBBER} roughness={0.45} />
      </mesh>

      <mesh position={[0, 0.056, -0.01]}>
        <boxGeometry args={[0.094, 0.06, 0.21]} />
        <meshStandardMaterial color={BOOT} roughness={0.42} />
      </mesh>
      <mesh position={[0, 0.055, 0.095]} scale={[1, 0.7, 1.25]}>
        <sphereGeometry args={[0.048, 20, 14]} />
        <meshStandardMaterial color={BOOT} roughness={0.42} />
      </mesh>
      <mesh position={[0, 0.058, -0.105]} scale={[0.92, 1, 0.75]}>
        <sphereGeometry args={[0.05, 16, 12]} />
        <meshStandardMaterial color={BOOT} roughness={0.42} />
      </mesh>

      <mesh position={[0, 0.104, -0.075]}>
        <cylinderGeometry args={[0.046, 0.052, 0.085, 14, 1, true]} />
        <meshStandardMaterial color={JERSEY} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>

      {[-0.035, 0, 0.035].map((z) => (
        <mesh key={z} position={[0, 0.09, z]}>
          <boxGeometry args={[0.045, 0.004, 0.007]} />
          <meshStandardMaterial color={SOCK} roughness={0.6} />
        </mesh>
      ))}

      {[-0.049, 0.049].map((x) => (
        <mesh key={x} position={[x, 0.057, 0.02]}>
          <boxGeometry args={[0.003, 0.01, 0.13]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={0.3}
            roughness={0.4}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

/** Corps complet, debout, léger contrepoids : environ 1,68 m. */
function PlayerBody() {
  return (
    <group scale={1.05}>
      {[-0.11, 0.11].map((x) => (
        <group key={x} position={[x, 0, 0.01]} rotation={[0, x < 0 ? 0.07 : -0.07, 0]}>
          <Boot />

          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.047, 0.045, 0.26, 12]} />
            <meshStandardMaterial color={SOCK} roughness={0.82} />
          </mesh>
          <mesh position={[0, 0.282, 0]}>
            <cylinderGeometry args={[0.049, 0.049, 0.022, 12]} />
            <meshStandardMaterial color={JERSEY} roughness={0.75} />
          </mesh>

          <mesh position={[0, 0.445, 0]}>
            <cylinderGeometry args={[0.047, 0.052, 0.33, 12]} />
            <meshStandardMaterial color={SKIN} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.615, 0]}>
            <sphereGeometry args={[0.05, 14, 12]} />
            <meshStandardMaterial color={SKIN} roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Short */}
      <mesh position={[0, 0.76, 0]}>
        <cylinderGeometry args={[0.165, 0.185, 0.25, 18]} />
        <meshStandardMaterial color={SHORTS} roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.884, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.028, 18]} />
        <meshStandardMaterial color={JERSEY_DARK} roughness={0.8} />
      </mesh>
      {[-0.172, 0.172].map((x) => (
        <mesh key={x} position={[x, 0.76, 0]}>
          <boxGeometry args={[0.008, 0.17, 0.04]} />
          <meshStandardMaterial
            color={C.cyan}
            emissive={C.cyan}
            emissiveIntensity={0.18}
            roughness={0.5}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Maillot */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.2, 0.16, 0.44, 20]} />
        <meshStandardMaterial color={JERSEY} roughness={0.78} />
      </mesh>
      {[-0.165, 0.165].map((x) => (
        <mesh key={x} position={[x, 1.29, 0]}>
          <sphereGeometry args={[0.082, 16, 14]} />
          <meshStandardMaterial color={JERSEY} roughness={0.78} />
        </mesh>
      ))}
      <mesh position={[0, 1.285, 0]}>
        <cylinderGeometry args={[0.199, 0.199, 0.014, 20]} />
        <meshStandardMaterial
          color={C.cyan}
          emissive={C.cyan}
          emissiveIntensity={0.16}
          roughness={0.5}
          toneMapped={false}
        />
      </mesh>

      {/* Bras : manches courtes, avant-bras le long du corps */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.205, 1.27, 0]} rotation={[0, 0, side * 0.1]}>
          <mesh position={[0, -0.05, 0]}>
            <cylinderGeometry args={[0.062, 0.055, 0.17, 14]} />
            <meshStandardMaterial color={JERSEY} roughness={0.78} />
          </mesh>
          <mesh position={[0, -0.138, 0]}>
            <cylinderGeometry args={[0.056, 0.056, 0.016, 14]} />
            <meshStandardMaterial
              color={C.cyan}
              emissive={C.cyan}
              emissiveIntensity={0.14}
              roughness={0.5}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[0, -0.3, 0.006]} rotation={[0.08, 0, 0]}>
            <cylinderGeometry args={[0.043, 0.038, 0.32, 12]} />
            <meshStandardMaterial color={SKIN} roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.462, 0.02]} scale={[0.85, 1.05, 0.7]}>
            <sphereGeometry args={[0.045, 14, 12]} />
            <meshStandardMaterial color={SKIN} roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Cou et tête */}
      <mesh position={[0, 1.355, 0]}>
        <cylinderGeometry args={[0.045, 0.05, 0.1, 12]} />
        <meshStandardMaterial color={SKIN} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.322, 0]}>
        <cylinderGeometry args={[0.057, 0.061, 0.02, 16]} />
        <meshStandardMaterial color={C.cyan} roughness={0.5} toneMapped={false} />
      </mesh>

      <mesh position={[0, 1.49, 0]} scale={[0.94, 1.03, 0.95]}>
        <sphereGeometry args={[0.105, 24, 20]} />
        <meshStandardMaterial color={SKIN} roughness={0.68} />
      </mesh>

      {/* Oreilles */}
      {[-0.098, 0.098].map((x) => (
        <mesh key={x} position={[x, 1.488, 0]} scale={[0.55, 1, 0.8]}>
          <sphereGeometry args={[0.023, 10, 10]} />
          <meshStandardMaterial color={SKIN_SHADE} roughness={0.7} />
        </mesh>
      ))}

      {/* Cheveux courts, dégagés sur le front */}
      <mesh position={[0, 1.49, -0.006]} rotation={[-0.32, 0, 0]}>
        <sphereGeometry args={[0.108, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
        <meshStandardMaterial color={HAIR} roughness={0.78} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.018, 1.583, 0.022]} scale={[0.72, 0.4, 0.6]}>
        <sphereGeometry args={[0.085, 16, 12]} />
        <meshStandardMaterial color={HAIR} roughness={0.78} />
      </mesh>
      {[-0.094, 0.094].map((x) => (
        <mesh key={x} position={[x, 1.455, 0.012]}>
          <boxGeometry args={[0.014, 0.07, 0.05]} />
          <meshStandardMaterial color={HAIR} roughness={0.78} />
        </mesh>
      ))}

      {/* Visage */}
      {[-0.037, 0.037].map((x) => (
        <mesh key={x} position={[x, 1.505, 0.094]}>
          <sphereGeometry args={[0.0105, 10, 10]} />
          <meshStandardMaterial color="#1B2433" roughness={0.4} />
        </mesh>
      ))}
      {[-0.039, 0.039].map((x, index) => (
        <mesh key={x} position={[x, 1.527, 0.092]} rotation={[0, 0, index === 0 ? -0.08 : 0.08]}>
          <boxGeometry args={[0.034, 0.006, 0.006]} />
          <meshStandardMaterial color={HAIR} roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 1.487, 0.102]} scale={[0.8, 1, 1]}>
        <sphereGeometry args={[0.014, 12, 10]} />
        <meshStandardMaterial color={SKIN_SHADE} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.457, 0.096]}>
        <boxGeometry args={[0.034, 0.0065, 0.005]} />
        <meshStandardMaterial color={MOUTH} roughness={0.65} />
      </mesh>
    </group>
  )
}

export function Footballer({ shadow }: { shadow: THREE.Texture }) {
  const id = 'zone-about'
  const handlers = useInteractive(id)
  const active = useIsActive(id)
  const reduced = useExperience((state) => state.reduced)
  const body = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!body.current || reduced) return
    const time = clock.getElapsedTime()
    body.current.position.y = Math.sin(time * 1.1) * 0.006
    body.current.rotation.y = Math.sin(time * 0.42) * 0.012
  })

  return (
    <group position={[-1.85, 0, -5.25]} rotation={[0, 0.26, 0]} {...handlers}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0.05]}>
        <planeGeometry args={[0.95, 0.82]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0.02]}>
        <ringGeometry args={[0.34, 0.375, 48]} />
        <meshBasicMaterial
          color={C.cyan}
          transparent
          opacity={active ? 0.5 : 0.12}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <group ref={body}>
        <PlayerBody />
      </group>
    </group>
  )
}

export function FootballKit({ ball, shadow }: { ball: THREE.Texture; shadow: THREE.Texture }) {
  const id = 'zone-engagement'
  const handlers = useInteractive(id)
  const active = useIsActive(id)

  return (
    <group position={[-5.85, 0, 5.95]} rotation={[0, 1.26, 0]} {...handlers}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.06, 0.004, 0.02]}>
        <planeGeometry args={[1.6, 1.15]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.04, 0.007, 0.02]}>
        <ringGeometry args={[0.44, 0.47, 56]} />
        <meshBasicMaterial
          color={C.cyan}
          transparent
          opacity={active ? 0.5 : 0.12}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Plateau bas, pour que les crampons restent alignés */}
      <mesh position={[0, 0.016, 0]}>
        <boxGeometry args={[0.68, 0.032, 0.44]} />
        <meshStandardMaterial color={C.woodDark} roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.034, 0]}>
        <boxGeometry args={[0.64, 0.008, 0.4]} />
        <meshStandardMaterial color={C.wood} roughness={0.6} />
      </mesh>

      <group position={[-0.14, 0.038, -0.015]} rotation={[0, 0.12, 0]}>
        <group scale={1.02}>
          <Boot />
        </group>
      </group>
      <group position={[0.14, 0.038, 0.03]} rotation={[0, -0.1, 0]}>
        <group scale={1.02}>
          <Boot />
        </group>
      </group>

      <mesh position={[0, 0.04, 0.222]}>
        <boxGeometry args={[0.18, 0.045, 0.006]} />
        <meshStandardMaterial color={C.gold} metalness={0.7} roughness={0.35} />
      </mesh>

      {/* Ballon posé au sol, à côté du plateau */}
      <mesh position={[0.5, 0.115, 0.18]} rotation={[0.3, 0.7, 0.1]}>
        <sphereGeometry args={[0.115, 40, 28]} />
        <meshStandardMaterial map={ball} roughness={0.38} metalness={0.03} />
      </mesh>
    </group>
  )
}
