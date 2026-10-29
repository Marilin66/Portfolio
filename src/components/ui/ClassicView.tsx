import { useEffect } from 'react'
import {
  certifications,
  engagement,
  experiences,
  isPending,
  languages,
  linkedinHref,
  phoneHref,
  profile,
  projects,
  realValue,
  timeline,
} from '../../data/selectors'
import { hasWebGL } from '../../lib/device'
import { CHAPTERS, type ChapterId } from '../../experience/chapters'
import { useExperience } from '../../store/useExperience'

/** Correspondance entre un chapitre 3D et une section de la version 2D. */
const SECTION_BY_CHAPTER: Record<ChapterId, string> = {
  bienvenue: 'profil',
  about: 'profil',
  parcours: 'parcours',
  skills: 'competences',
  projects: 'projets',
  experiences: 'experiences',
  certifications: 'certifications',
  engagement: 'engagement',
  ambitions: 'ambitions',
  contact: 'contact',
}

/**
 * Version 2D : même contenu, aucune 3D.
 * Accessible par choix (/classique), sur appareil sans WebGL, ou en cas de
 * préférence pour une lecture sobre.
 */
export function ClassicView({ onEnter3D }: { onEnter3D: () => void }) {
  const chapter = useExperience((state) => state.chapter)

  useEffect(() => {
    // On arrive au bon endroit : la version 2D reprend le chapitre en cours.
    const id = SECTION_BY_CHAPTER[CHAPTERS[chapter]?.id ?? 'bienvenue']
    const section = id ? document.getElementById(id) : null
    if (section) section.scrollIntoView({ block: 'start' })
    else window.scrollTo({ top: 0 })
  }, [chapter])

  const email = realValue(profile.identity.email)
  const phone = realValue(profile.identity.phone)
  const linkedin = realValue(profile.identity.linkedin)
  const photo = profile.photo.src

  return (
    <div className="classic">
      <div className="classic__wrap">
        <header className="classic__head">
          <div>
            <span className="eyebrow">Le monde de Marilin</span>
            <h1>{profile.identity.name}</h1>
            <p className="classic__role">{profile.identity.role}</p>
            <p className="classic__meta">{profile.identity.origin}</p>
          </div>
          <div className="classic__actions">
            {hasWebGL() && (
              <button type="button" className="btn btn--ghost" onClick={onEnter3D}>
                Expérience 3D
              </button>
            )}
            <a className="btn btn--ghost" href={profile.identity.github} target="_blank" rel="noreferrer">
              GitHub ↗
            </a>
          </div>
        </header>

        <main>
          <section id="profil">
            <span className="classic__num">01</span>
            <div>
              <h2>Profil</h2>
              <p className="classic__lede">{profile.meta.welcome}.</p>
              <p>{profile.intro.about}</p>
              <blockquote>
                <span className="eyebrow">Ce qui me fait avancer</span>
                <p>{profile.intro.motivation}</p>
              </blockquote>

              {profile.aboutChapters.map((chapter) => (
                <article key={chapter.id} className="classic__story">
                  <h3>{chapter.title}</h3>
                  <p>{chapter.body}</p>
                </article>
              ))}

              {photo ? (
                <div className="classic__portrait">
                  <img className="classic__portrait-img" src={photo} alt={`Portrait de ${profile.identity.name}`} />
                  <span className="muted">Portrait</span>
                </div>
              ) : (
                <div className="classic__portrait">
                  <span className="classic__portrait-mark">MB</span>
                  <span className="muted">Photo à fournir</span>
                </div>
              )}

              <h3>Langues</h3>
              <ul className="classic__list">
                {languages.map((language) => {
                  const level = realValue(language.level)
                  return (
                    <li key={language.id}>
                      <span className="classic__year">{language.name}</span>
                      <span className={level ? '' : 'muted'}>{level ?? 'Niveau à préciser'}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </section>

          <section id="parcours">
            <span className="classic__num">02</span>
            <div>
              <h2>Parcours</h2>
              <ul className="classic__list">
                {timeline.map((entry) => (
                  <li key={entry.id}>
                    <span className="classic__year">{entry.year}</span>
                    <span>
                      <strong>{entry.label}</strong>
                      <span className="classic__sub">{entry.place}</span>
                      {!isPending(entry.note) && <span className="classic__sub">{entry.note}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section id="competences">
            <span className="classic__num">03</span>
            <div>
              <h2>Compétences</h2>
              <h3>Développement logiciel</h3>
              <p className="classic__inline">{profile.skills.development.join(' · ')}</p>
              <h3>Électricité et systèmes</h3>
              <p className="classic__inline">{profile.skills.systems.join(' · ')}</p>
            </div>
          </section>

          <section id="projets">
            <span className="classic__num">04</span>
            <div>
              <h2>Projets</h2>
              {projects.map((project) => (
                <article key={project.id} className="classic__project">
                  <div className="card__top">
                    <span className="eyebrow">{project.kind}</span>
                    <span className={`badge${project.source === 'GitHub' ? ' badge--github' : ''}`}>
                      {project.source}
                    </span>
                  </div>
                  <h3>{project.name}</h3>
                  <p>{project.summary}</p>
                  {!isPending(project.role) && <p className="classic__sub">{project.role}</p>}
                  <p className="classic__inline">{project.stack.join(' · ')}</p>
                  <p className="links">
                    {project.demo.startsWith('http') && (
                      <a href={project.demo} target="_blank" rel="noreferrer">
                        Démo ↗
                      </a>
                    )}
                    {project.repo.startsWith('http') && (
                      <a href={project.repo} target="_blank" rel="noreferrer">
                        Code ↗
                      </a>
                    )}
                    {!project.demo.startsWith('http') && !project.repo.startsWith('http') && (
                      <span className="muted">Liens à compléter</span>
                    )}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section id="experiences">
            <span className="classic__num">05</span>
            <div>
              <h2>Expériences</h2>
              <ul className="classic__list">
                {experiences.map((experience) => {
                  const place = realValue(experience.place)
                  return (
                    <li key={experience.id}>
                      <span className="classic__year">{experience.period}</span>
                      <span>
                        <strong>{experience.org}</strong>
                        <span className="classic__sub">{experience.role}</span>
                        <span className="classic__sub">
                          {isPending(experience.detail) ? 'Détails à venir.' : experience.detail}
                        </span>
                        {place && <span className="classic__sub">Lieu : {place}</span>}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </section>

          <section id="certifications">
            <span className="classic__num">06</span>
            <div>
              <h2>Certifications</h2>
              <ul className="classic__list">
                {certifications.map((certification) => (
                  <li key={certification.id}>
                    <span className="classic__year">{certification.year}</span>
                    <span>
                      <strong>{certification.name}</strong>
                      <span className="classic__sub">{certification.issuer}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section id="engagement">
            <span className="classic__num">07</span>
            <div>
              <h2>Engagement</h2>
              <ul className="classic__list">
                {engagement.map((item) => (
                  <li key={item.id}>
                    <span className="classic__year">—</span>
                    <span>
                      <strong>{item.name}</strong>
                      <span className="classic__sub">{item.role}</span>
                      <span className="classic__sub">
                        {isPending(item.detail) ? 'Détails à venir.' : item.detail}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section id="ambitions">
            <span className="classic__num">08</span>
            <div>
              <h2>Ambitions</h2>
              <ul className="classic__list">
                {profile.ambitions.map((ambition, index) => (
                  <li key={ambition}>
                    <span className="classic__year">{String(index + 1).padStart(2, '0')}</span>
                    <span>{ambition}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section id="contact">
            <span className="classic__num">09</span>
            <div>
              <h2>Contact</h2>
              <ul className="classic__list">
                <li>
                  <span className="classic__year">GitHub</span>
                  <a href={profile.identity.github} target="_blank" rel="noreferrer">
                    github.com/marilin66 ↗
                  </a>
                </li>
                <li>
                  <span className="classic__year">E-mail</span>
                  {email ? <a href={`mailto:${email}`}>{email}</a> : <span className="muted">À fournir</span>}
                </li>
                <li>
                  <span className="classic__year">Téléphone</span>
                  {phone ? <a href={phoneHref(phone)}>{phone}</a> : <span className="muted">À fournir</span>}
                </li>
                <li>
                  <span className="classic__year">LinkedIn</span>
                  {linkedin ? (
                    <a href={linkedinHref(linkedin)} target="_blank" rel="noreferrer">
                      Profil ↗
                    </a>
                  ) : (
                    <span className="muted">À fournir</span>
                  )}
                </li>
              </ul>
              {email && (
                <p className="links">
                  <a className="btn btn--primary" href={`mailto:${email}`}>
                    Écrire un message
                  </a>
                </p>
              )}
            </div>
          </section>
        </main>

        <footer className="classic__foot">
          <span>
            {profile.identity.name} — {new Date().getFullYear()}
          </span>
          <span className="muted">Version sobre, sans 3D</span>
        </footer>
      </div>
    </div>
  )
}
