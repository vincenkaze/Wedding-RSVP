import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
} from 'framer-motion'
import type { GalleryItem } from '../../content/content'
import { EASE_ENTRANCE } from '../primitives/reveal'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface LightboxProps {
  items: GalleryItem[]
  index: number | null
  onClose: () => void
  onNavigate: (index: number) => void
}

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
  const containerRef = useRef<HTMLDivElement>(null)

  // Zoom state
  const scale = useMotionValue(1)
  const [isZoomed, setIsZoomed] = useState(false)
  const lastTap = useRef(0)
  const pointerCount = useRef(0)
  const initialDistance = useRef(0)
  const initialScale = useRef(1)

  // Pan state
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Swipe state
  const dragStartX = useRef(0)
  const [dragOffset, setDragOffset] = useState(0)
  const isDragging = useRef(false)

  // Exit animation
  const [isExiting, setIsExiting] = useState(false)

  const resetZoom = useCallback(() => {
    scale.set(1)
    x.set(0)
    y.set(0)
    setIsZoomed(false)
  }, [scale, x, y])

  const handleClose = useCallback(() => {
    setIsExiting(true)
    resetZoom()
    setTimeout(() => {
      setIsExiting(false)
      onClose()
    }, 200)
  }, [resetZoom, onClose])

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement
      // Small delay to let DOM mount
      const timer = setTimeout(() => {
        dialogRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
    // Return focus on close
    if (previousFocus.current) {
      previousFocus.current.focus()
      previousFocus.current = null
    }
  }, [isOpen])

  // Keyboard handling
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      }
      if (e.key === 'ArrowLeft' && index !== null && index > 0) {
        e.preventDefault()
        onNavigate(index - 1)
        resetZoom()
      }
      if (
        e.key === 'ArrowRight' &&
        index !== null &&
        index < items.length - 1
      ) {
        e.preventDefault()
        onNavigate(index + 1)
        resetZoom()
      }
    },
    [isOpen, index, items.length, onNavigate, handleClose, resetZoom],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
      }
    }
  }, [isOpen, handleKeyDown])

  // Backdrop click
  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  // Double-tap to zoom
  function handleTap() {
    const now = Date.now()
    if (now - lastTap.current < 300) {
      if (isZoomed) {
        resetZoom()
      } else {
        scale.set(2)
        setIsZoomed(true)
      }
    }
    lastTap.current = now
  }

  // Pointer events for pinch-zoom
  function handlePointerDown(e: React.PointerEvent) {
    pointerCount.current++
    if (pointerCount.current === 2) {
      const target = e.target as HTMLElement
      const rect = target.getBoundingClientRect()
      const dx = e.clientX - (rect.left + rect.width / 2)
      const dy = e.clientY - (rect.top + rect.height / 2)
      initialDistance.current = Math.sqrt(dx * dx + dy * dy)
      initialScale.current = scale.get()
    }
    if (pointerCount.current === 1 && !isZoomed) {
      dragStartX.current = e.clientX
      isDragging.current = true
    }
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (pointerCount.current === 2 && initialDistance.current > 0) {
      const target = e.target as HTMLElement
      const rect = target.getBoundingClientRect()
      const dx = e.clientX - (rect.left + rect.width / 2)
      const dy = e.clientY - (rect.top + rect.height / 2)
      const distance = Math.sqrt(dx * dx + dy * dy)
      const newScale = Math.min(
        Math.max(initialScale.current * (distance / initialDistance.current), 1),
        4,
      )
      scale.set(newScale)
      setIsZoomed(newScale > 1.1)
    }
    if (isDragging.current && !isZoomed) {
      const delta = e.clientX - dragStartX.current
      setDragOffset(delta)
    }
  }

  function handlePointerUp() {
    pointerCount.current = Math.max(0, pointerCount.current - 1)
    if (pointerCount.current === 0) {
      initialDistance.current = 0
    }

    // Swipe detection
    if (isDragging.current && !isZoomed) {
      const threshold = 50
      if (dragOffset < -threshold && index !== null && index < items.length - 1) {
        onNavigate(index + 1)
      } else if (dragOffset > threshold && index !== null && index > 0) {
        onNavigate(index - 1)
      }
    }
    setDragOffset(0)
    isDragging.current = false
  }

  if (!isOpen || !item) return null

  const hasPrev = index !== null && index > 0
  const hasNext = index !== null && index < items.length - 1

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          tabIndex={-1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE_ENTRANCE }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={handleBackdropClick}
          onKeyDown={(e) => {
            if (e.key === 'Escape') handleClose()
          }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6 sm:top-6"
            aria-label="Close lightbox"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Prev button */}
          {hasPrev && (
            <button
              type="button"
              onClick={() => {
                onNavigate(index! - 1)
                resetZoom()
              }}
              className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-6"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* Next button */}
          {hasNext && (
            <button
              type="button"
              onClick={() => {
                onNavigate(index! + 1)
                resetZoom()
              }}
              className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          {/* Image container */}
          <div
            ref={containerRef}
            className="relative flex h-full w-full items-center justify-center p-12 sm:p-16"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onClick={handleTap}
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
                transition={{ duration: 0.3, ease: EASE_ENTRANCE }}
                className="relative max-h-full max-w-full"
                style={{ scale, x, y }}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  draggable={false}
                  className="max-h-[80vh] max-w-full rounded-lg object-contain select-none"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Caption */}
          {item.caption && (
            <motion.p
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3, ease: EASE_ENTRANCE }}
              className="absolute bottom-6 left-0 right-0 text-center font-body text-sm text-white/80 sm:text-base"
            >
              {item.caption}
            </motion.p>
          )}

          {/* Counter */}
          <motion.p
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2, ease: EASE_ENTRANCE }}
            className="absolute bottom-6 right-6 font-body text-xs text-white/50"
          >
            {index! + 1} / {items.length}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
