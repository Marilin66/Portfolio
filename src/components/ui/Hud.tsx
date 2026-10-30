import { CHAPTERS, chapterIndexById } from '../../experience/chapters'
import { ANCHORS } from '../../experience/anchors'
import { useExperience } from '../../store/useExperience'
import { scrollToChapter } from '../../lib/scroll'
import { playTick, setAudioEnabled } from '../../lib/audio'

function ChapterIndex() {
  const chapter = useExperience((state) => state.chapter)
  const reduced = useExperience((state) => state.reduced)

  return (
    <nav className="chapter-index" aria-label="Chapitres du parcours">
      {CHAPTERS.map((item, index) => (
        <button
          key={item.id}
          type="button"
          aria-current={index === chapter ? 'true' : undefined}
          onClick={() => {
            playTick('navigate')
            scrollToChapter(index, reduced)
          }}
        >
          <span className="chapter-index__num">{item.index}</span>
          <span>{item.title}</span>
        </button>
      ))}
    </nav>
  )
}

function Progress() {
  const chapter = useExperience((state) => state.chapter)

  return (
    <div className="progress" aria-hidden="true">
      <span>{CHAPTERS[chapter]?.index ?? '00'}</span>
      <span className="progress__track">
        {CHAPTERS.map((item, index) => (
          <span key={item.id} className={index <= chapter ? 'is-on' : ''} />
        ))}
      </span>
      <span>{CHAPTERS[CHAPTERS.length - 1]?.index ?? '09'}</span>
    </div>
  )
}

export function Hud() {
  const audio = useExperience((state) => state.audio)
  const chapter = useExperience((state) => state.chapter)
  const hoverId = useExperience((state) => state.hoverId)
  const setAudio = useExperience((state) => state.setAudio)
  const setMapOpen = useExperience((state) => state.setMapOpen)

  const hoveredAnchor = hoverId ? ANCHORS[hoverId] : undefined
  const hoveredIndex = hoveredAnchor ? chapterIndexById(hoveredAnchor.chapter) : -1
  const hovered = hoveredIndex >= 0 ? CHAPTERS[hoveredIndex] : null
  const hoveredElsewhere = hovered && hovered.id !== CHAPTERS[chapter]?.id

  return (
    <>
      <header className="hud hud--top">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">
            MB
          </span>
          <span className="brand__text">
            <strong>Marilin BADJI</strong>
            <span>Ingénieur en devenir</span>
          </span>
        </div>

        <div className="hud__actions">
          <button type="button" onClick={() => setMapOpen(true)}>
            Plan
          </button>
          <button
            type="button"
            aria-pressed={audio}
            onClick={() => {
              const next = !audio
              setAudio(next)
              setAudioEnabled(next)
            }}
          >
            Son <span className="hud__state">{audio ? 'on' : 'off'}</span>
          </button>
        </div>
      </header>

      <ChapterIndex />
      <Progress />

      {hoveredElsewhere && (
        <div className="zone-hint" aria-hidden="true">
          <span>{hovered.index}</span>
          <strong>{hovered.title}</strong>
          <em>{hovered.kicker}</em>
        </div>
      )}

      {chapter === 0 && (
        <div className="scroll-hint" aria-hidden="true">
          <span>Défiler</span>
          <span className="scroll-hint__line" />
        </div>
      )}
    </>
  )
}
