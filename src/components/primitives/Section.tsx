import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  EASE_ENTRANCE,
  DURATION_CINEMATIC,
  STAGGER_SECTION,
} from './reveal'

interface SectionProps {
  children: ReactNode
  className?: string
  delay?: number
}

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: STAGGER_SECTION },
  },
}

export default function Section({
  children,
  className = '',
  delay = 0,
}: SectionProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      className={className}
    >
      <motion.div
        initial={prefersReducedMotion ? 'visible' : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={sectionVariants}
        transition={{
          duration: DURATION_CINEMATIC,
          ease: EASE_ENTRANCE,
          delay,
          staggerChildren: STAGGER_SECTION,
        }}
      >
        {children}
      </motion.div>
    </section>
  )
}

