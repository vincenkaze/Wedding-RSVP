import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import Section from '../primitives/Section'
import { wedding, sections } from '../../content/content'
import { EASE_ENTRANCE } from '../primitives/reveal'

interface TimeUnit {
  value: number
  label: string
}

const COUNTDOWN_TARGET = new Date(wedding.iso).getTime()

function getElapsedUnits(now: number): TimeUnit[] {
  const diff = COUNTDOWN_TARGET - now
  if (diff <= 0) {
    return [
      { value: 0, label: 'Days' },
      { value: 0, label: 'Hours' },
      { value: 0, label: 'Minutes' },
      { value: 0, label: 'Seconds' },
    ]
  }
  return [
    { value: Math.floor(diff / 86400000), label: 'Days' },
    { value: Math.floor((diff / 3600000) % 24), label: 'Hours' },
    { value: Math.floor((diff / 60000) % 60), label: 'Minutes' },
    { value: Math.floor((diff / 1000) % 60), label: 'Seconds' },
  ]
}

export default function Countdown() {
  const prefersReducedMotion = useReducedMotion()
  const [now, setNow] = useState(Date.now)

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const units = useMemo(() => getElapsedUnits(now), [now])

  return (
    <Section className="bg-white pt-20 pb-24 sm:pt-28 sm:pb-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <motion.p
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE_ENTRANCE }}
          className="font-display text-xs font-semibold uppercase tracking-[0.24em] text-accent"
        >
          {sections.countdown.label}
        </motion.p>
        <motion.h2
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE_ENTRANCE, delay: 0.08 }}
          className="mt-3 font-display text-3xl tracking-wide text-text sm:text-4xl"
        >
          {sections.countdown.heading}
        </motion.h2>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:flex-nowrap">
          {units.map((unit, i) => (
            <motion.div
              key={unit.label}
              initial={
                prefersReducedMotion
                  ? undefined
                  : { opacity: 0, scale: 0.96, y: 16, filter: 'blur(4px)' }
              }
              whileInView={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                ease: EASE_ENTRANCE,
                delay: 0.2 + i * 0.1,
              }}
              className="flex w-20 flex-col items-center rounded-2xl bg-surface px-3 py-5 shadow-sm ring-1 ring-black/5 sm:w-32 sm:px-4 sm:py-7 md:w-36"
            >
              <span className="font-display text-3xl tabular-nums text-text sm:text-4xl">
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted sm:text-xs">
                {unit.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  )
}
