import { useCallback, useState } from 'react'
import { gallery, sections } from '../../content/content'
import EditorialGallery from './EditorialGallery'
import Lightbox from './Lightbox'

export default function Gallery() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const handlePhotoActivate = useCallback((index: number) => {
    setLightboxIndex(index)
  }, [])

  const handleLightboxNavigate = useCallback((idx: number) => {
    setLightboxIndex(idx)
  }, [])

  return (
    <section id="gallery" className="gallery-fullscreen">
      <div className="gallery-fullscreen-header">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.24em] text-accent sm:text-sm">
          {sections.gallery.label}
        </p>
        <h2 className="mt-4 font-display text-3xl tracking-tight text-text sm:text-4xl md:text-5xl">
          {sections.gallery.heading}
        </h2>
      </div>

      <div className="gallery-content">
        <EditorialGallery
          items={gallery}
          onPhotoActivate={handlePhotoActivate}
        />
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
