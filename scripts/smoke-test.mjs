// Test fonctionnel du portfolio via le protocole DevTools de Chrome.
// Usage : node scripts/smoke-test.mjs <url-de-debug>

const endpoint = process.argv[2] ?? 'http://127.0.0.1:9222'
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const list = await (await fetch(`${endpoint}/json/list`)).json()
const page = list.find((target) => target.type === 'page')
if (!page) throw new Error('Aucune page Chrome ouverte.')

const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  ws.onopen = resolve
  ws.onerror = reject
})

let nextId = 0
const pending = new Map()
const events = []
ws.onmessage = (event) => {
  const message = JSON.parse(event.data)
  if (message.id) {
    const resolve = pending.get(message.id)
    if (resolve) {
      pending.delete(message.id)
      resolve(message)
    }
    return
  }
  events.push(message)
}

function send(method, params = {}) {
  return new Promise((resolve) => {
    const id = ++nextId
    pending.set(id, resolve)
    ws.send(JSON.stringify({ id, method, params }))
  })
}

async function evaluate(expression, awaitPromise = false) {
  const response = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise,
  })
  if (response.error) throw new Error(JSON.stringify(response.error))
  if (response.result?.exceptionDetails) {
    throw new Error(
      response.result.exceptionDetails.exception?.description ??
        response.result.exceptionDetails.text,
    )
  }
  return response.result?.result?.value
}

const results = []
function check(name, condition, detail = '') {
  results.push({ name, ok: Boolean(condition), detail })
}

await send('Runtime.enable')
await send('Log.enable')

// Attendre que React ait monté quelque chose.
for (let attempt = 0; attempt < 80; attempt += 1) {
  if (await evaluate("!!document.querySelector('.app, .classic')")) break
  await sleep(250)
}

const webgl = await evaluate(`(() => {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
})()`)

check('WebGL disponible', webgl, String(webgl))

const mode = await evaluate("document.querySelector('.classic') ? 'classic' : '3d'")
check('Application montée', ['classic', '3d'].includes(mode), mode)

if (mode === 'classic') {
  const count = await evaluate("document.querySelectorAll('.classic section').length")
  check('Sections 2D présentes', count >= 9, String(count))
  const contactLinks = await evaluate(
    "Array.from(document.querySelectorAll('.classic a')).filter(a => /github/.test(a.href)).length",
  )
  check('Lien GitHub actif', contactLinks > 0, String(contactLinks))
  console.log(JSON.stringify({ mode, webgl, results }, null, 2))
  ws.close()
  process.exit(0)
}

// --- Intro -------------------------------------------------------------
check('Intro affichée', await evaluate("!!document.querySelector('.intro')"))
check(
  'Focus initial dans l’intro',
  await evaluate("!!document.activeElement?.closest('.intro')"),
  await evaluate('document.activeElement?.textContent?.trim() ?? ""'),
)

const entered = await evaluate(`(() => {
  const button = Array.from(document.querySelectorAll('.intro button')).find((item) =>
    /Entrer/.test(item.textContent ?? ''),
  )
  if (!button) return false
  button.click()
  return true
})()`)
check('Bouton d’entrée cliqué', entered)
await sleep(1200)

check('Intro refermée', !(await evaluate("!!document.querySelector('.intro')")))
check('HUD affiché', await evaluate("!!document.querySelector('.hud')"))

// Attendre le canvas 3D (chunk chargé à la demande).
let hasCanvas = false
for (let attempt = 0; attempt < 40; attempt += 1) {
  hasCanvas = await evaluate("!!document.querySelector('.scene canvas')")
  if (hasCanvas) break
  await sleep(250)
}
check('Canvas 3D monté', hasCanvas)

check(
  'Dix chapitres dans l’index',
  (await evaluate("document.querySelectorAll('.chapter-index button').length")) === 10,
  String(await evaluate("document.querySelectorAll('.chapter-index button').length")),
)

// --- Clavier -----------------------------------------------------------
await evaluate("document.body.focus()")
await evaluate(
  "document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))",
)
await sleep(2200)
const chapterAfterArrow = await evaluate("document.querySelector('.panel h2')?.textContent ?? ''")
check('Flèche droite change de zone', chapterAfterArrow === 'Qui suis-je', chapterAfterArrow)
check(
  'Annonce aria-live à jour',
  await evaluate(
    "Array.from(document.querySelectorAll('.sr-only[aria-live]')).map((n) => n.textContent).join(' ').includes('Qui suis-je')",
  ),
)

// --- Plan --------------------------------------------------------------
await evaluate(`(() => {
  const button = Array.from(document.querySelectorAll('.hud__actions button')).find(
    (item) => item.textContent?.trim() === 'Plan',
  )
  button?.focus()
  button?.click()
})()`)
await sleep(400)
check('Plan ouvert', await evaluate("!!document.querySelector('.map')"))
check(
  'Focus déplacé dans le plan',
  await evaluate("!!document.activeElement?.closest('.map__inner')"),
  await evaluate('document.activeElement?.textContent?.trim() ?? ""'),
)

