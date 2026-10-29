import type { Tier } from '../store/useExperience'

/**
 * Vérifie qu'un contexte WebGL est disponible, une seule fois.
 * Le résultat est mémorisé : créer un contexte à chaque rendu peut atteindre
 * la limite du navigateur et faire disparaître le retour vers la 3D.
 */
let webglSupport: boolean | null = null

export function hasWebGL(): boolean {
  if (webglSupport !== null) return webglSupport
  try {
    const canvas = document.createElement('canvas')
    const context =
      canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    webglSupport = Boolean(window.WebGLRenderingContext && context)
    // Libère immédiatement le contexte de test.
    if (context) {
      const extension = (context as WebGLRenderingContext).getExtension('WEBGL_lose_context')
      extension?.loseContext()
    }
  } catch {
    webglSupport = false
  }
  return webglSupport ?? false
}

interface NavigatorWithHints extends Navigator {
  deviceMemory?: number
  connection?: { saveData?: boolean }
}

/**
 * Palier de qualité initial. Volontairement prudent : mieux vaut un rendu
 * sobre à 60 fps qu'un rendu riche à 20 fps. Le DPR est ajusté ensuite en
 * direct par <QualityGuard />.
 */
export function detectTier(): Tier {
  if (typeof window === 'undefined') return 'medium'

  const nav = navigator as NavigatorWithHints
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 4
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const small = window.innerWidth < 900
  const saveData = nav.connection?.saveData === true

  if (saveData) return 'low'

  if (coarse || small) {
    if (cores >= 6 && memory >= 4 && window.devicePixelRatio <= 3) return 'medium'
    return 'low'
  }

  if (cores >= 8 && memory >= 8) return 'high'
  if (cores >= 4) return 'medium'
  return 'low'
}

/** La version 2D peut être demandée par URL : /classique ou ?classique=1 */
export function classicRequestedByUrl(): boolean {
  if (typeof window === 'undefined') return false

  const path = window.location.pathname.replace(/\/+$/, '')
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '')
  const classicPath = `${base}/classique`
  const classicAlt = `${base}/classic`

  if (path === classicPath || path === classicAlt || path === '/classique' || path === '/classic') {
    return true
  }

  const params = new URLSearchParams(window.location.search)
  const value = params.get('classique') ?? params.get('classic')
  return value === '1' || value === 'true'
}
