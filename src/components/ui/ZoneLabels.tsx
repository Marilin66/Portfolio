import { Html } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { ANCHORS } from '../../experience/anchors'
import { CHAPTERS, chapterIndexById } from '../../experience/chapters'
import { useExperience } from '../../store/useExperience'
import { scrollToChapter } from '../../lib/scroll'
import { playTick } from '../../lib/audio'

/**
 * Étiquettes posées sur les objets de la pièce.
 * Un objet sans étiquette serait un décor : chaque zone interactive porte
 * le nom de la rubrique qu'elle ouvre. Sur mobile, seule la zone active est
 * étiquetée pour ne pas couvrir la scène.
 */
export function ZoneLabels() {
  const chapter = useExperience((state) => state.chapter)
  const hoverId = useExperience((state) => state.hoverId)
  const reduced = useExperience((state) => state.reduced)
  const size = useThree((state) => state.size)
  const compact = size.width < 960

  return (
    <>
      {Object.entries(ANCHORS).map(([id, anchor]) => {
        const index = chapterIndexById(anchor.chapter)
        const data = CHAPTERS[index]
        if (!data) return null

        const active = index === chapter
        const hovered = hoverId === id
        if (compact && !active && !hovered) return null

        return (
          <Html
            key={id}
            position={anchor.position}
            center
            distanceFactor={compact ? 8 : 9}
            zIndexRange={[20, 0]}
            className="zone-label-holder"
          >
            <button
              type="button"
              tabIndex={-1}
              className={`zone-label${active ? ' is-active' : ''}${hovered ? ' is-hovered' : ''}`}
              onClick={() => {
                playTick('navigate')
                scrollToChapter(index, reduced)
              }}
            >
              <span className="zone-label__index">{data.index}</span>
              {data.title}
            </button>
          </Html>
        )
      })}
    </>
  )
}
