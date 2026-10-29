import { progressForChapter } from '../experience/chapters'

/**
 * État de scroll partagé, mutable et hors React.
 * La caméra le lit à chaque frame sans provoquer de rendu React.
 */
export const scrollState = {
  target: 0,
  value: 0,
}

function currentProgress(): number {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
  const y = window.scrollY || window.pageYOffset
  return Math.min(1, Math.max(0, y / max))
}

/** Branche l'écoute du scroll et renvoie la fonction de nettoyage. */
export function initScroll(onProgress: (progress: number) => void): () => void {
  const update = () => {
    const progress = currentProgress()
    scrollState.target = progress
    onProgress(progress)
  }

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  update()
  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update)
  return () => {
    window.removeEventListener('scroll', update)
    window.removeEventListener('resize', update)
  }
}

/** Position de scroll cible pour atteindre un chapitre. */
export function scrollToChapter(index: number, reduced: boolean): void {
  const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
  const top = progressForChapter(index) * max
  window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' })
}

/** Numéro de chapitre correspondant à une progression 0 → 1. */
export function chapterFromProgress(progress: number, count: number): number {
  if (count <= 1) return 0
  return Math.round(progress * (count - 1))
}
