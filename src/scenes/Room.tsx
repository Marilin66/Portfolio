import { Suspense, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, RoundedBox, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { C } from '../components/three/palette'
import { useInteractive, useIsActive } from '../components/three/useInteractive'
import { useExperience } from '../store/useExperience'
import { profile } from '../data/selectors'
import { Chair, PendantLamp } from './room/furniture'
import { FootballKit, Footballer } from './room/footballer'
import {
  makeBeamTexture,
  makeFootballTexture,
  makePortraitTexture,
  makeRugTexture,
  makeScreenTexture,
  makeSkyTexture,
  makeSoftShadowTexture,
  makeWoodTexture,
} from './room/textures'

/* ------------------------------------------------------------------ */
/*  Textures partagées (créées une seule fois)                         */
/* ------------------------------------------------------------------ */

function buildTextures() {
  return {
    wood: makeWoodTexture(),
    sky: makeSkyTexture(),
    rug: makeRugTexture(),
    portrait: makePortraitTexture(),
    beam: makeBeamTexture(),
    football: makeFootballTexture(),
    softShadow: makeSoftShadowTexture(),
    screens: {
      hopitel: makeScreenTexture('HOPITEL', '#4FD3E6'),
      qr: makeScreenTexture('QR FLOW', '#5B6BE0'),
      journee: makeScreenTexture('UNE JOURNÉE SANS INFORMATICIENS', '#7FEBC4'),
      esante: makeScreenTexture('E-SANTÉ BÉNIN', '#38BDF8'),
    },
  }
}

type RoomTextures = ReturnType<typeof buildTextures>
let textureCache: RoomTextures | null = null

function getTextures(): RoomTextures {
  if (!textureCache) textureCache = buildTextures()
  return textureCache
}

/* ------------------------------------------------------------------ */
/*  Petit matériel réutilisable                                        */
/* ------------------------------------------------------------------ */

function Plant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const leaves = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const angle = (index / 7) * Math.PI * 2
        return {
          x: Math.cos(angle) * 0.1,
          z: Math.sin(angle) * 0.1,
          tilt: 0.35 + (index % 3) * 0.12,
          height: 0.3 + (index % 4) * 0.06,
          rotation: angle,
        }
      }),
    [],
  )

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.11, 0]}>
        <cylinderGeometry args={[0.13, 0.16, 0.22, 16]} />
        <meshStandardMaterial color="#C7B49A" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.23, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.02, 16]} />
        <meshStandardMaterial color="#5C4B38" roughness={1} />
      </mesh>
      {leaves.map((leaf, index) => (
        <mesh
          key={index}
          position={[leaf.x, 0.42, leaf.z]}
          rotation={[leaf.tilt, leaf.rotation, leaf.tilt * 0.6]}
        >
          <coneGeometry args={[0.055, leaf.height, 6]} />
          <meshStandardMaterial color={index % 2 === 0 ? '#6FA98B' : '#5C9377'} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  Enveloppe : sol, murs, plafond, tapis                              */
/* ------------------------------------------------------------------ */

function Shell({ textures }: { textures: RoomTextures }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.5]}>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial map={textures.wood} roughness={0.7} metalness={0.04} />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4.2, 0.5]}>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color="#F7F9FC" roughness={0.95} />
      </mesh>

      <mesh position={[0, 2.1, -6.5]}>
        <planeGeometry args={[18, 4.4]} />
        <meshStandardMaterial color="#F3EDE2" roughness={0.95} />
      </mesh>
      <mesh position={[0, 2.1, 7.5]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[18, 4.4]} />
        <meshStandardMaterial color="#F1EBE0" roughness={0.95} />
      </mesh>
      <mesh position={[-9, 2.1, 0.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[14, 4.4]} />
        <meshStandardMaterial color="#E4EDF8" roughness={0.96} />
      </mesh>
      <mesh position={[9, 2.1, 0.5]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[14, 4.4]} />
        <meshStandardMaterial color="#E7EFF8" roughness={0.96} />
      </mesh>

      {[
        { position: [0, 0.07, -6.44] as const, size: [18, 0.14, 0.06] as const },
        { position: [0, 0.07, 7.44] as const, size: [18, 0.14, 0.06] as const },
        { position: [-8.94, 0.07, 0.5] as const, size: [0.06, 0.14, 14] as const },
        { position: [8.94, 0.07, 0.5] as const, size: [0.06, 0.14, 14] as const },
      ].map((item, index) => (
        <mesh key={index} position={[...item.position]}>
          <boxGeometry args={[...item.size]} />
          <meshStandardMaterial color="#FBF7EF" roughness={0.8} />
        </mesh>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.4, 0.012, 2.2]}>
        <planeGeometry args={[5.2, 3.6]} />
        <meshStandardMaterial map={textures.rug} roughness={0.95} />
      </mesh>

      {/* Poutres : cassent la surface du plafond et donnent l'échelle */}
      {[-3.0, 2.4].map((z) => (
        <mesh key={z} position={[0, 4.08, z]}>
          <boxGeometry args={[18, 0.16, 0.2]} />
          <meshStandardMaterial color="#C9B08E" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  00 · Bienvenue : la pièce respire, la lumière traverse             */
/* ------------------------------------------------------------------ */

function Sunlight({ textures }: { textures: RoomTextures }) {
  return (
    <group>
      <mesh position={[-4.0, 1.6, -3.4]} rotation={[-0.32, 0.42, 0.12]}>
        <planeGeometry args={[5.4, 6]} />
        <meshBasicMaterial
          map={textures.beam}
          transparent
          opacity={0.45}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[-4.2, 0.02, -2.6]} rotation={[-Math.PI / 2, 0, 0.3]}>
        <planeGeometry args={[7, 5.5]} />
        <meshBasicMaterial
          map={textures.beam}
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

function DustPoints({ count }: { count: number }) {
  const group = useRef<THREE.Points>(null)
  const reduced = useExperience((state) => state.reduced)

  const positions = useMemo(() => {
    const array = new Float32Array(count * 3)
    for (let index = 0; index < count; index += 1) {
      array[index * 3] = -8 + Math.random() * 7
      array[index * 3 + 1] = 0.4 + Math.random() * 3.4
      array[index * 3 + 2] = -6 + Math.random() * 7
    }
    return array
  }, [count])

  useFrame(({ clock }) => {
    if (reduced || !group.current) return
    group.current.position.y = Math.sin(clock.getElapsedTime() * 0.25) * 0.06
  })

  return (
    <points ref={group}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#FFF3DC"
        size={0.022}
        sizeAttenuation
        transparent
        opacity={0.55}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  )
}

function DustMotes() {
  const tier = useExperience((state) => state.tier)

  // Rien sur les appareils modestes : 240 points animés chaque frame coûtent
  // plus cher que le gain visuel sur un petit écran.
  if (tier === 'low') return null

  return <DustPoints count={tier === 'high' ? 240 : 120} />
}

/* ------------------------------------------------------------------ */
/*  01 · Qui suis-je : le mur des portraits                            */
/* ------------------------------------------------------------------ */

function PortraitImage({ src }: { src: string }) {
  const texture = useTexture(src)
  return <meshBasicMaterial map={texture} toneMapped={false} />
}

function WallAbout({ textures }: { textures: RoomTextures }) {
  const id = 'zone-about'
  const handlers = useInteractive(id)
  const active = useIsActive(id)
  const photo = profile.photo.src

  return (
    <group position={[0.4, 0, -6.4]} {...handlers}>
      <mesh position={[0, 2.25, 0.02]}>
        <planeGeometry args={[1.95, 2.4]} />
        <meshBasicMaterial
          color={C.cyan}
          transparent
          opacity={active ? 0.4 : 0.18}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh position={[0, 2.25, 0.05]}>
        <planeGeometry args={[1.5, 1.92]} />
        {photo ? (
          <Suspense fallback={<meshBasicMaterial color={C.indigoDeep} />}>
            <PortraitImage src={photo} />
          </Suspense>
        ) : (
          <meshBasicMaterial map={textures.portrait} toneMapped={false} />
        )}
      </mesh>

      {[
        { position: [0, 3.26, 0.08] as const, size: [1.66, 0.06, 0.07] as const },
        { position: [0, 1.24, 0.08] as const, size: [1.66, 0.06, 0.07] as const },
        { position: [-0.8, 2.25, 0.08] as const, size: [0.06, 2.08, 0.07] as const },
        { position: [0.8, 2.25, 0.08] as const, size: [0.06, 2.08, 0.07] as const },
      ].map((item, index) => (
        <mesh key={index} position={[...item.position]}>
          <boxGeometry args={[...item.size]} />
          <meshStandardMaterial color="#E9DFC9" roughness={0.55} />
        </mesh>
      ))}

      {/* Deux petits cadres, sans contenu inventé */}
      {[-1.35, 2.15].map((x, index) => (
        <group key={x} position={[x, 2.6, 0.04]}>
          <mesh>
            <boxGeometry args={[0.64, 0.82, 0.04]} />
            <meshStandardMaterial color="#E9DFC9" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.025]}>
            <planeGeometry args={[0.52, 0.7]} />
            <meshBasicMaterial color={index === 0 ? '#B9CBDF' : '#C9D6E7'} toneMapped={false} />
          </mesh>
          <mesh position={[0, -0.18, 0.03]}>
            <planeGeometry args={[0.34, 0.02]} />
            <meshBasicMaterial color={C.indigo} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Notes punaisées */}
      {[
        [1.05, 1.62],
        [1.42, 1.95],
        [1.18, 2.28],
        [2.42, 1.55],
      ].map(([x, y], index) => (
        <group key={index} position={[x, y, 0.04]}>
          <mesh>
            <planeGeometry args={[0.26, 0.2]} />
            <meshBasicMaterial color="#F6F1E6" toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.05, 0.005]}>
            <planeGeometry args={[0.16, 0.012]} />
            <meshBasicMaterial color={index % 2 === 0 ? C.cyan : C.indigo} toneMapped={false} />
          </mesh>
        </group>
      ))}

      <mesh position={[0.5, 1.12, 0.14]}>
        <boxGeometry args={[3.0, 0.05, 0.24]} />
        <meshStandardMaterial color={C.woodDark} roughness={0.7} />
      </mesh>
      {[
        { x: -0.5, h: 0.22, color: '#5B6BE0' },
        { x: -0.32, h: 0.17, color: '#4FD3E6' },
        { x: -0.18, h: 0.2, color: '#F4EFE6' },
      ].map((book) => (
        <mesh key={book.x} position={[0.5 + book.x, 1.145 + book.h / 2, 0.14]}>
          <boxGeometry args={[0.055, book.h, 0.15]} />
          <meshStandardMaterial color={book.color} roughness={0.8} />
        </mesh>
      ))}
      <Plant position={[1.75, 1.145, 0.14]} scale={0.55} />
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  02 · Parcours : la bibliothèque                                   */
/* ------------------------------------------------------------------ */

const BOOK_COLORS = ['#3E5288', '#5B6BE0', '#2F7FA6', '#4FD3E6', '#F4EFE6', '#7FEBC4', '#8B96D8', '#D9C9A8']

function ShelfParcours() {
  const id = 'zone-parcours'
  const handlers = useInteractive(id)
  const active = useIsActive(id)
  const booksRef = useRef<THREE.InstancedMesh>(null)

  const books = useMemo(() => {
    const items: { position: [number, number, number]; size: [number, number, number]; color: string }[] = []
    const boards = [0.55, 1.15, 1.75, 2.35]

    boards.forEach((y, row) => {
      let z = -1.28
      let index = 0
      while (z < 1.2) {
        const thickness = 0.035 + Math.random() * 0.035
        const height = 0.17 + Math.random() * 0.13
        const depth = 0.16 + Math.random() * 0.04
        if (Math.random() > 0.1) {
          items.push({
            position: [0, y + height / 2 + 0.028, z + thickness / 2],
            size: [depth, height, thickness],
            color: BOOK_COLORS[(row * 3 + index) % BOOK_COLORS.length],
          })
        }
        z += thickness + 0.006
        index += 1
        if (Math.random() < 0.07) z += 0.16
      }
    })

    return items
  }, [])

  useEffect(() => {
    const mesh = booksRef.current
    if (!mesh) return
    const dummy = new THREE.Object3D()
    books.forEach((book, index) => {
      dummy.position.set(...book.position)
      dummy.scale.set(...book.size)
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
      mesh.setColorAt(index, new THREE.Color(book.color))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [books])

  return (
    <group position={[-8.84, 0, -2.35]} {...handlers}>
      {[0.55, 1.15, 1.75, 2.35].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[0.34, 0.04, 2.72]} />
          <meshStandardMaterial color={C.wood} roughness={0.68} />
        </mesh>
      ))}
      {[-1.34, 1.34].map((z) => (
        <mesh key={z} position={[0, 1.25, z]}>
          <boxGeometry args={[0.34, 2.5, 0.04]} />
          <meshStandardMaterial color={C.woodDark} roughness={0.7} />
        </mesh>
      ))}

      <instancedMesh ref={booksRef} args={[undefined, undefined, books.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.82} />
      </instancedMesh>

      <mesh position={[0, 1.93, 0]}>
        <boxGeometry args={[0.28, 0.012, 2.4]} />
        <meshBasicMaterial
          color={C.cyan}
          transparent
          opacity={active ? 0.55 : 0.18}
          toneMapped={false}
        />
      </mesh>

      <Plant position={[0, 2.39, -1.0]} scale={0.6} />

      <mesh position={[0, 2.54, 1.02]}>
        <boxGeometry args={[0.16, 0.3, 0.16]} />
        <meshStandardMaterial color="#D9C9A8" roughness={0.7} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  03 · Compétences : l'établi                                       */
/* ------------------------------------------------------------------ */

function Workbench() {
  const id = 'zone-skills'
  const handlers = useInteractive(id)
  const active = useIsActive(id)

  return (
    <group position={[-7.95, 0, 3.3]} {...handlers}>
      <mesh position={[0, 0.88, 0]}>
        <boxGeometry args={[1.5, 0.08, 3.0]} />
        <meshStandardMaterial color={C.wood} roughness={0.66} />
      </mesh>
      {[
        [-0.62, -1.38],
        [0.62, -1.38],
        [-0.62, 1.38],
        [0.62, 1.38],
      ].map(([x, z], index) => (
        <mesh key={index} position={[x, 0.42, z]}>
          <boxGeometry args={[0.08, 0.84, 0.08]} />
          <meshStandardMaterial color="#7E8EA6" metalness={0.4} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.3, 0.04, 2.7]} />
        <meshStandardMaterial color={C.woodDark} roughness={0.8} />
      </mesh>

      {/* Pegboard mural */}
      <mesh position={[-1.02, 2.15, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[3.0, 1.4]} />
        <meshStandardMaterial color="#E7DCC7" roughness={0.9} />
      </mesh>
      {[
        { position: [-1.0, 2.87, 0] as const, size: [0.04, 0.04, 3.0] as const },
        { position: [-1.0, 1.43, 0] as const, size: [0.04, 0.04, 3.0] as const },
        { position: [-1.0, 2.15, -1.52] as const, size: [0.04, 1.44, 0.04] as const },
        { position: [-1.0, 2.15, 1.52] as const, size: [0.04, 1.44, 0.04] as const },
      ].map((item, index) => (
        <mesh key={index} position={[...item.position]}>
          <boxGeometry args={[...item.size]} />
          <meshStandardMaterial color={C.woodDark} roughness={0.7} />
        </mesh>
      ))}

      {/* Outils suspendus */}
      {[-1.0, -0.7, -0.4, 1.0].map((z, index) => (
        <group key={z} position={[-0.97, 2.3, z]}>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.035, 0.045, 0.12, 12]} />
            <meshStandardMaterial color={index % 2 === 0 ? C.indigo : '#3B4A6B'} roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.08, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.26, 8]} />
            <meshStandardMaterial color="#C7D2E0" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      ))}
      <mesh position={[-0.97, 2.42, 0.28]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.13, 0.02, 8, 32]} />
        <meshStandardMaterial color={C.gold} metalness={0.85} roughness={0.35} />
      </mesh>
      <mesh position={[-0.97, 2.1, 0.3]}>
        <boxGeometry args={[0.02, 0.22, 0.3]} />
        <meshStandardMaterial color="#3F7F63" roughness={0.7} />
      </mesh>

      {/* Oscilloscope */}
      <group position={[0.05, 1.0, -0.9]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[0.72, 0.44, 0.46]} />
          <meshStandardMaterial color="#D9E2EE" roughness={0.55} metalness={0.15} />
        </mesh>
        <mesh position={[0, 0.25, 0.235]}>
          <planeGeometry args={[0.5, 0.28]} />
          <meshStandardMaterial
            color="#0E2233"
            emissive={C.cyan}
            emissiveIntensity={active ? 0.55 : 0.3}
            roughness={0.4}
          />
        </mesh>
        <mesh position={[0, 0.25, 0.24]}>
          <planeGeometry args={[0.4, 0.012]} />
          <meshBasicMaterial color={C.cyanBright} toneMapped={false} />
        </mesh>
        {[-0.18, 0, 0.18].map((x) => (
          <mesh key={x} position={[x, 0.08, 0.235]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.03, 12]} />
            <meshStandardMaterial color={C.indigoDeep} roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* Plaque d'essai et composants */}
      <mesh position={[0.1, 0.95, 0.25]}>
        <boxGeometry args={[0.42, 0.03, 0.28]} />
        <meshStandardMaterial color="#3F7F63" roughness={0.7} />
      </mesh>
      {[
        { z: -0.06, color: C.cyanBright },
        { z: 0.02, color: C.mint },
        { z: 0.1, color: C.gold },
      ].map((led) => (
        <mesh key={led.z} position={[0.16, 0.968, 0.25 + led.z]}>
          <boxGeometry args={[0.015, 0.012, 0.015]} />
          <meshBasicMaterial color={led.color} toneMapped={false} />
        </mesh>
      ))}

      <mesh position={[0.15, 0.96, 0.92]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.26, 8]} />
        <meshStandardMaterial color="#9AA9BC" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.15, 0.96, 0.92]}>
        <cylinderGeometry args={[0.03, 0.03, 0.12, 10]} />
        <meshStandardMaterial color={C.indigo} roughness={0.6} />
      </mesh>

      <mesh position={[0.74, 0.82, 0]}>
        <boxGeometry args={[0.03, 0.015, 2.9]} />
        <meshBasicMaterial
          color={C.cyan}
          transparent
          opacity={active ? 0.95 : 0.5}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  04 · Projets : le bureau                                          */
/* ------------------------------------------------------------------ */

function DeskProjects({ textures }: { textures: RoomTextures }) {
  const id = 'zone-projects'
  const handlers = useInteractive(id)
  const active = useIsActive(id)

  const monitors = [
    { x: -0.82, rotation: 0.16, map: textures.screens.hopitel },
    { x: 0.82, rotation: -0.14, map: textures.screens.qr },
  ]

  return (
    <group position={[5.5, 0, -5.2]} {...handlers}>
      <mesh position={[0, 0.78, 0]}>
        <boxGeometry args={[3.4, 0.08, 1.5]} />
        <meshStandardMaterial color={C.wood} roughness={0.64} />
      </mesh>
      {[
        [-1.55, -0.6],
        [1.55, -0.6],
        [-1.55, 0.6],
        [1.55, 0.6],
      ].map(([x, z], index) => (
        <mesh key={index} position={[x, 0.38, z]}>
          <boxGeometry args={[0.07, 0.76, 0.07]} />
          <meshStandardMaterial color="#7E8EA6" metalness={0.4} roughness={0.5} />
        </mesh>
      ))}

      {monitors.map((monitor) => (
        <group key={monitor.x} position={[monitor.x, 1.2, -0.22]} rotation={[0, monitor.rotation, 0]}>
          <mesh>
            <boxGeometry args={[1.2, 0.72, 0.04]} />
            <meshStandardMaterial color="#2A3550" roughness={0.45} />
          </mesh>
          <mesh position={[0, 0, 0.023]}>
            <planeGeometry args={[1.1, 0.62]} />
            <meshBasicMaterial map={monitor.map} toneMapped={false} />
          </mesh>
          <mesh position={[0, -0.42, -0.02]}>
            <boxGeometry args={[0.06, 0.14, 0.04]} />
            <meshStandardMaterial color="#2A3550" roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.5, -0.02]}>
            <boxGeometry args={[0.34, 0.02, 0.18]} />
            <meshStandardMaterial color="#2A3550" roughness={0.5} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.82, 0.42]} rotation={[-0.06, 0, 0]}>
        <boxGeometry args={[0.62, 0.02, 0.42]} />
        <meshStandardMaterial color="#CBD6E4" metalness={0.4} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.98, 0.2]} rotation={[-0.35, 0, 0]}>
        <boxGeometry args={[0.62, 0.4, 0.02]} />
        <meshStandardMaterial color="#2A3550" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.98, 0.215]} rotation={[-0.35, 0, 0]}>
        <planeGeometry args={[0.56, 0.34]} />
        <meshBasicMaterial map={textures.screens.journee} toneMapped={false} />
      </mesh>

      <mesh position={[-0.7, 0.83, 0.52]}>
        <boxGeometry args={[0.52, 0.02, 0.18]} />
        <meshStandardMaterial color="#E9EEF6" roughness={0.6} />
      </mesh>
      {/* Smartphone avec l'application mobile E-Santé Bénin */}
      <group position={[0.55, 0.83, 0.5]} rotation={[0, -0.15, 0]}>
        <mesh>
          <boxGeometry args={[0.1, 0.016, 0.19]} />
          <meshStandardMaterial color="#1E2A3C" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.009, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.088, 0.174]} />
          <meshBasicMaterial map={textures.screens.esante} toneMapped={false} />
        </mesh>
      </group>
      <mesh position={[-1.32, 0.86, 0.3]}>
        <cylinderGeometry args={[0.06, 0.05, 0.11, 16]} />
        <meshStandardMaterial color="#F4EFE6" roughness={0.5} />
      </mesh>
      <Plant position={[1.42, 0.82, 0.42]} scale={0.75} />

      {/* Étagère murale au-dessus du bureau */}
      <mesh position={[0, 2.62, -1.14]}>
        <boxGeometry args={[3.0, 0.05, 0.26]} />
        <meshStandardMaterial color={C.wood} roughness={0.66} />
      </mesh>
      {[-1.15, -0.9, -0.62, 0.55, 0.8, 1.05].map((x, index) => (
        <mesh key={x} position={[x, 2.72, -1.14]}>
          <boxGeometry args={[0.07, 0.2 + (index % 3) * 0.04, 0.16]} />
          <meshStandardMaterial
            color={['#3E5288', '#5B6BE0', '#2F7FA6', '#F4EFE6', '#7FEBC4', '#D9C9A8'][index % 6]}
            roughness={0.8}
          />
        </mesh>
      ))}
      <Plant position={[0.1, 2.65, -1.14]} scale={0.5} />

      <mesh position={[0, 0.76, 0.76]}>
        <boxGeometry args={[2.6, 0.015, 0.02]} />
        <meshBasicMaterial
          color={C.cyan}
          transparent
          opacity={active ? 0.95 : 0.45}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  05 · Expériences : le tableau d'affichage                          */
/* ------------------------------------------------------------------ */

function Pinboard() {
  const id = 'zone-experience'
  const handlers = useInteractive(id)
  const active = useIsActive(id)

  const cards = [
    { y: 2.55, z: -0.95, color: '#F6F1E6' },
    { y: 2.55, z: -0.35, color: '#E3EEF8' },
    { y: 2.55, z: 0.25, color: '#F6F1E6' },
    { y: 2.55, z: 0.85, color: '#DCEBEF' },
    { y: 1.95, z: -0.75, color: '#EDE6F7' },
    { y: 1.95, z: -0.15, color: '#F6F1E6' },
    { y: 1.95, z: 0.55, color: '#E3EEF8' },
  ]

  return (
    <group position={[8.9, 0, -1.6]} {...handlers}>
      <mesh position={[0, 2.05, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2.9, 1.9]} />
        <meshStandardMaterial color="#E7DCC7" roughness={0.95} />
      </mesh>
      {[
        { position: [0, 3.02, 0] as const, size: [0.05, 0.05, 2.98] as const },
        { position: [0, 1.08, 0] as const, size: [0.05, 0.05, 2.98] as const },
        { position: [0, 2.05, -1.46] as const, size: [0.05, 1.98, 0.05] as const },
        { position: [0, 2.05, 1.46] as const, size: [0.05, 1.98, 0.05] as const },
      ].map((item, index) => (
        <mesh key={index} position={[...item.position]}>
          <boxGeometry args={[...item.size]} />
          <meshStandardMaterial color={C.woodDark} roughness={0.7} />
        </mesh>
      ))}

      {cards.map((card, index) => (
        <group key={index} position={[-0.04, card.y, card.z]}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.42, 0.3]} />
            <meshStandardMaterial color={card.color} roughness={0.9} />
          </mesh>
          <mesh position={[-0.005, 0.06, 0]}>
            <boxGeometry args={[0.005, 0.018, 0.18]} />
            <meshBasicMaterial color={index % 3 === 0 ? C.cyan : C.indigo} toneMapped={false} />
          </mesh>
          <mesh position={[-0.01, 0.13, 0]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshBasicMaterial color="#D9C9A8" toneMapped={false} />
          </mesh>
        </group>
      ))}

      <Line
        points={[
          [0.02, 2.68, -0.95],
          [0.02, 2.4, -0.15],
          [0.02, 2.3, 0.85],
        ]}
        color="#7A8AA6"
        lineWidth={0.8}
        transparent
        opacity={0.6}
      />

      <mesh position={[0.02, 1.4, 1.15]}>
        <boxGeometry args={[0.01, 0.5, 0.02]} />
        <meshBasicMaterial
          color={C.cyan}
          transparent
          opacity={active ? 0.8 : 0.25}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  06 · Certifications : l'étagère                                   */
/* ------------------------------------------------------------------ */

function CertShelf() {
  const id = 'zone-certifications'
  const handlers = useInteractive(id)
  const active = useIsActive(id)

  return (
    <group position={[8.88, 0, 2.4]} {...handlers}>
      <mesh position={[0, 1.55, 0]}>
        <boxGeometry args={[0.3, 0.04, 2.2]} />
        <meshStandardMaterial color={C.wood} roughness={0.66} />
      </mesh>
      {[-1.05, 1.05].map((z) => (
        <mesh key={z} position={[0, 1.39, z]}>
          <boxGeometry args={[0.26, 0.32, 0.03]} />
          <meshStandardMaterial color={C.woodDark} roughness={0.7} />
        </mesh>
      ))}

      {[-0.66, 0, 0.66].map((z, index) => (
        <group key={z} position={[-0.02, 1.74, z]} rotation={[0, 0, 0.13]}>
          <mesh>
            <boxGeometry args={[0.02, 0.32, 0.44]} />
            <meshStandardMaterial color="#F6F1E6" roughness={0.6} />
          </mesh>
          <mesh position={[-0.015, 0, 0]}>
            <boxGeometry args={[0.005, 0.24, 0.36]} />
            <meshStandardMaterial
              color="#22405C"
              emissive={C.mint}
              emissiveIntensity={active ? 0.5 : 0.18}
              roughness={0.4}
            />
          </mesh>
          <mesh position={[-0.02, -0.08, 0]}>
            <boxGeometry args={[0.004, 0.012, 0.2]} />
            <meshBasicMaterial color={index === 0 ? C.gold : C.mint} toneMapped={false} />
          </mesh>
        </group>
      ))}

      <mesh position={[0.03, 1.57, 0.94]}>
        <boxGeometry args={[0.16, 0.02, 0.18]} />
        <meshStandardMaterial color="#5B6BE0" roughness={0.8} />
      </mesh>
      <Plant position={[0.02, 1.57, -0.92]} scale={0.55} />
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  07 · Engagement : le coin culture                                 */
/* ------------------------------------------------------------------ */

function CultureCorner() {
  const id = 'zone-engagement'
  const handlers = useInteractive(id)
  const active = useIsActive(id)

  return (
    <group>
      <group position={[-6.2, 0, 7.04]} {...handlers}>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[2.4, 0.8, 0.5]} />
          <meshStandardMaterial color={C.woodDark} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.82, 0]}>
          <boxGeometry args={[2.5, 0.04, 0.54]} />
          <meshStandardMaterial color={C.wood} roughness={0.64} />
        </mesh>
        {[-0.62, 0.62].map((x) => (
          <mesh key={x} position={[x, 0.4, -0.26]}>
            <boxGeometry args={[1.1, 0.68, 0.012]} />
            <meshStandardMaterial color="#8E7A5E" roughness={0.75} />
          </mesh>
        ))}

        {/* Platine vinyle */}
        <group position={[-0.5, 0.84, 0]}>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[0.56, 0.1, 0.46]} />
            <meshStandardMaterial color="#2E3A52" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.12, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.19, 0.19, 0.02, 32]} />
            <meshStandardMaterial color="#121A2A" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.135, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.008, 24]} />
            <meshBasicMaterial color={C.indigo} toneMapped={false} />
          </mesh>
          <mesh position={[0.22, 0.15, -0.1]} rotation={[0, 0.5, 0]}>
            <boxGeometry args={[0.015, 0.015, 0.28]} />
            <meshStandardMaterial color="#C7D2E0" metalness={0.7} roughness={0.35} />
          </mesh>
        </group>

        <mesh position={[0.88, 1.06, 0]}>
          <boxGeometry args={[0.3, 0.5, 0.3]} />
          <meshStandardMaterial color="#3A4A66" roughness={0.7} />
        </mesh>
        <mesh position={[0.88, 1.06, -0.151]}>
          <planeGeometry args={[0.16, 0.16]} />
          <meshBasicMaterial color={C.indigoDeep} toneMapped={false} />
        </mesh>

        {[-0.95, -0.86, -0.77].map((x, index) => (
          <mesh key={x} position={[x, 1.1, 0.06]} rotation={[0.14, 0, -0.05]}>
            <boxGeometry args={[0.012, 0.32, 0.32]} />
            <meshStandardMaterial color={index === 1 ? '#5B6BE0' : '#2F4A70'} roughness={0.8} />
          </mesh>
        ))}

        <mesh position={[0, 0.86, -0.24]}>
          <boxGeometry args={[2.2, 0.012, 0.02]} />
          <meshBasicMaterial
            color={C.cyan}
            transparent
            opacity={active ? 0.85 : 0.4}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Affiches au-dessus du meuble */}
      {[
        { x: -6.95, color: '#3C4E8C', accent: C.cyan },
        { x: -5.35, color: '#2F5E77', accent: C.mint },
      ].map((poster) => (
        <group key={poster.x} position={[poster.x, 2.55, 7.42]} rotation={[0, Math.PI, 0]}>
          <mesh>
            <boxGeometry args={[0.86, 1.14, 0.04]} />
            <meshStandardMaterial color="#E9DFC9" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.025]}>
            <planeGeometry args={[0.74, 1.02]} />
            <meshBasicMaterial color={poster.color} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.18, 0.03]}>
            <circleGeometry args={[0.16, 32]} />
            <meshBasicMaterial color={poster.accent} transparent opacity={0.85} toneMapped={false} />
          </mesh>
          <mesh position={[0, -0.24, 0.03]}>
            <planeGeometry args={[0.42, 0.02]} />
            <meshBasicMaterial color="#F4EFE6" transparent opacity={0.7} toneMapped={false} />
          </mesh>
        </group>
      ))}

      <Plant position={[-8.1, 0, 6.7]} scale={1.25} />
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  08 · Ambitions : la fenêtre                                       */
/* ------------------------------------------------------------------ */

