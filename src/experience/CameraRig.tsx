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
  const panelCollapsed = useExperience((state) => state.panelCollapsed)

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
    const isPortrait = state.size.width < state.size.height
    const isMobile = state.size.width < 900
    const aspect = state.size.width / Math.max(1, state.size.height)

    // Adaptation du FOV en mode portrait mobile : Three.js applique un FOV vertical fixe (45°),
    // ce qui réduit drastiquement la largeur visible sur mobile (effet zoom téléobjectif).
    // On compense ici pour préserver une vision large et naturelle de la pièce.
    if (state.camera instanceof THREE.PerspectiveCamera) {
      if (isPortrait) {
        const targetFov = THREE.MathUtils.clamp(45 / Math.min(1, aspect * 1.3), 45, 68)
        if (Math.abs(state.camera.fov - targetFov) > 0.2) {
          state.camera.fov = targetFov
          state.camera.updateProjectionMatrix()
        }
      } else if (Math.abs(state.camera.fov - 45) > 0.2) {
        state.camera.fov = 45
        state.camera.updateProjectionMatrix()
      }
    }

    if (focus) {
      desiredPosition.set(...focus.camera)
      desiredTarget.set(...focus.position)
      if (!reduced && !isMobile) {
        desiredPosition.x += state.pointer.x * 0.25
        desiredPosition.y += state.pointer.y * 0.15
      }
    } else {
      positions.getPoint(progress, desiredPosition)
      targets.getPoint(progress, desiredTarget)

      if (state.size.width > 980) {
        // Desktop : le panneau occupe la droite de l'écran, on décale l'axe de visée
        // pour que la scène reste bien centrée dans l'espace dégagé à gauche.
        desiredTarget.x += 1.0
      } else if (isMobile) {
        // Mobile : on donne du recul à la caméra pour embrasser la pièce.
        const backDir = desiredPosition.clone().sub(desiredTarget).normalize()
        desiredPosition.addScaledVector(backDir, isPortrait ? 1.4 : 0.7)

        // Si le panneau inférieur est ouvert, on abaisse le point visé pour que
        // la zone d'intérêt soit cadrée dans la moitié supérieure visible de l'écran.
        if (!panelCollapsed) {
          desiredTarget.y -= 0.62
        }
      }

      // Parallaxe souris (désactivée sur mobile pour éviter qu'un tap ne fige la caméra en biais).
      if (!reduced && !isMobile) {
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
