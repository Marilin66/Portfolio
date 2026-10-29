import { ContactShadows } from '@react-three/drei'
import { useExperience } from '../store/useExperience'
import { Room } from '../scenes/Room'

/**
 * Le monde est une seule pièce : l'atelier-chambre de Marilin, au matin.
 * Toutes les zones interactives vivent dans <Room />.
 */
export function World() {
  const tier = useExperience((state) => state.tier)

  return (
    <>
      <Room />

      {tier !== 'low' && (
        <ContactShadows
          position={[0, 0.015, 0.4]}
          scale={24}
          resolution={512}
          blur={2.4}
          opacity={0.32}
          far={4}
          frames={1}
          color="#3C5170"
        />
      )}
    </>
  )
}
