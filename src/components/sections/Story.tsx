import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { sections, liveStream } from '../../content/content'
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
    ? `${embedBase}/${liveStream.youtubeVideoId}?autoplay=1&mute=1`
    : ''

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
          className="relative overflow-hidden rounded-2xl bg-surface ring-1 ring-black/5 shadow-sm"
        >
          {/* 16:9 embed or placeholder */}
          <div className="relative aspect-video w-full">
            {state === 'pre' && !embedUrl ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
                <svg
                  className="h-12 w-12 text-accent/40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327z" />
                  <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                </svg>
                <p className="font-body text-base text-muted sm:text-lg">
                  The live stream will begin soon
                </p>
                <p className="font-body text-sm text-accent">
                  {liveStream.channelName}
                </p>
              </div>
            ) : state === 'pre' ? (
              <div className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
                <p className="font-body text-base text-muted sm:text-lg">
                  Ceremony begins in
                </p>
                <span className="font-display text-4xl tabular-nums tracking-tight text-text sm:text-5xl">
                  {getRemaining(now, startMs)}
                </span>
                <p className="font-body text-sm text-muted">
                  {liveStream.channelName}
                </p>
              </div>
            ) : (
              embedUrl && (
                <iframe
                  src={embedUrl}
                  title={`${liveStream.channelName} live stream`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              )
            )}
          </div>

          {/* Live badge */}
          {state === 'live' && (
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 sm:left-6 sm:top-6">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              <span className="font-body text-xs font-semibold uppercase tracking-wider text-white">
                Live
              </span>
            </div>
          )}

          {/* Channel link */}
          {liveStream.channelUrl && (
            <div className="flex items-center justify-between px-4 py-3 sm:px-6">
              <p className="font-body text-sm text-muted">
                {liveStream.channelName}
              </p>
              <a
                href={liveStream.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-xs font-semibold uppercase tracking-wider text-accent transition-colors hover:text-accent/80"
              >
                Open on YouTube
              </a>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
