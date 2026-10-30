import { chapterIndexById } from '../../experience/chapters'
import { contactLinks, hero, phoneHref, profile } from '../../data/selectors'
import { useExperience } from '../../store/useExperience'
import { scrollToChapter } from '../../lib/scroll'
import { playTick } from '../../lib/audio'
import { switchToClassic } from '../../lib/routes'

/**
 * Premier écran : une couche de texte posée sur la pièce 3D.
 * Tout ce qui identifie Marilin et permet d'agir est lisible sans défiler,
 * sans survol et sans attendre une animation. La 3D reste le décor.
 */
export function Hero() {
  const chapter = useExperience((state) => state.chapter)
  const introDone = useExperience((state) => state.introDone)
  const reduced = useExperience((state) => state.reduced)
  const setMapOpen = useExperience((state) => state.setMapOpen)

  if (chapter !== 0 || !introDone) return null

  const goTo = (id: 'projects' | 'contact' | 'pourquoi') => {
    playTick('navigate')
    scrollToChapter(chapterIndexById(id), reduced)
  }

  return (
    <section className="hero" aria-labelledby="hero-name">
      <div className="hero__panel">
        <p className="eyebrow hero__eyebrow">
          <span>{profile.identity.origin}</span>
          <span className="hero__dot" aria-hidden="true" />
          <span>Génie électrique &amp; informatique</span>
        </p>

        <h1 className="hero__name" id="hero-name">
          {profile.identity.name}
        </h1>

        <p className="hero__title">{hero.title}</p>
        <p className="hero__value">{hero.valueProp}</p>

        <div className="hero__actions">
          <button type="button" className="btn btn--primary btn--lg" onClick={() => goTo('projects')}>
            {hero.ctaPrimary}
            <span aria-hidden="true">→</span>
          </button>
          <button type="button" className="btn btn--secondary btn--lg" onClick={() => goTo('contact')}>
            {hero.ctaSecondary}
          </button>
        </div>

        <ul className="contact-strip" aria-label="Coordonnées">
          <li>
            <a className="contact-strip__link" href={contactLinks.github} target="_blank" rel="noreferrer">
              <span className="contact-strip__label">GitHub</span>
              <span className="contact-strip__value">marilin66 ↗</span>
            </a>
          </li>
          {contactLinks.email ? (
            <li>
              <a className="contact-strip__link" href={`mailto:${contactLinks.email}`}>
                <span className="contact-strip__label">E-mail</span>
                <span className="contact-strip__value">{contactLinks.email}</span>
              </a>
            </li>
          ) : (
            <li className="contact-strip__pending">
              <span className="contact-strip__label">E-mail</span>
              <span className="contact-strip__value">À COMPLÉTER</span>
            </li>
          )}
          {contactLinks.phone ? (
            <li>
              <a className="contact-strip__link" href={phoneHref(contactLinks.phone)}>
                <span className="contact-strip__label">Téléphone</span>
                <span className="contact-strip__value">{contactLinks.phone}</span>
              </a>
            </li>
          ) : (
            <li className="contact-strip__pending">
              <span className="contact-strip__label">Téléphone</span>
              <span className="contact-strip__value">À COMPLÉTER</span>
            </li>
          )}
          {contactLinks.linkedin ? (
            <li>
              <a className="contact-strip__link" href={contactLinks.linkedin} target="_blank" rel="noreferrer">
                <span className="contact-strip__label">LinkedIn</span>
                <span className="contact-strip__value">Profil ↗</span>
              </a>
            </li>
          ) : (
            <li className="contact-strip__pending">
              <span className="contact-strip__label">LinkedIn</span>
              <span className="contact-strip__value">À COMPLÉTER</span>
            </li>
          )}
        </ul>

        <div className="hero__next">
          <button type="button" className="hero__why" onClick={() => goTo('pourquoi')}>
            Pourquoi me choisir
            <span aria-hidden="true">↓</span>
          </button>
          <p className="hero__hint">
            <span className="hint__keys" aria-hidden="true">↕</span>
            {hero.hint}
          </p>
        </div>

        <div className="hero__foot">
          <button type="button" className="link-btn" onClick={() => setMapOpen(true)}>
            Plan de la pièce
          </button>
          <span className="hero__foot-sep" aria-hidden="true">
            ·
          </span>
          <button type="button" className="link-btn" onClick={switchToClassic}>
            Vue classique, sans 3D
          </button>
        </div>
      </div>
    </section>
  )
}
