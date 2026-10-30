import { ANCHORS, focusTargetFor } from '../../experience/anchors'
import { CHAPTERS, chapterIndexById } from '../../experience/chapters'
import {
  certifications,
  contactLinks,
  engagement,
  experiences,
  isPending,
  languages,
  profile,
  projects,
  realValue,
  timeline,
  whyChoose,
} from '../../data/selectors'
import { ProjectCard } from './ProjectCard'
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
          {selected ? "Vue d'ensemble" : "Voir sur l'établi"}
        </span>
      </button>
      <ul className="chips">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

function WhyContent() {
  const reduced = useExperience((state) => state.reduced)

  return (
    <>
      <p className="lede">{whyChoose.lede}</p>
      <ul className="why-list">
        {whyChoose.items.map((item, index) => (
          <li key={item.id} className="why-item">
            <span className="why-item__index" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <span className="tag tag--soft">{item.proof}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="panel__cta-row">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => {
            playTick('navigate')
            scrollToChapter(chapterIndexById('projects'), reduced)
          }}
        >
          Voir les projets <span aria-hidden="true">→</span>
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => {
            playTick('navigate')
            scrollToChapter(chapterIndexById('contact'), reduced)
          }}
        >
          Me contacter
        </button>
      </div>
    </>
  )
}

function AboutContent() {
  const photo = profile.photo.src

  return (
    <>
      <div className="portrait">
        <div className="portrait__frame">
          <img src={photo} alt={`Portrait de ${profile.identity.name}`} loading="lazy" />
        </div>
        <div className="portrait__meta">
          <span className="eyebrow">Portrait</span>
          <p className="portrait__name">{profile.identity.name}</p>
          <p className="portrait__place">{profile.identity.origin}</p>
          <p className="note">{profile.photo.note}</p>
        </div>
      </div>

      <p className="lede">{profile.intro.about}</p>

      {profile.aboutChapters.map((chapter, index) => (
        <article key={chapter.id} className="story">
          <span className="story__num">{String(index + 1).padStart(2, '0')}</span>
          <div>
            <h3>{chapter.title}</h3>
            <p>{chapter.body}</p>
          </div>
        </article>
      ))}

      <section className="section-block">
        <h3 className="section-block__title">Langues</h3>
        <ul className="plain">
          {languages.map((language) => {
            const level = realValue(language.level)
            return (
              <li key={language.id}>
                <span>{language.name}</span>
                <span className={level ? '' : 'is-pending'}>{level ?? 'À COMPLÉTER'}</span>
              </li>
            )
          })}
        </ul>
      </section>
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
      <p className="note">Ces étapes sont posées sur la bibliothèque, à gauche de la pièce.</p>
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
        Quatre projets, dont deux accessibles en ligne. Chaque lien mène au dépôt ou à la démo.
      </p>
      <div className="project-list" onMouseEnter={() => hover('zone-projects')} onMouseLeave={() => hover(null)}>
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} onShowInScene={() => openInScene('zone-projects')} />
        ))}
      </div>
      <p className="note">
        Les aperçus affichés sur les écrans du bureau sont des illustrations, pas des captures
        d'écran.
      </p>
    </>
  )
}

function ExperiencesContent() {
  return (
    <>
      <p className="lede">Six étapes de terrain, du câblage à la maintenance des systèmes.</p>
      <ul className="items">
        {experiences.map((experience) => {
          const place = realValue(experience.place)
          const detail = realValue(experience.detail)
          const extra = [place ? `Lieu : ${place}` : 'Lieu : à compléter', detail ?? 'Missions : à compléter']
          return (
            <Item
              key={experience.id}
              id={experience.id}
              target="zone-experience"
              index={experience.period}
              title={experience.org}
              subtitle={experience.role}
              detail={extra.join(' · ')}
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
      <p className="lede">{certifications.length} certificats YALI, posés sur l'étagère.</p>
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
            detail={isPending(item.detail) ? 'Détail des missions à compléter.' : item.detail}
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
      <p className="lede">La direction donnée au travail, en quatre points.</p>
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
  return (
    <>
      <p className="lede">
        Un projet, un stage, une collaboration : les coordonnées utiles sont réunies ici.
      </p>
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

      <div className="panel__cta-row">
        <a className="btn btn--primary" href={contactLinks.github} target="_blank" rel="noreferrer">
          Ouvrir le GitHub <span aria-hidden="true">↗</span>
        </a>
      </div>

      <p className="note">
        Adresse e-mail, téléphone et LinkedIn seront ajoutés dès réception : ils ne sont pas
        inventés.
      </p>
    </>
  )
}

function ChapterBody({ index }: { index: number }) {
  switch (CHAPTERS[index]?.id) {
    case 'pourquoi':
      return <WhyContent />
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
      return null
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
  const reduced = useExperience((state) => state.reduced)
  const panelCollapsed = useExperience((state) => state.panelCollapsed)
  const togglePanelCollapsed = useExperience((state) => state.togglePanelCollapsed)
  const data = CHAPTERS[Math.min(chapter, CHAPTERS.length - 1)]

  // Le premier écran est occupé par le hero : pas de panneau par-dessus.
  if (!data || chapter === 0) return null

  const hasPrev = chapter > 0
  const hasNext = chapter < CHAPTERS.length - 1

  const goPrev = () => {
    if (!hasPrev) return
    playTick('navigate')
    scrollToChapter(chapter - 1, reduced)
  }

  const goNext = () => {
    if (!hasNext) return
    playTick('navigate')
    scrollToChapter(chapter + 1, reduced)
  }

  return (
    <aside
      key={data.id}
      id="contenu"
      tabIndex={-1}
      className={`panel${panelCollapsed ? ' is-collapsed' : ''}`}
      aria-label={`Zone ${data.index} — ${data.title}`}
    >
      <header className="panel__head">
        <div className="panel__meta">
          <span className="eyebrow">
            {data.index} / {data.kicker}
          </span>
          <div className="panel__head-actions">
            {selectedId && (
              <button type="button" className="link-btn" onClick={closeSelection}>
                Vue d'ensemble
              </button>
            )}
            <button
              type="button"
              className="panel__toggle-btn"
              onClick={togglePanelCollapsed}
              aria-expanded={!panelCollapsed}
              aria-label={panelCollapsed ? 'Ouvrir la fiche de contenu' : 'Réduire la fiche pour voir la pièce'}
            >
              {panelCollapsed ? 'Fiche ↑' : 'Réduire ↓'}
            </button>
          </div>
        </div>
        <div className="panel__title-row">
          <h2>{data.title}</h2>
          <div className="panel__nav-arrows">
            <button
              type="button"
              className="icon-btn"
              onClick={goPrev}
              disabled={!hasPrev}
              aria-label="Zone précédente"
            >
              ←
            </button>
            <span className="panel__nav-count" aria-hidden="true">
              {data.index}/{CHAPTERS[CHAPTERS.length - 1]?.index}
            </span>
            <button
              type="button"
              className="icon-btn"
              onClick={goNext}
              disabled={!hasNext}
              aria-label="Zone suivante"
            >
              →
            </button>
          </div>
        </div>
      </header>
      {!panelCollapsed && (
        <div className="panel__body">
          <ChapterBody index={chapter} />
        </div>
      )}
    </aside>
  )
}
