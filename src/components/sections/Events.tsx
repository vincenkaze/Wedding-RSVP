import { motion, useReducedMotion } from 'framer-motion'
import { events, sections } from '../../content/content'
import EventCard from './EventCard'
import {
  EASE_ENTRANCE,
  STAGGER_SIBLING,
  DURATION_CINEMATIC,
} from '../primitives/reveal'

export default function Events() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      id="events"
      className="relative px-6 py-20 sm:py-28 md:py-32"
    >
      <div className="mx-auto max-w-3xl">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.p
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DURATION_CINEMATIC, ease: EASE_ENTRANCE }}
            className="font-body text-xs font-semibold uppercase tracking-[0.24em] text-accent sm:text-sm"
          >
            {sections.events.label}
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
            className="mt-4 font-display text-3xl tracking-tight text-ink sm:text-4xl md:text-5xl"
          >
            {sections.events.heading}
          </motion.h2>
        </div>

        {/* Timeline layout */}
        <div className="relative">
          {/* Desktop connecting line — left side */}
          <div
            aria-hidden
            className="absolute left-0 top-0 bottom-0 hidden w-px bg-gold/30 md:block"
          />

          {/* Mobile connecting line — left side */}
          <div
            aria-hidden
            className="absolute left-0 top-0 bottom-0 w-px bg-gold/30 md:hidden"
          />

          <div className="flex flex-col gap-6 sm:gap-8">
            {events.map((event, i) => (
              <motion.div
                key={event.title}
                initial={
                  prefersReducedMotion
                    ? undefined
                    : { opacity: 0, y: 24, filter: 'blur(4px)' }
                }
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: DURATION_CINEMATIC,
                  ease: EASE_ENTRANCE,
                  delay: i * STAGGER_SIBLING,
                }}
                className="relative pl-8 md:pl-12"
              >
                {/* Timeline dot */}
                <motion.span
                  initial={prefersReducedMotion ? undefined : { scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: 0.4,
                    ease: EASE_ENTRANCE,
                    delay: i * STAGGER_SIBLING,
                  }}
                  className="absolute left-0 top-6 z-10 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-accent bg-white md:top-8"
                  aria-hidden
                />

                <EventCard {...event} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
