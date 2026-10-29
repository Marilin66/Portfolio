import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const profilePath = resolve(here, '..', 'src', 'data', 'profile.json')
const strict = process.argv.includes('--strict')

const PENDING = /(à compléter|à préciser|à confirmer|COMPLÉTER)/i
const found = []

function walk(value, path) {
  if (typeof value === 'string') {
    if (PENDING.test(value)) found.push({ path, value })
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, `${path}[${index}]`))
    return
  }
  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => walk(item, path ? `${path}.${key}` : key))
  }
}

const profile = JSON.parse(await readFile(profilePath, 'utf8'))
walk(profile, '')

if (!profile.photo?.src) {
  found.push({ path: 'photo.src', value: '(vide)' })
}

if (found.length === 0) {
  console.log('Contenu complet : aucun marqueur « à compléter » dans profile.json.')
  process.exit(0)
}

console.log(`${found.length} champ(s) encore à compléter :\n`)
for (const { path, value } of found) {
  console.log(`- ${path} = ${value}`)
}

console.log('\nRappel : ces valeurs sont visibles dans le site. Termine-les avant publication.')
if (strict) process.exit(1)
