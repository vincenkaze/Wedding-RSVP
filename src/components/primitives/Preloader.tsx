import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { couple } from '../../content/content'

interface PreloaderProps {
  onComplete: () => void
}

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Preloader({ onComplete }: PreloaderProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (prefersReduced) {
      onComplete()
      return
    }
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onComplete, 400)
    }, 2000)
    return () => clearTimeout(timer)
  }, [onComplete])

  const initials = `${couple.firstName[0]} & ${couple.secondName[0]}`

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          aria-label="Loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg"
        >
          {/* Gold line draw */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="h-px w-24 origin-left bg-accent sm:w-32"
          />

          {/* Initials */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1.2,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.8,
            }}
            className="mt-6 font-display text-3xl tracking-tight text-ink sm:text-4xl"
          >
            {initials}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
