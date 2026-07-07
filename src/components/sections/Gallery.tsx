import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { gallery, sections } from '../../content/content'
import Lightbox from './Lightbox'
import { EASE_ENTRANCE, DURATION_CINEMATIC } from '../primitives/reveal'

const RADIUS = 110
const PHOTOS_PER_RING = 3
const DEG_PER_PX = 0.4
const FRICTION = 0.92
const STOP_THRESHOLD = 4
const FLICK_VELOCITY = 600
const FLICK_COOLDOWN_MS = 120
const RING_CONFIGS = [
  { tilt: 35, photos: gallery.slice(0, 3) },
  { tilt: 0, photos: gallery.slice(3, 6) },
  { tilt: -35, photos: gallery.slice(6, 9) },
] as const

export default function Gallery() {
  const prefersReducedMotion = useReducedMotion()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const globeRef = useRef<HTMLDivElement>(null)
  const soundRef = useRef<HTMLAudioElement>(null)
  const rotX = useRef(0)
  const rotY = useRef(0)
  const dragging = useRef(false)
  const lastX = useRef(0)
  const lastY = useRef(0)
  const lastT = useRef(0)
  const velX = useRef(0)
  const velY = useRef(0)
  const raf = useRef<number | null>(null)
  const lastFlickAt = useRef(0)
  const audioUnlocked = useRef(false)

  const render = useCallback(() => {
    const el = globeRef.current
    if (!el) return
    el.style.transform = `rotateX(${rotX.current}deg) rotateY(${rotY.current}deg)`
  }, [])

  const playClick = useCallback(() => {
    const sound = soundRef.current
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
    const sound = soundRef.current
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
      velX.current *= FRICTION
      velY.current *= FRICTION
      if (Math.hypot(velX.current, velY.current) < STOP_THRESHOLD) {
        raf.current = null
        return
      }
      raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
  }, [render])

  const onDown = useCallback(
    (x: number, y: number) => {
      dragging.current = true
      lastX.current = x
      lastY.current = y
      lastT.current = performance.now()
      velX.current = 0
      velY.current = 0
      if (raf.current !== null) {
        cancelAnimationFrame(raf.current)
        raf.current = null
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
      lastX.current = x
      lastY.current = y
      lastT.current = now
    },
    [render],
  )

  const onUp = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false

    const speed = Math.hypot(velX.current, velY.current)
    const now = performance.now()
    if (speed > FLICK_VELOCITY && now - lastFlickAt.current > FLICK_COOLDOWN_MS) {
      playClick()
      lastFlickAt.current = now
    }

    startMomentum()
  }, [playClick, startMomentum])

  useEffect(() => {
    const globe = globeRef.current
    if (!globe) return

    const handleMouseDown = (e: MouseEvent) => onDown(e.clientX, e.clientY)
    const handleMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY)
    const handleMouseUp = () => onUp()
    const handleTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]
      onDown(t.clientX, t.clientY)
    }
    const handleTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      onMove(t.clientX, t.clientY)
    }
    const handleTouchEnd = () => onUp()

    globe.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mouseleave', handleMouseUp)
    globe.addEventListener('touchstart', handleTouchStart, { passive: true })
    globe.addEventListener('touchmove', handleTouchMove, { passive: true })
    globe.addEventListener('touchend', handleTouchEnd)
    globe.addEventListener('touchcancel', handleTouchEnd)

    return () => {
      globe.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mouseleave', handleMouseUp)
      globe.removeEventListener('touchstart', handleTouchStart)
      globe.removeEventListener('touchmove', handleTouchMove)
      globe.removeEventListener('touchend', handleTouchEnd)
      globe.removeEventListener('touchcancel', handleTouchEnd)
      if (raf.current !== null) cancelAnimationFrame(raf.current)
    }
  }, [onDown, onMove, onUp])

  const handlePhotoClick = useCallback(
    (globalIndex: number) => {
      setLightboxIndex(globalIndex)
    },
    [],
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
              {RING_CONFIGS.map((ring, ringIdx) => (
                <div key={ringIdx} className={`ring ring-${ringIdx === 0 ? 'top' : ringIdx === 1 ? 'mid' : 'bot'}`}>
                  {ring.photos.map((item, photoIdx) => {
                    const globalIndex = ringIdx * PHOTOS_PER_RING + photoIdx
                    const angle = (360 / PHOTOS_PER_RING) * photoIdx
                    return (
                      <button
                        key={item.src}
                        type="button"
                        className="photo"
                        style={{
                          transform: `rotateY(${angle}deg) translateZ(${RADIUS}px)`,
                        }}
                        onClick={() => handlePhotoClick(globalIndex)}
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
                            width={90}
                            height={90}
                          />
                        </picture>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <audio id="flick-sound" ref={soundRef} src="/audio/Flick.mp3" preload="auto" />
      </div>

      <Lightbox
        items={gallery}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </section>
  )
}
