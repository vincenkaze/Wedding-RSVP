import { useCallback, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { gallery, sections } from '../../content/content'
import GallerySection from '../../gallery/ui/GallerySection'
import Lightbox from './Lightbox'
import { EASE_ENTRANCE, DURATION_CINEMATIC } from '../primitives/reveal'

export default function Gallery() {
  const prefersReducedMotion = useReducedMotion()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const handlePhotoClick = useCallback((index: number) => {
    setLightboxIndex(index)
  }, [])

  const handleLightboxNavigate = useCallback((idx: number) => {
    setLightboxIndex(idx)
  }, [])

  return (
    <section id="gallery" className="relative px-6 py-20 sm:py-28 md:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12 sm:mb-16">
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

        <motion.div
          initial={
            prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96 }
          }
          whileInView={
            prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }
          }
          viewport={{ once: true }}
          transition={{ duration: DURATION_CINEMATIC, ease: EASE_ENTRANCE, delay: 0.15 }}
          className="flex justify-center"
        >
          <GallerySection
            items={gallery}
            onPhotoClick={handlePhotoClick}
            lightboxOpen={lightboxIndex !== null}
          />
        </motion.div>
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
