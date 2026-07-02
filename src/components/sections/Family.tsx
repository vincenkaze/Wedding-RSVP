import { motion, useReducedMotion } from 'framer-motion'
import { family, sections } from '../../content/content'
import FamilyGroup from './FamilyGroup'
import {
  EASE_ENTRANCE,
  DURATION_CINEMATIC,
} from '../primitives/reveal'

function Flourish() {
  return (
    <svg
      viewBox="0 0 24 80"
      fill="none"
      className="hidden h-20 w-6 text-accent md:block"
      aria-hidden
    >
      <path
        d="M12 0 C12 20, 0 20, 0 40 C0 60, 12 60, 12 80"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M12 20 C12 30, 6 30, 6 40 C6 50, 12 50, 12 60"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <circle cx="12" cy="40" r="2" fill="currentColor" />
    </svg>
  )
}

export default function Family() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      id="family"
      className="relative px-6 py-20 sm:py-28 md:py-32 bg-surface/50"
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
            {sections.family.label}
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
            {sections.family.heading}
          </motion.h2>
        </div>

        {/* Family groups */}
        <div className="flex flex-col items-center gap-12 md:flex-row md:items-start md:justify-center md:gap-0">
          <div className="md:w-5/12">
            <FamilyGroup side={family.bride} />
          </div>

          {/* Flourish: desktop between columns, mobile divider */}
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: DURATION_CINEMATIC,
              ease: EASE_ENTRANCE,
              delay: 0.3,
            }}
            className="flex items-center justify-center md:mx-4 md:mt-8"
          >
            {/* Mobile divider */}
            <div className="h-px w-16 bg-accent/40 md:hidden" aria-hidden />
            {/* Desktop flourish */}
            <Flourish />
          </motion.div>

          <div className="md:w-5/12">
            <FamilyGroup side={family.groom} />
          </div>
        </div>
      </div>
    </section>
  )
}
