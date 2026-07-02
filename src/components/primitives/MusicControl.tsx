import { useCallback, useEffect, useRef, useState } from 'react'
import { Music, VolumeX } from 'lucide-react'

const AUDIO_SRC = '/audio/ambient.mp3'
const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function MusicControl() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [visible, setVisible] = useState(false)
  const [audioFailed, setAudioFailed] = useState(false)

  useEffect(() => {
    if (prefersReduced) return
    const timer = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  const toggle = useCallback(() => {
    if (audioFailed) return

    const audio = audioRef.current
    if (!audio) {
      const el = new Audio(AUDIO_SRC)
      el.preload = 'none'
      el.loop = true
      el.volume = 0.3

      el.addEventListener('error', () => {
        setAudioFailed(true)
        audioRef.current = null
      }, { once: true })

      el.play().catch(() => {
        setAudioFailed(true)
        audioRef.current = null
      })

      audioRef.current = el
      setPlaying(true)
      return
    }
    if (audio.paused) {
      audio.play().catch(() => {
        setPlaying(false)
      })
      setPlaying(true)
    } else {
      audio.pause()
      setPlaying(false)
    }
  }, [audioFailed])

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  if (prefersReduced) return null

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 transition-opacity duration-500 sm:bottom-8 sm:right-8 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <button
        type="button"
        onClick={toggle}
        disabled={audioFailed}
        aria-label={audioFailed ? 'Audio unavailable' : playing ? 'Pause music' : 'Play music'}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-bg/80 text-muted backdrop-blur-sm transition-all duration-200 hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-30 disabled:hover:border-border disabled:hover:text-muted"
      >
        {playing ? (
          <VolumeX className="h-5 w-5" />
        ) : (
          <Music className="h-5 w-5" />
        )}
      </button>
    </div>
  )
}
