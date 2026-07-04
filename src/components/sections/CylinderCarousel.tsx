import { useRef, useCallback, useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import type { GalleryItem } from '../../content/content'

interface CylinderCarouselProps {
  items: GalleryItem[]
  onOpen: (index: number) => void
}

const FRICTION = 0.94
const DRAG_SENSITIVITY = 0.35
const MIN_VELOCITY = 0.05

export default function CylinderCarousel({ items, onOpen }: CylinderCarouselProps) {
  const prefersReducedMotion = useReducedMotion()
  const count = items.length
  const angleStep = 360 / count

  const radius = count <= 6 ? 260 : count <= 10 ? 300 : 340

  const trackRef = useRef<HTMLDivElement>(null)
  const angleRef = useRef(0)
  const velocityRef = useRef(0)
  const dragging = useRef(false)
  const startX = useRef(0)
  const lastX = useRef(0)
  const lastTime = useRef(0)
  const moved = useRef(false)
  const rafRef = useRef<number>(0)

  const [angle, setAngle] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)

  const syncAngle = useCallback(() => {
    setAngle(angleRef.current)
    const normalized = (((-angleRef.current % 360) + 360) % 360)
    const idx = Math.round(normalized / angleStep) % count
    setActiveIndex(idx)
  }, [angleStep, count])

  const animateRef = useRef<() => void>(() => {})

  const animate = useCallback(() => {
    if (dragging.current) return

    if (Math.abs(velocityRef.current) < MIN_VELOCITY) {
      velocityRef.current = 0
      return
    }

    velocityRef.current *= FRICTION
    angleRef.current += velocityRef.current
    syncAngle()
    rafRef.current = requestAnimationFrame(animateRef.current)
  }, [syncAngle])

  useEffect(() => {
    animateRef.current = animate
  }, [animate])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true
    moved.current = false
    startX.current = e.clientX
    lastX.current = e.clientX
    lastTime.current = Date.now()
    velocityRef.current = 0
    cancelAnimationFrame(rafRef.current)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return

    const dx = e.clientX - lastX.current
    const dt = Date.now() - lastTime.current

    if (Math.abs(e.clientX - startX.current) > 4) {
      moved.current = true
    }

    if (dt > 0) {
      velocityRef.current = (dx / dt) * 16 * DRAG_SENSITIVITY
    }

    angleRef.current += dx * DRAG_SENSITIVITY
    lastX.current = e.clientX
    lastTime.current = Date.now()
    syncAngle()
  }, [syncAngle])

  const handlePointerUp = useCallback(() => {
    dragging.current = false
    if (!prefersReducedMotion) {
      rafRef.current = requestAnimationFrame(animateRef.current)
    }
  }, [prefersReducedMotion])

  const handleClick = useCallback((index: number) => {
    if (moved.current) return
    onOpen(index)
  }, [onOpen])

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div className="cylinder-viewport">
      <div
        className="cylinder-track"
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ transform: `translateZ(-${radius}px) rotateY(${angle}deg)` }}
      >
        {items.map((item, i) => (
          <div
            key={item.src}
            className="cylinder-card"
            style={{ transform: `rotateY(${i * angleStep}deg) translateZ(${radius}px)` }}
          >
            <button
              type="button"
              onClick={() => handleClick(i)}
              className="cylinder-card-inner"
              aria-label={`View photo: ${item.alt}`}
            >
              <div className="aspect-square w-full overflow-hidden rounded-xl">
                <picture>
                  {item.srcAvif && <source srcSet={item.srcAvif} type="image/avif" />}
                  {item.srcWebp && <source srcSet={item.srcWebp} type="image/webp" />}
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    sizes="(max-width: 640px) 80vw, 280px"
                    className="h-full w-full object-cover"
                  />
                </picture>
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="cylinder-dots" aria-hidden>
        {items.map((_, i) => (
          <span
            key={i}
            className={`cylinder-dot ${i === activeIndex ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}
