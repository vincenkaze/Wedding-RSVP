import { useCallback, useEffect, useRef, useState } from 'react'
import { sections } from '../../content/content'

interface SectionDef {
  id: string
  label: string
}

const SECTION_DEFS: SectionDef[] = [
  { id: 'hero', label: 'Hero' },
  { id: 'countdown', label: sections.countdown.label },
  { id: 'story', label: sections.story.label },
  { id: 'events', label: sections.events.label },
  { id: 'family', label: sections.family.label },
  { id: 'venue', label: sections.venue.label },
  { id: 'gallery', label: sections.gallery.label },
  { id: 'rsvp', label: sections.rsvp.label },
  { id: 'footer', label: 'Footer' },
]

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function SectionProgress() {
  const [activeId, setActiveId] = useState('hero')
  const observerRef = useRef<IntersectionObserver | null>(null)
  const visibleRef = useRef<Map<string, number>>(new Map())
  const observedRef = useRef<Set<Element>>(new Set())

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }, [])

  useEffect(() => {
    const thresholds = Array.from({ length: 21 }, (_, i) => i / 20)

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement
          const id = el.id
          if (!id) continue
          if (entry.isIntersecting) {
            visibleRef.current.set(id, entry.intersectionRatio)
          } else {
            visibleRef.current.delete(id)
          }
        }

        let bestId = 'hero'
        let bestRatio = 0
        for (const [id, ratio] of visibleRef.current) {
          if (ratio > bestRatio) {
            bestRatio = ratio
            bestId = id
          }
        }
        setActiveId(bestId)
      },
      { threshold: thresholds },
    )

    const observeSections = () => {
      if (!observerRef.current) return
      for (const def of SECTION_DEFS) {
        const el = document.getElementById(def.id)
        if (el && !observedRef.current.has(el)) {
          observerRef.current.observe(el)
          observedRef.current.add(el)
        }
      }
    }

    observeSections()

    const mutObs = new MutationObserver(observeSections)
    mutObs.observe(document.body, { childList: true, subtree: true })

    return () => {
      mutObs.disconnect()
      observerRef.current?.disconnect()
    }
  }, [])

  return (
    <nav
      className="section-progress"
      aria-label="Section progress"
      role="navigation"
    >
      {SECTION_DEFS.map((def) => {
        const isActive = activeId === def.id
        return (
          <button
            key={def.id}
            type="button"
            className={`section-progress-indicator${isActive ? ' is-active' : ''}`}
            onClick={() => scrollTo(def.id)}
            aria-label={`Go to ${def.label}`}
            aria-current={isActive ? 'true' : undefined}
            tabIndex={0}
          >
            <span className="sr-only">{def.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
