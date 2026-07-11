import { useCallback, useRef } from 'react'

const PETAL_EMOJIS = ['🌸', '🌺', '🌷', '🌹', '💮', '🏵️', '🪷', '🌼'] as const
const PHASE3_DURATION = 3200

let popAudio: HTMLAudioElement | null = null
function getPopAudio() {
  if (!popAudio) {
    popAudio = new Audio('/audio/POP.mp3')
    popAudio.volume = 0.5
  }
  return popAudio
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

interface Particle {
  el: HTMLSpanElement
}

function createParticle(
  type: 'blast-left' | 'blast-right' | 'fountain' | 'rain',
): Particle {
  const el = document.createElement('span')
  el.textContent = pick(PETAL_EMOJIS)
  el.setAttribute('aria-hidden', 'true')

  const size = rand(12, 32)
  Object.assign(el.style, {
    position: 'fixed',
    zIndex: '9998',
    pointerEvents: 'none',
    fontSize: `${size}px`,
    lineHeight: '1',
    willChange: 'transform, opacity',
  })

  switch (type) {
    case 'blast-left': {
      el.style.left = `${rand(-2, 5)}%`
      el.style.bottom = `${rand(-2, 5)}%`
      el.style.setProperty('--rand-x', `${rand(10, 200)}px`)
      el.style.setProperty('--rand-y', `${rand(-20, 120)}px`)
      el.style.setProperty('--rand-r', `${rand(180, 1080)}deg`)
      el.style.animationName = 'flower-blast-left'
      break
    }
    case 'blast-right': {
      el.style.right = `${rand(-2, 5)}%`
      el.style.bottom = `${rand(-2, 5)}%`
      el.style.setProperty('--rand-x', `${rand(10, 200)}px`)
      el.style.setProperty('--rand-y', `${rand(-20, 120)}px`)
      el.style.setProperty('--rand-r', `${rand(-1080, -180)}deg`)
      el.style.animationName = 'flower-blast-right'
      break
    }
    case 'fountain': {
      el.style.left = `${rand(35, 65)}%`
      el.style.bottom = '0'
      el.style.setProperty('--rand-x', `${rand(-100, 100)}px`)
      el.style.setProperty('--rand-y', `${rand(0, 100)}px`)
      el.style.setProperty('--rand-r', `${rand(180, 1440)}deg`)
      el.style.animationName = 'flower-fountain'
      break
    }
    case 'rain': {
      el.style.left = `${rand(0, 100)}%`
      el.style.top = `${rand(-60, -10)}px`
      el.style.setProperty('--rand-x', `${rand(-60, 60)}px`)
      el.style.setProperty('--rand-r', `${rand(180, 1440)}deg`)
      el.style.animationName = 'flower-rain'
      break
    }
  }

  const duration =
    type === 'rain' ? rand(2.5, 4.5) : type === 'fountain' ? rand(1.2, 2.2) : rand(0.8, 1.6)
  const delay = type === 'rain' ? rand(0.3, 2) : rand(0, 0.5)

  el.style.animationDuration = `${duration}s`
  el.style.animationDelay = `${delay}s`
  el.style.animationTimingFunction =
    type === 'rain'
      ? 'cubic-bezier(0.25, 0.1, 0.25, 1)'
      : 'cubic-bezier(0.22, 1, 0.36, 1)'
  el.style.animationFillMode = 'forwards'
  el.style.animationIterationCount = '1'

  return { el }
}

export default function FlowerShower() {
  const batchRef = useRef(0)

  const fire = useCallback(() => {
    const batch = ++batchRef.current
    const particles: Particle[] = []

    for (let i = 0; i < 35; i++) particles.push(createParticle('blast-left'))
    for (let i = 0; i < 35; i++) particles.push(createParticle('blast-right'))
    for (let i = 0; i < 30; i++) particles.push(createParticle('fountain'))
    for (let i = 0; i < 50; i++) particles.push(createParticle('rain'))

    particles.forEach((p) => document.body.appendChild(p.el))

    try {
      const audio = getPopAudio()
      audio.currentTime = 0
      audio.play().catch(() => {})
    } catch {}

    setTimeout(() => {
      if (batch !== batchRef.current) return
      particles.forEach((p) => {
        if (p.el.parentNode) p.el.parentNode.removeChild(p.el)
      })
    }, PHASE3_DURATION)
  }, [])

  return { fire }
}
