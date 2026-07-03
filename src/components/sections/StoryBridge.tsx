import { motion, useReducedMotion } from 'framer-motion'
import { EASE_ENTRANCE, DURATION_CINEMATIC } from '../primitives/reveal'

export default function StoryBridge() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      aria-hidden
      className="relative flex items-center justify-center py-16 sm:py-24 md:py-32"
    >
      <div className="flex flex-col items-center gap-6">
        {/* Malayalam glyph */}
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DURATION_CINEMATIC, ease: EASE_ENTRANCE }}
          className="flex flex-col items-center"
        >
          <span className="font-display text-lg tracking-wider text-accent/60 sm:text-xl md:text-2xl">
            ശുഭം
          </span>
          <span className="font-body text-[10px] uppercase tracking-[0.2em] text-accent/40 sm:text-xs">
          </span>
        </motion.div>

        {/* Vertical line */}
        <motion.div
          initial={prefersReducedMotion ? undefined : { scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: DURATION_CINEMATIC, ease: EASE_ENTRANCE, delay: 0.15 }}
          className="w-px origin-top bg-accent/40"
          style={{ height: prefersReducedMotion ? 80 : 80 }}
        />

        {/* Center dot with heartbeat pulse */}
        <div className="relative">
          <div className="h-2 w-2 rounded-full bg-accent/70" />
          {!prefersReducedMotion && (
            <div className="story-bridge-pulse absolute inset-0 h-2 w-2 rounded-full bg-accent/40" />
          )}
        </div>

        {/* Vertical line (bottom half) */}
        <motion.div
          initial={prefersReducedMotion ? undefined : { scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: DURATION_CINEMATIC, ease: EASE_ENTRANCE, delay: 0.3 }}
          className="w-px origin-top bg-accent/40"
          style={{ height: prefersReducedMotion ? 80 : 80 }}
        />

        {/* Hindi glyph */}
        <motion.span
          initial={prefersReducedMotion ? undefined : { opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DURATION_CINEMATIC, ease: EASE_ENTRANCE, delay: 0.45 }}
          className="font-display text-lg tracking-wider text-accent/60 sm:text-xl md:text-2xl"
        >
          शुभ
        </motion.span>
      </div>
    </section>
  )
}
