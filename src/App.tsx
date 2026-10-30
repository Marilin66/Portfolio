import { Suspense, lazy, useEffect } from 'react'
import { CHAPTERS } from './experience/chapters'
import { Hud } from './components/ui/Hud'
import { ChapterPanel } from './components/ui/ChapterPanel'
import { Schematic } from './components/ui/Schematic'
import { Intro } from './components/ui/Intro'
import { useExperience } from './store/useExperience'
import { useReducedMotion } from './hooks/useReducedMotion'
import { detectTier } from './lib/device'
import { chapterFromProgress, initScroll, scrollToChapter } from './lib/scroll'
import { playTick } from './lib/audio'
import { profile } from './data/selectors'

// Le moteur 3D est chargé en différé pour ne pas bloquer l'introduction.
const Scene = lazy(() =>
  import('./experience/Scene').then((module) => ({ default: module.Scene })),
)

export default function App() {
  const reduced = useReducedMotion()
  const introDone = useExperience((state) => state.introDone)
  const chapter = useExperience((state) => state.chapter)
  const activeChapter = CHAPTERS[Math.min(chapter, CHAPTERS.length - 1)]

  useEffect(() => {
    useExperience.getState().setReduced(reduced)
  }, [reduced])

  useEffect(() => {
    useExperience.getState().setTier(detectTier())
  }, [])

  // Titre de l'onglet.
  useEffect(() => {
    document.title = `${profile.identity.name} — ${profile.meta.siteTitle}`
  }, [])

  // Progression de scroll → chapitre actif.
  useEffect(() => {
    return initScroll((progress) => {
      const state = useExperience.getState()
      const next = chapterFromProgress(progress, CHAPTERS.length)

      // Un scroll ferme toujours un cadrage rapproché.
      if (state.selectedId) state.closeSelection()

      if (next === state.chapter) return

      state.setChapter(next)
      state.hover(null)
      if (state.introDone) playTick('navigate')
    })
  }, [])

  // L'introduction bloque le scroll tant qu'elle est affichée.
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('is-locked', !introDone)
    return () => root.classList.remove('is-locked')
  }, [introDone])

  // Raccourcis clavier : Échap pour fermer, flèches pour changer de zone,
  // 0–9 pour un accès direct, Home/End pour les extrémités.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null
      if (event.metaKey || event.ctrlKey || event.altKey) return

      const state = useExperience.getState()

      // Échap doit toujours fonctionner.
      if (event.key === 'Escape') {
        if (state.mapOpen) state.setMapOpen(false)
        else if (state.selectedId) state.closeSelection()
        return
      }

      // Le reste des raccourcis ne doit pas voler les touches d'un champ.
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      if (target?.closest('.panel__body')) return
      if (state.mapOpen) return

      // ←/→ : chapitre précédent / suivant.
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault()
        const direction = event.key === 'ArrowRight' ? 1 : -1
        const next = Math.min(CHAPTERS.length - 1, Math.max(0, state.chapter + direction))
        if (next !== state.chapter) scrollToChapter(next, state.reduced)
        return
      }

      if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault()
        scrollToChapter(event.key === 'Home' ? 0 : CHAPTERS.length - 1, state.reduced)
        return
      }

      // 0–9 correspondent aux numéros affichés.
      if (!/^[0-9]$/.test(event.key)) return
      const index = Number(event.key)
      if (index < CHAPTERS.length) {
        event.preventDefault()
        state.setMapOpen(false)
        scrollToChapter(index, state.reduced)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Navigation tactile mobile : balayer horizontalement pour changer de zone.
  useEffect(() => {
    let startX = 0
    let startY = 0
    let startTime = 0

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return
      const target = event.target instanceof HTMLElement ? event.target : null
      if (target?.closest('.panel__body, .map, .intro')) return

      startX = event.touches[0].clientX
      startY = event.touches[0].clientY
      startTime = Date.now()
    }

    const onTouchEnd = (event: TouchEvent) => {
      if (event.changedTouches.length !== 1) return
      const target = event.target instanceof HTMLElement ? event.target : null
      if (target?.closest('.panel__body, .map, .intro')) return

      const deltaX = event.changedTouches[0].clientX - startX
      const deltaY = event.changedTouches[0].clientY - startY
      const duration = Date.now() - startTime

      // Balayage horizontal net (> 45px) et plus horizontal que vertical.
      if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25 && duration < 600) {
        const state = useExperience.getState()
        const direction = deltaX < 0 ? 1 : -1
        const next = Math.min(CHAPTERS.length - 1, Math.max(0, state.chapter + direction))
        if (next !== state.chapter) {
          playTick('navigate')
          scrollToChapter(next, state.reduced)
        }
      }
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  return (
    <div className="app">
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>

      <Suspense fallback={<div className="scene scene--fallback" />}>
        <Scene />
      </Suspense>

      <Hud />
      <ChapterPanel />
      <Schematic />
      <Intro />

      {/* Hauteur de page = distance de voyage de la caméra. */}
      <div className="scroll-track" style={{ height: `${CHAPTERS.length * 100}vh` }} aria-hidden="true" />

      <p className="sr-only">
        Portfolio tridimensionnel de Marilin BADJI. Utilisez les flèches pour parcourir la pièce,
        la touche Échap pour fermer un détail, ou ouvrez le plan pour accéder directement à une zone.
      </p>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {activeChapter ? `Zone ${activeChapter.index} — ${activeChapter.title}` : ''}
      </p>
    </div>
  )
}
