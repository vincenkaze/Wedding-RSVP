import { useCallback, useEffect, useRef, useState } from 'react'
import { Music, Volume2 } from 'lucide-react'
import { venue, sections } from '../../content/content'
import { buildDirectionsUrl } from '../../lib/maps'
import { useMediaQuery } from '../../hooks/useMediaQuery'

const AUDIO_SRC = '/audio/ambient.mp3'
const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface StickyActionBarProps {
  heroRef: React.RefObject<HTMLElement | null>
  rsvpRef: React.RefObject<HTMLElement | null>
  autoPlay?: boolean
  playTrigger?: boolean
}

export default function StickyActionBar({
  heroRef,
  rsvpRef,
  autoPlay = false,
  playTrigger = false,
}: StickyActionBarProps) {
  const isMobile = useMediaQuery('(max-width: 1023px)')
  const [barVisible, setBarVisible] = useState(false)
  const [rsvpHidden, setRsvpHidden] = useState(false)
  const [musicVisible, setMusicVisible] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Audio state
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [audioFailed, setAudioFailed] = useState(false)
  const autoPlayAttempted = useRef(false)

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

  // Show music button with slight delay after bar appears
  useEffect(() => {
    if (prefersReduced || !isMobile) return
    if (barVisible) {
      const t = setTimeout(() => setMusicVisible(true), 300)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setMusicVisible(false))
    return () => clearTimeout(t)
  }, [barVisible, isMobile])

  // ── Audio logic (moved from MusicControl) ──
  const createAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current
    const el = new Audio(AUDIO_SRC)
    el.preload = 'none'
    el.loop = true
    el.volume = 0.3
    el.addEventListener('error', () => {
      setAudioFailed(true)
      audioRef.current = null
    }, { once: true })
    audioRef.current = el
    return el
  }, [])

  const tryPlay = useCallback(() => {
    if (audioFailed) return
    const audio = createAudio()
    if (audio.paused) {
      audio.play().then(() => setPlaying(true)).catch(() => {})
    }
  }, [audioFailed, createAudio])

  const toggleMusic = useCallback(() => {
    if (audioFailed) return
    const audio = audioRef.current
    if (!audio) {
      const el = createAudio()
      el.play().then(() => setPlaying(true)).catch(() => {
        setAudioFailed(true)
        audioRef.current = null
      })
      return
    }
    if (audio.paused) {
      audio.play().catch(() => setPlaying(false))
      setPlaying(true)
    } else {
      audio.pause()
      setPlaying(false)
    }
  }, [audioFailed, createAudio])

  useEffect(() => {
    if (!autoPlay || autoPlayAttempted.current) return
    autoPlayAttempted.current = true
    tryPlay()
  }, [autoPlay, tryPlay])

  useEffect(() => {
    if (!playTrigger) return
    tryPlay()
  }, [playTrigger, tryPlay])

  useEffect(() => {
    if (audioFailed) return
    const handleInteraction = () => {
      tryPlay()
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
    }
    window.addEventListener('click', handleInteraction, { once: true })
    window.addEventListener('touchstart', handleInteraction, { once: true })
    return () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
    }
  }, [audioFailed, tryPlay])

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

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

      <button
        type="button"
        onClick={toggleMusic}
        disabled={audioFailed}
        aria-label={audioFailed ? 'Audio unavailable' : playing ? 'Pause background music' : 'Play background music'}
        className={`sticky-music-btn transition-opacity duration-300 ${musicVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        {playing ? <Volume2 className="h-4 w-4" /> : <Music className="h-4 w-4" />}
      </button>
    </div>
  )
}
