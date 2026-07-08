import { useEffect, useState } from 'react'
import { motion, useSpring } from 'framer-motion'

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  const scaleX = useSpring(0, { stiffness: 100, damping: 30, restDelta: 0.001 })

  useEffect(() => {
    const updateProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      if (scrollHeight <= 0) {
        setProgress(0)
        return
      }
      const scrolled = window.scrollY / scrollHeight
      setProgress(scrolled)
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
