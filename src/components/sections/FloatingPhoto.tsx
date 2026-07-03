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
  initialPosition: ScatterPosition
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
  initialPosition,
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

  // Motion values for transforms
  const x = useMotionValue(initialPosition.x)
  const y = useMotionValue(initialPosition.y)
  const rotation = useMotionValue(initialPosition.rotation)
  const scale = useMotionValue(initialPosition.scale)

  // Springs for smooth return-home
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

  // Idle animation
  const idleAnimRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (prefersReducedMotion || isDragging || isHovered) return

    // Subtle idle drift: small x oscillation + rotation
    const period = 6000 + (index % 3) * 1200
    let frame = 0

    const tick = () => {
      frame++
      const t = (frame * 50) / period
      const driftX = Math.sin(t * Math.PI * 2) * 3
      const driftRot = Math.cos(t * Math.PI * 2 + 1) * 1.2

      x.set(initialPosition.x + driftX)
      rotation.set(initialPosition.rotation + driftRot)
    }

    idleAnimRef.current = setInterval(tick, 50)

    return () => {
      if (idleAnimRef.current) {
        clearInterval(idleAnimRef.current)
        idleAnimRef.current = null
      }
    }
  }, [prefersReducedMotion, isDragging, isHovered, index, initialPosition.x, initialPosition.rotation, x, rotation])

  // Return home helper
  const returnToHome = useCallback(() => {
    if (prefersReducedMotion) {
      x.set(initialPosition.x)
      y.set(initialPosition.y)
      rotation.set(initialPosition.rotation)
      scale.set(initialPosition.scale)
    } else {
      x.set(initialPosition.x)
      y.set(initialPosition.y)
      rotation.set(initialPosition.rotation)
      scale.set(isScaledUp ? 1.5 : initialPosition.scale)
    }
  }, [prefersReducedMotion, initialPosition, x, y, rotation, scale, isScaledUp])

  // Drag handling with @use-gesture
  const bindDrag = useDrag(
    ({ active, movement: [mx, my], first, last }) => {
      if (prefersReducedMotion) return

      if (first) {
        setIsDragging(true)
        onBringToFront(index)
        dragDistance.current = 0
        // Pause idle animation
        if (idleAnimRef.current) {
          clearInterval(idleAnimRef.current)
          idleAnimRef.current = null
        }
      }

      dragDistance.current = Math.sqrt(mx * mx + my * my)

      if (active) {
        x.set(initialPosition.x + mx)
        y.set(initialPosition.y + my)
        // Subtle tilt during drag
        rotation.set(initialPosition.rotation + mx * 0.05)
      }

      if (last) {
        setIsDragging(false)

        // If drag distance is small enough, treat as tap/click
        if (dragDistance.current < 8) {
          onActivate(index)
        } else {
          // Return home with spring
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
      scale.set(initialPosition.scale * clampedScale)

      if (last) {
        setIsScaledUp(clampedScale > 1.2)
        if (clampedScale < 1.2) {
          scale.set(initialPosition.scale)
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

  // Shadow intensity based on distance from home
  const shadowIntensity = isDragging ? 0.3 : isHovered ? 0.2 : 0.1

  const captionId = caption ? `gallery-caption-${index}` : undefined

  return (
    <div
      ref={containerRef}
      {...bindDrag()}
      {...bindPinch()}
      className={`absolute ${aspect} w-[45%] max-w-[200px] cursor-grab select-none sm:w-[35%] sm:max-w-[260px] md:w-[28%] md:max-w-[320px] ${
        isDragging ? 'cursor-grabbing' : ''
      }`}
      style={{ touchAction: 'none' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
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
          zIndex: isTopmost ? 50 : index,
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
          {/* Image */}
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

          {/* Rotate handle - desktop only, visible on hover */}
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

        {/* Caption */}
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
