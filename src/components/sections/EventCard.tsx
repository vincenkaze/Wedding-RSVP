import { motion, type Variants } from 'framer-motion'
import { EASE_ENTRANCE, DURATION_CINEMATIC } from '../primitives/reveal'
import { MapPin } from 'lucide-react'

interface EventCardProps {
  title: string
  date: string
  time: string
  location: string
  description?: string
  mapsQuery: string
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: DURATION_CINEMATIC, ease: EASE_ENTRANCE },
  },
}

function buildMapsUrl(query: string): string {
  const encoded = encodeURIComponent(query)
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`
}

export default function EventCard({
  title,
  date,
  time,
  location,
  description,
  mapsQuery,
}: EventCardProps) {
  return (
    <motion.article
      variants={cardVariants}
      className="relative bg-surface border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-3"
    >
      <div
        className="absolute top-0 left-6 right-6 h-px bg-accent/30"
        aria-hidden
      />

      <h3 className="font-display text-text text-xl sm:text-2xl leading-snug">
        {title}
      </h3>

      <div className="flex flex-col gap-0.5">
        <p className="font-body text-text text-sm sm:text-base font-medium tracking-wide">
          {date}
        </p>
        <p className="font-body text-text-muted text-sm sm:text-base">
          {time}
        </p>
      </div>

      <p className="font-body text-text-muted text-sm sm:text-base">
        {location}
      </p>

      {description && (
        <p className="font-body text-text-muted text-sm leading-relaxed mt-0.5">
          {description}
        </p>
      )}

      <a
        href={buildMapsUrl(mapsQuery)}
        target="_blank"
        rel="noopener noreferrer"
        className="event-maps-btn mt-2 inline-flex items-center gap-2 self-start rounded-full border border-accent/40 px-4 py-2 font-body text-xs font-medium uppercase tracking-wider text-accent transition-colors duration-200 hover:border-accent hover:text-accent-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-sm"
      >
        <MapPin className="h-3.5 w-3.5" aria-hidden />
        Open in Maps
      </a>
    </motion.article>
  )
}
