import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import type { GalleryItem } from '../../content/content'
import { createDebugRenderer } from '../render/DebugRenderer'

interface Props {
  items: GalleryItem[]
  onPhotoClick: (index: number) => void
}

export default function GallerySection({ items, onPhotoClick }: Props) {
  const prefersReducedMotion = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<ReturnType<typeof createDebugRenderer> | null>(null)
  const [log, setLog] = useState<string[]>([])

  useEffect(() => {
    if (prefersReducedMotion) {
      console.log('[GallerySection] prefers-reduced-motion — skipping canvas')
      return
    }

    const canvas = canvasRef.current
    if (!canvas) {
      console.error('[GallerySection] canvas ref is null')
      return
    }

    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) {
      console.error('[GallerySection] canvas has zero dimensions')
      return
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    console.log('[GallerySection] canvas sized to:', canvas.width, 'x', canvas.height)

    // Map gallery items to sized webp paths
    const renderer = createDebugRenderer(canvas)
    rendererRef.current = renderer
    setLog([...renderer.log])

    let rafId = 0
    function loop(time: number) {
      renderer.render(time)
      setLog([...renderer.log])
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId)
      rendererRef.current?.destroy()
    }
  }, [prefersReducedMotion, items])

  if (prefersReducedMotion) {
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
    <div className="gallery-canvas-container">
      <canvas
        ref={canvasRef}
        className="gallery-canvas"
        style={{ touchAction: 'none', cursor: 'grab' }}
      />
      <details
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          fontSize: 10,
          zIndex: 10,
          background: 'rgba(255,255,255,0.9)',
          color: '#333',
          maxWidth: '100%',
          overflow: 'auto',
          borderRadius: 4,
        }}
        open
      >
        <summary>Debug</summary>
        <pre style={{ margin: 0, padding: 4 }}>
          {log.slice(-10).join('\n')}
        </pre>
      </details>
    </div>
  )
}
