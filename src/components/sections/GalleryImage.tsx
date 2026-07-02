import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { EASE_ENTRANCE, DURATION_CINEMATIC } from '../primitives/reveal'

interface GalleryImageProps {
  src: string
  srcWebp?: string
  srcAvif?: string
  alt: string
  caption?: string
  aspect?: string
  index: number
  onOpen: (index: number) => void
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: DURATION_CINEMATIC, ease: EASE_ENTRANCE },
  },
}

export default function GalleryImage({
  src,
  srcWebp,
  srcAvif,
  alt,
  caption,
  aspect = 'aspect-[4/5]',
  index,
  onOpen,
}: GalleryImageProps) {
  const [hasError, setHasError] = useState(false)
  const captionId = caption ? `gallery-caption-${index}` : undefined

  return (
    <motion.figure
      variants={itemVariants}
      className="group relative flex flex-col gap-2"
    >
      <button
        type="button"
        onClick={() => onOpen(index)}
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
      </button>
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
