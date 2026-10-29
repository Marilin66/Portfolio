import raw from './profile.json'
import { profileSchema, type Profile } from './schema'

/** Contenu validé, unique source de vérité pour les scènes et la version 2D. */
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

/** Lien téléphonique propre, sans espaces ni séparateurs. */
export function phoneHref(value: string): string {
  return `tel:${value.replace(/[^+\d]/g, '')}`
}

/** Lien LinkedIn : accepte une URL complète ou un simple identifiant. */
export function linkedinHref(value: string): string {
  if (/^https?:\/\//i.test(value)) return value
  return `https://www.linkedin.com/in/${value.replace(/^@/, '')}`
}

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
    items: profile.skills.development,
  },
  {
    id: 'tool-elec',
    title: 'Électricité et systèmes',
    items: profile.skills.systems,
  },
] as const

/** Champs restant à fournir, listés dans le pied de page et dans le README. */
export const pendingFields = [
  'Intitulé exact et année de la licence',
  'Dates et missions du stage CAP EPAC',
  'Missions des stages CAMAH et DREAM TECH',
  'Lieu et missions du stage à la DGPER',
  'Lien de démo HOPITEL',
  'Dépôts GitHub à mettre en avant',
  'Niveaux de langue',
  'E-mail, téléphone et LinkedIn',
  'Destination du formulaire de contact',
]
