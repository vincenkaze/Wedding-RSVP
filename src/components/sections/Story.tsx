import { motion, useReducedMotion } from 'framer-motion'
import { sections, storyPrologue, storyTimeline } from '../../content/content'
import StoryMilestone from './StoryMilestone'
import {
  EASE_ENTRANCE,
  DURATION_CINEMATIC,
  STAGGER_SECTION,
} from '../primitives/reveal'

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: STAGGER_SECTION },
  },
}

export default function Story() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section id="story" className="relative px-6 py-20 sm:py-28 md:py-32">
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="mx-auto max-w-3xl"
      >
        {/* Section header */}
        <div className="text-center mb-16 sm:mb-20">
          <motion.p
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DURATION_CINEMATIC, ease: EASE_ENTRANCE }}
            className="font-body text-xs font-semibold uppercase tracking-[0.24em] text-accent sm:text-sm"
          >
            {sections.story.label}
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
            {sections.story.heading}
          </motion.h2>
          <motion.p
            initial={
              prefersReducedMotion
                ? undefined
                : { opacity: 0, y: 12, filter: 'blur(2px)' }
            }
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{
              duration: DURATION_CINEMATIC,
              ease: EASE_ENTRANCE,
              delay: 0.16,
            }}
            className="mx-auto mt-6 max-w-lg font-body text-base leading-relaxed text-muted sm:text-lg"
          >
            {storyPrologue}
          </motion.p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical gold line — desktop: center, mobile: left edge */}
          <div
            aria-hidden
            className="absolute left-0 top-0 bottom-0 hidden w-px bg-accent/30 md:left-1/2 md:-translate-x-1/2 md:block"
          />
          <div
            aria-hidden
            className="absolute left-0 top-0 bottom-0 w-px bg-accent/30 md:hidden"
          />

          <div className="flex flex-col gap-12 sm:gap-16 md:gap-20">
            {storyTimeline.map((milestone, i) => (
              <StoryMilestone
                key={milestone.year}
                milestone={milestone}
                index={i}
                isLast={i === storyTimeline.length - 1}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
