import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { StoryMilestone as MilestoneType } from '../../content/content'
import {
  EASE_ENTRANCE,
  DURATION_CINEMATIC,
  DURATION_STANDARD,
} from '../primitives/reveal'

interface StoryMilestoneProps {
  milestone: MilestoneType
  index: number
  isLast: boolean
}

export default function StoryMilestone({ milestone, index, isLast }: StoryMilestoneProps) {
  const prefersReducedMotion = useReducedMotion()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const isEven = index % 2 === 0

  const year = (
    <motion.time
      initial={prefersReducedMotion ? undefined : { opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: DURATION_CINEMATIC, ease: EASE_ENTRANCE }}
      className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-accent sm:text-base"
    >
      {milestone.year}
    </motion.time>
  )

  const content = (
    <motion.div
      initial={
        prefersReducedMotion
          ? undefined
          : { opacity: 0, x: 20, filter: 'blur(4px)' }
      }
      whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: DURATION_CINEMATIC, ease: EASE_ENTRANCE, delay: 0.1 }}
      className="flex flex-col gap-3"
    >
      <h3 className="font-display text-2xl tracking-tight text-text sm:text-3xl">
        {milestone.title}
      </h3>
      <p className="font-body text-base leading-relaxed text-muted sm:text-lg">
        {milestone.body}
      </p>
    </motion.div>
  )

  const photo =
    milestone.image && !imageError ? (
      <motion.figure
        initial={
          prefersReducedMotion
            ? undefined
            : { opacity: 0, scale: 0.95, rotate: 3 }
        }
        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: EASE_ENTRANCE, delay: 0.2 }}
        className="mt-4 overflow-hidden rounded-xl ring-1 ring-black/5"
      >
        <div className="aspect-[4/3] bg-surface relative">
          <img
            src={milestone.image}
            alt={milestone.imageAlt ?? milestone.title}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`h-full w-full object-cover transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="h-10 w-10 text-accent/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </div>
          )}
        </div>
      </motion.figure>
    ) : null

  return (
    <div
      className={`relative grid gap-6 sm:gap-8 ${
        isEven
          ? 'md:grid-cols-[1fr_2rem_1.5fr]'
          : 'md:grid-cols-[1.5fr_2rem_1fr]'
      } md:items-start`}
    >
      {/* Left column: even → year+photo, odd → text */}
      <div
        className={`flex flex-col gap-3 ${
          isEven ? '' : 'md:order-3 md:items-end md:text-right'
        }`}
      >
        {isEven ? (
          <>
            {year}
            {photo}
          </>
        ) : (
          content
        )}
      </div>

      {/* Center: dot + line */}
      <div className="hidden md:flex flex-col items-center">
        <motion.span
          initial={prefersReducedMotion ? undefined : { scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: DURATION_STANDARD, ease: EASE_ENTRANCE }}
          className="z-10 mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-accent bg-white"
          aria-hidden
        />
        {!isLast && (
          <div className="w-px flex-1 bg-accent/40" aria-hidden />
        )}
      </div>

      {/* Mobile dot (visible on md:hidden) */}
      <div className="absolute left-0 top-1 z-10 md:hidden" aria-hidden>
        <motion.span
          initial={prefersReducedMotion ? undefined : { scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: DURATION_STANDARD, ease: EASE_ENTRANCE }}
          className="block h-3 w-3 rounded-full border-2 border-accent bg-white"
        />
      </div>

      {/* Right column: even → text, odd → year+photo */}
      <div
        className={`flex flex-col gap-3 pl-6 md:pl-0 ${
          isEven ? '' : 'md:order-1'
        }`}
      >
        {isEven ? (
          content
        ) : (
          <>
            {year}
            {photo}
          </>
        )}
      </div>
    </div>
  )
}
