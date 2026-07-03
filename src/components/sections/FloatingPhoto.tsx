import { useState, useRef, useCallback, useEffect } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from 'framer-motion'
import { useDrag, usePinch } from '@use-gesture/react'
import type { GalleryItem } from '../../content/content'
import { EASE_ENTRANCE, DURATION_CINEMATIC } from '../primitives/reveal'
import type { ScatterPosition } from './scatter-positions'

interface FloatingPhotoProps extends GalleryItem {
  index: number
  total: number
  scatter: ScatterPosition
  onActivate: (index: number) => void
  onBringToFront: (index: number) => void
  isTopmost: boolean
}

export default function FloatingPhoto({
  src,
  srcWebp,
  srcAvif,
  alt,
  caption,
  aspect = 'aspect-[4/5]',
  index,
  total,
  scatter,
  onActivate,
  onBringToFront,
  isTopmost,
}: FloatingPhotoProps) {
  const prefersReducedMotion = useReducedMotion()
  const [hasError, setHasError] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isScaledUp, setIsScaledUp] = useState(false)

  const dragDistance = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Motion values for animated offsets (drift/drag only — base position is via top/left)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotation = useMotionValue(scatter.rotation)
  const scale = useMotionValue(scatter.scale)

  // Springs for smooth transitions
  const springX = useSpring(x, {
    stiffness: 120,
    damping: 20,
    mass: 0.8,
  })
  const springY = useSpring(y, {
    stiffness: 120,
    damping: 20,
    mass: 0.8,
  })
  const springRotation = useSpring(rotation, {
    stiffness: 150,
    damping: 25,
    mass: 0.6,
  })
  const springScale = useSpring(scale, {
    stiffness: 200,
    damping: 25,
    mass: 0.5,
  })

  // Idle animation — subtle drift around zero
  const idleAnimRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (prefersReducedMotion || isDragging || isHovered) return

    const period = 6000 + (index % 3) * 1200
    let frame = 0

    const tick = () => {
      frame++
      const t = (frame * 50) / period
      x.set(Math.sin(t * Math.PI * 2) * 4)
      y.set(Math.cos(t * Math.PI * 2 + 0.5) * 3)
      rotation.set(scatter.rotation + Math.cos(t * Math.PI * 2 + 1) * 1.2)
    }

    idleAnimRef.current = setInterval(tick, 50)

    return () => {
      if (idleAnimRef.current) {
        clearInterval(idleAnimRef.current)
        idleAnimRef.current = null
      }
    }
  }, [prefersReducedMotion, isDragging, isHovered, index, scatter.rotation, x, y, rotation])

  // Return home — reset animated offsets to zero
  const returnToHome = useCallback(() => {
    x.set(0)
    y.set(0)
    rotation.set(scatter.rotation)
    scale.set(isScaledUp ? 1.5 : scatter.scale)
  }, [x, y, rotation, scale, scatter.rotation, scatter.scale, isScaledUp])

  // Drag handling
  const bindDrag = useDrag(
    ({ active, movement: [mx, my], first, last }) => {
      if (prefersReducedMotion) return

      if (first) {
        setIsDragging(true)
        onBringToFront(index)
        dragDistance.current = 0
        if (idleAnimRef.current) {
          clearInterval(idleAnimRef.current)
          idleAnimRef.current = null
        }
      }

      dragDistance.current = Math.sqrt(mx * mx + my * my)

      if (active) {
        x.set(mx)
        y.set(my)
        rotation.set(scatter.rotation + mx * 0.04)
      }

      if (last) {
        setIsDragging(false)

        if (dragDistance.current < 8) {
          onActivate(index)
        } else {
          returnToHome()
        }
      }
    },
    {
      filterTaps: true,
      threshold: 4,
    },
  )

  // Pinch handling
  const bindPinch = usePinch(
    ({ offset: [s], first, last }) => {
      if (prefersReducedMotion) return

      if (first) {
        onBringToFront(index)
      }

      const clampedScale = Math.min(Math.max(s, 0.8), 4)
      scale.set(scatter.scale * clampedScale)

      if (last) {
        setIsScaledUp(clampedScale > 1.2)
        if (clampedScale < 1.2) {
          scale.set(scatter.scale)
        }
      }
    },
    {
      scaleBounds: { min: 0.8, max: 4 },
    },
  )

  // Keyboard handling
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onActivate(index)
      }
      if (e.key === 'Escape') {
        returnToHome()
      }
    },
    [index, onActivate, returnToHome],
  )

  const shadowIntensity = isDragging ? 0.3 : isHovered ? 0.2 : 0.1
  const captionId = caption ? `gallery-caption-${index}` : undefined

  return (
    <div
      ref={containerRef}
      {...bindDrag()}
      {...bindPinch()}
      className={`absolute ${aspect} w-[45%] max-w-50 cursor-grab select-none sm:w-[35%] sm:max-w-65 md:w-[28%] md:max-w-80 ${
        isDragging ? 'cursor-grabbing' : ''
      }`}
      style={{
        top: `${scatter.topPct}%`,
        left: `${scatter.leftPct}%`,
        touchAction: 'none',
        zIndex: isTopmost ? 50 : index + 1,
      }}
    >
      <motion.div
        initial={{ opacity: 0, filter: 'blur(8px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        transition={{
          duration: DURATION_CINEMATIC,
          ease: EASE_ENTRANCE,
          delay: index * 0.12,
        }}
        style={{
          x: springX,
          y: springY,
          rotate: springRotation,
          scale: springScale,
        }}
        onHoverStart={() => {
          setIsHovered(true)
          if (!prefersReducedMotion && !isDragging) {
            onBringToFront(index)
          }
        }}
        onHoverEnd={() => {
          setIsHovered(false)
        }}
        role="button"
        tabIndex={0}
        aria-label={`Photo ${index + 1} of ${total}: ${alt}`}
        aria-describedby={captionId}
        onKeyDown={handleKeyDown}
      >
        <div
          className="relative h-full w-full overflow-hidden rounded-xl bg-surface"
          style={{
            filter: `drop-shadow(0 8px 16px rgba(0,0,0,${shadowIntensity}))`,
            transform: isDragging ? 'scale(1.02)' : 'scale(1)',
            transition: 'transform 0.2s ease',
          }}
        >
          {hasError ? (
            <span className="flex h-full w-full items-center justify-center bg-surface">
              <svg
                className="h-10 w-10 text-accent/30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </span>
          ) : (
            <picture>
              {srcAvif && <source srcSet={srcAvif} type="image/avif" />}
              {srcWebp && <source srcSet={srcWebp} type="image/webp" />}
              <img
                src={src}
                alt={alt}
                loading="lazy"
                decoding="async"
                draggable={false}
                onError={() => setHasError(true)}
                className="h-full w-full object-cover"
              />
            </picture>
          )}

          {!prefersReducedMotion && (
            <div
              className="float-handle absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 opacity-0 transition-opacity duration-200 hover:bg-white sm:bottom-2 sm:right-2"
              style={{
                opacity: isHovered && !isDragging ? 0.8 : 0,
                pointerEvents: isHovered && !isDragging ? 'auto' : 'none',
              }}
              onPointerDown={(e) => {
                e.stopPropagation()
                const startX = e.clientX
                const startRotation = rotation.get()

                const handlePointerMove = (moveEvent: PointerEvent) => {
                  const delta = moveEvent.clientX - startX
                  rotation.set(startRotation + delta * 0.5)
                }

                const handlePointerUp = () => {
                  window.removeEventListener('pointermove', handlePointerMove)
                  window.removeEventListener('pointerup', handlePointerUp)
                }

                window.addEventListener('pointermove', handlePointerMove)
                window.addEventListener('pointerup', handlePointerUp)
              }}
              aria-label="Rotate photo"
            >
              <svg
                className="h-3 w-3 text-text/60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12a9 9 0 11-6.219-8.56" />
                <path d="M21 3v5h-5" />
              </svg>
            </div>
          )}
        </div>

        {caption && (
          <figcaption
            id={captionId}
            className="mt-2 text-center font-body text-xs text-muted sm:text-sm"
          >
            {caption}
          </figcaption>
        )}
      </motion.div>
    </div>
  )
}
