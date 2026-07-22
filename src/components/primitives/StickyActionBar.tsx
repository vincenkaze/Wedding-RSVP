import { useEffect, useState } from 'react'
import { venue, sections } from '../../content/content'
import { buildDirectionsUrl } from '../../lib/maps'
import { useMediaQuery } from '../../hooks/useMediaQuery'

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface StickyActionBarProps {
  heroRef: React.RefObject<HTMLElement | null>
  rsvpRef: React.RefObject<HTMLElement | null>
}

export default function StickyActionBar({
  heroRef,
  rsvpRef,
}: StickyActionBarProps) {
  const isMobile = useMediaQuery('(max-width: 1023px)')
  const [barVisible, setBarVisible] = useState(false)
  const [rsvpHidden, setRsvpHidden] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Track hero visibility — bar shows when hero scrolls out
  useEffect(() => {
    if (!isMobile) return
    const el = heroRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setBarVisible(!entry.isIntersecting)
      },
      { threshold: 0 },
    )
    observer.observe(el)

    // Handle page load already scrolled past hero
    setBarVisible(el.getBoundingClientRect().bottom <= 0)
    setInitialized(true)

    return () => observer.disconnect()
  }, [heroRef, isMobile])

  // Track RSVP visibility — hide RSVP button when section is near
  useEffect(() => {
    if (!isMobile) return
    const el = rsvpRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setRsvpHidden(entry.isIntersecting)
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [rsvpRef, isMobile])

  if (prefersReduced || !isMobile) return null

  return (
    <div
      className={`sticky-action-bar ${barVisible ? 'sticky-action-bar--visible' : ''} ${!initialized ? 'sticky-action-bar--instant' : ''}`}
      role="navigation"
      aria-label="Quick actions"
    >
      <a
        href={buildDirectionsUrl(venue.mapsQuery)}
        target="_blank"
        rel="noopener noreferrer"
        className="sticky-action-btn"
      >
        {sections.actionBar.directions}
      </a>

      <div className={`sticky-action-divider transition-opacity duration-300 ${rsvpHidden ? 'opacity-0' : ''}`} />

      <a
        href="#rsvp"
        className={`sticky-action-btn transition-opacity duration-300 ${rsvpHidden ? 'opacity-0 pointer-events-none' : ''}`}
      >
        {sections.actionBar.rsvp}
      </a>
    </div>
  )
}
