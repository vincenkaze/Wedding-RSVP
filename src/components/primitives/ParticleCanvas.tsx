/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef } from 'react'

// ── Types ──

interface AmbientParticle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
  baseOpacity: number
  phase: number
  color: string
}

interface VortexParticle {
  x: number
  y: number
  centerX: number
  centerY: number
  angle: number
  distance: number
  angularVelocity: number
  radialVelocity: number
  radius: number
  opacity: number
  maxOpacity: number
  color: string
  born: number
  lifetime: number
  snapped: boolean
}

// ── Module-level fire functions (set by the component) ──

let _fireVortex: ((x: number, y: number) => void) | null = null
let _fireMiniVortex: ((x: number, y: number) => void) | null = null

export function fireVortex(x: number, y: number) {
  _fireVortex?.(x, y)
}

export function fireMiniVortex(x: number, y: number) {
  _fireMiniVortex?.(x, y)
}

// ── Helpers ──

function getParticleColors(): string[] {
  const style = getComputedStyle(document.documentElement)
  return [
    style.getPropertyValue('--color-accent').trim() || '#b08968',
    style.getPropertyValue('--color-accent-light').trim() || '#ddb892',
  ]
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

// ── Constants ──

const AMBIENT_COUNT = 40
const VORTEX_COUNT = 30
const MINI_VORTEX_COUNT = 12
const VORTEX_RADIUS = 150
const VORTEX_SNAP_THRESHOLD = 25
const MINI_VORTEX_RADIUS = 60
const MINI_VORTEX_SNAP_THRESHOLD = 15
const VORTEX_LIFETIME = 1200
const MINI_VORTEX_LIFETIME = 700

// ── Reduced motion gate ──

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// ── Component ──

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (prefersReducedMotion) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let colors = getParticleColors()
    const ambientParticles: AmbientParticle[] = []
    const vortexParticles: VortexParticle[] = []
    let rafId = 0
    let lastTime = 0

    function initAmbient() {
      const w = window.innerWidth
      const h = window.innerHeight
      for (let i = 0; i < AMBIENT_COUNT; i++) {
        const baseOpacity = rand(0.06, 0.12)
        ambientParticles.push({
          x: rand(0, w),
          y: rand(0, h),
          vx: rand(-0.2, 0.2),
          vy: rand(-0.2, 0.2),
          radius: rand(1, 2.5),
          opacity: baseOpacity,
          baseOpacity,
          phase: rand(0, Math.PI * 2),
          color: colors[Math.floor(rand(0, colors.length))],
        })
      }
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      colors = getParticleColors()
    }

    resize()
    initAmbient()
    window.addEventListener('resize', resize)

    // ── Context lost / restored ──

    function onContextLost(e: Event) {
      e.preventDefault()
      cancelAnimationFrame(rafId)
    }

    function onContextRestored() {
      lastTime = performance.now()
      rafId = requestAnimationFrame(animate)
    }

    canvas.addEventListener('contextlost', onContextLost)
    canvas.addEventListener('contextrestored', onContextRestored)

    // ── Animation loop ──

    function animate(time: number) {
      // Sleep when tab is hidden
      if (document.hidden) {
        rafId = requestAnimationFrame(animate)
        return
      }

      const dt = Math.min(time - lastTime, 32)
      lastTime = time

      const w = window.innerWidth
      const h = window.innerHeight
      ctx.clearRect(0, 0, w, h)

      const now = performance.now()

      // ── Ambient particles ──

      for (const p of ambientParticles) {
        const noiseX = Math.sin(p.y * 0.003 + time * 0.0002 + p.phase) * 0.15
        const noiseY =
          Math.cos(p.x * 0.003 + time * 0.00015 + p.phase) * 0.15 - 0.03
        p.vx += noiseX * (dt / 16)
        p.vy += noiseY * (dt / 16)
        p.vx *= 0.98
        p.vy *= 0.98
        p.x += p.vx * (dt / 16)
        p.y += p.vy * (dt / 16)

        // Wrap around edges
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        if (p.y > h + 10) p.y = -10

        // Subtle opacity pulse
        const opacityPulse = Math.sin(time * 0.001 + p.phase) * 0.02
        p.opacity = p.baseOpacity + opacityPulse

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = hexToRgba(p.color, p.opacity)
        ctx.fill()
      }

      // ── Vortex / mini-vortex particles ──

      for (let i = vortexParticles.length - 1; i >= 0; i--) {
        const p = vortexParticles[i]
        const age = now - p.born
        if (age < 0) continue // not yet born (staggered)
        if (age > p.lifetime) {
          vortexParticles.splice(i, 1)
          continue
        }

        const progress = age / p.lifetime

        // Phase logic: spiral-in → snap-out
        if (!p.snapped && p.radialVelocity < 0) {
          const threshold =
            p.lifetime < 800 ? MINI_VORTEX_SNAP_THRESHOLD : VORTEX_SNAP_THRESHOLD
          if (p.distance <= threshold || progress > 0.5) {
            // Snap outward — elastic burst
            p.radialVelocity = Math.abs(p.radialVelocity) * 2.2
            p.angularVelocity *= 0.6
            p.snapped = true
          } else {
            // Still spiraling in — accelerate rotation
            p.angularVelocity *= 1.008
          }
        }

        // Hydrodynamic friction
        p.radialVelocity *= 0.96
        p.angularVelocity *= 0.993

        // Update position
        p.angle += p.angularVelocity * (dt / 16)
        p.distance += p.radialVelocity * (dt / 16)
        p.x = p.centerX + Math.cos(p.angle) * p.distance
        p.y = p.centerY + Math.sin(p.angle) * p.distance

        // Fade out
        p.opacity = p.maxOpacity * Math.max(0, 1 - progress * progress)

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = hexToRgba(p.color, p.opacity)
        ctx.fill()
      }

      // RAF gating — continue if ambient particles or effects exist
      if (ambientParticles.length > 0 || vortexParticles.length > 0) {
        rafId = requestAnimationFrame(animate)
      }
    }

    rafId = requestAnimationFrame(animate)

    // ── Fire functions ──

    _fireVortex = (x: number, y: number) => {
      const now = performance.now()
      for (let i = 0; i < VORTEX_COUNT; i++) {
        const angle = rand(0, Math.PI * 2)
        const distance = rand(60, VORTEX_RADIUS)
        vortexParticles.push({
          x: x + Math.cos(angle) * distance,
          y: y + Math.sin(angle) * distance,
          centerX: x,
          centerY: y,
          angle,
          distance,
          angularVelocity: rand(6, 10) * (Math.random() > 0.5 ? 1 : -1),
          radialVelocity: -rand(2, 4),
          radius: rand(1.5, 3.5),
          opacity: 0,
          maxOpacity: rand(0.5, 0.8),
          color: colors[Math.floor(rand(0, colors.length))],
          born: now + rand(0, 80),
          lifetime: VORTEX_LIFETIME + rand(-100, 200),
          snapped: false,
        })
      }
    }

    _fireMiniVortex = (x: number, y: number) => {
      const now = performance.now()
      for (let i = 0; i < MINI_VORTEX_COUNT; i++) {
        const angle = rand(0, Math.PI * 2)
        const distance = rand(20, MINI_VORTEX_RADIUS)
        vortexParticles.push({
          x: x + Math.cos(angle) * distance,
          y: y + Math.sin(angle) * distance,
          centerX: x,
          centerY: y,
          angle,
          distance,
          angularVelocity: rand(4, 6) * (Math.random() > 0.5 ? 1 : -1),
          radialVelocity: -rand(1.5, 2.5),
          radius: rand(1, 2.5),
          opacity: 0,
          maxOpacity: rand(0.25, 0.45),
          color: colors[Math.floor(rand(0, colors.length))],
          born: now + rand(0, 60),
          lifetime: MINI_VORTEX_LIFETIME + rand(-50, 100),
          snapped: false,
        })
      }
    }

    // ── Cleanup ──

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('contextlost', onContextLost)
      canvas.removeEventListener('contextrestored', onContextRestored)
      _fireVortex = null
      _fireMiniVortex = null
    }
  }, [])

  if (prefersReducedMotion) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[9998]"
    />
  )
}
