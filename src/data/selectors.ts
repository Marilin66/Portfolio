import raw from './profile.json'
import { profileSchema, type Profile } from './schema'

/** Contenu validé, unique source de vérité pour la scène et l'interface. */
export const profile: Profile = profileSchema.parse(raw)

/** Marqueur utilisé dans profile.json pour tout ce qui reste à renseigner. */
export const PLACEHOLDER = 'À COMPLÉTER'

const PENDING_PATTERN = /(à compléter|à préciser|à confirmer|COMPLÉTER)/i

/** Vrai si le texte est encore un brouillon : « À COMPLÉTER », « à préciser »… */
export function isPending(value: string | undefined | null): boolean {
  return typeof value === 'string' && PENDING_PATTERN.test(value)
}

export function isPlaceholder(value: string | undefined | null): boolean {
  return typeof value === 'string' && value.includes(PLACEHOLDER)
}

/** Valeur affichable : renvoie null si le champ est encore à compléter. */
export function realValue(value: string | undefined | null): string | null {
  if (!value || isPending(value)) return null
  return value
}

/** Un lien n'est utilisable que s'il est renseigné et vérifié. */
export function realLink(value: string | undefined | null): string | null {
  const clean = realValue(value)
  return clean && /^https?:\/\//i.test(clean) ? clean : null
}

/** Lien téléphonique propre, sans espaces ni séparateurs. */
export function phoneHref(value: string): string {
  return `tel:${value.replace(/[^+\d]/g, '')}`
}

/** Lien LinkedIn : accepte une URL complète ou un simple identifiant. */
export function linkedinHref(value: string): string {
  if (/^https?:\/\//i.test(value)) return value
  return `https://www.linkedin.com/in/${value.replace(/^@/, '')}`
}

export const hero = profile.hero
export const whyChoose = profile.whyChoose
export const timeline = profile.timeline
export const experiences = profile.experiences
export const projects = profile.projects
export const certifications = profile.certifications
export const engagement = profile.engagement
export const languages = profile.languages

export const skillGroups = [
  {
    id: 'tool-dev',
    title: 'Développement logiciel',
    note: 'Langages, frameworks, architecture',
    items: profile.skills.development,
  },
  {
    id: 'tool-elec',
    title: 'Électricité et systèmes',
    note: 'Terrain, maintenance, conception',
    items: profile.skills.systems,
  },
] as const

/** Coordonnées réellement disponibles (tout le reste s'affiche « À COMPLÉTER »). */
export const contactLinks = {
  github: profile.identity.github,
  email: realValue(profile.identity.email),
  phone: realValue(profile.identity.phone),
  linkedin: realValue(profile.identity.linkedin),
}

/** Champs restant à fournir, listés à la fin de la vue classique. */
export const pendingFields = [
  'Profil LinkedIn',
  "Photo définitive (fichier public/photo/portrait.jpeg)",
  'Lien du dépôt public HOPITEL',
  "Intitulé exact et année d'obtention de la licence",
  'Dates précises et missions du stage CAP EPAC',
  'Lieu et missions des stages CAMAH, DREAM TECH et DGPER',
  'Détail des responsabilités à l’Ensemble Artistique et Culturel et au Campus Ciné Club',
  'Niveaux de langue (français, fon, anglais)',
]
