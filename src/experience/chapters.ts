import { profile } from '../data/selectors'

export type ChapterId =
  | 'bienvenue'
  | 'about'
  | 'parcours'
  | 'skills'
  | 'projects'
  | 'experiences'
  | 'certifications'
  | 'engagement'
  | 'ambitions'
  | 'contact'

export interface Chapter {
  id: ChapterId
  index: string
  title: string
  kicker: string
  /** Position de la caméra en fin de chapitre, à l'intérieur de la pièce. */
  camera: [number, number, number]
  /** Point visé en fin de chapitre. */
  target: [number, number, number]
}

/**
 * Une seule pièce, dix points de vue.
 * La caméra reste à hauteur d'œil et se déplace d'une zone à l'autre,
 * comme dans une visite guidée de jeu d'aventure.
 */
const REGISTRY: Record<ChapterId, Chapter> = {
  bienvenue: {
    id: 'bienvenue',
    index: '00',
    title: "L'Atelier du matin",
    kicker: 'Bienvenue',
    camera: [-6.1, 2.0, 5.4],
    target: [1.4, 1.3, -3.2],
  },
  about: {
    id: 'about',
    index: '01',
    title: 'Qui suis-je',
    kicker: 'Portrait',
    camera: [0, 1.9, 1.9],
    target: [0, 2.15, -6.4],
  },
  parcours: {
    id: 'parcours',
    index: '02',
    title: 'Parcours',
    kicker: 'La ligne du temps',
    camera: [-3.4, 1.85, -1.8],
    target: [-8.9, 1.95, -2.4],
  },
  skills: {
    id: 'skills',
    index: '03',
    title: 'Compétences',
    kicker: "L'établi",
    camera: [-2.0, 1.78, 4.6],
    target: [-6.2, 1.05, 3.3],
  },
  projects: {
    id: 'projects',
    index: '04',
    title: 'Projets',
    kicker: 'Le bureau',
    camera: [2.2, 1.85, -1.2],
    target: [5.6, 1.25, -4.9],
  },
  experiences: {
    id: 'experiences',
    index: '05',
    title: 'Expériences',
    kicker: 'Le mur des étapes',
    camera: [3.4, 1.85, -1.6],
    target: [8.9, 1.95, -1.6],
  },
  certifications: {
    id: 'certifications',
    index: '06',
    title: 'Certifications',
    kicker: "L'étagère",
    camera: [4.6, 1.8, 2.4],
    target: [8.9, 1.85, 2.4],
  },
  engagement: {
    id: 'engagement',
    index: '07',
    title: 'Engagement',
    kicker: 'Le coin culture',
    camera: [-1.8, 1.75, 4.9],
    target: [-5.8, 1.15, 6.0],
  },
  ambitions: {
    id: 'ambitions',
    index: '08',
    title: 'Ambitions',
    kicker: 'La fenêtre',
    camera: [-2.8, 1.95, -0.8],
    target: [-5.8, 2.1, -6.4],
  },
  contact: {
    id: 'contact',
    index: '09',
    title: 'Contact',
    kicker: 'La porte',
    camera: [3.0, 1.8, 4.4],
    target: [6.9, 1.5, 7.35],
  },
}

/** L'ordre des chapitres est éditable dans profile.json (ui.chapterOrder). */
export const CHAPTERS: Chapter[] = profile.ui.chapterOrder
  .map((id, index) => {
    const chapter = REGISTRY[id as ChapterId]
    if (!chapter) return null
    return {
      ...chapter,
      index: String(index).padStart(2, '0'),
    }
  })
  .filter((chapter): chapter is Chapter => Boolean(chapter))

export function chapterIndexById(id: ChapterId): number {
  return CHAPTERS.findIndex((chapter) => chapter.id === id)
}

/** Progression de scroll (0 → 1) correspondant exactement à un chapitre. */
export function progressForChapter(index: number): number {
  if (CHAPTERS.length <= 1) return 0
  return index / (CHAPTERS.length - 1)
}
