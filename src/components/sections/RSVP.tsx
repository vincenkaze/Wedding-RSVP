import { forwardRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import RSVPForm from './RSVPForm'
import { sections } from '../../content/content'
import { EASE_ENTRANCE, DURATION_CINEMATIC } from '../primitives/reveal'

const RSVPSection = forwardRef<HTMLElement>(function RSVPSection(_props, ref) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      ref={ref}
      id="rsvp"
      className="relative px-4 py-20 sm:px-6 sm:py-28 md:py-32 bg-surface/50"
    >
      <div className="mx-auto max-w-xl">
        {/* Section header */}
        <div className="text-center mb-10 sm:mb-14">
          <motion.p
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DURATION_CINEMATIC, ease: EASE_ENTRANCE }}
            className="font-body text-xs font-semibold uppercase tracking-[0.24em] text-accent sm:text-sm"
          >
            {sections.rsvp.label}
          </motion.p>
          <motion.h2
            initial={
              prefersReducedMotion
                ? undefined
                : { opacity: 0, y: 20 }
            }
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: DURATION_CINEMATIC,
              ease: EASE_ENTRANCE,
              delay: 0.08,
            }}
            className="mt-4 font-display text-3xl tracking-tight text-text sm:text-4xl md:text-5xl"
          >
            {sections.rsvp.heading}
          </motion.h2>
        </div>

        {/* Form card */}
        <motion.div
          initial={
            prefersReducedMotion
              ? undefined
              : { opacity: 0, y: 24 }
          }
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: DURATION_CINEMATIC,
            ease: EASE_ENTRANCE,
            delay: 0.2,
          }}
          className="w-full rounded-2xl border border-border bg-bg p-6 sm:p-8 md:p-10"
        >
          <RSVPForm />
        </motion.div>
      </div>
    </section>
  )
})

export default RSVPSection
