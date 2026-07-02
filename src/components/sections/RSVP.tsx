import { motion, useReducedMotion } from 'framer-motion'
import RSVPForm from './RSVPForm'
import { rsvp, sections } from '../../content/content'
import { EASE_ENTRANCE, DURATION_CINEMATIC } from '../primitives/reveal'

function getDaysRemaining(deadline: string): number {
  const now = new Date()
  const target = new Date(deadline)
  const diff = target.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / 86400000))
}

export default function RSVPSection() {
  const prefersReducedMotion = useReducedMotion()
  const daysLeft = getDaysRemaining(rsvp.deadline)

  return (
    <section
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
            {sections.rsvp.heading}
          </motion.h2>

          {daysLeft > 0 && (
            <motion.p
              initial={
                prefersReducedMotion
                  ? undefined
                  : { opacity: 0, y: 8, filter: 'blur(2px)' }
              }
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{
                duration: DURATION_CINEMATIC,
                ease: EASE_ENTRANCE,
                delay: 0.16,
              }}
              className="mt-4 font-body text-sm text-muted"
            >
              RSVP by {rsvp.deadline} — {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
            </motion.p>
          )}
        </div>

        {/* Form card */}
        <motion.div
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
            delay: 0.2,
          }}
          className="w-full rounded-2xl border border-border bg-bg p-6 sm:p-8 md:p-10"
        >
          <RSVPForm />
        </motion.div>
      </div>
    </section>
  )
}
