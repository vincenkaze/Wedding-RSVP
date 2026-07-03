import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { gallery, sections } from '../../content/content'
import FloatingPhoto from './FloatingPhoto'
import Lightbox from './Lightbox'
import {
  getResponsiveScatterPositions,
  type ScatterPosition,
} from './scatter-positions'
import { EASE_ENTRANCE, DURATION_CINEMATIC } from '../primitives/reveal'

export default function FloatingGallery() {
  const prefersReducedMotion = useReducedMotion()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [topmostIndex, setTopmostIndex] = useState<number | null>(null)
  const [scatterPositions, setScatterPositions] = useState<ScatterPosition[]>(
    () => getResponsiveScatterPositions(gallery.length, 1024),
  )
  const canvasRef = useRef<HTMLDivElement>(null)

  // Recalculate positions on resize
  useEffect(() => {
    const updatePositions = () => {
      const width = canvasRef.current?.clientWidth ?? 1024
      setScatterPositions(getResponsiveScatterPositions(gallery.length, width))
    }

    updatePositions()

    const observer = new ResizeObserver(updatePositions)
    if (canvasRef.current) {
      observer.observe(canvasRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleBringToFront = useCallback((index: number) => {
    setTopmostIndex(index)
  }, [])

  const handleActivate = useCallback((index: number) => {
    setLightboxIndex(index)
  }, [])

  return (
    <section id="gallery" className="relative px-6 py-20 sm:py-28 md:py-32">
      <div className="mx-auto max-w-5xl">
        {/* Section header */}
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
            initial={
              prefersReducedMotion
                ? undefined
                : { opacity: 0, y: 20, filter: 'blur(4px)' }
            }
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
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

        {/* Floating canvas */}
        <div
          ref={canvasRef}
          className="relative mx-auto h-[400px] w-full sm:h-[450px] md:h-[550px]"
          style={{ overflow: 'visible' }}
        >
          {gallery.map((item, i) => (
            <FloatingPhoto
              key={item.src}
              {...item}
              index={i}
              total={gallery.length}
              initialPosition={scatterPositions[i]}
              onActivate={handleActivate}
              onBringToFront={handleBringToFront}
              isTopmost={topmostIndex === i}
            />
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <Lightbox
        items={gallery}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </section>
  )
}
