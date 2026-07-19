import { useState } from 'react'
import type { EditorialCard } from '../../lib/gallery-layout'

interface EditorialGalleryCardProps {
  card: EditorialCard
  onActivate: (id: string) => void
}

export default function EditorialGalleryCard({ card, onActivate }: EditorialGalleryCardProps) {
  const [loaded, setLoaded] = useState(false)
  const baseName = card.src.replace('.avif', '').split('/').pop() ?? ''
  const webp = card.src.replace('.avif', '.webp')

  return (
    <button
      type="button"
      className="editorial-card"
      onClick={() => onActivate(card.id)}
      aria-label={`View photo: ${card.alt}`}
      style={{
        left: `${card.x}px`,
        top: `${card.y}px`,
        width: `${card.width}px`,
        height: `${card.height}px`,
        ['--rot' as string]: `${card.rotation}deg`,
        zIndex: card.depth > 0.98 ? 2 : 1,
      }}
    >
      <picture>
        <source
          srcSet={`/gallery/sizes/512/${baseName}.avif 512w, /gallery/sizes/1024/${baseName}.avif 1024w, ${card.src} 1920w`}
          sizes={`${Math.round(card.width)}px`}
          type="image/avif"
        />
        <source
          srcSet={`/gallery/sizes/512/${baseName}.webp 512w, /gallery/sizes/1024/${baseName}.webp 1024w, ${webp} 1920w`}
          sizes={`${Math.round(card.width)}px`}
          type="image/webp"
        />
        <img
          src={webp}
          alt={card.alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`editorial-card-img${loaded ? ' is-loaded' : ''}`}
          draggable={false}
        />
      </picture>
    </button>
  )
}
