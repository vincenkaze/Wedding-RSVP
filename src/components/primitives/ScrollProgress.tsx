import { useEffect } from 'react'
import { motion, useSpring } from 'framer-motion'

export default function ScrollProgress() {
  const scaleX = useSpring(0, { stiffness: 100, damping: 30, restDelta: 0.001 })

  useEffect(() => {
    const updateProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      if (scrollHeight <= 0) {
        scaleX.set(0)
        return
      }
      const scrolled = window.scrollY / scrollHeight
      scaleX.set(scrolled)
    }

    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress, { passive: true })
    updateProgress()

    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [scaleX])

  return (
    <div className="scroll-progress-track">
      <motion.div
        className="scroll-progress-bar"
        style={{ scaleX }}
      />
    </div>
  )
}
