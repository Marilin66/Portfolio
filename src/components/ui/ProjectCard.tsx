import { isPending, realLink } from '../../data/selectors'
import type { Project } from '../../data/schema'

/**
 * Carte de projet, partagée par le panneau de la pièce et la vue classique.
 * Règle unique : un lien n'apparaît actif que s'il a été renseigné et
 * vérifié ; sinon la mention « À COMPLÉTER » remplace le bouton.
 */
export function ProjectCard({
  project,
  onShowInScene,
}: {
  project: Project
  onShowInScene?: () => void
}) {
  const repo = realLink(project.repo)
  const demo = realLink(project.demo)
  const role = isPending(project.role) ? null : project.role

  return (
    <article className="project-card">
      <header className="project-card__head">
        <span className="tag tag--soft">{project.kind}</span>
        <span className={`tag${project.source === 'GitHub' ? ' tag--source' : ''}`}>{project.source}</span>
      </header>

      <h3 className="project-card__title">{project.name}</h3>
      <p className="project-card__summary">{project.summary}</p>
      {role && (
        <p className="project-card__role">
          <span className="project-card__role-label">Rôle</span>
          {role}
        </p>
      )}

      <ul className="chips" aria-label={`Technologies de ${project.name}`}>
        {project.stack.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <div className="project-card__actions">
        {repo ? (
          <a className="btn btn--secondary btn--sm" href={repo} target="_blank" rel="noreferrer">
            Code <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <span className="btn btn--pending btn--sm" aria-disabled="true">
            Code · À COMPLÉTER
          </span>
        )}

        {demo ? (
          <a className="btn btn--primary btn--sm" href={demo} target="_blank" rel="noreferrer">
            Démo <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <span className="btn btn--pending btn--sm" aria-disabled="true">
            Démo · À COMPLÉTER
          </span>
        )}

        {onShowInScene && (
          <button type="button" className="link-btn" onClick={onShowInScene}>
            Voir dans la pièce
          </button>
        )}
      </div>

      {project.linkNote && <p className="project-card__note">{project.linkNote}</p>}
    </article>
  )
}
