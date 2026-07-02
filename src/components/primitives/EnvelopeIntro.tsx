import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { couple } from '../../content/content'

const STORAGE_KEY = 'wedding-envelope-seen'
const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function hasVisited(): boolean {
  try {
    if (typeof window !== 'undefined' && window.location.search.includes('intro=1')) {
      return false
    }
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return true
  }
}

function markVisited() {
  try {
    localStorage.setItem(STORAGE_KEY, 'true')
  } catch {
    // ignore
  }
}

interface EnvelopeIntroProps {
  onComplete: () => void
}

export default function EnvelopeIntro({ onComplete }: EnvelopeIntroProps) {
  const [show, setShow] = useState(() => {
    if (prefersReduced || hasVisited()) return false
    return true
  })

  const handleComplete = useCallback(() => {
    markVisited()
    setShow(false)
    onComplete()
  }, [onComplete])

  const initials = `${couple.firstName[0]}${couple.secondName[0]}`

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="status"
          aria-label="Welcome animation"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-bg"
        >
          {/* Skip button */}
          <button
            type="button"
            onClick={handleComplete}
            className="absolute bottom-8 right-6 font-body text-xs uppercase tracking-wider text-muted/50 transition-colors hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:bottom-10 sm:right-10"
          >
            Skip
          </button>

          {/* SVG Envelope */}
          <div className="relative h-40 w-56 sm:h-48 sm:w-64">
            {/* Envelope body */}
            <svg
              viewBox="0 0 240 160"
              fill="none"
              className="h-full w-full"
              aria-hidden
            >
              {/* Back panel */}
              <rect
                x="4"
                y="4"
                width="232"
                height="152"
                rx="8"
                fill="var(--color-surface, #f5f0eb)"
                stroke="var(--color-accent, #b08d57)"
                strokeWidth="1"
              />
              {/* Flap */}
              <motion.path
                d="M4 4 L120 80 L236 4"
                fill="var(--color-surface, #f5f0eb)"
                stroke="var(--color-accent, #b08d57)"
                strokeWidth="1"
                initial={{ rotateX: 0 }}
                animate={{ rotateX: 180 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                style={{ transformOrigin: '120px 4px' }}
              />
              {/* Front fold lines */}
              <path
                d="M4 156 L100 90"
                stroke="var(--color-accent, #b08d57)"
                strokeWidth="0.5"
                opacity="0.4"
              />
              <path
                d="M236 156 L140 90"
                stroke="var(--color-accent, #b08d57)"
                strokeWidth="0.5"
                opacity="0.4"
              />
            </svg>

            {/* Initials inside envelope */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.8,
              }}
              className="absolute inset-0 flex items-center justify-center pt-6"
            >
              <span className="font-display text-2xl tracking-tight text-accent sm:text-3xl">
                {initials}
              </span>
            </motion.div>
          </div>

          {/* Couple name */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
              delay: 1.2,
            }}
            className="mt-6 font-display text-lg tracking-tight text-text sm:text-xl"
          >
            {couple.displayName}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
