import { useEffect, useRef } from 'react'

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
const isTouch =
  typeof window !== 'undefined' &&
  (window.matchMedia('(hover: none)').matches ||
    window.matchMedia('(pointer: coarse)').matches)

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const targetX = useRef(0)
  const targetY = useRef(0)
  const currentX = useRef(0)
  const currentY = useRef(0)

  useEffect(() => {
    if (prefersReduced || isTouch) return

    const dot = dotRef.current
    if (!dot) return

    function onMove(e: MouseEvent) {
      targetX.current = e.clientX
      targetY.current = e.clientY
    }

    function animate() {
      const lerp = 0.15
      currentX.current += (targetX.current - currentX.current) * lerp
      currentY.current += (targetY.current - currentY.current) * lerp
      dot!.style.transform = `translate(${currentX.current - 6}px, ${currentY.current - 6}px)`
      rafRef.current = requestAnimationFrame(animate)
    }

    function onEnterInteractive(e: Event) {
      const target = e.target as HTMLElement
      if (
        target.closest(
          'a, button, [role="button"], input, textarea, select, [role="checkbox"], [role="radio"]',
        )
      ) {
        dot!.classList.add('cursor-hover')
      }
    }

    function onLeaveInteractive(e: Event) {
      const target = e.target as HTMLElement
      if (
        target.closest(
          'a, button, [role="button"], input, textarea, select, [role="checkbox"], [role="radio"]',
        )
      ) {
        dot!.classList.remove('cursor-hover')
      }
    }

    document.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseenter', onEnterInteractive, true)
    document.addEventListener('mouseleave', onLeaveInteractive, true)
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseenter', onEnterInteractive, true)
      document.removeEventListener('mouseleave', onLeaveInteractive, true)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  if (prefersReduced || isTouch) return null

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[200] h-3 w-3 rounded-full bg-accent mix-blend-difference"
    />
  )
}