// Piège de focus : Maj+Tab sur le premier élément doit aller au dernier.
await evaluate(`(() => {
  const items = Array.from(
    document.querySelectorAll('.map__inner a[href], .map__inner button:not([disabled])'),
  )
  items[0]?.focus()
})()`)
const trapped = await evaluate(`(() => {
  const items = Array.from(
    document.querySelectorAll('.map__inner a[href], .map__inner button:not([disabled])'),
  )
  const first = items[0]
  const last = items[items.length - 1]
  first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }))
  return document.activeElement === last
})()`)
check('Piège de focus (Maj+Tab)', trapped)

const projectsClicked = await evaluate(`(() => {
  const button = Array.from(document.querySelectorAll('.map__list button')).find(
    (item) => item.querySelector('strong')?.textContent === 'Projets',
  )
  if (!button) return false
  button.click()
  return true
})()`)
check('Navigation par le plan', projectsClicked)
await sleep(2200)
check(
  'Chapitre « Projets » atteint',
  (await evaluate("document.querySelector('.panel h2')?.textContent ?? ''")) === 'Projets',
  await evaluate("document.querySelector('.panel h2')?.textContent ?? ''"),
)
check('Plan refermé après sélection', !(await evaluate("!!document.querySelector('.map')")))

// --- Sélection 3D depuis le panneau -----------------------------------
await evaluate(`(() => {
  const button = Array.from(document.querySelectorAll('.panel button')).find(
    (item) => item.textContent?.trim() === 'Voir dans la pièce',
  )
  button?.click()
})()`)
await sleep(500)
check(
  'Cadrage rapproché actif',
  await evaluate("!!document.querySelector('.panel__back')"),
)

await evaluate("window.scrollBy(0, 60)")
await sleep(1200)
check(
  'Le scroll ferme le cadrage',
  !(await evaluate("!!document.querySelector('.panel__back')")),
)

// --- Passage en 2D puis retour en 3D ----------------------------------
await evaluate(`(() => {
  const button = Array.from(document.querySelectorAll('.hud__actions button')).find(
    (item) => item.textContent?.trim() === 'Version 2D',
  )
  button?.click()
})()`)
await sleep(600)
check('Version 2D affichée', await evaluate("!!document.querySelector('.classic')"))
check(
  'Titre de la version 2D',
  (await evaluate('document.title')) === 'Marilin BADJI — Portfolio',
  await evaluate('document.title'),
)
check('URL /classique', (await evaluate('location.pathname')) === '/classique', await evaluate('location.pathname'))
const classicOrder = await evaluate(
  "Array.from(document.querySelectorAll('.classic section')).map((s) => s.id).join(',')",
)
check('Ordre 2D cohérent', classicOrder.indexOf('certifications') < classicOrder.indexOf('engagement'), classicOrder)

await evaluate(`(() => {
  const button = Array.from(document.querySelectorAll('.classic button')).find(
    (item) => /Expérience 3D/.test(item.textContent ?? ''),
  )
  button?.click()
})()`)
await sleep(2500)
check('Retour en 3D', await evaluate("!!document.querySelector('.hud')"))
check('Intro non rejouée', !(await evaluate("!!document.querySelector('.intro')")))
check(
  'URL de retour',
  (await evaluate('location.pathname')) === '/',
  await evaluate('location.pathname'),
)
check(
  'Titre de la version 3D',
  (await evaluate('document.title')) === 'Marilin BADJI — Le monde de Marilin',
  await evaluate('document.title'),
)

// --- Échap -------------------------------------------------------------
await evaluate(`(() => {
  const button = document.querySelector('.hud__actions button')
  button?.focus()
  button?.click()
})()`)
await sleep(300)
await evaluate(`(() => {
  const target = document.activeElement ?? document.body
  target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
})()`)
await sleep(400)
check('Échap ferme le plan', !(await evaluate("!!document.querySelector('.map')")))
check(
  'Focus rendu au bouton Plan',
  await evaluate(
    "document.activeElement?.textContent?.trim() === 'Plan'",
  ),
  await evaluate('document.activeElement?.textContent?.trim() ?? ""'),
)

// --- Erreurs console ---------------------------------------------------
const errors = events
  .filter(
    (event) =>
      event.method === 'Runtime.exceptionThrown' ||
      (event.method === 'Runtime.consoleAPICalled' && event.params?.type === 'error') ||
      (event.method === 'Log.entryAdded' && event.params?.entry?.level === 'error'),
  )
  .map((event) => event.method)
check('Aucune erreur console', errors.length === 0, errors.join(', '))

const failed = results.filter((result) => !result.ok)
console.log(
  JSON.stringify(
    {
      mode,
      webgl,
      passed: results.length - failed.length,
      total: results.length,
      failed,
      results,
    },
    null,
    2,
  ),
)
ws.close()
process.exit(failed.length === 0 ? 0 : 1)