function WindowAmbitions({ textures }: { textures: RoomTextures }) {
  const id = 'zone-ambitions'
  const handlers = useInteractive(id)
  const active = useIsActive(id)

  return (
    <group position={[-5.8, 0, -6.42]} {...handlers}>
      <mesh position={[0, 2.36, 0.01]}>
        <planeGeometry args={[3.6, 2.4]} />
        <meshBasicMaterial map={textures.sky} color={active ? '#FBF5EA' : '#E6E0D6'} toneMapped={false} />
      </mesh>

      {[
        { position: [0, 3.62, 0.08] as const, size: [3.86, 0.1, 0.12] as const },
        { position: [0, 1.1, 0.08] as const, size: [3.86, 0.1, 0.12] as const },
        { position: [-1.88, 2.36, 0.08] as const, size: [0.1, 2.62, 0.12] as const },
        { position: [1.88, 2.36, 0.08] as const, size: [0.1, 2.62, 0.12] as const },
        { position: [0, 2.36, 0.09] as const, size: [0.05, 2.42, 0.08] as const },
        { position: [0, 2.36, 0.09] as const, size: [3.66, 0.05, 0.08] as const },
      ].map((item, index) => (
        <mesh key={index} position={[...item.position]}>
          <boxGeometry args={[...item.size]} />
          <meshStandardMaterial color="#E9DFC9" roughness={0.55} />
        </mesh>
      ))}

      <mesh position={[0, 1.02, 0.16]}>
        <boxGeometry args={[3.9, 0.08, 0.3]} />
        <meshStandardMaterial color="#E9DFC9" roughness={0.6} />
      </mesh>

      {[-2.16, 2.16].map((x) => (
        <mesh key={x} position={[x, 2.3, 0.26]}>
          <planeGeometry args={[0.72, 2.7]} />
          <meshStandardMaterial
            color="#F1E7D8"
            roughness={0.95}
            transparent
            opacity={0.92}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      <Plant position={[1.5, 1.06, 0.16]} scale={0.6} />
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  09 · Contact : la porte                                           */
/* ------------------------------------------------------------------ */

function DoorContact() {
  const id = 'zone-contact'
  const handlers = useInteractive(id)
  const active = useIsActive(id)

  return (
    <group position={[6.9, 0, 7.46]} {...handlers}>
      <mesh position={[0, 1.22, 0]}>
        <boxGeometry args={[1.2, 2.44, 0.06]} />
        <meshStandardMaterial color="#3B4A86" roughness={0.6} />
      </mesh>

      {[
        { position: [-0.68, 1.25, 0] as const, size: [0.09, 2.5, 0.1] as const },
        { position: [0.68, 1.25, 0] as const, size: [0.09, 2.5, 0.1] as const },
        { position: [0, 2.5, 0] as const, size: [1.52, 0.09, 0.1] as const },
      ].map((item, index) => (
        <mesh key={index} position={[...item.position]}>
          <boxGeometry args={[...item.size]} />
          <meshStandardMaterial color="#E9DFC9" roughness={0.55} />
        </mesh>
      ))}

      {[
        { position: [-0.61, 1.22, -0.035] as const, size: [0.02, 2.36, 0.01] as const },
        { position: [0.61, 1.22, -0.035] as const, size: [0.02, 2.36, 0.01] as const },
        { position: [0, 2.41, -0.035] as const, size: [1.24, 0.02, 0.01] as const },
        { position: [0, 0.03, -0.035] as const, size: [1.24, 0.02, 0.01] as const },
      ].map((item, index) => (
        <mesh key={index} position={[...item.position]}>
          <boxGeometry args={[...item.size]} />
          <meshBasicMaterial
            color={C.cyan}
            transparent
            opacity={active ? 1 : 0.55}
            toneMapped={false}
          />
        </mesh>
      ))}

      <mesh position={[0.44, 1.12, -0.06]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial color={C.gold} metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0.44, 1.12, -0.025]}>
        <cylinderGeometry args={[0.02, 0.02, 0.06, 12]} />
        <meshStandardMaterial color={C.gold} metalness={0.9} roughness={0.3} />
      </mesh>

      <mesh position={[0, 0.012, -0.62]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.5, 0.8]} />
        <meshStandardMaterial color="#E7DCC7" roughness={1} />
      </mesh>
      <mesh position={[0, 0.03, -0.34]}>
        <boxGeometry args={[1.1, 0.012, 0.06]} />
        <meshBasicMaterial
          color={C.cyan}
          transparent
          opacity={active ? 0.9 : 0.4}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  Mobilier d'appoint                                                */
/* ------------------------------------------------------------------ */

function Daybed() {
  return (
    <group position={[1.2, 0, 5.1]}>
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[3.1, 0.3, 2.0]} />
        <meshStandardMaterial color={C.wood} roughness={0.7} />
      </mesh>
      {[
        [-1.3, -0.8],
        [1.3, -0.8],
        [-1.3, 0.8],
        [1.3, 0.8],
      ].map(([x, z], index) => (
        <mesh key={index} position={[x, 0.09, z]}>
          <boxGeometry args={[0.08, 0.18, 0.08]} />
          <meshStandardMaterial color={C.woodDark} roughness={0.75} />
        </mesh>
      ))}
      <mesh position={[0, 0.48, 0]}>
        <boxGeometry args={[2.96, 0.22, 1.86]} />
        <meshStandardMaterial color="#F1EADC" roughness={0.96} />
      </mesh>
      <mesh position={[0.62, 0.62, 0]}>
        <boxGeometry args={[1.5, 0.07, 1.8]} />
        <meshStandardMaterial color="#3B4A86" roughness={0.95} />
      </mesh>
      {[-0.55, 0.55].map((z) => (
        <RoundedBox
          key={z}
          args={[0.72, 0.16, 0.46]}
          radius={0.07}
          smoothness={4}
          position={[-1.03, 0.66, z]}
          rotation={[0, 0, 0.06]}
        >
          <meshStandardMaterial color="#F7F2E8" roughness={0.95} />
        </RoundedBox>
      ))}
    </group>
  )
}

function FloorLamp() {
  return (
    <group position={[4.35, 0, 6.55]}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.19, 0.22, 0.04, 24]} />
        <meshStandardMaterial color="#7E8EA6" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.88, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.72, 12]} />
        <meshStandardMaterial color="#7E8EA6" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.78, 0]}>
        <cylinderGeometry args={[0.18, 0.26, 0.3, 24, 1, true]} />
        <meshStandardMaterial color="#F4EBDC" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, 1.7, 0]} color="#FFE3B8" intensity={2.4} distance={4.5} decay={2} />
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  Racine de la pièce                                                */
/* ------------------------------------------------------------------ */

