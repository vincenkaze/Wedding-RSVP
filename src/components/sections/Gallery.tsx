import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { gallery, sections } from '../../content/content'
import Lightbox from './Lightbox'
import { EASE_ENTRANCE, DURATION_CINEMATIC } from '../primitives/reveal'

const N = gallery.length
const RADIUS = 155
const ROTATION_SPEED = 0.003
const FRONT_THRESHOLD = 0.4
const SWIPE_SENSITIVITY = 0.008
const MOMENTUM_FRICTION = 0.95
const MOMENTUM_THRESHOLD = 0.0005

export default function Gallery() {
  const prefersReducedMotion = useReducedMotion()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const sphereRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const photoEls = useRef<(HTMLDivElement | null)[]>([])
  const frontImgRef = useRef<HTMLImageElement>(null)
  const openSoundRef = useRef<HTMLAudioElement>(null)
  const flickSoundRef = useRef<HTMLAudioElement>(null)
  const swipeSoundRef = useRef<HTMLAudioElement>(null)
  const rotation = useRef(0)
  const raf = useRef<number | null>(null)
  const lastTime = useRef(0)
  const paused = useRef(false)
  const audioUnlocked = useRef(false)
  const renderFrameRef = useRef<() => void>(() => {})

  const dragStartX = useRef(0)
  const dragStartRotation = useRef(0)
  const isDragging = useRef(false)
  const velocity = useRef(0)
  const lastDragX = useRef(0)
  const lastDragTime = useRef(0)

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

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true
    dragStartX.current = e.clientX
    dragStartRotation.current = rotation.current
    lastDragX.current = e.clientX
    lastDragTime.current = performance.now()
    velocity.current = 0
    paused.current = true
    if (stageRef.current) {
      stageRef.current.setPointerCapture(e.pointerId)
    }
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return
    const dx = e.clientX - dragStartX.current
    rotation.current = dragStartRotation.current + dx * SWIPE_SENSITIVITY
    const now = performance.now()
    const dt = now - lastDragTime.current
    if (dt > 0) {
      velocity.current = (e.clientX - lastDragX.current) / dt
    }
    lastDragX.current = e.clientX
    lastDragTime.current = now
  }, [])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return
    isDragging.current = false
    if (stageRef.current) {
      stageRef.current.releasePointerCapture(e.pointerId)
    }
    const flick = Math.abs(velocity.current) > 0.3
    if (flick) {
      playSound(swipeSoundRef)
    }
    paused.current = false
    lastTime.current = 0
  }, [playSound])

  const renderFrame = useCallback(() => {
    if (!isDragging.current) {
      if (paused.current) {
        if (Math.abs(velocity.current) > MOMENTUM_THRESHOLD) {
          rotation.current += velocity.current * 0.5
          velocity.current *= MOMENTUM_FRICTION
        } else {
          velocity.current = 0
          raf.current = requestAnimationFrame(renderFrameRef.current)
          return
        }
      } else {
        const now = performance.now()
        const dt = lastTime.current ? (now - lastTime.current) / 16.67 : 1
        lastTime.current = now
        rotation.current += ROTATION_SPEED * dt
      }
    }

    let bestIdx = 0
    let bestScore = -Infinity

    photoEls.current.forEach((el, i) => {
      if (!el) return
      const angle = (i / N) * Math.PI * 2 + rotation.current
      const x = Math.sin(angle) * RADIUS
      const z = Math.cos(angle) * RADIUS

      el.style.transform = `translate3d(${x}px, 0px, ${z}px)`

      const depthNorm = (z + RADIUS) / (2 * RADIUS)
      const scale = 0.55 + depthNorm * 0.45
      el.style.transform += ` scale(${scale})`

      const opacity = 0.25 + depthNorm * 0.75
      el.style.opacity = String(opacity)

      if (z > 0) {
        const score = z - Math.abs(x) * FRONT_THRESHOLD
        if (score > bestScore) {
          bestScore = score
          bestIdx = i
        }
      }
    })

    setActiveIndex((prev) => {
      if (prev !== bestIdx) {
          const img = frontImgRef.current
          if (img) {
            const item = gallery[bestIdx]
            img.src = item.src
            img.alt = item.alt
          }
        if (isDragging.current) {
          playSound(swipeSoundRef)
        }
      }
      return bestIdx
    })

    raf.current = requestAnimationFrame(renderFrameRef.current)
  }, [])

  useEffect(() => {
    renderFrameRef.current = renderFrame
  })

  useEffect(() => {
    if (prefersReducedMotion) return
    raf.current = requestAnimationFrame(renderFrame)
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current)
    }
  }, [prefersReducedMotion, renderFrame])

  useEffect(() => {
    const img = frontImgRef.current
    if (img && gallery[activeIndex]) {
      const item = gallery[activeIndex]
      img.src = item.src
      img.alt = item.alt
    }
  }, [activeIndex])

  const handleFrontClick = useCallback(() => {
    playSound(openSoundRef)
    setLightboxIndex(activeIndex)
  }, [activeIndex, playSound])

  const handleLightboxNavigate = useCallback(
    (idx: number) => {
      playSound(flickSoundRef)
      setLightboxIndex(idx)
    },
    [playSound],
  )

  const handleMouseEnter = useCallback(() => {
    if (!isDragging.current) paused.current = true
  }, [])
  const handleMouseLeave = useCallback(() => {
    if (!isDragging.current) {
      paused.current = false
      lastTime.current = 0
    }
  }, [])

  const activeItem = gallery[activeIndex]

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
          <div
            ref={stageRef}
            className="gallery-stage"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ touchAction: 'none' }}
          >
            {/* Layer 1: rotating sphere */}
            <div className="sphere-layer">
              <div ref={sphereRef} className="sphere">
                {gallery.map((item, i) => (
                  <div
                    key={item.src}
                    ref={(el) => { photoEls.current[i] = el }}
                    className="sphere-photo"
                  >
                    <img
                      src={item.src}
                      alt={item.alt}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      width={96}
                      height={96}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Layer 2: fixed front frame */}
            <button
              type="button"
              className="front-frame"
              onClick={handleFrontClick}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              aria-label={`View photo: ${activeItem?.alt ?? ''}`}
            >
              <img
                ref={frontImgRef}
                src={activeItem?.src ?? ''}
                alt={activeItem?.alt ?? ''}
                className="front-frame-img"
                draggable={false}
                width={250}
                height={250}
              />
            </button>
          </div>
        </motion.div>

        <audio ref={openSoundRef} src="/audio/open.mp3" preload="auto" />
        <audio ref={flickSoundRef} src="/audio/Flick.mp3" preload="auto" />
        <audio ref={swipeSoundRef} src="/audio/Swipe.mp3" preload="auto" />
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
