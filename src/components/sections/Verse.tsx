import { motion, useReducedMotion } from 'framer-motion'
import Section from '../primitives/Section'
import { verse } from '../../content/content'
import { EASE_ENTRANCE } from '../primitives/reveal'

const verseLines = verse.text.split('\n')

export default function Verse() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <Section
      className="bg-white pb-24 pt-16 sm:pb-32 sm:pt-24"
    >
      <div className="mx-auto max-w-2xl px-6 text-center">
        {/* Top ornament */}
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE_ENTRANCE }}
          className="mb-6 flex justify-center"
        >
          <span className="verse-ornament inline-block h-px w-12 bg-gold sm:w-16" />
        </motion.div>

        {/* Verse text */}
        <blockquote className="space-y-3">
          {verseLines.map((line, i) => (
            <motion.p
              key={i}
              initial={
                prefersReducedMotion
                  ? undefined
                  : { opacity: 0, y: 12, filter: 'blur(2px)' }
              }
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                ease: EASE_ENTRANCE,
                delay: 0.15 + i * 0.08,
              }}
              className="font-display text-lg leading-relaxed text-ink sm:text-xl md:text-2xl"
            >
              {line}
            </motion.p>
          ))}
        </blockquote>

        {/* Gold rule draw */}
        <motion.div
          initial={prefersReducedMotion ? undefined : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.8,
            ease: EASE_ENTRANCE,
            delay: 0.35,
          }}
          className="mx-auto mt-8 h-px w-24 origin-left bg-gold sm:w-32"
        />

        {/* Reference */}
        {verse.reference && (
          <motion.p
            initial={
              prefersReducedMotion
                ? undefined
                : { opacity: 0, y: 8, filter: 'blur(2px)' }
            }
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE_ENTRANCE, delay: 0.5 }}
            className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-muted sm:text-sm"
          >
            — {verse.reference}
          </motion.p>
        )}

        {/* Bottom ornament */}
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE_ENTRANCE, delay: 0.55 }}
          className="mt-6 flex justify-center"
        >
          <span className="verse-ornament inline-block h-px w-12 bg-gold sm:w-16" />
        </motion.div>
      </div>
    </Section>
  )
}
