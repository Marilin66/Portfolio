import { Suspense, lazy, useEffect, useState } from 'react'
import { CHAPTERS } from './experience/chapters'
import { Hero } from './components/ui/Hero'
import { ChapterPanel } from './components/ui/ChapterPanel'
import { Schematic } from './components/ui/Schematic'
import { Intro } from './components/ui/Intro'
import { ClassicView } from './components/ui/ClassicView'
import { useExperience } from './store/useExperience'
import { useReducedMotion } from './hooks/useReducedMotion'
import { classicRequestedByUrl, detectTier, hasWebGL } from './lib/device'
import { ROUTE_EVENT } from './lib/routes'
import { chapterFromProgress, initScroll, scrollToChapter } from './lib/scroll'
import { playTick } from './lib/audio'
import { hero, profile } from './data/selectors'

// Le moteur 3D est chargé en différé : le contenu et le contact restent
// disponibles même si le rendu 3D échoue ou met du temps à arriver.
const Scene = lazy(() =>
  import('./experience/Scene').then((module) => ({ default: module.Scene })),
)

export default function App() {
  const reduced = useReducedMotion()
  const introDone = useExperience((state) => state.introDone)
  const chapter = useExperience((state) => state.chapter)
  const [classic, setClassic] = useState(() => classicRequestedByUrl() || !hasWebGL())
  const activeChapter = CHAPTERS[Math.min(chapter, CHAPTERS.length - 1)]

  useEffect(() => {
    useExperience.getState().setReduced(reduced)
  }, [reduced])

  useEffect(() => {
    useExperience.getState().setTier(detectTier())
  }, [])

  // URL → vue. La vue classique fonctionne aussi via /classique.
  useEffect(() => {
    const sync = () => {
      const next = classicRequestedByUrl()
      setClassic(next)
      if (next) useExperience.getState().finishIntro()
    }
    window.addEventListener('popstate', sync)
    window.addEventListener(ROUTE_EVENT, sync)
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener(ROUTE_EVENT, sync)
    }
  }, [])

  useEffect(() => {
    useExperience.getState().setClassic(classic)
  }, [classic])

  useEffect(() => {
    document.title = `${profile.identity.name} — ${hero.title}`
  }, [])

  // Progression de scroll → zone active.
  useEffect(() => {
    if (classic) return
    return initScroll((progress) => {
      const state = useExperience.getState()
      if (!state.introDone) return

      const next = chapterFromProgress(progress, CHAPTERS.length)
      if (state.selectedId) state.closeSelection()
      if (next === state.chapter) return

      state.setChapter(next)
      state.hover(null)
      playTick('navigate')
    })
  }, [classic])

  // L'introduction bloque le scroll tant qu'elle est affichée.
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('is-locked', !classic && !introDone)
    return () => root.classList.remove('is-locked')
  }, [introDone, classic])

  // Raccourcis clavier : Échap ferme, flèches changent de zone.
  useEffect(() => {
    if (classic) return

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null
      if (event.metaKey || event.ctrlKey || event.altKey) return

      const state = useExperience.getState()

      if (event.key === 'Escape') {
        if (state.mapOpen) state.setMapOpen(false)
        else if (state.selectedId) state.closeSelection()
        return
      }

      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      if (target?.closest('.panel__body') || target?.closest('.hero')) return
      if (state.mapOpen || !state.introDone) return

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
  }, [classic])

  // Navigation tactile : balayage horizontal d'une zone à l'autre.
  useEffect(() => {
    if (classic) return
    let startX = 0
    let startY = 0
    let startTime = 0

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return
      const target = event.target instanceof HTMLElement ? event.target : null
      if (target?.closest('.panel, .map, .intro, .hero')) return
      startX = event.touches[0].clientX
      startY = event.touches[0].clientY
      startTime = Date.now()
    }

    const onTouchEnd = (event: TouchEvent) => {
      if (event.changedTouches.length !== 1) return
      const target = event.target instanceof HTMLElement ? event.target : null
      if (target?.closest('.panel, .map, .intro, .hero')) return

      const deltaX = event.changedTouches[0].clientX - startX
      const deltaY = event.changedTouches[0].clientY - startY
      const duration = Date.now() - startTime

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
  }, [classic])

  if (classic) return <ClassicView />

  return (
    <div className="app">
      <a className="skip-link" href="#contenu-principal">
        Aller au contenu
      </a>

      <div className="scene" aria-hidden="true">
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </div>
      <div className="scene__wash" aria-hidden="true" />

      <div id="contenu-principal" className="app__content" tabIndex={-1}>
        <Hero />
        <ChapterPanel />
      </div>

      <Schematic />
      <Intro />

      {/* Hauteur de page = distance de voyage de la caméra. */}
      <div className="scroll-track" style={{ height: `${CHAPTERS.length * 100}vh` }} aria-hidden="true" />

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {activeChapter ? `Zone ${activeChapter.index} — ${activeChapter.title}` : ''}
      </p>
    </div>
  )
}
