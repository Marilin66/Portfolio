import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { CHAPTERS } from './chapters'
import { World } from './World'
import { CameraRig } from './CameraRig'
import { Effects } from './Effects'
import { useExperience } from '../store/useExperience'

/** Signale à l'interface que la scène est réellement montée. */
function SceneReady() {
  const setSceneReady = useExperience((state) => state.setSceneReady)

  useEffect(() => {
    setSceneReady(true)
    return () => setSceneReady(false)
  }, [setSceneReady])

  return null
}

/**
 * Ajuste le DPR en continu : baisse si l'appareil peine, remonte s'il a de la
 * marge. Une seule mesure au démarrage ne suffit pas : un onglet peut être
 * ralenti par une autre application, puis retrouver ses performances.
 */
function QualityGuard() {
  const setDpr = useThree((state) => state.setDpr)
  const tier = useExperience((state) => state.tier)
  const frames = useRef(0)
  const elapsed = useRef(0)
  const dpr = useRef(1)

  const base = tier === 'high' ? 1.25 : tier === 'medium' ? 1 : 0.85
  const max = tier === 'high' ? 1.6 : tier === 'medium' ? 1.2 : 0.85

  useEffect(() => {
    dpr.current = base
    if (tier !== 'low') setDpr(base)
  }, [base, setDpr, tier])

  useFrame((_, delta) => {
    if (tier === 'low') return

    frames.current += 1
    elapsed.current += delta
    if (elapsed.current < 2) return

    const fps = frames.current / elapsed.current
    frames.current = 0
    elapsed.current = 0

    let next = dpr.current
    if (fps < 42) next = Math.max(0.75, dpr.current - 0.15)
    else if (fps > 57) next = Math.min(max, dpr.current + 0.1)

    if (Math.abs(next - dpr.current) >= 0.01) {
      dpr.current = next
      setDpr(next)
    }
  })

  return null
}

export function Scene() {
  const tier = useExperience((state) => state.tier)

  return (
    <div className="scene" aria-hidden="true">
      <Canvas
        dpr={tier === 'high' ? [1, 2] : tier === 'medium' ? [1, 1.5] : [0.8, 1]}
        gl={{
          antialias: tier !== 'low',
          powerPreference: 'high-performance',
          alpha: false,
          toneMappingExposure: 1.05,
        }}
        camera={{ fov: 45, position: CHAPTERS[0].camera, near: 0.1, far: 60 }}
        onPointerMissed={() => {
          const state = useExperience.getState()
          if (state.selectedId) state.closeSelection()
        }}
      >
        <color attach="background" args={['#DCE9F6']} />
        <fog attach="fog" args={['#DCE9F6', 14, 42]} />

        <Suspense fallback={null}>
          <World />
          <SceneReady />
        </Suspense>

        <CameraRig />
        <Effects />
        <QualityGuard />
      </Canvas>
    </div>
  )
}
