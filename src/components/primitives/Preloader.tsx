import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { couple, gallery } from '../../content/content'
import { EASE_ENTRANCE } from './reveal'

const STORAGE_KEY = 'wedding-preloader-seen'

interface PreloaderProps {
  onComplete: () => void
}

function hasSeenPreloader(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function markSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, 'true')
  } catch {
    // ignore
  }
}

const COLLAGE_IMAGES = gallery.slice(0, 8)

const COLLAGE_POSITIONS = [
  { gridArea: '1 / 1 / 3 / 3', rotate: -2, size: 'large' as const, floatDelay: 0 },
  { gridArea: '1 / 3 / 2 / 5', rotate: 1.5, size: 'wide' as const, floatDelay: 0.4 },
  { gridArea: '2 / 3 / 3 / 4', rotate: -1, size: 'small' as const, floatDelay: 0.8 },
  { gridArea: '2 / 4 / 3 / 5', rotate: 3, size: 'small' as const, floatDelay: 1.2 },
  { gridArea: '3 / 1 / 4 / 2', rotate: 2, size: 'small' as const, floatDelay: 0.6 },
  { gridArea: '3 / 2 / 4 / 4', rotate: -1.5, size: 'wide' as const, floatDelay: 1.0 },
  { gridArea: '3 / 4 / 4 / 5', rotate: -3, size: 'small' as const, floatDelay: 0.2 },
  { gridArea: '1 / 5 / 2 / 6', rotate: 1, size: 'small' as const, floatDelay: 1.4 },
]

const COLLAGE_POSITIONS_MOBILE = [
  { gridArea: '1 / 1 / 2 / 3', rotate: -1.5, size: 'large' as const, floatDelay: 0 },
  { gridArea: '1 / 3 / 2 / 4', rotate: 2, size: 'small' as const, floatDelay: 0.5 },
  { gridArea: '2 / 1 / 3 / 2', rotate: 1, size: 'small' as const, floatDelay: 0.9 },
  { gridArea: '2 / 2 / 3 / 4', rotate: -2, size: 'wide' as const, floatDelay: 0.3 },
  { gridArea: '3 / 1 / 4 / 3', rotate: 1.5, size: 'wide' as const, floatDelay: 0.7 },
  { gridArea: '3 / 3 / 4 / 4', rotate: -1, size: 'small' as const, floatDelay: 1.1 },
  { gridArea: '4 / 1 / 5 / 2', rotate: -2.5, size: 'small' as const, floatDelay: 0.4 },
  { gridArea: '4 / 2 / 5 / 4', rotate: 1, size: 'wide' as const, floatDelay: 0.8 },
]

export default function Preloader({ onComplete }: PreloaderProps) {
  const [visible, setVisible] = useState(() => !hasSeenPreloader())
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (!visible) {
      onComplete()
      return
    }

    const timer = setTimeout(() => {
      setVisible(false)
      markSeen()
      setTimeout(onComplete, 800)
    }, 1800)
    return () => clearTimeout(timer)
  }, [visible, onComplete])

  const initials = `${couple.firstName[0]} & ${couple.secondName[0]}`
  const positions = isMobile ? COLLAGE_POSITIONS_MOBILE : COLLAGE_POSITIONS

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          aria-label="Loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.8, ease: EASE_ENTRANCE }}
          className="preloader-overlay"
        >
          {/* Backdrop blur + gradient layer */}
          <div className="absolute inset-0 bg-bg/80 backdrop-blur-md sm:backdrop-blur-2xl" />

          {/* Cinematic vignette overlay */}
          <div className="preloader-vignette" aria-hidden="true" />

          {/* Collage grid — passive, non-interactable */}
          <div className="preloader-collage" aria-hidden="true">
            {COLLAGE_IMAGES.map((item, i) => {
              const pos = positions[i]
              if (!pos) return null

              return (
                <motion.div
                  key={item.src}
                  style={{
                    gridArea: pos.gridArea,
                    rotate: `${pos.rotate}deg`,
                    '--float-delay': `${pos.floatDelay}s`,
                  } as React.CSSProperties}
                  initial={{ opacity: 0, scale: 0.82 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.8,
                    ease: EASE_ENTRANCE,
                    delay: 0.2 + i * 0.12,
                  }}
                  className={`preloader-card ${pos.size}`}
                >
                  <picture>
                    <source srcSet={item.src} type="image/avif" />
                    <source srcSet={item.src.replace('.avif', '.webp')} type="image/webp" />
                    <img
                      src={item.src.replace('.avif', '.webp')}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="preloader-card-img"
                    />
                  </picture>
                  {/* Subtle inner glow for depth */}
                  <div className="preloader-card-glow" />
                </motion.div>
              )
            })}
          </div>

          {/* Center monogram + gold line */}
          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: EASE_ENTRANCE, delay: 0.6 }}
              className="h-px w-24 origin-left bg-accent sm:w-32"
            />

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                ease: EASE_ENTRANCE,
                delay: 0.9,
              }}
              className="mt-6 font-display text-4xl tracking-tight text-text/90 sm:text-5xl"
            >
              {initials}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, letterSpacing: '0.1em' }}
              animate={{ opacity: 0.5, letterSpacing: '0.35em' }}
              transition={{ duration: 0.8, ease: EASE_ENTRANCE, delay: 1.2 }}
              className="mt-4 font-body text-xs uppercase text-text-muted"
            >
              Loading
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
