import { useCallback, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { gallery, sections } from '../../content/content'
import EditorialGallery from './EditorialGallery'
import Lightbox from './Lightbox'
import { EASE_ENTRANCE, DURATION_CINEMATIC } from '../primitives/reveal'

export default function Gallery() {
  const prefersReducedMotion = useReducedMotion()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const lightboxOpen = lightboxIndex !== null

  const handlePhotoActivate = useCallback((index: number) => {
    setLightboxIndex(index)
  }, [])

  const handleLightboxNavigate = useCallback((idx: number) => {
    setLightboxIndex(idx)
  }, [])

  return (
    <section id="gallery" className="gallery-fullscreen">
      <div className="gallery-fullscreen-header">
        <motion.p
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DURATION_CINEMATIC, ease: EASE_ENTRANCE }}
          className="font-body text-xs font-semibold uppercase tracking-[0.24em] text-accent sm:text-sm"
        >
          {sections.gallery.label}
        </motion.p>
        <motion.h2
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: DURATION_CINEMATIC,
            ease: EASE_ENTRANCE,
            delay: 0.08,
          }}
          className="mt-4 font-display text-3xl tracking-tight text-text sm:text-4xl md:text-5xl"
        >
          {sections.gallery.heading}
        </motion.h2>
      </div>

      {prefersReducedMotion ? (
        <div className="gallery-css-grid">
          {gallery.map((item, i) => {
            const basePath = item.src.replace('.avif', '')
            const name = basePath.split('/').pop()!
            return (
              <button
                key={item.src}
                type="button"
                className="gallery-css-item"
                onClick={() => setLightboxIndex(i)}
                aria-label={`View photo: ${item.alt}`}
              >
                <picture>
                  <source
                    srcSet={`/gallery/sizes/512/${name}.avif 512w, /gallery/sizes/1024/${name}.avif 1024w, ${item.src} 1920w`}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    type="image/avif"
                  />
                  <source
                    srcSet={`/gallery/sizes/512/${name}.webp 512w, /gallery/sizes/1024/${name}.webp 1024w, ${item.src.replace('.avif', '.webp')} 1920w`}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    type="image/webp"
                  />
                  <img
                    src={item.src.replace('.avif', '.webp')}
                    alt={item.alt}
                    loading="lazy"
                    decoding="async"
                    width={300}
                    height={300}
                  />
                </picture>
              </button>
            )
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: DURATION_CINEMATIC, ease: EASE_ENTRANCE, delay: 0.15 }}
          className="gallery-fullscreen-canvas"
        >
          <EditorialGallery
            items={gallery}
            onPhotoActivate={handlePhotoActivate}
            paused={lightboxOpen}
          />
        </motion.div>
      )}

      <Lightbox
        items={gallery}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={handleLightboxNavigate}
      />
    </section>
  )
}
