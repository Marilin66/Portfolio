import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { useExperience } from '../store/useExperience'

/**
 * Post-traitement léger : un matin brumeux supporte mal le bloom agressif.
 * Rien sur les appareils modestes, la lumière est alors entièrement portée
 * par les matériaux et les sources de la scène.
 */
export function Effects() {
  const tier = useExperience((state) => state.tier)

  if (tier === 'low') return null

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={tier === 'high' ? 0.4 : 0.28}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.4}
        mipmapBlur
        radius={0.6}
      />
      <Vignette offset={0.32} darkness={0.34} />
      {tier === 'high' && <Noise opacity={0.02} premultiply />}
    </EffectComposer>
  )
}
