import { useExperience } from '../store/useExperience'

/**
 * Chemins de l'application, calculés à partir de la base de déploiement.
 * Avec la configuration par défaut, `BASE_URL` vaut « / ».
 */
const base = import.meta.env.BASE_URL.replace(/\/+$/, '')

export const CLASSIC_PATH = `${base}/classique`
export const HOME_PATH = `${base}/` || '/'

/**
 * Événement émis à chaque bascule 2D / 3D.
 * L'application écoute cet événement en plus de `popstate` : sans lui, le
 * bouton « Vue classique » changeait l'URL sans changer la vue affichée.
 */
export const ROUTE_EVENT = 'mb:routechange'

function notifyRouteChange(): void {
  window.dispatchEvent(new Event(ROUTE_EVENT))
}

/** Bascule vers la version 2D, sans rechargement, et met l'URL à jour. */
export function switchToClassic(): void {
  useExperience.getState().setClassic(true)
  if (window.location.pathname !== CLASSIC_PATH) {
    history.pushState(null, '', CLASSIC_PATH)
  }
  notifyRouteChange()
}

/** Revient à la scène 3D depuis la version 2D. */
export function switchTo3D(): void {
  const state = useExperience.getState()
  // Un cadrage rapproché n'a plus de sens après un détour par la 2D.
  state.closeSelection()
  // L'introduction a déjà été vue : on ne la rejoue pas.
  state.finishIntro()
  state.setClassic(false)
  if (window.location.pathname !== HOME_PATH) {
    history.pushState(null, '', HOME_PATH)
  }
  window.scrollTo({ top: 0 })
  notifyRouteChange()
}
