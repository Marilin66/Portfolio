import { z } from 'zod'

/**
 * Schéma de validation du contenu.
 * Objectif : si profile.json est édité à la main et qu'un champ manque,
 * l'erreur est explicite au démarrage plutôt qu'un écran vide inexplicable.
 */
export const profileSchema = z.object({
  meta: z.object({
    siteTitle: z.string(),
    tagline: z.string(),
    welcome: z.string(),
    updated: z.string(),
  }),
  hero: z.object({
    title: z.string(),
    valueProp: z.string(),
    valuePropAlternatives: z.array(z.string()),
    ctaPrimary: z.string(),
    ctaSecondary: z.string(),
    hint: z.string(),
  }),
  whyChoose: z.object({
    title: z.string(),
    lede: z.string(),
    items: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        body: z.string(),
        proof: z.string(),
      }),
    ),
  }),
  identity: z.object({
    name: z.string(),
    firstName: z.string(),
    role: z.string(),
    origin: z.string(),
    github: z.url(),
    email: z.string(),
    phone: z.string(),
    linkedin: z.string(),
  }),
  intro: z.object({
    about: z.string(),
    motivation: z.string(),
  }),
  photo: z.object({
    src: z.string(),
    placeholder: z.string(),
    note: z.string(),
  }),
  aboutChapters: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      body: z.string(),
    }),
  ),
  timeline: z.array(
    z.object({
      id: z.string(),
      year: z.string(),
      label: z.string(),
      place: z.string(),
      note: z.string(),
    }),
  ),
  experiences: z.array(
    z.object({
      id: z.string(),
      period: z.string(),
      org: z.string(),
      role: z.string(),
      place: z.string(),
      detail: z.string(),
    }),
  ),
  skills: z.object({
    development: z.array(z.string()),
    systems: z.array(z.string()),
  }),
  projects: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      kind: z.string(),
      summary: z.string(),
      role: z.string(),
      stack: z.array(z.string()),
      demo: z.string(),
      repo: z.string(),
      linkNote: z.string(),
      source: z.string(),
    }),
  ),
  certifications: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      issuer: z.string(),
      year: z.string(),
    }),
  ),
  engagement: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      role: z.string(),
      detail: z.string(),
    }),
  ),
  languages: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      level: z.string(),
    }),
  ),
  ambitions: z.array(z.string()),
  ui: z.object({
    chapterOrder: z.array(z.string()),
    nav: z.array(z.object({ label: z.string(), chapter: z.string() })),
    placeholders: z.array(z.string()),
  }),
})

export type Profile = z.infer<typeof profileSchema>
export type AboutChapter = Profile['aboutChapters'][number]
export type TimelineEntry = Profile['timeline'][number]
export type Experience = Profile['experiences'][number]
export type Project = Profile['projects'][number]
export type Certification = Profile['certifications'][number]
export type Engagement = Profile['engagement'][number]
export type Language = Profile['languages'][number]
