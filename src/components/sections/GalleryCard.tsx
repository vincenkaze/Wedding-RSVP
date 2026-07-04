import { useState } from 'react'
import type { GalleryItem } from '../../content/content'

const BORDER_COLORS = [
  'border-accent/20',
  'border-accent/30',
  'border-accent/15',
  'border-accent/25',
  'border-accent/20',
  'border-accent/30',
  'border-accent/15',
  'border-accent/25',
  'border-accent/20',
  'border-accent/30',
]

const ROTATIONS = [
  '-rotate-1', 'rotate-0.5', '-rotate-0.5', 'rotate-1', '-rotate-0.5',
  'rotate-0.5', '-rotate-1', 'rotate-0', '-rotate-0.5', 'rotate-1',
]

interface GalleryCardProps {
  item: GalleryItem
  index: number
  onOpen: () => void
}

export default function GalleryCard({ item, index, onOpen }: GalleryCardProps) {
  const [hasError, setHasError] = useState(false)

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`gallery-card group relative overflow-hidden rounded-xl border-2 bg-surface ${
        BORDER_COLORS[index % BORDER_COLORS.length]
      } ${ROTATIONS[index % ROTATIONS.length]}`}
      style={{ willChange: 'transform' }}
      aria-label={`View photo: ${item.alt}`}
    >
      <div className="aspect-square w-full overflow-hidden">
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
            {item.srcAvif && <source srcSet={item.srcAvif} type="image/avif" />}
            {item.srcWebp && <source srcSet={item.srcWebp} type="image/webp" />}
            <img
              src={item.src}
              alt={item.alt}
              loading="lazy"
              decoding="async"
              draggable={false}
              sizes="(max-width: 640px) 45vw, (max-width: 768px) 35vw, 28vw"
              onError={() => setHasError(true)}
              className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            />
          </picture>
        )}
      </div>
    </button>
  )
}
