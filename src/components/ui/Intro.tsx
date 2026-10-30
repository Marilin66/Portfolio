import { useRef } from 'react'
import { profile } from '../../data/selectors'
import { useExperience } from '../../store/useExperience'
import { useFocusTrap } from '../../hooks/useFocusTrap'

const BOOT_LABELS = [
  ['01', "Lumière d'aube"],
  ['02', 'Pièce-atelier'],
  ['03', 'Scène 3D'],
  ['04', 'Lecteur'],
] as const

/**
 * Écran d'accueil. Le visiteur entre dans le monde comme dans un jeu :
 * un titre, une promesse, puis la pièce s'ouvre derrière.
 * Les lignes de démarrage reflètent l'état réel du chargement de la scène.
 */
export function Intro() {
  const introDone = useExperience((state) => state.introDone)
  const sceneReady = useExperience((state) => state.sceneReady)
  const finishIntro = useExperience((state) => state.finishIntro)
  const innerRef = useRef<HTMLDivElement>(null)

  useFocusTrap(!introDone, innerRef)

  if (introDone) return null

  const states = ['douce', 'dix zones', sceneReady ? 'prête' : 'chargement', 'prêt']

  return (
    <div className="intro" role="dialog" aria-modal="true" aria-label="Introduction" aria-describedby="intro-tagline">
      <div className="intro__inner" ref={innerRef}>
        <div className="intro__top">
          <span className="eyebrow">{profile.meta.siteTitle} · Aube</span>
          <span className="intro__origin">{profile.identity.origin}</span>
        </div>

        <h1 className="intro__name">
          <span className="intro__welcome">Bienvenue dans le monde de</span>
          <span className="intro__big">Marilin,</span>
          <span className="intro__big intro__big--accent">développeur créatif</span>
        </h1>

        <p className="intro__role">{profile.identity.role}</p>
        <p className="intro__tagline" id="intro-tagline">
          La lumière se lève sur une pièce où l'électricité, le code et les idées se répondent.
        </p>

        <ul className="boot" aria-hidden="true">
          {BOOT_LABELS.map(([index, label], position) => (
            <li key={index} style={{ animationDelay: `${0.15 + position * 0.12}s` }}>
              <span>{index}</span>
              <span>{label}</span>
              <span className="boot__dots" />
              <span>{states[position]}</span>
            </li>
          ))}
        </ul>

        <div className="intro__actions">
          <button type="button" className="btn btn--primary" onClick={finishIntro}>
            {sceneReady ? 'Entrer dans la pièce' : 'Entrer pendant le chargement'}
          </button>
        </div>

        <p className="intro__note">
          Navigation : balayage tactile, molette ou plan accessible à tout moment · son désactivé par
          défaut.
        </p>
      </div>
    </div>
  )
}
