import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'framer-motion'
import type { GalleryItem } from '../../content/content'
import { getBaseName } from '../../lib/gallery-assets'
import { EASE_ENTRANCE } from '../primitives/reveal'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface LightboxProps {
  items: GalleryItem[]
  index: number | null
  onClose: () => void
  onNavigate: (index: number) => void
}

const SWIPE_THRESHOLD = 50
const CLOSE_THRESHOLD = 80
const TAP_MOVEMENT = 8
const DOUBLE_TAP_MS = 300
const ZOOM_MIN = 1
const ZOOM_MAX = 4
const ZOOM_DOUBLE = 2.5
const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export default function Lightbox({
  items,
  index,
  onClose,
  onNavigate,
}: LightboxProps) {
  const prefersReducedMotion = useReducedMotion()
  const isOpen = index !== null
  const item = index !== null ? items[index] : null
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const activePointers = useRef<Map<number, { x: number; y: number }>>(new Map())
  const lastTap = useRef(0)
  const dragOrigin = useRef({ x: 0, y: 0 })
  const pinchBase = useRef({ distance: 0, scale: ZOOM_MIN })
  const closingRef = useRef(false)
  const closeTimerRef = useRef(0)

  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomScale, setZoomScale] = useState(ZOOM_MIN)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [backdropOpacity, setBackdropOpacity] = useState(0.9)

  const hasPrev = index !== null && index > 0
  const hasNext = index !== null && index < items.length - 1

  const resetZoom = useCallback(() => {
    setZoomScale(ZOOM_MIN)
    setPan({ x: 0, y: 0 })
    setIsZoomed(false)
  }, [])

  const navigate = useCallback(
    (next: number) => {
      resetZoom()
      onNavigate(next)
    },
    [onNavigate, resetZoom],
  )

  const handleClose = useCallback(() => {
    if (closingRef.current) return
    closingRef.current = true
    setIsExiting(true)
    resetZoom()
    closeTimerRef.current = window.setTimeout(() => {
      setIsExiting(false)
      onClose()
    }, 200)
  }, [onClose, resetZoom])

  useEffect(() => {
    if (isOpen) {
      clearTimeout(closeTimerRef.current)
      closingRef.current = false
      setIsExiting(false)
    }
  }, [index, isOpen])

  const handleCloseButton = useCallback(() => {
    window.history.back()
  }, [])

  const hasMoved = useCallback(
    (x: number, y: number) =>
      Math.abs(x - dragOrigin.current.x) > TAP_MOVEMENT ||
      Math.abs(y - dragOrigin.current.y) > TAP_MOVEMENT,
    [],
  )

  const clampPan = useCallback(
    (x: number, y: number, scale: number): { x: number; y: number } => {
      if (scale <= 1) return { x: 0, y: 0 }
      const container = imageContainerRef.current
      if (!container) return { x, y }
      const vw = container.clientWidth
      const vh = container.clientHeight
      const halfExcessW = Math.max(0, (vw * scale - vw) / 2)
      const halfExcessH = Math.max(0, (vh * scale - vh) / 2)
      return {
        x: Math.min(halfExcessW, Math.max(-halfExcessW, x)),
        y: Math.min(halfExcessH, Math.max(-halfExcessH, y)),
      }
    },
    [],
  )

  const enableWillChange = useCallback((on: boolean) => {
    const el = imageContainerRef.current
    if (el) {
      el.style.willChange = on ? 'transform' : ''
    }
  }, [])

  useEffect(() => {
    if (!isOpen || !item) return
    const preload = (idx: number) => {
      if (idx < 0 || idx >= items.length) return
      const name = getBaseName(items[idx].src)
      const img1024 = new Image()
      img1024.src = `/gallery/sizes/1024/${name}.webp`
      const imgFull = new Image()
      imgFull.src = items[idx].src.replace('.avif', '.webp')
    }
    preload(index! - 1)
    preload(index! + 1)
  }, [isOpen, index, item, items])

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement
      requestAnimationFrame(() => dialogRef.current?.focus())
    }
    return () => {
      if (previousFocus.current) {
        previousFocus.current.focus()
        previousFocus.current = null
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const el = dialogRef.current
    if (!el) return

    function trapTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      const focusable = Array.from(
        el!.querySelectorAll(FOCUSABLE),
      ) as HTMLElement[]
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first || document.activeElement === el) {
          e.preventDefault()
          last.focus()
        }
      } else if (document.activeElement === last || document.activeElement === el) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', trapTab)
    return () => document.removeEventListener('keydown', trapTab)
  }, [isOpen])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') {
        e.preventDefault()
        handleCloseButton()
      }
      if (e.key === 'ArrowLeft' && hasPrev) {
        e.preventDefault()
        navigate(index! - 1)
      }
      if (e.key === 'ArrowRight' && hasNext) {
        e.preventDefault()
        navigate(index! + 1)
      }
    },
    [isOpen, index, hasPrev, hasNext, navigate, handleCloseButton],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  useEffect(() => {
    if (!isOpen) return
    closingRef.current = false
    window.history.pushState({ __lightbox: Date.now() }, '')

    function onPopState(this: Window) {
      if (!closingRef.current) {
        handleClose()
      }
    }
    window.addEventListener('popstate', onPopState)

    return () => {
      window.removeEventListener('popstate', onPopState)
    }
  }, [isOpen, handleClose])

  useEffect(() => {
    if (!isOpen) return
    const { overflow, paddingRight } = document.body.style
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
    document.body.style.overflow = 'hidden'
    return () => {
      clearTimeout(closeTimerRef.current)
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
    }
  }, [isOpen])

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) handleCloseButton()
  }

  function handlePointerDown(e: React.PointerEvent) {
    const target = e.currentTarget as HTMLElement
    target.setPointerCapture(e.pointerId)
    activePointers.current.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY,
    })

    enableWillChange(true)

    if (activePointers.current.size === 1) {
      dragOrigin.current = { x: e.clientX, y: e.clientY }
      setIsDragging(false)
    } else if (activePointers.current.size === 2) {
      const pts = Array.from(activePointers.current.values())
      const dx = pts[0].x - pts[1].x
      const dy = pts[0].y - pts[1].y
      pinchBase.current = {
        distance: Math.sqrt(dx * dx + dy * dy),
        scale: zoomScale,
      }
    }
  }

  function handlePointerMove(e: React.PointerEvent) {
    const prev = activePointers.current.get(e.pointerId)
    if (!prev) return
    prev.x = e.clientX
    prev.y = e.clientY

    const count = activePointers.current.size

    if (count === 2) {
      const pts = Array.from(activePointers.current.values())
      const dx = pts[0].x - pts[1].x
      const dy = pts[0].y - pts[1].y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (pinchBase.current.distance > 0) {
        const raw = pinchBase.current.scale * (dist / pinchBase.current.distance)
        const nextScale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, raw))
        setZoomScale(nextScale)
        setIsZoomed(nextScale > 1.1)
      }
    } else if (count === 1) {
      const dx = e.clientX - dragOrigin.current.x
      const dy = e.clientY - dragOrigin.current.y
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        setIsDragging(true)
      }
      if (isZoomed) {
        setPan(clampPan(dx, dy, zoomScale))
      } else if (isDragging) {
        setPan({ x: dx, y: dy })
        if (dy > 0) {
          setBackdropOpacity(Math.max(0.5, 0.9 - dy / 300))
        }
      }
    }
  }

  function handlePointerUp(e: React.PointerEvent) {
    activePointers.current.delete(e.pointerId)
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    if (activePointers.current.size > 0) return

    enableWillChange(false)
    setBackdropOpacity(0.9)

    const dx = e.clientX - dragOrigin.current.x
    const dy = e.clientY - dragOrigin.current.y

    if (isDragging && !isZoomed) {
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx < -SWIPE_THRESHOLD && hasNext) navigate(index! + 1)
        else if (dx > SWIPE_THRESHOLD && hasPrev) navigate(index! - 1)
      } else if (dy > CLOSE_THRESHOLD) {
        handleCloseButton()
      }
      setPan({ x: 0, y: 0 })
    } else if (!isDragging && !hasMoved(e.clientX, e.clientY)) {
      const now = Date.now()
      if (now - lastTap.current < DOUBLE_TAP_MS) {
        if (isZoomed) {
          resetZoom()
        } else {
          setZoomScale(ZOOM_DOUBLE)
          setIsZoomed(true)
          setPan({ x: 0, y: 0 })
        }
        lastTap.current = 0
        return
      }
      lastTap.current = now
    }

    setIsDragging(false)
    if (!isZoomed) setPan({ x: 0, y: 0 })
  }

  function handlePointerCancel(e: React.PointerEvent) {
    activePointers.current.delete(e.pointerId)
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    if (activePointers.current.size === 0) {
      enableWillChange(false)
      setBackdropOpacity(0.9)
      setIsDragging(false)
      if (!isZoomed) setPan({ x: 0, y: 0 })
    }
  }

  if (!isOpen || !item) return null

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Photo ${index! + 1} of ${items.length}`}
          tabIndex={-1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0.1 : 0.2,
            ease: EASE_ENTRANCE,
          }}
          className="fixed inset-0 z-50 flex items-center justify-center outline-none"
          style={{ backgroundColor: `rgba(0,0,0,${backdropOpacity})` }}
          onClick={handleBackdropClick}
        >
          <span
            className="sr-only"
            aria-live="polite"
            aria-atomic="true"
          >
            {item.alt}
          </span>

          <button
            type="button"
            onClick={handleCloseButton}
            className="absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6 sm:top-6"
            aria-label="Close lightbox"
          >
            <X className="h-5 w-5" />
          </button>

          {hasPrev && (
            <button
              type="button"
              onClick={() => navigate(index! - 1)}
              className="absolute left-2 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-6"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {hasNext && (
            <button
              type="button"
              onClick={() => navigate(index! + 1)}
              className="absolute right-2 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          <div
            ref={imageContainerRef}
            className="relative flex h-full w-full items-center justify-center"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            style={{ touchAction: 'none' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={item.src}
                initial={
                  prefersReducedMotion
                    ? { opacity: 1 }
                    : { opacity: 0, scale: 0.96 }
                }
                animate={
                  prefersReducedMotion
                    ? { opacity: 1 }
                    : { opacity: 1, scale: 1 }
                }
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.96 }
                }
                transition={{
                  duration: prefersReducedMotion ? 0.1 : 0.3,
                  ease: EASE_ENTRANCE,
                }}
                className="relative max-h-full max-w-full"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomScale})`,
                  transition: isDragging ? 'none' : 'transform 0.2s ease',
                }}
              >
                <picture>
                  <source
                    srcSet={`/gallery/sizes/512/${getBaseName(item.src)}.avif 512w, /gallery/sizes/1024/${getBaseName(item.src)}.avif 1024w, ${item.src} 1920w`}
                    sizes="100vw"
                    type="image/avif"
                  />
                  <source
                    srcSet={`/gallery/sizes/512/${getBaseName(item.src)}.webp 512w, /gallery/sizes/1024/${getBaseName(item.src)}.webp 1024w, ${item.src.replace('.avif', '.webp')} 1920w`}
                    sizes="100vw"
                    type="image/webp"
                  />
                  <img
                    src={item.src.replace('.avif', '.webp')}
                    alt={item.alt}
                    draggable={false}
                    className="max-h-[85vh] max-w-[95vw] rounded-lg object-contain select-none"
                  />
                </picture>
              </motion.div>
            </AnimatePresence>
          </div>

          <p
            className="absolute bottom-4 right-4 z-20 font-body text-xs text-white/50 sm:bottom-6 sm:right-6"
            aria-live="off"
          >
            {String(index! + 1).padStart(2, '0')} /{' '}
            {String(items.length).padStart(2, '0')}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
