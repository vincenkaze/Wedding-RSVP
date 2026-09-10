import { useCallback, useEffect, useRef, useState } from 'react'
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
    return sessionStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return true
  }
}

function markVisited() {
  try {
    sessionStorage.setItem(STORAGE_KEY, 'true')
  } catch {
    // ignore
  }
}

interface EnvelopeIntroProps {
  onComplete: () => void
  onReveal?: () => void
}

export default function EnvelopeIntro({ onComplete, onReveal }: EnvelopeIntroProps) {
  const [show, setShow] = useState(() => {
    if (prefersReduced || hasVisited()) return false
    return true
  })
  const [sealed, setSealed] = useState(true)
  const completedRef = useRef(false)
  const sealRef = useRef<HTMLButtonElement>(null)

  const handleComplete = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    markVisited()
    setShow(false)
    onComplete()
  }, [onComplete])

  useEffect(() => {
    if (!show && !completedRef.current) {
      completedRef.current = true
      onComplete()
    }
  }, [show, onComplete])

  const handleSealClick = useCallback(async () => {
    if (!sealed) return

    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      'requestPermission' in DeviceOrientationEvent
    ) {
      try {
        await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission()
      } catch {
        // iOS permission denied — gallery will work without tilt
      }
    }

    onReveal?.()
    setSealed(false)
  }, [sealed, onReveal])

  useEffect(() => {
    if (sealed) return
    // Tap → flap (1s) → card rises (by ~1.4s) → names settle (~1.8s) →
    // camera push into names (1.55–2.6s) → cream flash (2.42–2.62s) → handoff.
    const t = setTimeout(handleComplete, 2650)
    return () => clearTimeout(t)
  }, [sealed, handleComplete])

  const initials = `${couple.firstName[0]}${couple.secondName[0]}`

  const sealedAnimate = { scale: [1, 1.08, 1] as number[], boxShadow: ['0 0 0 0 rgba(176,141,87,0)', '0 0 12px 4px rgba(176,141,87,0.35)', '0 0 0 0 rgba(176,141,87,0)'] }
  const unsealedAnimate = { opacity: 0, scale: 0.4 }
  const sealedTransition = { scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const }, boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const } }
  const unsealedTransition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }

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
          {/* Skip intro — top right; fades once the seal breaks */}
          <motion.button
            type="button"
            onClick={handleComplete}
            initial={false}
            animate={{ opacity: sealed ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ pointerEvents: sealed ? 'auto' : 'none' }}
            className="absolute top-6 right-6 font-body text-xs uppercase tracking-wider text-muted/50 transition-colors hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:top-8 sm:right-10"
          >
            Skip Intro
          </motion.button>

          {/* Camera-push layer — rushes into the couple's names, then fades
              late so low-end GPUs never rasterize a giant scaled layer */}
          <motion.div
            initial={false}
            animate={
              sealed ? { scale: 1, opacity: 1 } : { scale: 7, opacity: [1, 1, 0] }
            }
            transition={
              sealed
                ? { duration: 0 }
                : {
                    scale: { delay: 1.55, duration: 1.05, ease: [0.42, 0, 1, 1] },
                    opacity: { delay: 1.55, duration: 1.05, times: [0, 0.72, 1] },
                  }
            }
            style={{ transformOrigin: '50% 40%' }}
            className="flex flex-col items-center"
          >
          {/* Floating envelope container */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 3,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
            className="relative h-48 w-64 sm:h-56 sm:w-72"
          >
            {/* SVG Envelope */}
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
              {/* Flap — stays closed until seal is clicked */}
              <motion.path
                d="M4 4 L120 80 L236 4"
                fill="var(--color-surface, #f5f0eb)"
                stroke="var(--color-accent, #b08d57)"
                strokeWidth="1"
                initial={{ rotateX: 0 }}
                animate={{ rotateX: sealed ? 0 : 180 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
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

            {/* Wax seal — clickable trigger */}
            <button
              ref={sealRef}
              type="button"
              onClick={handleSealClick}
              disabled={!sealed}
              aria-label="Open envelope"
              className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 z-10"
            >
              <motion.div
                animate={sealed ? sealedAnimate : unsealedAnimate}
                transition={sealed ? sealedTransition : unsealedTransition}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-accent shadow-lg"
              >
                <span className="font-display text-sm font-bold text-bg">
                  {initials}
                </span>
              </motion.div>
            </button>

            {/* Card reveal — slides up after seal breaks */}
            <AnimatePresence>
              {!sealed && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
                  className="absolute inset-0 flex items-center justify-center pt-4"
                >
                  <div className="flex flex-col items-center">
                    <span className="font-display text-3xl tracking-tight text-accent sm:text-4xl">
                      {initials}
                    </span>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 1.2 }}
                      className="mt-3 font-display text-base tracking-tight text-text sm:text-lg"
                    >
                      {couple.displayName}
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Hint text */}
          <AnimatePresence>
            {sealed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: 1.5 }}
                className="mt-8 font-body text-xs tracking-wider text-muted/60 sm:text-sm"
              >
                Tap the seal to open
              </motion.p>
            )}
          </AnimatePresence>
          </motion.div>

          {/* Warm cream flash — punch-through finish that dissolves into Hero */}
          <motion.div
            aria-hidden
            initial={false}
            animate={{ opacity: sealed ? 0 : 1 }}
            transition={
              sealed ? { duration: 0 } : { delay: 2.42, duration: 0.2 }
            }
            className="pointer-events-none absolute inset-0 bg-bg"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
