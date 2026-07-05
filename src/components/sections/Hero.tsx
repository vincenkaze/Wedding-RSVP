import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { couple, wedding, hero } from '../../content/content'
import { ChevronDown } from 'lucide-react'

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const lineVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      delay,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
}

const nameReveal: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)', clipPath: 'inset(0 100% 0 0)' },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    clipPath: 'inset(0 0% 0 0)',
    transition: {
      delay,
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
}

const STAGGER = 0.08

function DateReveal({ onReveal }: { onReveal: () => void }) {
  const [revealed, setRevealed] = useState(false)

  const handleReveal = () => {
    setRevealed(true)
    onReveal()
  }

  if (prefersReducedMotion) {
    return (
      <>
        <p className="font-body text-white/90 text-sm sm:text-base tracking-widest uppercase">
          {wedding.displayDate}
        </p>
        <p className="font-body text-white/60 text-xs sm:text-sm tracking-wider">
          {wedding.location}
        </p>
      </>
    )
  }

  return (
    <button
      type="button"
      onClick={handleReveal}
      aria-label={revealed ? `${wedding.displayDate}, ${wedding.location}` : 'Tap to reveal the wedding date'}
      className="flex flex-col items-center gap-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      style={{ perspective: '800px' }}
    >
      {/* Bouncing text */}
      <motion.div
        animate={revealed ? {} : { translateY: [0, -18, 0] }}
        transition={
          revealed
            ? {}
            : { duration: 1.4, repeat: Infinity, ease: [0.45, 0, 0.55, 1], times: [0, 0.4, 1] }
        }
      >
        <motion.p
          animate={{ rotateY: revealed ? 1080 : 180 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className={`font-body text-white/90 text-sm sm:text-base tracking-widest uppercase ${revealed ? 'underline-draw' : ''}`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {wedding.displayDate}
        </motion.p>
        <motion.p
          animate={{ rotateY: revealed ? 1080 : 180 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className="font-body text-white/60 text-xs sm:text-sm tracking-wider"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {wedding.location}
        </motion.p>
      </motion.div>
    </button>
  )
}

export default function Hero() {
  const [imgError, setImgError] = useState(false)
  return (
    <section
      id="hero"
      className="relative min-h-dvh flex flex-col items-center justify-center px-6 py-20 overflow-hidden"
    >
      {/* Ken Burns background image */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        {imgError ? (
          <div className="h-full w-full bg-gradient-to-br from-accent/20 via-surface to-bg" />
        ) : (
          <picture>
            <source srcSet={hero.imageAvif} type="image/avif" />
            <img
              src={hero.image}
              alt=""
              loading="eager"
              decoding="async"
              fetchPriority="high"
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover ${prefersReducedMotion ? '' : 'ken-burns'}`}
            />
          </picture>
        )}
      </div>

      {/* Dark vignette overlay */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/15 to-black/40"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8 md:gap-10 max-w-2xl mx-auto text-center">
        {/* Pre-title */}
        <motion.p
          initial={prefersReducedMotion ? undefined : 'hidden'}
          animate="visible"
          variants={lineVariants}
          custom={0}
          className={`font-body text-white/70 text-xs sm:text-sm uppercase tracking-[0.3em] ${prefersReducedMotion ? '' : 'letter-expand'}`}
        >
          {hero.preTitle}
        </motion.p>

        {/* Names */}
        <motion.h1
          initial={prefersReducedMotion ? undefined : 'hidden'}
          animate="visible"
          variants={nameReveal}
          custom={STAGGER}
          className="font-display text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] tracking-tight"
        >
          {couple.displayName}
        </motion.h1>

        {/* Date — mirrored, tap to reveal */}
        <motion.div
          initial={prefersReducedMotion ? undefined : 'hidden'}
          animate="visible"
          variants={lineVariants}
          custom={STAGGER * 2}
          className="flex flex-col items-center gap-1"
        >
          <DateReveal onReveal={() => {}} />
        </motion.div>

        {/* RSVP CTA */}
        <motion.a
          href="#rsvp"
          initial={prefersReducedMotion ? undefined : 'hidden'}
          animate="visible"
          variants={lineVariants}
          custom={STAGGER * 3}
          whileHover={prefersReducedMotion ? {} : { scale: 1.04 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
          className="inline-block font-body text-sm sm:text-base uppercase tracking-[0.15em] font-medium
            bg-accent text-bg px-8 py-3.5 sm:px-10 sm:py-4 rounded-full
            transition-shadow duration-300 shadow-sm
            hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {hero.ctaText}
        </motion.a>
      </div>

      {/* Scroll indicator */}
      <div
        aria-hidden
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 scroll-indicator"
      >
        <ChevronDown className="w-6 h-6 text-white/50" />
      </div>
    </section>
  )
}
