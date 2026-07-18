import { useCallback, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { gallery, sections } from '../../content/content'
import GallerySection from '../../gallery/ui/GallerySection'
import Lightbox from './Lightbox'
import { EASE_ENTRANCE, DURATION_CINEMATIC } from '../primitives/reveal'

export default function Gallery() {
  const prefersReducedMotion = useReducedMotion()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null)

  const activeIndex = useMemo(() => {
    if (!activePhotoId) return 0
    const idx = gallery.findIndex((item) => (item.id ?? item.src) === activePhotoId)
    return idx >= 0 ? idx : 0
  }, [activePhotoId])

  const handlePhotoClick = useCallback((index: number) => {
    setLightboxIndex(index)
  }, [])

  const handleLightboxNavigate = useCallback((idx: number) => {
    setLightboxIndex(idx)
  }, [])

  const handleActivePhotoChange = useCallback((id: string | null) => {
    setActivePhotoId(id)
  }, [])

  const handlePhotoHold = useCallback((index: number) => {
    setLightboxIndex(index)
  }, [])

  return (
    <section id="gallery" className="relative px-6 py-14 sm:py-20 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-8 sm:mb-10">
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
            onPhotoHold={handlePhotoHold}
            onActivePhotoChange={handleActivePhotoChange}
            lightboxOpen={lightboxIndex !== null}
          />
        </motion.div>

        <div
          className="mt-3 flex justify-end text-text/40"
          aria-live="polite"
        >
          <span className="font-body text-[11px] tabular-nums tracking-widest select-none">
            {String(activeIndex + 1).padStart(2, '0')} / {String(gallery.length).padStart(2, '0')}
          </span>
        </div>
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
