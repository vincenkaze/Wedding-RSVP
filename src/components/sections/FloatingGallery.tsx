import { useState, useCallback, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { gallery, sections } from '../../content/content'
import FloatingImage from './FloatingImage'
import Lightbox from './Lightbox'
import { EASE_ENTRANCE, DURATION_CINEMATIC } from '../primitives/reveal'

const REPULSION_RADIUS = 200
const REPULSION_STRENGTH = 24

function useRepulsion() {
  const [offsets, setOffsets] = useState(() =>
    Array.from({ length: gallery.length }, () => ({ x: 0, y: 0 })),
  )
  const rafRef = useRef(0)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const rect = e.currentTarget.getBoundingClientRect()
        const mx = e.clientX - rect.left
        const my = e.clientY - rect.top

        setOffsets((prev) =>
          prev.map((_, i) => {
            const img = e.currentTarget.children[i] as HTMLElement | undefined
            if (!img) return { x: 0, y: 0 }

            const imgRect = img.getBoundingClientRect()
            const cx = imgRect.left - rect.left + imgRect.width / 2
            const cy = imgRect.top - rect.top + imgRect.height / 2

            const dx = cx - mx
            const dy = cy - my
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist > REPULSION_RADIUS || dist === 0) return { x: 0, y: 0 }

            const force = (1 - dist / REPULSION_RADIUS) * REPULSION_STRENGTH
            return {
              x: (dx / dist) * force,
              y: (dy / dist) * force,
            }
          }),
        )
      })
    },
    [],
  )

  const handleMouseLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    setOffsets((prev) => prev.map(() => ({ x: 0, y: 0 })))
  }, [])

  return { offsets, handleMouseMove, handleMouseLeave }
}

export default function FloatingGallery() {
  const prefersReducedMotion = useReducedMotion()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const { offsets, handleMouseMove, handleMouseLeave } = useRepulsion()

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
          className="relative grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3"
          onMouseMove={prefersReducedMotion ? undefined : handleMouseMove}
          onMouseLeave={prefersReducedMotion ? undefined : handleMouseLeave}
        >
          {gallery.map((item, i) => (
            <FloatingImage
              key={item.src}
              {...item}
              index={i}
              onOpen={setLightboxIndex}
              repulsion={offsets[i]}
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
