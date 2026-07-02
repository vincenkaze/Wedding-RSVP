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

    const l = new Lenis({
      duration: reduced ? 0 : 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.5,
      infinite: false,
    })

    setLenis(l)

    let id: number
    const raf = (time: number) => {
      l.raf(time)
      id = requestAnimationFrame(raf)
    }
    id = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(id)
      l.destroy()
    }
  }, [])

  return <SmoothScrollContext.Provider value={{ lenis }}>{children}</SmoothScrollContext.Provider>
}