export function Room() {
  const textures = useMemo(getTextures, [])

  return (
    <group>
      <ambientLight intensity={0.34} color="#D9E8FA" />
      <hemisphereLight args={['#D6E9FF', '#8D97A2', 0.55]} />
      <directionalLight position={[-6.5, 5.5, -4.5]} intensity={2.2} color="#FFE9C9" />
      <pointLight position={[-5.6, 2.3, -4.2]} intensity={9} distance={10} decay={2} color="#FFEBD0" />
      <pointLight position={[0, 3.2, 1.4]} intensity={2.6} distance={9} decay={2} color="#FFE7C8" />

      <Shell textures={textures} />
      <Sunlight textures={textures} />
      <WindowAmbitions textures={textures} />
      <WallAbout textures={textures} />
      <Footballer shadow={textures.softShadow} />
      <ShelfParcours />
      <Workbench />
      <DeskProjects textures={textures} />
      <Pinboard />
      <CertShelf />
      <CultureCorner />
      <FootballKit ball={textures.football} shadow={textures.softShadow} />
      <DoorContact />
      <Daybed />
      <FloorLamp />
      <PendantLamp />
      <Chair />
      <Plant position={[-7.6, 0, -5.6]} scale={1.5} />
      <DustMotes />
    </group>
  )
}
