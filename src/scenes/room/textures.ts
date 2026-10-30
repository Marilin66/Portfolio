import * as THREE from 'three'

/**
 * Textures générées à la volée sur un canvas : aucun asset binaire,
 * aucun chargement réseau, et une identité visuelle cohérente.
 * Toutes les textures sont en sRGB et répétables quand nécessaire.
 */

function canvas2d(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D indisponible')
  return { canvas, ctx }
}

function toTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

/** Parquet clair, planches larges, grain discret. */
export function makeWoodTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = canvas2d(512, 512)
  const plank = 64

  ctx.fillStyle = '#CDB392'
  ctx.fillRect(0, 0, 512, 512)

  for (let row = 0; row < 8; row += 1) {
    const y = row * plank
    ctx.fillStyle = row % 2 === 0 ? '#D3BA99' : '#C6AB88'
    ctx.fillRect(0, y, 512, plank)

    ctx.fillStyle = 'rgba(96, 74, 50, 0.28)'
    ctx.fillRect(0, y, 512, 1.5)

    for (let grain = 0; grain < 10; grain += 1) {
      const gy = y + 6 + Math.random() * (plank - 12)
      ctx.strokeStyle = `rgba(120, 92, 60, ${0.03 + Math.random() * 0.05})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, gy)
      ctx.bezierCurveTo(150, gy - 3, 340, gy + 3, 512, gy)
      ctx.stroke()
    }

    ctx.fillStyle = 'rgba(96, 74, 50, 0.22)'
    ctx.fillRect(row % 2 === 0 ? 150 : 360, y, 1.5, plank)
  }

  const texture = toTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(5, 4)
  return texture
}

/** Ciel d'aube derrière la fenêtre. */
export function makeSkyTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = canvas2d(512, 512)

  const sky = ctx.createLinearGradient(0, 0, 0, 512)
  sky.addColorStop(0, '#5A7FB2')
  sky.addColorStop(0.38, '#96B8DA')
  sky.addColorStop(0.66, '#E7D6C2')
  sky.addColorStop(0.82, '#F9E8CB')
  sky.addColorStop(1, '#F3DDBE')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, 512, 512)

  const sun = ctx.createRadialGradient(300, 330, 8, 300, 330, 150)
  sun.addColorStop(0, 'rgba(255, 250, 235, 1)')
  sun.addColorStop(0.25, 'rgba(255, 238, 205, 0.85)')
  sun.addColorStop(1, 'rgba(255, 226, 180, 0)')
  ctx.fillStyle = sun
  ctx.fillRect(0, 120, 512, 392)

  ctx.fillStyle = 'rgba(122, 148, 177, 0.35)'
  ctx.beginPath()
  ctx.ellipse(120, 452, 220, 46, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(96, 124, 158, 0.32)'
  ctx.beginPath()
  ctx.ellipse(400, 470, 260, 52, 0, 0, Math.PI * 2)
  ctx.fill()

  return toTexture(canvas)
}

/** Tapis profond, bordure claire. */
export function makeRugTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = canvas2d(512, 512)
  ctx.fillStyle = '#26345F'
  ctx.fillRect(0, 0, 512, 512)
  ctx.strokeStyle = '#4C5FB0'
  ctx.lineWidth = 8
  ctx.strokeRect(20, 20, 472, 472)
  ctx.strokeStyle = 'rgba(143, 240, 250, 0.22)'
  ctx.lineWidth = 2
  ctx.strokeRect(44, 44, 424, 424)

  ctx.strokeStyle = 'rgba(180, 205, 240, 0.12)'
  ctx.lineWidth = 2
  for (let i = 0; i < 7; i += 1) {
    const x = 90 + i * 56
    ctx.beginPath()
    ctx.moveTo(x, 90)
    ctx.lineTo(x + 32, 422)
    ctx.stroke()
  }

  return toTexture(canvas)
}

/** Portrait de remplacement, en attendant la photo. */
export function makePortraitTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = canvas2d(512, 640)

  const bg = ctx.createLinearGradient(0, 0, 512, 640)
  bg.addColorStop(0, '#21315C')
  bg.addColorStop(1, '#5A6BE0')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 512, 640)

  ctx.strokeStyle = 'rgba(143, 240, 250, 0.16)'
  ctx.lineWidth = 1
  for (let x = 0; x <= 512; x += 64) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, 640)
    ctx.stroke()
  }
  for (let y = 0; y <= 640; y += 64) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(512, y)
    ctx.stroke()
  }

  ctx.beginPath()
  ctx.arc(256, 262, 118, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(244, 240, 230, 0.12)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(143, 240, 250, 0.65)'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = '#F4EFE6'
  ctx.font = '700 112px "Montserrat", system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('MB', 256, 268)

  ctx.fillStyle = 'rgba(180, 235, 245, 0.9)'
  ctx.font = '600 18px "Inter", system-ui, sans-serif'
  ctx.fillText('PHOTO À FOURNIR', 256, 452)

  ctx.fillStyle = 'rgba(244, 240, 230, 0.5)'
  ctx.font = '400 15px "Inter", system-ui, sans-serif'
  ctx.fillText('Marilin BADJI · Bohicon, Bénin', 256, 486)

  return toTexture(canvas)
}

/** Aperçu abstrait d'une interface, avec le nom du projet. */
export function makeScreenTexture(label: string, accent: string): THREE.CanvasTexture {
  const { canvas, ctx } = canvas2d(640, 400)

  ctx.fillStyle = '#0E1A2E'
  ctx.fillRect(0, 0, 640, 400)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)'
  ctx.fillRect(0, 0, 640, 34)
  ;['#56D6E8', '#7FEBC4', '#8B96D8'].forEach((color, index) => {
    ctx.beginPath()
    ctx.arc(22 + index * 18, 17, 4, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.globalAlpha = 0.6
    ctx.fill()
  })
  ctx.globalAlpha = 1

  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
  ctx.fillRect(0, 34, 120, 366)
  for (let i = 0; i < 5; i += 1) {
    ctx.fillStyle = 'rgba(220, 236, 255, 0.18)'
    ctx.fillRect(18, 64 + i * 40, 78, 8)
  }

  ctx.fillStyle = accent
  ctx.globalAlpha = 0.9
  ctx.fillRect(150, 74, 42, 4)
  ctx.globalAlpha = 1

  ctx.fillStyle = '#F4EFE6'
  ctx.font = '700 28px "Montserrat", system-ui, sans-serif'
  ctx.textAlign = 'left'
  const words = label.split(' ')
  const lines: string[] = []
  let current = ''
  words.forEach((word) => {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > 420) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  })
  if (current) lines.push(current)
  lines.slice(0, 2).forEach((line, index) => {
    ctx.fillText(line, 150, 128 + index * 36)
  })

  const blocks = [
    { x: 150, y: 206, w: 190, h: 92 },
    { x: 356, y: 206, w: 120, h: 92 },
    { x: 492, y: 206, w: 112, h: 92 },
    { x: 150, y: 314, w: 300, h: 12 },
    { x: 150, y: 338, w: 220, h: 12 },
  ]
  blocks.forEach((block, index) => {
    ctx.fillStyle = index < 3 ? 'rgba(86, 214, 232, 0.12)' : 'rgba(244, 239, 230, 0.16)'
    ctx.fillRect(block.x, block.y, block.w, block.h)
    if (index < 3) {
      ctx.strokeStyle = 'rgba(86, 214, 232, 0.35)'
      ctx.lineWidth = 1
      ctx.strokeRect(block.x + 0.5, block.y + 0.5, block.w - 1, block.h - 1)
    }
  })

  return toTexture(canvas)
}

/** Halo doux pour les faisceaux de lumière. */
export function makeBeamTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = canvas2d(256, 256)
  const gradient = ctx.createRadialGradient(128, 128, 4, 128, 128, 128)
  gradient.addColorStop(0, 'rgba(255, 244, 224, 0.55)')
  gradient.addColorStop(0.45, 'rgba(255, 238, 210, 0.16)')
  gradient.addColorStop(1, 'rgba(255, 238, 210, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 256, 256)
  return toTexture(canvas)
}

/**
 * Ballon de football : pentagones sombres sur cuir clair, projetés en
 * équirectangulaire. Le motif est dessiné trois fois (centre, bord gauche,
 * bord droit) pour rester continu quand la texture fait le tour de la sphère.
 */
export function makeFootballTexture(): THREE.CanvasTexture {
  const width = 1024
  const height = 512
  const { canvas, ctx } = canvas2d(width, height)

  ctx.fillStyle = '#F3EFE3'
  ctx.fillRect(0, 0, width, height)

  // Grain du cuir, très discret : il évite un blanc plat à l'écran.
  for (let index = 0; index < 900; index += 1) {
    ctx.fillStyle = `rgba(120, 110, 92, ${0.018 + Math.random() * 0.03})`
    ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2)
  }

  const pentagon = (cx: number, cy: number, rx: number, ry: number, rotation: number) => {
    ctx.beginPath()
    for (let corner = 0; corner < 5; corner += 1) {
      const angle = rotation - Math.PI / 2 + (corner * Math.PI * 2) / 5
      const x = cx + Math.cos(angle) * rx
      const y = cy + Math.sin(angle) * ry
      if (corner === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
  }

  // Deux anneaux de cinq pentagones : la disposition classique d'un ballon.
  const spots = [
    ...Array.from({ length: 5 }, (_, index) => ({
      u: (index * 2) / 5 + 0.1,
      v: 0.5 - 26.57 / 180,
    })),
    ...Array.from({ length: 5 }, (_, index) => ({
      u: (index * 2) / 5 + 0.3,
      v: 0.5 + 26.57 / 180,
    })),
  ]

  spots.forEach((spot, index) => {
    const cx = spot.u * width
    const cy = spot.v * height
    const stretch = 1 / Math.cos(((0.5 - spot.v) * Math.PI))
    const radius = width / 24 // environ 15° de rayon
    ;[-width, 0, width].forEach((offset) => {
      pentagon(cx + offset, cy, radius * stretch, radius, index * 0.5)
      ctx.fillStyle = '#1E2838'
      ctx.fill()
      ctx.strokeStyle = 'rgba(244, 240, 230, 0.28)'
      ctx.lineWidth = 2
      ctx.stroke()
    })
  })

  // Calottes polaires : la projection étire le pentagone du pôle sur toute
  // la largeur de la texture.
  ctx.fillStyle = '#1E2838'
  ctx.fillRect(0, 0, width, 12)
  ctx.fillRect(0, height - 12, width, 12)
  ctx.strokeStyle = 'rgba(244, 240, 230, 0.22)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, 15)
  ctx.lineTo(width, 15)
  ctx.moveTo(0, height - 15)
  ctx.lineTo(width, height - 15)
  ctx.stroke()

  return toTexture(canvas)
}

/** Ombre de contact douce : ancre les objets au sol sans vraie shadow map. */
export function makeSoftShadowTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = canvas2d(256, 256)
  const gradient = ctx.createRadialGradient(128, 128, 10, 128, 128, 126)
  gradient.addColorStop(0, 'rgba(28, 35, 49, 0.55)')
  gradient.addColorStop(0.5, 'rgba(28, 35, 49, 0.24)')
  gradient.addColorStop(1, 'rgba(28, 35, 49, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 256, 256)
  return toTexture(canvas)
}

