import { useEffect, useRef } from 'react'

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
const isTouch =
  typeof window !== 'undefined' &&
  (window.matchMedia('(hover: none)').matches ||
    window.matchMedia('(pointer: coarse)').matches)
const isMobile =
  typeof window !== 'undefined' &&
  window.matchMedia('(max-width: 639px)').matches

const INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, textarea, select, [role="checkbox"], [role="radio"]'

function getInteractiveTarget(target: EventTarget | null): Element | null {
  if (target instanceof Element) {
    return target.closest(INTERACTIVE_SELECTOR)
  }
  if (target instanceof Node) {
    return target.parentElement?.closest(INTERACTIVE_SELECTOR) ?? null
  }
  return null
}

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const targetX = useRef(0)
  const targetY = useRef(0)
  const currentX = useRef(0)
  const currentY = useRef(0)
  const mountedRef = useRef(false)

  useEffect(() => {
    if (prefersReduced || isTouch || isMobile) return

    const dot = dotRef.current
    if (!dot) return

    mountedRef.current = true

    function onMove(e: MouseEvent) {
      targetX.current = e.clientX
      targetY.current = e.clientY
    }

    function animate() {
      if (!mountedRef.current || !dotRef.current) return
      const lerp = 0.15
      currentX.current += (targetX.current - currentX.current) * lerp
      currentY.current += (targetY.current - currentY.current) * lerp
      dotRef.current.style.transform = `translate(${currentX.current - 6}px, ${currentY.current - 6}px)`
      rafRef.current = requestAnimationFrame(animate)
    }

    function onEnterInteractive(e: Event) {
      if (getInteractiveTarget(e.target)) {
        dotRef.current?.classList.add('cursor-hover')
      }
    }

    function onLeaveInteractive(e: Event) {
      if (getInteractiveTarget(e.target)) {
        dotRef.current?.classList.remove('cursor-hover')
      }
    }

    document.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseenter', onEnterInteractive, true)
    document.addEventListener('mouseleave', onLeaveInteractive, true)
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      mountedRef.current = false
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseenter', onEnterInteractive, true)
      document.removeEventListener('mouseleave', onLeaveInteractive, true)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  if (prefersReduced || isTouch || isMobile) return null

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[200] h-3 w-3 rounded-full bg-accent mix-blend-difference"
    />
  )
}
