import { useState, useRef, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { EASE_ENTRANCE, DURATION_CINEMATIC } from '../primitives/reveal'

interface FloatingImageProps {
  src: string
  srcWebp?: string
  srcAvif?: string
  alt: string
  caption?: string
  aspect?: string
  index: number
  onOpen: (index: number) => void
  repulsion?: { x: number; y: number }
}

export default function FloatingImage({
  src,
  srcWebp,
  srcAvif,
  alt,
  caption,
  aspect = 'aspect-[4/5]',
  index,
  onOpen,
  repulsion = { x: 0, y: 0 },
}: FloatingImageProps) {
  const prefersReducedMotion = useReducedMotion()
  const [hasError, setHasError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const captionId = caption ? `gallery-caption-${index}` : undefined
  const ref = useRef<HTMLDivElement>(null)

  const handleClick = useCallback(() => {
    onOpen(index)
  }, [index, onOpen])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onOpen(index)
      }
    },
    [index, onOpen],
  )

  const idleY = prefersReducedMotion ? 0 : [0, -6, 0]
  const idleDuration = 4 + (index % 3) * 0.8

  const x = prefersReducedMotion ? 0 : repulsion.x

  return (
    <motion.figure
      ref={ref}
      initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: DURATION_CINEMATIC,
        ease: EASE_ENTRANCE,
        delay: index * 0.08,
      }}
      animate={
        !prefersReducedMotion
          ? {
              x,
              y: isHovered ? 0 : undefined,
            }
          : undefined
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col gap-2"
    >
      <motion.button
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        animate={
          prefersReducedMotion
            ? undefined
            : { y: isHovered ? 0 : idleY }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : isHovered
              ? { type: 'spring', stiffness: 200, damping: 20 }
              : { duration: idleDuration, repeat: Infinity, ease: 'easeInOut' }
        }
        className={`${aspect} overflow-hidden rounded-xl bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
        aria-describedby={captionId}
      >
        {hasError ? (
          <span className="flex h-full w-full items-center justify-center bg-surface">
            <svg className="h-10 w-10 text-accent/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
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
              onError={() => setHasError(true)}
              className="h-full w-full object-cover transition-transform duration-500 ease-out
                group-hover:scale-105 group-focus-within:scale-105"
            />
          </picture>
        )}
      </motion.button>
      {caption && (
        <figcaption
          id={captionId}
          className="font-body text-xs text-center text-muted sm:text-sm px-1"
        >
          {caption}
        </figcaption>
      )}
    </motion.figure>
  )
}
