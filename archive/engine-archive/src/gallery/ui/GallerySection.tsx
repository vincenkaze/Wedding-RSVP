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
  onPhotoHold: (index: number) => void
  onActivePhotoChange?: (photoId: string | null) => void
  lightboxOpen: boolean
}

export default function GallerySection({ items, onPhotoClick, onPhotoHold, onActivePhotoChange, lightboxOpen }: Props) {
  const prefersReducedMotion = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<GalleryEngine | null>(null)
  const [stats, setStats] = useState<FrameStats | null>(null)
  const [engineFailed, setEngineFailed] = useState(false)

  const handleFrame = useCallback((frameStats: FrameStats) => {
    setStats(frameStats)
  }, [])

  const handleBackendChosen = useCallback(() => {}, [])
  const handleHover = useCallback(() => {}, [])
  const handleError = useCallback((err: Error) => {
    void err
  }, [])

  const handleActivePhotoChange = useCallback(
    (id: string | null) => {
      onActivePhotoChange?.(id)
    },
    [onActivePhotoChange],
  )

  const handlePhotoHold = useCallback(
    (id: string) => {
      const idx = items.findIndex((item) => (item.id ?? item.src) === id)
      if (idx >= 0) onPhotoHold(idx)
    },
    [items, onPhotoHold],
  )

  useEffect(() => {
    if (prefersReducedMotion) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return

    let engine: GalleryEngine
    try {
      engine = new GalleryEngine(canvas, {
        onHover: handleHover,
        onFrame: handleFrame,
        onActivePhotoChange: handleActivePhotoChange,
        onPhotoHold: handlePhotoHold,
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
  }, [prefersReducedMotion, items, handleFrame, handleBackendChosen, handleHover, handleError, handleActivePhotoChange, handlePhotoHold])

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
        {items.map((item, i) => {
          const basePath = item.src.replace('.avif', '')
          const name = basePath.split('/').pop()!
          return (
            <button
              key={item.src}
              type="button"
              className="gallery-css-item"
              onClick={() => onPhotoClick(i)}
              aria-label={`View photo: ${item.alt}`}
            >
              <picture>
                <source
                  srcSet={`/gallery/sizes/512/${name}.avif 512w, /gallery/sizes/1024/${name}.avif 1024w, ${item.src} 1920w`}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  type="image/avif"
                />
                <source
                  srcSet={`/gallery/sizes/512/${name}.webp 512w, /gallery/sizes/1024/${name}.webp 1024w, ${item.src.replace('.avif', '.webp')} 1920w`}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  type="image/webp"
                />
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
          )
        })}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="gallery-canvas-container">
      <canvas
        ref={canvasRef}
        className="gallery-canvas"
        style={{ cursor: 'grab' }}
      />
      {!stats && (
        <div className="gallery-loading">
          <div className="gallery-loading-spinner" />
        </div>
      )}
    </div>
  )
}
