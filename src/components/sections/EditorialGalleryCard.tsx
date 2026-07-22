import { useEffect, useRef, useState } from 'react'
import type { GalleryItem } from '../../content/content'
import { getWebp, getSrcSet, getSizes } from '../../lib/gallery-assets'

interface EditorialGalleryCardProps {
  item: GalleryItem
  index: number
  totalItems: number
  onActivate: (index: number) => void
}

const HOVER_RANGE = 8

export default function EditorialGalleryCard({ item, index, totalItems, onActivate }: EditorialGalleryCardProps) {
  const [loaded, setLoaded] = useState(false)
  const cardRef = useRef<HTMLButtonElement>(null)
  const webp = getWebp(item.src)
  const srcSet = getSrcSet(item.src)
  const sizes = getSizes()

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    function handlePointerMove(e: PointerEvent) {
      const el = card
      if (!el) return
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
      const rect = el.getBoundingClientRect()
      const rx = (e.clientX - rect.left) / rect.width
      const ry = (e.clientY - rect.top) / rect.height
      el.style.setProperty('--hover-x', `${(rx - 0.5) * HOVER_RANGE * 2}px`)
      el.style.setProperty('--hover-y', `${(ry - 0.5) * HOVER_RANGE * 2}px`)
    }

    function handlePointerLeave() {
      const el = card
      if (!el) return
      el.style.setProperty('--hover-x', '0px')
      el.style.setProperty('--hover-y', '0px')
    }

    card.addEventListener('pointermove', handlePointerMove)
    card.addEventListener('pointerleave', handlePointerLeave)
    card.addEventListener('pointercancel', handlePointerLeave)

    return () => {
      card.removeEventListener('pointermove', handlePointerMove)
      card.removeEventListener('pointerleave', handlePointerLeave)
      card.removeEventListener('pointercancel', handlePointerLeave)
      card.style.setProperty('--hover-x', '0px')
      card.style.setProperty('--hover-y', '0px')
    }
  }, [])

  return (
    <button
      ref={cardRef}
      type="button"
      className="gallery-card"
      data-span={item.span}
      onClick={() => onActivate(index)}
      aria-label={`View photo: ${item.alt}`}
      aria-posinset={index + 1}
      aria-setsize={totalItems}
    >
      <picture>
        <source srcSet={srcSet.avif} sizes={sizes} type="image/avif" />
        <source srcSet={srcSet.webp} sizes={sizes} type="image/webp" />
        <img
          src={webp}
          alt={item.alt}
          loading={item.priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`gallery-card-img photo-warm${loaded ? ' is-loaded' : ''}`}
          draggable={false}
          width={item.width}
          height={item.height}
        />
      </picture>
    </button>
  )
}
