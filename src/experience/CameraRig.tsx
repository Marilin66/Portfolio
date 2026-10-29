import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CHAPTERS } from './chapters'
import { scrollState } from '../lib/scroll'
import { useExperience } from '../store/useExperience'

/**
 * Caméra : une visite continue de la pièce, d'une zone à l'autre.
 * La position et le point visé sont deux splines Catmull-Rom construites à
 * partir des cadrages de `chapters.ts` ; la progression vient du scroll.
 * Un clic sur un objet remplace temporairement ce trajet par un cadrage serré.
 */
export function CameraRig() {
  const reduced = useExperience((state) => state.reduced)
  const focus = useExperience((state) => state.focus)

  const positions = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        CHAPTERS.map((chapter) => new THREE.Vector3(...chapter.camera)),
        false,
        'catmullrom',
        0.35,
      ),
    [],
  )

  const targets = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        CHAPTERS.map((chapter) => new THREE.Vector3(...chapter.target)),
        false,
        'catmullrom',
        0.35,
      ),
    [],
  )

  const desiredPosition = useMemo(() => new THREE.Vector3(), [])
  const desiredTarget = useMemo(() => new THREE.Vector3(), [])
  const lookAt = useRef(new THREE.Vector3(...CHAPTERS[0].target))

  useFrame((state, delta) => {
    // Le scroll est lissé pour éviter les à-coups de molette.
    if (reduced) {
      scrollState.value = scrollState.target
    } else {
      scrollState.value += (scrollState.target - scrollState.value) * Math.min(1, delta * 6)
    }

    const progress = THREE.MathUtils.clamp(scrollState.value, 0, 1)

    if (focus) {
      desiredPosition.set(...focus.camera)
      desiredTarget.set(...focus.position)
      if (!reduced) {
        desiredPosition.x += state.pointer.x * 0.25
        desiredPosition.y += state.pointer.y * 0.15
      }
    } else {
      positions.getPoint(progress, desiredPosition)
      targets.getPoint(progress, desiredTarget)

      // Le panneau occupe la droite de l'écran : on décale légèrement l'axe
      // de visée pour que la scène reste centrée dans l'espace visible.
      if (state.size.width > 980) desiredTarget.x += 1.0

      if (!reduced) {
        // Parallaxe : ±8° environ, assez pour la profondeur, trop peu pour désorienter.
        desiredPosition.x += state.pointer.x * 0.4
        desiredPosition.y += state.pointer.y * 0.2
        desiredTarget.x += state.pointer.x * 0.55
        desiredTarget.y += state.pointer.y * 0.3
      }
    }

    const smoothing = reduced ? 1 : 1 - Math.exp(-delta * 3.4)
    state.camera.position.lerp(desiredPosition, smoothing)
    lookAt.current.lerp(desiredTarget, smoothing)
    state.camera.lookAt(lookAt.current)
  })

  return null
}
