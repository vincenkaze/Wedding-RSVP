import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import {
  sections,
  liveStream,
  couple,
  wedding,
  venue,
  events,
} from '../../content/content'
import { EASE_ENTRANCE, DURATION_CINEMATIC } from '../primitives/reveal'

type StreamState = 'pre' | 'live' | 'post'

function getStreamState(now: number, startMs: number): StreamState {
  if (now < startMs) return 'pre'
  if (now < startMs + 4 * 3600_000) return 'live'
  return 'post'
}

function getRemaining(now: number, target: number): string {
  const diff = target - now
  if (diff <= 0) return '0:00:00'
  const h = Math.floor(diff / 3600_000)
  const m = Math.floor((diff / 60_000) % 60)
  const s = Math.floor((diff / 1000) % 60)
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const embedBase = 'https://www.youtube.com/embed'

export default function Story() {
  const prefersReducedMotion = useReducedMotion()
  const [now, setNow] = useState(Date.now)
  const [isPlaying, setIsPlaying] = useState(false)

  const startMs = useMemo(
    () => new Date(liveStream.liveStartIso).getTime(),
    [],
  )

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const state = getStreamState(now, startMs)
  const embedUrl = liveStream.youtubeVideoId
    ? `${embedBase}/${liveStream.youtubeVideoId}?autoplay=1&rel=0&modestbranding=1`
    : ''

  const ceremonyEvent = events[0]

  return (
    <section id="story" className="relative px-6 py-20 sm:py-28 md:py-32">
      <div className="mx-auto max-w-3xl">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.p
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DURATION_CINEMATIC, ease: EASE_ENTRANCE }}
            className="font-body text-xs font-semibold uppercase tracking-[0.24em] text-accent sm:text-sm"
          >
            {sections.story.label}
          </motion.p>
          <motion.h2
            initial={
              prefersReducedMotion
                ? undefined
                : { opacity: 0, y: 20 }
            }
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: DURATION_CINEMATIC,
              ease: EASE_ENTRANCE,
              delay: 0.08,
            }}
            className="mt-4 font-display text-3xl tracking-tight text-text sm:text-4xl md:text-5xl"
          >
            {sections.story.heading}
          </motion.h2>
        </div>

        {/* Stream card */}
        <motion.div
          initial={
            prefersReducedMotion
              ? undefined
              : { opacity: 0, y: 20 }
          }
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: DURATION_CINEMATIC,
            ease: EASE_ENTRANCE,
            delay: 0.16,
          }}
          className="relative overflow-hidden rounded-2xl bg-surface ring-1 ring-black/5 shadow-md"
        >
          {/* 16:9 media frame */}
          <div className="relative aspect-video w-full bg-black">
            {isPlaying && embedUrl ? (
              <iframe
                src={embedUrl}
                title={`${ceremonyEvent?.title || 'Ceremony'} live stream`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full border-0"
              />
            ) : (
              <button
                type="button"
                onClick={liveStream.youtubeVideoId ? () => setIsPlaying(true) : undefined}
                disabled={!liveStream.youtubeVideoId}
                className="group relative flex h-full w-full cursor-pointer flex-col justify-between overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-default"
                aria-label="Play ceremony live stream"
              >
                {/* Thumbnail background */}
                {liveStream.youtubeVideoId ? (
                  <img
                    src={`https://img.youtube.com/vi/${liveStream.youtubeVideoId}/maxresdefault.jpg`}
                    alt={ceremonyEvent?.title || couple.displayName}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : null}

                {/* High contrast gradient overlay */}
                <div
                  className={`absolute inset-0 ${
                    liveStream.youtubeVideoId
                      ? 'bg-gradient-to-t from-black/85 via-black/45 to-black/40'
                      : ''
                  }`}
                />

                {/* Top overlay bar: simplified text + status indicator */}
                <div className="relative z-10 flex items-start justify-between p-3.5 sm:p-6">
                  {/* Left: Tag + Couple Names + Date/Time */}
                  <div className="min-w-0 pr-2">
                    <span className="block font-body text-[0.625rem] sm:text-xs font-semibold uppercase tracking-[0.2em] text-accent-light">
                      {liveStream.tagLiveStreaming}
                    </span>
                    <h3 className="mt-0.5 font-display text-sm font-medium tracking-tight text-white drop-shadow-sm sm:text-lg md:text-xl">
                      {couple.displayName}
                    </h3>
                    <p className="font-body text-[0.6875rem] text-white/80 sm:text-xs mt-0.5">
                      {wedding.dateShort} • {wedding.timeShort} ({wedding.timezone})
                    </p>
                  </div>

                  {/* Right: Status badge */}
                  <div className="flex-shrink-0">
                    {state === 'live' ? (
                      <div className="flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-wider text-white shadow-lg sm:px-3 sm:text-xs">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                        </span>
                        <span>{liveStream.statusLive}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-wider text-amber-300 ring-1 ring-amber-400/30 sm:px-3 sm:text-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span>{liveStream.statusStartingSoon}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Center overlay: Play button with pulse + Hero Countdown */}
                <div className="relative z-10 my-auto flex flex-col items-center justify-center px-4 text-center">
                  {/* Play button with soft pulse */}
                  <div className="relative mb-2 sm:mb-4">
                    <span className="absolute -inset-2.5 rounded-full bg-white/25 animate-ping opacity-45 pointer-events-none sm:-inset-3.5" />
                    <span className="absolute -inset-1 rounded-full bg-white/20 animate-pulse pointer-events-none sm:-inset-1.5" />
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white text-stone-900 shadow-2xl ring-4 ring-white/30 backdrop-blur-md transition-all duration-300 group-hover:scale-110 sm:h-16 sm:w-16 md:h-18 md:w-18">
                      <svg
                        className="ml-0.5 h-5 w-5 fill-stone-900 text-stone-900 sm:ml-1 sm:h-7 sm:w-7 md:h-8 md:w-8"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M8 5.14v14l11-7-11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Hero Countdown */}
                  {liveStream.youtubeVideoId && state === 'pre' && (
                    <div className="flex flex-col items-center">
                      <p className="font-body text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-white/90 drop-shadow-sm sm:text-xs md:text-sm">
                        {liveStream.countdownLabel}
                      </p>
                      <span className="mt-0.5 font-display text-2xl font-bold tabular-nums tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] sm:text-5xl md:text-6xl">
                        {getRemaining(now, startMs)}
                      </span>
                    </div>
                  )}

                  {/* Fallback when no video ID */}
                  {!liveStream.youtubeVideoId && (
                    <p className="font-body text-sm text-muted sm:text-base">
                      The live stream will begin soon
                    </p>
                  )}
                </div>

                {/* Bottom spacer to balance top padding */}
                <div className="h-4 sm:h-6 pointer-events-none" />
              </button>
            )}
          </div>

          {/* Bottom info & actions bar (outside the player) */}
          <div className="flex flex-col gap-4 border-t border-black/5 bg-surface p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            {/* Left: Event name, venue location & quiet broadcast credit */}
            <div className="min-w-0">
              <h4 className="font-display text-base font-semibold text-text sm:text-lg">
                {ceremonyEvent?.title || 'Wedding Ceremony'}
              </h4>
              <p className="font-body text-xs text-muted sm:text-sm mt-0.5">
                {venue.name}, {venue.region}
              </p>
              <p className="font-body text-[0.6875rem] text-muted/70 sm:text-xs mt-1">
                {liveStream.broadcastPrefix} {liveStream.channelName}
              </p>
            </div>

            {/* Right: Primary action with strong hierarchy */}
            {liveStream.channelUrl && (
              <div className="flex-shrink-0">
                <a
                  href={liveStream.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-text px-4 py-2.5 font-body text-xs font-semibold text-white shadow-sm transition-all hover:bg-stone-800 hover:shadow-md active:scale-95 sm:px-5 sm:py-2.5 sm:text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <span>{liveStream.watchOnYoutube}</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-85 sm:h-4 sm:w-4" />
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

