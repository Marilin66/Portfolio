import { useEffect, useMemo, useRef } from 'react'
import { CHAPTERS } from '../../experience/chapters'
import { useExperience } from '../../store/useExperience'
import { scrollToChapter } from '../../lib/scroll'
import { playTick } from '../../lib/audio'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { switchToClassic } from '../../lib/routes'

/**
 * Plan de la pièce : un tracé unique, dix zones.
 * Sert de menu secondaire (souris, clavier, lecteur d'écran) et de secours
 * si l'on ne souhaite pas visiter la pièce au scroll.
 */
export function Schematic() {
  const open = useExperience((state) => state.mapOpen)
  const chapter = useExperience((state) => state.chapter)
  const reduced = useExperience((state) => state.reduced)
  const setMapOpen = useExperience((state) => state.setMapOpen)
  const innerRef = useRef<HTMLDivElement>(null)

  const nodes = useMemo(
    () =>
      CHAPTERS.map((item, index) => ({
        ...item,
        x: 58 + index * 76,
        y: 150 + (index % 2 === 0 ? -46 : 46),
      })),
    [],
  )

  const path = useMemo(
    () =>
      nodes.reduce((accumulator, node, index) => {
        if (index === 0) return `M ${node.x} ${node.y}`
        const previous = nodes[index - 1]
        const middle = (previous.x + node.x) / 2
        return `${accumulator} C ${middle} ${previous.y}, ${middle} ${node.y}, ${node.x} ${node.y}`
      }, ''),
    [nodes],
  )

  useFocusTrap(open, innerRef, () => setMapOpen(false))

  // Le plan est une couche modale : on empêche le scroll de la page derrière.
  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    const wasLocked = root.classList.contains('is-locked')
    root.classList.add('is-locked')
    return () => {
      if (!wasLocked) root.classList.remove('is-locked')
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="map"
      role="dialog"
      aria-modal="true"
      aria-label="Plan de la pièce"
      onClick={(event) => {
        if (event.target === event.currentTarget) setMapOpen(false)
      }}
    >
      <div className="map__inner" ref={innerRef}>
        <div className="map__head">
          <div>
            <span className="eyebrow">Plan de la pièce</span>
            <h2>Dix zones, un même matin</h2>
          </div>
          <button
            type="button"
            className="map__close"
            onClick={() => setMapOpen(false)}
            aria-label="Fermer le plan"
          >
            Fermer
          </button>
        </div>

        <div className="map__scroll">
          <div className="map__canvas">
            <svg viewBox="0 0 800 300" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
              <path d={path} fill="none" stroke="#5B6BE0" strokeOpacity="0.35" strokeWidth="1.6" />
              <path
                d={path}
                fill="none"
                stroke="#0E93A8"
                strokeOpacity="0.55"
                strokeWidth="1.3"
                strokeDasharray="4 10"
                className={reduced ? '' : 'map__flow'}
              />
              {nodes.map((node, index) => (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={index === chapter ? 13 : 10}
                    fill="#F7FAFE"
                    stroke={index === chapter ? '#0E93A8' : '#9FB2C9'}
                    strokeWidth="1.2"
                  />
                  <text
                    x={node.x}
                    y={node.y + 3.5}
                    textAnchor="middle"
                    fontSize="9"
                    fontFamily="JetBrains Mono, monospace"
                    fill={index === chapter ? '#0E93A8' : '#4A5E7C'}
                  >
                    {node.index}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        <div className="map__list">
          {CHAPTERS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={index === chapter ? 'is-active' : ''}
              onClick={() => {
                playTick('navigate')
                setMapOpen(false)
                // Le plan verrouille le scroll : on attend que le verrou soit
                // retiré avant de demander le défilement, sinon il est ignoré.
                window.setTimeout(() => scrollToChapter(index, reduced), 0)
              }}
            >
              <span>{item.index}</span>
              <strong>{item.title}</strong>
              <em>{item.kicker}</em>
            </button>
          ))}
        </div>

        <div className="map__foot">
          <p>La même histoire, sans 3D ni animation : plus rapide à lire, plus légère à charger.</p>
          <button
            type="button"
            className="map__classic"
            onClick={() => {
              setMapOpen(false)
              switchToClassic()
            }}
          >
            Ouvrir la version 2D
          </button>
        </div>
      </div>
    </div>
  )
}
