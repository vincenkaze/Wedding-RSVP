import { useState, useRef, useCallback, useEffect } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion'
import { useDrag, usePinch } from '@use-gesture/react'
import type { GalleryItem } from '../../content/content'
import { EASE_ENTRANCE, DURATION_CINEMATIC } from '../primitives/reveal'
import type { ScatterPosition } from './scatter-positions'
import { useDominantColor } from '../../hooks/useDominantColor'

interface FloatingPhotoProps extends GalleryItem {
  index: number
  total: number
  scatter: ScatterPosition
  depth: number
  gyroPitch: number
  gyroRoll: number
  onActivate: (index: number) => void
  onBringToFront: (index: number) => void
  isTopmost: boolean
}

export default function FloatingPhoto({
  src,
  srcWebp,
  srcAvif,
  alt,
  aspect = 'aspect-square',
  index,
  total,
  scatter,
  depth,
  gyroPitch,
  gyroRoll,
  onActivate,
  onBringToFront,
  isTopmost,
}: FloatingPhotoProps) {
  const prefersReducedMotion = useReducedMotion()
  const [hasError, setHasError] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const dominantColor = useDominantColor(src)

  const dragDistance = useRef(0)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotation = useMotionValue(scatter.rotation)
  const scale = useMotionValue(scatter.scale)

  const springX = useSpring(x, { stiffness: 120, damping: 20, mass: 0.8 })
  const springY = useSpring(y, { stiffness: 120, damping: 20, mass: 0.8 })
  const springRotation = useSpring(rotation, { stiffness: 150, damping: 25, mass: 0.6 })
  const springScale = useSpring(scale, { stiffness: 200, damping: 25, mass: 0.5 })

  const gyroOffsetX = useTransform(() => gyroRoll * depth * 40)
  const gyroOffsetY = useTransform(() => gyroPitch * depth * 40)
  const gyroOffsetZ = useTransform(() => depth * 30)

  const springGyroX = useSpring(gyroOffsetX, { stiffness: 80, damping: 15, mass: 1 })
  const springGyroY = useSpring(gyroOffsetY, { stiffness: 80, damping: 15, mass: 1 })

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

  const bindDrag = useDrag(
    ({ active, movement: [mx, my], first, last, offset: [ox, oy] }) => {
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
        x.set(ox)
        y.set(oy)
        rotation.set(scatter.rotation + mx * 0.04)
      }

      if (last) {
        setIsDragging(false)
        if (dragDistance.current < 8) {
          onActivate(index)
        }
      }
    },
    { filterTaps: true, threshold: 4 },
  )

  const bindPinch = usePinch(
    ({ offset: [s], first }) => {
      if (prefersReducedMotion) return
      if (first) onBringToFront(index)
      scale.set(scatter.scale * Math.min(Math.max(s, 0.8), 4))
    },
    { scaleBounds: { min: 0.8, max: 4 } },
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onActivate(index)
      }
    },
    [index, onActivate],
  )

  const shadowIntensity = isDragging ? 0.3 : isHovered ? 0.2 : 0.1

  return (
    <div
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
          translateX: springGyroX,
          translateY: springGyroY,
          translateZ: gyroOffsetZ,
          transformStyle: 'preserve-3d',
        }}
        onHoverStart={() => {
          setIsHovered(true)
          if (!prefersReducedMotion && !isDragging) {
            onBringToFront(index)
          }
        }}
        onHoverEnd={() => setIsHovered(false)}
        role="button"
        tabIndex={0}
        aria-label={`Photo ${index + 1} of ${total}: ${alt}`}
        onKeyDown={handleKeyDown}
      >
        {/* Ambient glow — subsurface color aura */}
        {!prefersReducedMotion && dominantColor && (
          <div
            className="absolute -inset-6 -z-10 rounded-3xl opacity-40 blur-3xl pointer-events-none"
            style={{
              backgroundColor: dominantColor,
              mixBlendMode: 'multiply',
              transition: 'opacity 0.6s ease',
              opacity: isHovered ? 0.55 : 0.35,
            }}
            aria-hidden
          />
        )}

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
                sizes="(max-width: 640px) 45vw, (max-width: 768px) 35vw, 28vw"
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
      </motion.div>
    </div>
  )
}
