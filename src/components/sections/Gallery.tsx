import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { gallery, sections } from '../../content/content'
import Lightbox from './Lightbox'
import { EASE_ENTRANCE, DURATION_CINEMATIC } from '../primitives/reveal'

const N = gallery.length
const RADIUS = 130
const ROTATION_SPEED = 0.003
const FRONT_THRESHOLD = 0.4

export default function Gallery() {
  const prefersReducedMotion = useReducedMotion()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const sphereRef = useRef<HTMLDivElement>(null)
  const photoEls = useRef<(HTMLDivElement | null)[]>([])
  const frontImgRef = useRef<HTMLImageElement>(null)
  const openSoundRef = useRef<HTMLAudioElement>(null)
  const flickSoundRef = useRef<HTMLAudioElement>(null)
  const rotation = useRef(0)
  const raf = useRef<number | null>(null)
  const lastTime = useRef(0)
  const paused = useRef(false)
  const audioUnlocked = useRef(false)
  const renderFrameRef = useRef<() => void>(() => {})

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

  const renderFrame = useCallback(() => {
    if (paused.current) {
      raf.current = requestAnimationFrame(renderFrameRef.current)
      return
    }

    const now = performance.now()
    const dt = lastTime.current ? (now - lastTime.current) / 16.67 : 1
    lastTime.current = now

    rotation.current += ROTATION_SPEED * dt

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
          img.src = item.src.replace(/\.\w+$/, '.jpg')
          img.alt = item.alt
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
      img.src = item.src.replace(/\.\w+$/, '.jpg')
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

  const handleMouseEnter = useCallback(() => { paused.current = true }, [])
  const handleMouseLeave = useCallback(() => {
    paused.current = false
    lastTime.current = 0
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
          <div className="gallery-stage">
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
                      src={item.src.replace(/\.\w+$/, '.jpg')}
                      alt={item.alt}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      width={80}
                      height={80}
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
                src={activeItem?.src.replace(/\.\w+$/, '.jpg') ?? ''}
                alt={activeItem?.alt ?? ''}
                className="front-frame-img"
                draggable={false}
                width={200}
                height={200}
              />
            </button>
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
