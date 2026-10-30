import { useEffect, useRef } from 'react'
import { hero, profile } from '../../data/selectors'
import { useExperience } from '../../store/useExperience'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { switchToClassic } from '../../lib/routes'

/**
 * Carton d'ouverture, très court : il donne le ton du jeu sans retarder
 * l'information. Il se referme seul après deux secondes et demie, et reste
 * traversable à tout moment (« Passer l'intro »).
 */
export function Intro() {
  const introDone = useExperience((state) => state.introDone)
  const sceneReady = useExperience((state) => state.sceneReady)
  const reduced = useExperience((state) => state.reduced)
  const finishIntro = useExperience((state) => state.finishIntro)
  const innerRef = useRef<HTMLDivElement>(null)

  useFocusTrap(!introDone, innerRef)

  useEffect(() => {
    if (introDone) return
    const timer = window.setTimeout(finishIntro, reduced ? 900 : 2600)
    return () => window.clearTimeout(timer)
  }, [introDone, reduced, finishIntro])

  if (introDone) return null

  return (
    <div
      className="intro"
      role="dialog"
      aria-modal="true"
      aria-label="Introduction"
      aria-describedby="intro-message"
    >
      <div className="intro__inner" ref={innerRef}>
        <p className="eyebrow intro__eyebrow">
          {profile.meta.siteTitle} · {profile.identity.origin}
        </p>

        <h1 className="intro__title" id="intro-message">
          <span className="intro__line intro__line--soft">Bienvenue dans le monde de</span>
          <span className="intro__line">Marilin,</span>
          <span className="intro__line intro__line--accent">développeur créatif</span>
        </h1>

        <p className="intro__role">{hero.title}</p>
        <p className="intro__value">{hero.valueProp}</p>

        <div className="intro__actions">
          <button type="button" className="btn btn--primary" onClick={finishIntro}>
            Entrer maintenant
          </button>
          <button type="button" className="btn btn--ghost" onClick={finishIntro}>
            Passer l'intro
          </button>
        </div>

        <div className="intro__foot">
          <span className="status" aria-live="polite">
            <span className={`status__dot${sceneReady ? ' is-ready' : ''}`} aria-hidden="true" />
            {sceneReady ? 'Pièce prête' : 'Préparation de la pièce…'}
          </span>
          <button type="button" className="link-btn" onClick={switchToClassic}>
            Vue classique, sans 3D
          </button>
        </div>
      </div>
    </div>
  )
}
