import { ANCHORS, focusTargetFor } from '../../experience/anchors'
import { CHAPTERS, chapterIndexById } from '../../experience/chapters'
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
import { useExperience } from '../../store/useExperience'
import { playTick } from '../../lib/audio'
import { scrollToChapter } from '../../lib/scroll'

/** Cadre la caméra sur une zone de la pièce depuis une ligne de texte. */
function openInScene(id: string): void {
  const anchor = ANCHORS[id]
  const target = focusTargetFor(id)
  if (!anchor || !target) return
  const state = useExperience.getState()
  state.setChapter(chapterIndexById(anchor.chapter))
  state.select(target)
  playTick('select')
}

function Item({
  id,
  target,
  index,
  title,
  subtitle,
  detail,
}: {
  id: string
  target: string
  index: string
  title: string
  subtitle: string
  detail?: string
}) {
  const selected = useExperience((state) => state.selectedId === target)
  const hovered = useExperience((state) => state.hoverId === target)
  const hover = useExperience((state) => state.hover)
  const closeSelection = useExperience((state) => state.closeSelection)

  return (
    <li className={`item${selected ? ' is-open' : ''}${hovered ? ' is-hot' : ''}`}>
      <button
        type="button"
        className="item__button"
        aria-expanded={selected}
        onMouseEnter={() => hover(target)}
        onMouseLeave={() => hover(null)}
        onFocus={() => hover(target)}
        onBlur={() => hover(null)}
        onClick={() => {
          if (selected) closeSelection()
          else openInScene(target)
        }}
        aria-label={`${title} — afficher dans la pièce`}
        data-item={id}
      >
        <span className="item__index">{index}</span>
        <span className="item__main">
          <strong>{title}</strong>
          <span>{subtitle}</span>
        </span>
        <span className="item__mark" aria-hidden="true">
          {selected ? '−' : '+'}
        </span>
      </button>
      {selected && detail && <p className="item__detail">{detail}</p>}
    </li>
  )
}

