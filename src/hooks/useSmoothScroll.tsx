import { useEffect, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import { SmoothScrollContext } from './smooth-scroll-context'

interface Props {
  children: ReactNode
}

export default function SmoothScrollRoot({ children }: Props) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia('(max-width: 639px)').matches

    if (reduced || isMobile) {
      document.documentElement.style.scrollBehavior = 'smooth'
      return
    }

    const l = new Lenis({
      duration: reduced ? 0 : 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.5,
      infinite: false,
    })

    // Defer setState to avoid synchronous cascading renders in effect body
    const lenisRaf = requestAnimationFrame(() => setLenis(l))

    let id: number
    const rafLoop = (time: number) => {
      l.raf(time)
      id = requestAnimationFrame(rafLoop)
    }
    id = requestAnimationFrame(rafLoop)

    // Re-evaluate prefers-reduced-motion on change
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    function onReducedMotionChange() {
      const isReduced = mq.matches
      l.options.duration = isReduced ? 0 : 1.2
    }
    mq.addEventListener('change', onReducedMotionChange)

    // Re-init on resize/orientation change (debounced)
    let resizeTimer: ReturnType<typeof setTimeout>
    function onResize() {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        l.resize()
      }, 250)
    }
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      cancelAnimationFrame(lenisRaf)
      cancelAnimationFrame(id)
      mq.removeEventListener('change', onReducedMotionChange)
      window.removeEventListener('resize', onResize)
      clearTimeout(resizeTimer)
      l.destroy()
    }
  }, [])

  return <SmoothScrollContext.Provider value={{ lenis }}>{children}</SmoothScrollContext.Provider>
}
