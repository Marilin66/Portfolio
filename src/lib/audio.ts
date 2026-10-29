/**
 * Ambiance sonore entièrement synthétisée (aucun fichier audio).
 * Désactivée par défaut : rien ne démarre avant un geste explicite.
 */

let context: AudioContext | null = null
let master: GainNode | null = null
let enabled = false

function ensureContext(): AudioContext | null {
  if (context) return context
  const Ctor =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null

  context = new Ctor()
  master = context.createGain()
  master.gain.value = 0
  master.connect(context.destination)

  // Bourdonnement de transformateur : deux sinusoïdes très proches,
  // filtrées, pour un battement lent et discret.
  const drone = context.createGain()
  drone.gain.value = 1

  const filter = context.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 240
  filter.Q.value = 0.6

  drone.connect(filter)
  filter.connect(master)

  const low = context.createOscillator()
  low.type = 'sine'
  low.frequency.value = 50

  const harmonic = context.createOscillator()
  harmonic.type = 'sine'
  harmonic.frequency.value = 100.4

  const lowGain = context.createGain()
  lowGain.gain.value = 0.18

  const harmonicGain = context.createGain()
  harmonicGain.gain.value = 0.05

  low.connect(lowGain).connect(drone)
  harmonic.connect(harmonicGain).connect(drone)
  low.start()
  harmonic.start()

  return context
}

export function setAudioEnabled(next: boolean): void {
  enabled = next
  if (!next) {
    if (master && context) {
      master.gain.cancelScheduledValues(context.currentTime)
      master.gain.setTargetAtTime(0, context.currentTime, 0.25)
    }
    return
  }

  const ctx = ensureContext()
  if (!ctx || !master) return
  void ctx.resume()
  master.gain.cancelScheduledValues(ctx.currentTime)
  master.gain.setTargetAtTime(0.16, ctx.currentTime, 0.6)
}

/** Clic d'interface discret (relais). */
export function playTick(kind: 'navigate' | 'select' = 'navigate'): void {
  if (!enabled) return
  const ctx = ensureContext()
  if (!ctx || !master) return

  const now = ctx.currentTime
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  const filter = ctx.createBiquadFilter()

  oscillator.type = 'square'
  oscillator.frequency.value = kind === 'select' ? 880 : 1320
  filter.type = 'bandpass'
  filter.frequency.value = kind === 'select' ? 1200 : 2400
  filter.Q.value = 1.2

  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.05, now + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09)

  oscillator.connect(filter).connect(gain).connect(master)
  oscillator.start(now)
  oscillator.stop(now + 0.1)
}
