import { useEffect, useRef, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import { SmoothScrollContext } from './smooth-scroll-context'

interface Props {
  children: ReactNode
}

export default function SmoothScrollRoot({ children }: Props) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

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

    setLenis(l)

    let id: number
    let idle = false
    let idleTimer: ReturnType<typeof setTimeout>

    function startRaf() {
      if (!idle) return
      idle = false
      clearTimeout(idleTimer)
      const rafLoop = (time: number) => {
        l.raf(time)
        id = requestAnimationFrame(rafLoop)
      }
      id = requestAnimationFrame(rafLoop)
    }

    function onScroll() {
      if (idle) startRaf()
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => {
        idle = true
        cancelAnimationFrame(id)
      }, 200)
    }

    startRaf()
    window.addEventListener('scroll', onScroll, { passive: true })

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
      cancelAnimationFrame(id)
      clearTimeout(idleTimer)
      window.removeEventListener('scroll', onScroll)
      mq.removeEventListener('change', onReducedMotionChange)
      window.removeEventListener('resize', onResize)
      clearTimeout(resizeTimer)
      l.destroy()
    }
  }, [])

  return <SmoothScrollContext.Provider value={{ lenis }}>{children}</SmoothScrollContext.Provider>
}
