import type { ChapterId } from './chapters'
import type { FocusTarget } from '../store/useExperience'

export interface Anchor {
  chapter: ChapterId
  /** Objet visé dans la pièce. */
  position: [number, number, number]
  /** Position de caméra du cadrage rapproché (orientée vers l'objet). */
  camera: [number, number, number]
}

/**
 * Coordonnées des zones interactives de la pièce, partagées entre la scène 3D
 * et les panneaux 2D. Chaque ligne de contenu pointe vers l'une de ces zones.
 */
export const ANCHORS: Record<string, Anchor> = {
  'zone-about': {
    chapter: 'about',
    position: [0, 2.1, -6.35],
    camera: [0, 1.95, 1.6],
  },
  'zone-parcours': {
    chapter: 'parcours',
    position: [-8.9, 1.9, -2.4],
    camera: [-4.2, 1.85, -2.4],
  },
  'zone-skills': {
    chapter: 'skills',
    position: [-6.2, 1.05, 3.3],
    camera: [-2.4, 1.78, 4.1],
  },
  'zone-projects': {
    chapter: 'projects',
    position: [5.6, 1.25, -4.9],
    camera: [2.7, 1.85, -1.7],
  },
  'zone-experience': {
    chapter: 'experiences',
    position: [8.9, 1.95, -1.6],
    camera: [4.4, 1.9, -1.6],
  },
  'zone-certifications': {
    chapter: 'certifications',
    position: [8.9, 1.85, 2.4],
    camera: [5.0, 1.85, 2.4],
  },
  'zone-engagement': {
    chapter: 'engagement',
    position: [-5.8, 1.15, 6.0],
    camera: [-2.2, 1.72, 5.3],
  },
  'zone-ambitions': {
    chapter: 'ambitions',
    position: [-5.8, 2.1, -6.35],
    camera: [-3.2, 1.95, -2.0],
  },
  'zone-contact': {
    chapter: 'contact',
    position: [6.9, 1.5, 7.35],
    camera: [3.4, 1.8, 4.6],
  },
}

/** Cadrage rapproché prêt à l'emploi pour un objet de la pièce. */
export function focusTargetFor(id: string): FocusTarget | null {
  const anchor = ANCHORS[id]
  if (!anchor) return null
  return { id, position: anchor.position, camera: anchor.camera }
}
