import { useEffect, useRef, useState, useCallback } from 'react'
import { useReducedMotion } from 'framer-motion'
import type { GalleryItem } from '../../content/content'
import { GalleryEngine } from '../../engine/Engine'
import type { FrameStats, PhotoManifest } from '../../engine/core/contract'

function photoId(item: GalleryItem): string {
  return item.id ?? item.src
}

function getMaxDpr(): number {
  if (typeof window === 'undefined') return 1.5
  const isMobile = window.innerWidth < 768
  return isMobile ? 1.5 : 2
}

interface Props {
  items: GalleryItem[]
  onPhotoClick: (index: number) => void
  lightboxOpen: boolean
}

export default function GallerySection({ items, onPhotoClick, lightboxOpen }: Props) {
  const prefersReducedMotion = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<GalleryEngine | null>(null)
  const [stats, setStats] = useState<FrameStats | null>(null)
  const [engineFailed, setEngineFailed] = useState(false)

  const handleSelect = useCallback(
    (id: string | null) => {
      if (id === null) return
      const idx = items.findIndex((item) => photoId(item) === id)
      if (idx !== -1) onPhotoClick(idx)
    },
    [items, onPhotoClick],
  )

  const handleFrame = useCallback((frameStats: FrameStats) => {
    setStats(frameStats)
  }, [])

  const handleBackendChosen = useCallback(() => {}, [])
  const handleHover = useCallback(() => {}, [])
  const handleError = useCallback((err: Error) => {
    void err
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return

    let engine: GalleryEngine
    try {
      engine = new GalleryEngine(canvas, {
        onSelect: handleSelect,
        onHover: handleHover,
        onFrame: handleFrame,
        onBackendChosen: handleBackendChosen,
        onError: handleError,
      })
    } catch {
      queueMicrotask(() => setEngineFailed(true))
      return
    }

    engine.setMaxDpr(getMaxDpr())
    engineRef.current = engine

    engine.mount().then(() => {
      const manifest: PhotoManifest = {
        photos: items.map((item) => ({
          id: photoId(item),
          src: item.src.replace('.avif', '.webp'),
          alt: item.alt,
          position: [0, 0, 0],
          normal: [0, 0, 1],
        })),
        sphereRadius: 1.2,
      }
      return engine.loadPhotos(manifest)
    }).catch(() => {
      setEngineFailed(true)
    })

    const handleResize = () => {
      const r = canvas.getBoundingClientRect()
      engine.resize(r.width, r.height)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      engine.unmount()
      engineRef.current = null
    }
  }, [prefersReducedMotion, items, handleSelect, handleFrame, handleBackendChosen, handleHover, handleError])

  useEffect(() => {
    engineRef.current?.setLightboxOpen(lightboxOpen)
  }, [lightboxOpen])

  useEffect(() => {
    if (prefersReducedMotion) return
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const engine = engineRef.current
        if (!engine) return
        if (entry.isIntersecting) {
          engine.setEnabled(true)
        } else {
          engine.setEnabled(false)
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [prefersReducedMotion])

  if (prefersReducedMotion || engineFailed) {
    return (
      <div className="gallery-css-grid">
        {items.map((item, i) => (
          <button
            key={item.src}
            type="button"
            className="gallery-css-item"
            onClick={() => onPhotoClick(i)}
            aria-label={`View photo: ${item.alt}`}
          >
            <picture>
              <source srcSet={item.src} type="image/avif" />
              <source srcSet={item.src.replace('.avif', '.webp')} type="image/webp" />
              <img
                src={item.src.replace('.avif', '.webp')}
                alt={item.alt}
                loading="lazy"
                decoding="async"
                width={300}
                height={300}
              />
            </picture>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="gallery-canvas-container">
      <canvas
        ref={canvasRef}
        className="gallery-canvas"
        style={{ touchAction: 'none', cursor: 'grab' }}
      />
      {!stats && (
        <div className="gallery-loading">
          <div className="gallery-loading-spinner" />
        </div>
      )}
    </div>
  )
}