function SkillGroup({ title, note, items }: { title: string; note: string; items: readonly string[] }) {
  const target = 'zone-skills'
  const selected = useExperience((state) => state.selectedId === target)
  const hover = useExperience((state) => state.hover)
  const hovered = useExperience((state) => state.hoverId === target)
  const closeSelection = useExperience((state) => state.closeSelection)

  return (
    <div
      className={`group${selected || hovered ? ' is-hot' : ''}`}
      onMouseEnter={() => hover(target)}
      onMouseLeave={() => hover(null)}
    >
      <button
        type="button"
        className="group__head"
        onClick={() => (selected ? closeSelection() : openInScene(target))}
        aria-expanded={selected}
      >
        <span>
          <strong>{title}</strong>
          <span>{note}</span>
        </span>
        <span className="group__focus" aria-hidden="true">
          {selected ? 'Vue d’ensemble' : 'Voir sur l’établi'}
        </span>
      </button>
      <div className="chips">
        {items.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  )
}

function BienvenueContent() {
  const reduced = useExperience((state) => state.reduced)

  return (
    <>
      <p className="lede">{profile.meta.welcome}</p>
      <p>{profile.intro.about}</p>
      <div className="quote">
        <span className="eyebrow">Ce qui me fait avancer</span>
        <p>{profile.intro.motivation}</p>
      </div>
      <dl className="facts">
        <div>
          <dt>Origine</dt>
          <dd>{profile.identity.origin}</dd>
        </div>
        <div>
          <dt>Rôle</dt>
          <dd>{profile.identity.role}</dd>
        </div>
        <div>
          <dt>GitHub</dt>
          <dd>
            <a href={profile.identity.github} target="_blank" rel="noreferrer">
              marilin66 ↗
            </a>
          </dd>
        </div>
      </dl>
      <button
        type="button"
        className="cta"
        onClick={() => {
          playTick('navigate')
          scrollToChapter(1, reduced)
        }}
      >
        <span>Entrer dans la pièce</span>
        <span aria-hidden="true">↓</span>
      </button>
      <div className="section">
        <span className="eyebrow">Les zones de la pièce</span>
        <div className="zones">
          {CHAPTERS.slice(1).map((chapter, index) => (
            <button
              key={chapter.id}
              type="button"
              onClick={() => {
                playTick('navigate')
                scrollToChapter(index + 1, reduced)
              }}
            >
              <span>{chapter.index}</span>
              {chapter.title}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

function AboutContent() {
  const photo = profile.photo.src

  return (
    <>
      <div className="portrait">
        <div className="portrait__frame" aria-hidden={photo ? undefined : 'true'}>
          {photo ? (
            <img src={photo} alt={`Portrait de ${profile.identity.name}`} />
          ) : (
            <span>MB</span>
          )}
        </div>
        <div className="portrait__meta">
          <span className="eyebrow">Portrait</span>
          <p className="muted">{photo ? 'Marilin BADJI' : 'Photo à fournir'}</p>
          {!photo && <p className="note">{profile.photo.note}</p>}
        </div>
      </div>

      {profile.aboutChapters.map((chapter, index) => (
        <article key={chapter.id} className="story">
          <span className="story__num">{String(index + 1).padStart(2, '0')}</span>
          <div>
            <h3>{chapter.title}</h3>
            <p>{chapter.body}</p>
          </div>
        </article>
      ))}

      <div className="section">
        <span className="eyebrow">Langues</span>
        <ul className="plain">
          {languages.map((language) => {
            const level = realValue(language.level)
            return (
              <li key={language.id}>
                <span>{language.name}</span>
                <span className={level ? '' : 'muted'}>{level ?? 'Niveau à préciser'}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}

function ParcoursContent() {
  return (
    <>
      <p className="lede">De 2016 à l'enseignement supérieur, une ligne continue.</p>
      <ul className="items">
        {timeline.map((entry) => (
          <Item
            key={entry.id}
            id={entry.id}
            target="zone-parcours"
            index={entry.year}
            title={entry.label}
            subtitle={entry.place}
            detail={isPending(entry.note) ? undefined : entry.note}
          />
        ))}
      </ul>
      <p className="note">Les étapes sont posées sur la bibliothèque, à gauche de la pièce.</p>
    </>
  )
}

function SkillsContent() {
  return (
    <>
      <p className="lede">Un socle matériel, une pratique logicielle.</p>
      <SkillGroup
        title="Développement logiciel"
        note="Langages, frameworks, architecture"
        items={profile.skills.development}
      />
      <SkillGroup
        title="Électricité et systèmes"
        note="Terrain, maintenance, conception"
        items={profile.skills.systems}
      />
    </>
  )
}

function ProjectsContent() {
  const hover = useExperience((state) => state.hover)

  return (
    <>
      <p className="lede">
        {projects.length} projets, deux sources : mon dossier et mon GitHub.
      </p>
      {projects.map((project) => (
        <article
          key={project.id}
          className="card"
          onMouseEnter={() => hover('zone-projects')}
          onMouseLeave={() => hover(null)}
        >
          <div className="card__top">
            <span className="eyebrow">{project.kind}</span>
            <span className={`badge${project.source === 'GitHub' ? ' badge--github' : ''}`}>
              {project.source}
            </span>
          </div>
          <h3>{project.name}</h3>
          <p>{project.summary}</p>
          {!isPending(project.role) && <p className="role">{project.role}</p>}
          <div className="chips">
            {project.stack.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="links">
            {project.demo.startsWith('http') ? (
              <a href={project.demo} target="_blank" rel="noreferrer">
                Démo ↗
              </a>
            ) : (
              <span className="muted">Démo à venir</span>
            )}
            {project.repo.startsWith('http') ? (
              <a href={project.repo} target="_blank" rel="noreferrer">
                Code ↗
              </a>
            ) : (
              <span className="muted">Dépôt à venir</span>
            )}
            <button type="button" className="linklike" onClick={() => openInScene('zone-projects')}>
              Voir dans la pièce
            </button>
          </div>
        </article>
      ))}
      <p className="note">
        Les aperçus affichés sur les écrans du bureau sont des illustrations abstraites, pas des
        captures d'écran.
      </p>
    </>
  )
}

function ExperiencesContent() {
  return (
    <>
      <p className="lede">Un câble par expérience, du chantier au système.</p>
      <ul className="items">
        {experiences.map((experience) => {
          const place = realValue(experience.place)
          const detail = isPending(experience.detail) ? 'Détails à venir.' : experience.detail
          return (
            <Item
              key={experience.id}
              id={experience.id}
              target="zone-experience"
              index={experience.period}
              title={experience.org}
              subtitle={experience.role}
              detail={place ? `${detail} Lieu : ${place}` : detail}
            />
          )
        })}
      </ul>
    </>
  )
}

function CertificationsContent() {
  return (
    <>
      <p className="lede">
        {certifications.length} certificats YALI, posés sur l'étagère.
      </p>
      <ul className="items">
        {certifications.map((certification, index) => (
          <Item
            key={certification.id}
            id={certification.id}
            target="zone-certifications"
            index={String(index + 1).padStart(2, '0')}
            title={certification.name}
            subtitle={`${certification.issuer} · ${certification.year}`}
          />
        ))}
      </ul>
    </>
  )
}

function EngagementContent() {
  return (
    <>
      <p className="lede">La technique, mais aussi la culture et le collectif.</p>
      <ul className="items">
        {engagement.map((item) => (
          <Item
            key={item.id}
            id={item.id}
            target="zone-engagement"
            index="—"
            title={item.name}
            subtitle={item.role}
            detail={isPending(item.detail) ? 'Détails à venir.' : item.detail}
          />
        ))}
      </ul>
      <p className="note">
        Le coin culture rassemble la platine, les affiches et les objets de l'engagement associatif.
      </p>
    </>
  )
}

function AmbitionsContent() {
  return (
    <>
      <p className="lede">Que le travail parle pour lui.</p>
      <ol className="ambitions">
        {profile.ambitions.map((ambition, index) => (
          <li key={ambition}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            {ambition}
          </li>
        ))}
      </ol>
      <p className="note">
        La fenêtre reste ouverte : c'est par là que la lumière entre, et par là que la suite se
        dessine.
      </p>
    </>
  )
}

function ContactContent() {
  const email = realValue(profile.identity.email)
  const phone = realValue(profile.identity.phone)
  const linkedin = realValue(profile.identity.linkedin)

  return (
    <>
      <p className="lede">La porte est ouverte.</p>
      <ul className="plain">
        <li>
          <span>GitHub</span>
          <a href={profile.identity.github} target="_blank" rel="noreferrer">
            github.com/marilin66 ↗
          </a>
        </li>
        <li>
          <span>E-mail</span>
          {email ? (
            <a href={`mailto:${email}`}>{email}</a>
          ) : (
            <span className="muted">À fournir</span>
          )}
        </li>
        <li>
          <span>Téléphone</span>
          {phone ? (
            <a href={phoneHref(phone)}>{phone}</a>
          ) : (
            <span className="muted">À fournir</span>
          )}
        </li>
        <li>
          <span>LinkedIn</span>
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
        <a className="cta" href={`mailto:${email}`}>
          <span>Écrire un message</span>
          <span aria-hidden="true">↗</span>
        </a>
      )}
      <a className="cta" href={profile.identity.github} target="_blank" rel="noreferrer">
        <span>Ouvrir mon GitHub</span>
        <span aria-hidden="true">↗</span>
      </a>
      {(!email || !phone || !linkedin) && (
        <p className="note">
          Certaines coordonnées seront ajoutées dès qu'elles seront fournies.
        </p>
      )}
    </>
  )
}

function ChapterBody({ index }: { index: number }) {
  switch (CHAPTERS[index]?.id) {
    case 'about':
      return <AboutContent />
    case 'parcours':
      return <ParcoursContent />
    case 'skills':
      return <SkillsContent />
    case 'projects':
      return <ProjectsContent />
    case 'experiences':
      return <ExperiencesContent />
    case 'certifications':
      return <CertificationsContent />
    case 'engagement':
      return <EngagementContent />
    case 'ambitions':
      return <AmbitionsContent />
    case 'contact':
      return <ContactContent />
    default:
      return <BienvenueContent />
  }
}

/**
 * Panneau de contenu, ancré à la zone active de la pièce.
 * Le texte reste du HTML : lisible, sélectionnable, accessible au clavier
 * et aux lecteurs d'écran, alors que la scène 3D est décorative.
 */
export function ChapterPanel() {
  const chapter = useExperience((state) => state.chapter)
  const selectedId = useExperience((state) => state.selectedId)
  const closeSelection = useExperience((state) => state.closeSelection)
  const data = CHAPTERS[Math.min(chapter, CHAPTERS.length - 1)]

  return (
    <aside key={data.id} id="contenu" tabIndex={-1} className="panel" aria-label={`Zone ${data.index} — ${data.title}`}>
      <header className="panel__head">
        <div className="panel__meta">
          <span className="eyebrow">
            {data.index} / {data.kicker}
          </span>
          {selectedId && (
            <button type="button" className="panel__back" onClick={closeSelection}>
              Vue d’ensemble
            </button>
          )}
        </div>
        <h2>{data.title}</h2>
      </header>
      <div className="panel__body">
        <ChapterBody index={chapter} />
      </div>
    </aside>
  )
}
