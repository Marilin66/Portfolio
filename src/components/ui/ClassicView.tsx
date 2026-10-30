import {
  certifications,
  contactLinks,
  engagement,
  experiences,
  hero,
  languages,
  pendingFields,
  profile,
  projects,
  realValue,
  timeline,
  whyChoose,
} from '../../data/selectors'
import { ProjectCard } from './ProjectCard'
import { switchTo3D } from '../../lib/routes'

/**
 * Version classique : la même information, sans WebGL, sans caméra et sans
 * animation. C'est la vue de secours (appareil modeste, préférence pour
 * moins de mouvement, lecteur d'écran, impression) et l'équivalent strict
 * de la navigation dans la pièce.
 */
export function ClassicView() {
  return (
    <div className="classic">
      <a className="skip-link" href="#classique-contenu">
        Aller au contenu
      </a>

      <main id="classique-contenu">
        <section className="classic-hero" aria-labelledby="classique-nom">
          <div className="classic-hero__text">
            <p className="eyebrow">
              {profile.identity.origin} · Génie électrique &amp; informatique
            </p>
            <button type="button" className="link-btn classic-hero__back" onClick={switchTo3D}>
              Version 3D
            </button>
            <h1 id="classique-nom">{profile.identity.name}</h1>
            <p className="classic-hero__title">{hero.title}</p>
            <p className="classic-hero__value">{hero.valueProp}</p>
            <div className="classic-hero__actions">
              <a className="btn btn--primary btn--lg" href="#classique-projets">
                Voir les projets <span aria-hidden="true">→</span>
              </a>
              <a className="btn btn--secondary btn--lg" href="#classique-contact">
                Me contacter
              </a>
            </div>
            <ul className="contact-strip" aria-label="Coordonnées">
              <li>
                <a className="contact-strip__link" href={contactLinks.github} target="_blank" rel="noreferrer">
                  <span className="contact-strip__label">GitHub</span>
                  <span className="contact-strip__value">marilin66 ↗</span>
                </a>
              </li>
              <li className={contactLinks.email ? '' : 'contact-strip__pending'}>
                {contactLinks.email ? (
                  <a className="contact-strip__link" href={`mailto:${contactLinks.email}`}>
                    <span className="contact-strip__label">E-mail</span>
                    <span className="contact-strip__value">{contactLinks.email}</span>
                  </a>
                ) : (
                  <>
                    <span className="contact-strip__label">E-mail</span>
                    <span className="contact-strip__value">À COMPLÉTER</span>
                  </>
                )}
              </li>
              <li className={contactLinks.linkedin ? '' : 'contact-strip__pending'}>
                {contactLinks.linkedin ? (
                  <a className="contact-strip__link" href={contactLinks.linkedin} target="_blank" rel="noreferrer">
                    <span className="contact-strip__label">LinkedIn</span>
                    <span className="contact-strip__value">Profil ↗</span>
                  </a>
                ) : (
                  <>
                    <span className="contact-strip__label">LinkedIn</span>
                    <span className="contact-strip__value">À COMPLÉTER</span>
                  </>
                )}
              </li>
            </ul>
          </div>

          <figure className="classic-hero__figure">
            <img src={profile.photo.src} alt={`Portrait de ${profile.identity.name}`} />
            <figcaption>{profile.photo.note}</figcaption>
          </figure>
        </section>

        <section className="band" id="classique-pourquoi" aria-labelledby="titre-pourquoi">
          <div className="shell">
            <header className="section-head">
              <p className="eyebrow">Profil</p>
              <h2 id="titre-pourquoi">{whyChoose.title}</h2>
              <p className="lede">{whyChoose.lede}</p>
            </header>
            <ul className="why-grid">
              {whyChoose.items.map((item, index) => (
                <li key={item.id} className="why-card">
                  <span className="why-card__index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="tag tag--soft">{item.proof}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="band band--soft" id="classique-profil" aria-labelledby="titre-profil">
          <div className="shell">
            <header className="section-head">
              <p className="eyebrow">Qui suis-je</p>
              <h2 id="titre-profil">Un parcours, plusieurs étapes</h2>
              <p className="lede">{profile.intro.about}</p>
            </header>
            <div className="story-grid">
              {profile.aboutChapters.map((chapter, index) => (
                <article key={chapter.id} className="story-card">
                  <span className="story-card__num">{String(index + 1).padStart(2, '0')}</span>
                  <h3>{chapter.title}</h3>
                  <p>{chapter.body}</p>
                </article>
              ))}
            </div>
            <div className="fact-row">
              <div className="fact">
                <span className="fact__label">Motivation</span>
                <p>{profile.intro.motivation}</p>
              </div>
              <div className="fact">
                <span className="fact__label">Langues</span>
                <ul className="plain">
                  {languages.map((language) => (
                    <li key={language.id}>
                      <span>{language.name}</span>
                      <span className={realValue(language.level) ? '' : 'is-pending'}>
                        {realValue(language.level) ?? 'À COMPLÉTER'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="band" id="classique-projets" aria-labelledby="titre-projets">
          <div className="shell">
            <header className="section-head">
              <p className="eyebrow">Projets</p>
              <h2 id="titre-projets">Des réalisations consultables</h2>
              <p className="lede">
                Les liens « Code » mènent au dépôt GitHub, les liens « Démo » à l'application en
                ligne. Les liens manquants restent marqués « À COMPLÉTER ».
              </p>
            </header>
            <div className="project-grid">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </section>

        <section className="band band--soft" id="classique-parcours" aria-labelledby="titre-parcours">
          <div className="shell two-col">
            <div>
              <header className="section-head section-head--left">
                <p className="eyebrow">Parcours</p>
                <h2 id="titre-parcours">Formation</h2>
              </header>
              <ol className="timeline">
                {timeline.map((entry) => (
                  <li key={entry.id}>
                    <span className="timeline__year">{entry.year}</span>
                    <div>
                      <strong>{entry.label}</strong>
                      <span className="timeline__place">{entry.place}</span>
                      <p className="note">{entry.note}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <header className="section-head section-head--left">
                <p className="eyebrow">Compétences</p>
                <h2>Outils et pratique</h2>
              </header>
              <div className="skill-block">
                <h3>Développement logiciel</h3>
                <ul className="chips">
                  {profile.skills.development.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="skill-block">
                <h3>Électricité et systèmes</h3>
                <ul className="chips">
                  {profile.skills.systems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="band" id="classique-experiences" aria-labelledby="titre-experiences">
          <div className="shell">
            <header className="section-head">
              <p className="eyebrow">Expériences</p>
              <h2 id="titre-experiences">Terrain et stages</h2>
            </header>
            <ul className="exp-grid">
              {experiences.map((experience) => (
                <li key={experience.id} className="exp-card">
                  <span className="exp-card__period">{experience.period}</span>
                  <h3>{experience.org}</h3>
                  <p className="exp-card__role">{experience.role}</p>
                  <p className="note">
                    Lieu : {realValue(experience.place) ?? 'À COMPLÉTER'}
                    <br />
                    Missions : {realValue(experience.detail) ?? 'À COMPLÉTER'}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="band band--soft" id="classique-certifications" aria-labelledby="titre-certs">
          <div className="shell two-col">
            <div>
              <header className="section-head section-head--left">
                <p className="eyebrow">Certifications</p>
                <h2 id="titre-certs">YALI, 2025</h2>
              </header>
              <ul className="plain plain--bordered">
                {certifications.map((certification) => (
                  <li key={certification.id}>
                    <span>{certification.name}</span>
                    <span className="note">{certification.issuer}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <header className="section-head section-head--left">
                <p className="eyebrow">Engagement</p>
                <h2>Culture et collectif</h2>
              </header>
              <ul className="plain plain--bordered">
                {engagement.map((item) => (
                  <li key={item.id}>
                    <span>
                      <strong>{item.name}</strong>
                      <br />
                      {item.role}
                    </span>
                    <span className="note">
                      {realValue(item.detail) ?? 'Détail à compléter'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="band" id="classique-ambitions" aria-labelledby="titre-ambitions">
          <div className="shell">
            <header className="section-head">
              <p className="eyebrow">Ambitions</p>
              <h2 id="titre-ambitions">La direction donnée au travail</h2>
            </header>
            <ol className="ambitions ambitions--wide">
              {profile.ambitions.map((ambition, index) => (
                <li key={ambition}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {ambition}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="band band--contact" id="classique-contact" aria-labelledby="titre-contact">
          <div className="shell contact-band">
            <div>
              <p className="eyebrow">Contact</p>
              <h2 id="titre-contact">Prendre contact</h2>
              <p className="lede">
                Un projet, un stage, une collaboration : la réponse passe par l'un de ces canaux.
              </p>
            </div>
            <ul className="contact-list">
              <li>
                <span className="contact-list__label">GitHub</span>
                <a href={contactLinks.github} target="_blank" rel="noreferrer">
                  github.com/marilin66 ↗
                </a>
              </li>
              <li>
                <span className="contact-list__label">E-mail</span>
                {contactLinks.email ? (
                  <a href={`mailto:${contactLinks.email}`}>{contactLinks.email}</a>
                ) : (
                  <span className="is-pending">À COMPLÉTER</span>
                )}
              </li>
              <li>
                <span className="contact-list__label">Téléphone</span>
                {contactLinks.phone ? (
                  <a href={`tel:${contactLinks.phone.replace(/[^+\d]/g, '')}`}>{contactLinks.phone}</a>
                ) : (
                  <span className="is-pending">À COMPLÉTER</span>
                )}
              </li>
              <li>
                <span className="contact-list__label">LinkedIn</span>
                {contactLinks.linkedin ? (
                  <a href={contactLinks.linkedin} target="_blank" rel="noreferrer">
                    Profil ↗
                  </a>
                ) : (
                  <span className="is-pending">À COMPLÉTER</span>
                )}
              </li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="classic-foot">
        <div className="shell">
          <p>
            {profile.identity.name} — {hero.title}
          </p>
          <details>
            <summary>Champs à compléter</summary>
            <ul>
              {pendingFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </details>
          <button type="button" className="link-btn" onClick={switchTo3D}>
            Revenir à la pièce 3D
          </button>
        </div>
      </footer>
    </div>
  )
}
