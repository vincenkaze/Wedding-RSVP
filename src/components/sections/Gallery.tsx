import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { gallery, sections } from '../../content/content'
import Lightbox from './Lightbox'
import { EASE_ENTRANCE, DURATION_CINEMATIC } from '../primitives/reveal'

const RADIUS = 140
const DEG_PER_PX = 0.4
const FRICTION = 0.92
const STOP_THRESHOLD = 4
const SNAP_DURATION = 320
const TAP_MAX_MS = 250
const TAP_MAX_PX = 8

const spherePositions = gallery.map((_, i) => {
  const phi = Math.acos(1 - 2 * (i + 0.5) / gallery.length)
  const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5)
  return {
    x: RADIUS * Math.sin(phi) * Math.cos(theta),
    y: RADIUS * Math.cos(phi),
    z: RADIUS * Math.sin(phi) * Math.sin(theta),
  }
})

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export default function Gallery() {
  const prefersReducedMotion = useReducedMotion()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const globeRef = useRef<HTMLDivElement>(null)
  const photoRefs = useRef<(HTMLButtonElement | null)[]>([])
  const openSoundRef = useRef<HTMLAudioElement>(null)
  const flickSoundRef = useRef<HTMLAudioElement>(null)
  const rotX = useRef(0)
  const rotY = useRef(0)
  const dragging = useRef(false)
  const lastX = useRef(0)
  const lastY = useRef(0)
  const lastT = useRef(0)
  const velX = useRef(0)
  const velY = useRef(0)
  const raf = useRef<number | null>(null)
  const snapRaf = useRef<number | null>(null)
  const pointerDownT = useRef(0)
  const pointerDownX = useRef(0)
  const pointerDownY = useRef(0)
  const audioUnlocked = useRef(false)

  const pickActive = useCallback(() => {
    let bestIdx = 0
    let bestArea = 0
    photoRefs.current.forEach((el, i) => {
      if (!el) return
      const rect = el.getBoundingClientRect()
      const area = rect.width * rect.height
      if (area > bestArea) {
        bestArea = area
        bestIdx = i
      }
    })
    setActiveIndex(bestIdx)
    return bestIdx
  }, [])

  const render = useCallback(() => {
    const el = globeRef.current
    if (!el) return
    el.style.transform = `rotateX(${rotX.current}deg) rotateY(${rotY.current}deg)`
  }, [])

  const snapTo = useCallback(
    (photoIdx: number) => {
      const pos = spherePositions[photoIdx]
      const targetRotY = (-Math.atan2(pos.x, pos.z) * 180) / Math.PI
      const targetRotX =
        (Math.atan2(pos.y, Math.sqrt(pos.x * pos.x + pos.z * pos.z)) * 180) /
        Math.PI

      const startX = rotX.current
      const startY = rotY.current
      const startTime = performance.now()

      if (snapRaf.current !== null) cancelAnimationFrame(snapRaf.current)

      const step = () => {
        const elapsed = performance.now() - startTime
        const t = Math.min(elapsed / SNAP_DURATION, 1)
        const ease = easeOutCubic(t)

        rotX.current = startX + (targetRotX - startX) * ease
        rotY.current = startY + (targetRotY - startY) * ease
        render()

        if (t < 1) {
          snapRaf.current = requestAnimationFrame(step)
        } else {
          snapRaf.current = null
        }
      }
      snapRaf.current = requestAnimationFrame(step)
    },
    [render],
  )

  const playSound = useCallback((ref: React.RefObject<HTMLAudioElement | null>) => {
    const sound = ref.current
    if (!sound) return
    try {
      sound.currentTime = 0
      const p = sound.play()
      if (p && typeof p.catch === 'function') p.catch(() => {})
    } catch {
      /* silent fail */
    }
  }, [])

  const unlockAudio = useCallback(() => {
    if (audioUnlocked.current) return
    const sound = openSoundRef.current
    if (!sound) return
    sound.volume = 0
    const p = sound.play()
    if (p && typeof p.then === 'function') {
      p.then(() => {
        sound.pause()
        sound.currentTime = 0
        sound.volume = 1
        audioUnlocked.current = true
      }).catch(() => {})
    }
  }, [])

  useEffect(() => {
    const handleTouchStart = () => unlockAudio()
    const handleMouseDown = () => unlockAudio()
    window.addEventListener('touchstart', handleTouchStart, { once: true, passive: true })
    window.addEventListener('mousedown', handleMouseDown, { once: true })
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('mousedown', handleMouseDown)
    }
  }, [unlockAudio])

  const startMomentum = useCallback(() => {
    if (raf.current !== null) cancelAnimationFrame(raf.current)
    const step = () => {
      rotY.current += velY.current * (1 / 60)
      rotX.current += velX.current * (1 / 60)
      rotX.current = Math.max(-80, Math.min(80, rotX.current))
      render()
      pickActive()
      velX.current *= FRICTION
      velY.current *= FRICTION
      if (Math.hypot(velX.current, velY.current) < STOP_THRESHOLD) {
        raf.current = null
        const active = pickActive()
        snapTo(active)
        return
      }
      raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
  }, [render, pickActive, snapTo])

  const onDown = useCallback(
    (x: number, y: number) => {
      dragging.current = true
      lastX.current = x
      lastY.current = y
      lastT.current = performance.now()
      velX.current = 0
      velY.current = 0
      pointerDownT.current = performance.now()
      pointerDownX.current = x
      pointerDownY.current = y
      if (raf.current !== null) {
        cancelAnimationFrame(raf.current)
        raf.current = null
      }
      if (snapRaf.current !== null) {
        cancelAnimationFrame(snapRaf.current)
        snapRaf.current = null
      }
    },
    [],
  )

  const onMove = useCallback(
    (x: number, y: number) => {
      if (!dragging.current) return
      const now = performance.now()
      const dt = Math.max(now - lastT.current, 1) / 1000
      const dx = x - lastX.current
      const dy = y - lastY.current

      rotY.current += dx * DEG_PER_PX
      rotX.current -= dy * DEG_PER_PX
      rotX.current = Math.max(-80, Math.min(80, rotX.current))

      velX.current = (-dy * DEG_PER_PX) / dt
      velY.current = (dx * DEG_PER_PX) / dt

      render()
      pickActive()
      lastX.current = x
      lastY.current = y
      lastT.current = now
    },
    [render, pickActive],
  )

  const onUp = useCallback(
    (x: number, y: number) => {
      if (!dragging.current) return
      dragging.current = false

      const elapsed = performance.now() - pointerDownT.current
      const dist = Math.hypot(x - pointerDownX.current, y - pointerDownY.current)
      const isTap = elapsed < TAP_MAX_MS && dist < TAP_MAX_PX

      if (isTap) {
        playSound(openSoundRef)
        setLightboxIndex(activeIndex)
      } else {
        startMomentum()
      }
    },
    [activeIndex, playSound, startMomentum],
  )

  useEffect(() => {
    const globe = globeRef.current
    if (!globe) return

    const handleMouseDown = (e: MouseEvent) => onDown(e.clientX, e.clientY)
    const handleMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY)
    const handleMouseUp = (e: MouseEvent) => onUp(e.clientX, e.clientY)
    const handleTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]
      onDown(t.clientX, t.clientY)
    }
    const handleTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      onMove(t.clientX, t.clientY)
    }
    const handleTouchEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0]
      onUp(t.clientX, t.clientY)
    }

    globe.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    globe.addEventListener('touchstart', handleTouchStart, { passive: true })
    globe.addEventListener('touchmove', handleTouchMove, { passive: true })
    globe.addEventListener('touchend', handleTouchEnd)
    globe.addEventListener('touchcancel', handleTouchEnd)

    return () => {
      globe.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      globe.removeEventListener('touchstart', handleTouchStart)
      globe.removeEventListener('touchmove', handleTouchMove)
      globe.removeEventListener('touchend', handleTouchEnd)
      globe.removeEventListener('touchcancel', handleTouchEnd)
      if (raf.current !== null) cancelAnimationFrame(raf.current)
      if (snapRaf.current !== null) cancelAnimationFrame(snapRaf.current)
    }
  }, [onDown, onMove, onUp])

  const handleLightboxNavigate = useCallback(
    (idx: number) => {
      playSound(flickSoundRef)
      setLightboxIndex(idx)
    },
    [playSound],
  )

  return (
    <section id="gallery" className="relative px-6 py-20 sm:py-28 md:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12 sm:mb-16">
          <motion.p
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DURATION_CINEMATIC, ease: EASE_ENTRANCE }}
            className="font-body text-xs font-semibold uppercase tracking-[0.24em] text-accent sm:text-sm"
          >
            {sections.gallery.label}
          </motion.p>
          <motion.h2
            initial={
              prefersReducedMotion
                ? undefined
                : { opacity: 0, y: 20, filter: 'blur(4px)' }
            }
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{
              duration: DURATION_CINEMATIC,
              ease: EASE_ENTRANCE,
              delay: 0.08,
            }}
            className="mt-4 font-display text-3xl tracking-tight text-text sm:text-4xl md:text-5xl"
          >
            {sections.gallery.heading}
          </motion.h2>
        </div>

        <motion.div
          initial={
            prefersReducedMotion
              ? { opacity: 1 }
              : { opacity: 0, scale: 0.96, filter: 'blur(4px)' }
          }
          whileInView={
            prefersReducedMotion
              ? { opacity: 1 }
              : { opacity: 1, scale: 1, filter: 'blur(0px)' }
          }
          viewport={{ once: true }}
          transition={{ duration: DURATION_CINEMATIC, ease: EASE_ENTRANCE, delay: 0.15 }}
          className="flex justify-center"
        >
          <div className="globe-wrapper">
            <div ref={globeRef} className="globe">
              {gallery.map((item, i) => {
                const pos = spherePositions[i]
                const isActive = activeIndex === i
                return (
                  <button
                    key={item.src}
                    ref={(el) => { photoRefs.current[i] = el }}
                    type="button"
                    className={`photo${isActive ? ' is-active' : ''}`}
                    style={{
                      transform: `translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px)`,
                    }}
                    aria-label={`View photo: ${item.alt}`}
                  >
                    <picture>
                      <source
                        type="image/avif"
                        srcSet={item.src.replace(/\.\w+$/, '.avif')}
                      />
                      <source
                        type="image/webp"
                        srcSet={item.src.replace(/\.\w+$/, '.webp')}
                      />
                      <img
                        src={item.src.replace(/\.\w+$/, '.jpg')}
                        alt={item.alt}
                        loading={item.priority ? 'eager' : 'lazy'}
                        decoding="async"
                        draggable={false}
                        className="photo-bw"
                        width={80}
                        height={80}
                      />
                    </picture>
                  </button>
                )
              })}
            </div>
          </div>
        </motion.div>

        <audio ref={openSoundRef} src="/audio/open.mp3" preload="auto" />
        <audio ref={flickSoundRef} src="/audio/Flick.mp3" preload="auto" />
      </div>

      <Lightbox
        items={gallery}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={handleLightboxNavigate}
      />
    </section>
  )
}
