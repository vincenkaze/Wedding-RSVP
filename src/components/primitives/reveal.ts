import type { Variants } from 'framer-motion'

export const EASE_ENTRANCE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export const DURATION_STANDARD = 0.6
export const DURATION_CINEMATIC = 0.9
export const STAGGER_SIBLING = 0.08
export const STAGGER_SECTION = 0.2

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: DURATION_CINEMATIC, ease: EASE_ENTRANCE },
  },
}

export const sectionReveal: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: STAGGER_SECTION },
  },
}

export const titleReveal: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: DURATION_CINEMATIC, ease: EASE_ENTRANCE },
  },
}

export const itemReveal: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: DURATION_CINEMATIC, ease: EASE_ENTRANCE },
  },
}
