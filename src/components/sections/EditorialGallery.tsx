import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { buildEditorialLayout, type EditorialCard } from '../../lib/gallery-layout'
import {
  clampToBounds,
  createDragState,
  endDrag,
  moveDrag,
  startDrag,
  stepInertia,
  type DragState,
} from '../../lib/gallery-physics'
import type { GalleryItem } from '../../content/content'
import EditorialGalleryCard from './EditorialGalleryCard'

interface EditorialGalleryProps {
  items: GalleryItem[]
  onPhotoActivate: (index: number) => void
  paused: boolean
}

const PARALLAX_FACTOR = 0.28
const VERTICAL_LOCK_THRESHOLD = 8
const HINT_DISMISS_KEY = 'editorial-gallery-hint-seen'

const BACKGROUND_WORDS = ['MOMENTS', 'TOGETHER', 'ANJANA', 'KRISHNAPRASAD']

export default function EditorialGallery({
  items,
  onPhotoActivate,
  paused,
}: EditorialGalleryProps) {
  const prefersReducedMotion = useReducedMotion()

  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const dragStateRef = useRef<DragState>(createDragState(0))
  const rafRef = useRef<number | null>(null)
  const pointerIdRef = useRef<number | null>(null)
  const gestureRef = useRef<'undecided' | 'horizontal' | 'vertical'>('undecided')
  const startYRef = useRef(0)

  const [viewportSize, setViewportSize] = useState({ w: 0, h: 0 })
  const [bounds, setBounds] = useState({ min: 0, max: 0 })
  const [showHint, setShowHint] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return !sessionStorage.getItem(HINT_DISMISS_KEY)
    } catch {
      return true
    }
  })

  const layout = useMemo(
    () => (viewportSize.w > 0 && viewportSize.h > 0 ? buildEditorialLayout(items, viewportSize.w, viewportSize.h) : null),
    [items, viewportSize.w, viewportSize.h],
  )

  const cardIndexById = useMemo(() => {
    const map = new Map<string, number>()
    items.forEach((item, index) => map.set(item.id ?? item.src, index))
    return map
  }, [items])

  const applyPosition = useCallback(
    (position: number) => {
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${position}px, -50%, 0)`
      }
      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(${position * PARALLAX_FACTOR}px, 0, 0)`
      }
    },
    [],
  )

  const measure = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport || !layout) return
    const vw = viewport.clientWidth
    const vh = viewport.clientHeight
    setViewportSize({ w: vw, h: vh })
    const min = Math.min(0, vw - layout.contentWidth - 64)
    const max = 0
    setBounds({ min, max })
    const clamped = clampToBounds(dragStateRef.current.position, min, max)
    dragStateRef.current.position = clamped
    applyPosition(clamped)
  }, [layout, applyPosition])

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  const stopAnimation = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const animateRef = useRef<(time: number) => void>(() => {})

  const animate = useCallback(() => {
    const state = dragStateRef.current
    const now = performance.now()
    const dt = Math.min(48, now - (state.lastTime || now))
    const next = stepInertia(state, dt)
    next.lastTime = now
    dragStateRef.current = next

    const clamped = clampToBounds(next.position, bounds.min, bounds.max)
    if (clamped !== next.position) {
      dragStateRef.current.position = clamped
      dragStateRef.current.velocity = 0
      applyPosition(clamped)
      stopAnimation()
      return
    }

    applyPosition(next.position)

    if (Math.abs(next.velocity) < 0.02) {
      dragStateRef.current.velocity = 0
      stopAnimation()
      return
    }
    rafRef.current = requestAnimationFrame(animateRef.current)
  }, [bounds.min, bounds.max, applyPosition, stopAnimation])

  useEffect(() => {
    animateRef.current = animate
  }, [animate])

  const beginAnimationLoop = useCallback(() => {
    if (rafRef.current !== null) return
    dragStateRef.current.lastTime = performance.now()
    rafRef.current = requestAnimationFrame(animateRef.current)
  }, [])

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (paused || prefersReducedMotion) return
      stopAnimation()
      pointerIdRef.current = event.pointerId
      gestureRef.current = 'undecided'
      startYRef.current = event.clientY
      dragStateRef.current = startDrag(dragStateRef.current, event.clientX, performance.now())
      viewportRef.current?.setPointerCapture(event.pointerId)
    },
    [paused, prefersReducedMotion, stopAnimation],
  )

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (paused || prefersReducedMotion) return
      if (pointerIdRef.current !== event.pointerId) return
      const state = dragStateRef.current

      if (gestureRef.current === 'undecided') {
        const dx = Math.abs(event.clientX - state.lastPointerX)
        const dy = Math.abs(event.clientY - startYRef.current)
        if (dx < VERTICAL_LOCK_THRESHOLD && dy < VERTICAL_LOCK_THRESHOLD) return
        gestureRef.current = dx > dy ? 'horizontal' : 'vertical'
      }

      if (gestureRef.current === 'vertical') return

      const next = moveDrag(state, event.clientX, performance.now())
      next.position = clampToBounds(next.position, bounds.min, bounds.max)
      dragStateRef.current = next
      applyPosition(next.position)
    },
    [paused, prefersReducedMotion, bounds.min, bounds.max, applyPosition],
  )

  const finishGesture = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (pointerIdRef.current !== event.pointerId) return
      pointerIdRef.current = null
      viewportRef.current?.releasePointerCapture(event.pointerId)

      if (gestureRef.current === 'horizontal') {
        dragStateRef.current = endDrag(dragStateRef.current)
        beginAnimationLoop()
      } else {
        dragStateRef.current = endDrag(dragStateRef.current)
        dragStateRef.current.velocity = 0
      }
      gestureRef.current = 'undecided'
    },
    [beginAnimationLoop],
  )

  useEffect(() => {
    if (paused) stopAnimation()
  }, [paused, stopAnimation])

  useEffect(() => {
    return () => stopAnimation()
  }, [stopAnimation])

  const dismissHint = useCallback(() => {
    setShowHint(false)
    try {
      sessionStorage.setItem(HINT_DISMISS_KEY, '1')
    } catch {
      void 0
    }
  }, [])

  const handleActivate = useCallback(
    (id: string) => {
      const index = cardIndexById.get(id)
      if (index === undefined) return
      dismissHint()
      onPhotoActivate(index)
    },
    [cardIndexById, onPhotoActivate, dismissHint],
  )

  if (prefersReducedMotion) {
    return null
  }

  return (
    <div className="editorial-gallery">
      <div
        ref={viewportRef}
        className="editorial-gallery-viewport"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishGesture}
        onPointerCancel={finishGesture}
      >
        <div ref={bgRef} className="editorial-gallery-bg" aria-hidden="true">
          {BACKGROUND_WORDS.map((word, i) => (
            <span
              key={word}
              className="editorial-gallery-bg-word"
              style={{ top: `${18 + i * 22}%` }}
            >
              {word}
            </span>
          ))}
        </div>

        {layout && (
          <div
            ref={trackRef}
            className="editorial-gallery-track"
            style={{
              width: `${layout.contentWidth}px`,
              height: `${layout.contentHeight}px`,
            }}
          >
            {layout.cards.map((card: EditorialCard) => (
              <EditorialGalleryCard key={card.id} card={card} onActivate={handleActivate} />
            ))}
          </div>
        )}
      </div>

      {showHint && (
        <div className="editorial-gallery-hint-row">
          <span className="editorial-gallery-hint-text">
            Swipe sideways to explore
          </span>
          <button
            type="button"
            className="editorial-gallery-hint-dismiss"
            onClick={dismissHint}
            aria-label="Dismiss hint"
          >
            Got it
          </button>
        </div>
      )}
    </div>
  )
}
