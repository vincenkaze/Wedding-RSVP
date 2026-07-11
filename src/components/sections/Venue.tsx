import { useRef, useState } from 'react'
import { motion, useReducedMotion, useInView } from 'framer-motion'
import { venue, sections } from '../../content/content'
import { downloadICS } from '../../lib/ics'
import { buildMapsUrl, buildDirectionsUrl } from '../../lib/maps'
import { EASE_ENTRANCE, DURATION_CINEMATIC } from '../primitives/reveal'
import { MapPin, Navigation, Calendar, ChevronDown, ExternalLink } from 'lucide-react'

export default function VenueSection() {
  const prefersReducedMotion = useReducedMotion()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInView = useInView(mapRef, { once: true, amount: 0.3 })
  const [mapLoaded, setMapLoaded] = useState(false)
  const [travelOpen, setTravelOpen] = useState(false)

  const actionBtn =
    'inline-flex items-center gap-2 self-start rounded-full border border-accent/40 px-4 py-2 font-body text-xs font-medium uppercase tracking-wider text-accent transition-colors duration-200 hover:border-accent hover:text-accent-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-sm'

  return (
    <section
      id="venue"
      className="relative px-6 py-20 sm:py-28 md:py-32 bg-surface/50"
    >
      <div className="mx-auto max-w-4xl">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.p
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DURATION_CINEMATIC, ease: EASE_ENTRANCE }}
            className="font-body text-xs font-semibold uppercase tracking-[0.24em] text-accent sm:text-sm"
          >
            {sections.venue.label}
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
            <span className="block">{venue.name.split(' ')[0]}</span>
            <span className="block">{venue.name.split(' ').slice(1).join(' ')}</span>
          </motion.h2>
          <motion.p
            initial={
              prefersReducedMotion
                ? undefined
                : { opacity: 0, y: 12 }
            }
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: DURATION_CINEMATIC,
              ease: EASE_ENTRANCE,
              delay: 0.16,
            }}
            className="mt-3 font-body text-sm tracking-wider uppercase text-muted sm:text-base"
          >
            {venue.region}
          </motion.p>
        </div>

        {/* Content grid */}
        <div className="flex flex-col gap-12 md:grid md:grid-cols-2 md:gap-12 md:items-start">
          {/* Left: map */}
          <motion.div
            ref={mapRef}
            initial={
              prefersReducedMotion
                ? undefined
                : { opacity: 0, clipPath: 'inset(20% 20% 20% 20%)' }
            }
            whileInView={{
              opacity: 1,
              clipPath: 'inset(0% 0% 0% 0%)',
            }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.2, ease: EASE_ENTRANCE }}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl ring-1 ring-black/5"
            role="figure"
            aria-label={`Map showing ${venue.name} at ${venue.address}`}
          >
            {mapInView && (
              <iframe
                src={venue.mapsEmbedUrl}
                title={`Map of ${venue.name}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className={`h-full w-full border-0 transition-opacity duration-500 ${
                  mapLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setMapLoaded(true)}
                allowFullScreen
              />
            )}
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface">
                <MapPin className="h-8 w-8 text-accent/40" aria-hidden />
              </div>
            )}
          </motion.div>

          {/* Right: details + actions */}
          <div className="flex flex-col gap-6">
            <motion.p
              initial={
                prefersReducedMotion
                  ? undefined
                  : { opacity: 0, y: 16 }
              }
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: DURATION_CINEMATIC,
                ease: EASE_ENTRANCE,
                delay: 0.1,
              }}
              className="font-body text-base leading-relaxed text-muted sm:text-lg"
            >
              {venue.description}
            </motion.p>

            <ul className="flex flex-col gap-2.5">
              {venue.details.map((detail, i) => (
                <motion.li
                  key={detail}
                  initial={
                    prefersReducedMotion
                      ? undefined
                      : { opacity: 0, x: -12 }
                  }
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: DURATION_CINEMATIC,
                    ease: EASE_ENTRANCE,
                    delay: 0.2 + i * 0.08,
                  }}
                  className="flex items-center gap-3 font-body text-sm text-text sm:text-base"
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                    aria-hidden
                  />
                  {detail}
                </motion.li>
              ))}
            </ul>

            {/* Action buttons */}
            <motion.div
              initial={
                prefersReducedMotion
                  ? undefined
                  : { opacity: 0, y: 12 }
              }
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: DURATION_CINEMATIC,
                ease: EASE_ENTRANCE,
                delay: 0.35,
              }}
              className="flex flex-wrap gap-3"
            >
              <a
                href={buildMapsUrl(venue.mapsQuery)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${actionBtn} venue-action-btn`}
              >
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                Open in Maps
              </a>
              {venue.directionsQuery && (
                <a
                  href={buildDirectionsUrl(venue.directionsQuery)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${actionBtn} venue-action-btn`}
                >
                  <Navigation className="h-3.5 w-3.5" aria-hidden />
                  Directions
                </a>
              )}
              <button
                type="button"
                onClick={() => downloadICS(venue.ical)}
                className={`${actionBtn} venue-action-btn`}
              >
                <Calendar className="h-3.5 w-3.5" aria-hidden />
                Add to Calendar
              </button>
              <a
                href={venue.website}
                target="_blank"
                rel="noopener noreferrer"
                className={`${actionBtn} venue-action-btn`}
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                Visit Website
              </a>
            </motion.div>
          </div>
        </div>

        {/* Travel & Stay */}
        {venue.travelStay && (
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: DURATION_CINEMATIC,
              ease: EASE_ENTRANCE,
              delay: 0.2,
            }}
            className="mt-12 sm:mt-16"
          >
            <button
              type="button"
              onClick={() => setTravelOpen(!travelOpen)}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-bg px-6 py-4 text-left transition-colors duration-200 hover:border-accent/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              aria-expanded={travelOpen}
            >
              <span className="font-display text-lg tracking-tight text-text sm:text-xl">
                {venue.travelStay.title}
              </span>
              <ChevronDown
                className={`h-5 w-5 text-muted transition-transform duration-300 ${
                  travelOpen ? 'rotate-180' : ''
                }`}
                aria-hidden
              />
            </button>
            <div
              className="travel-stay-content"
              style={{
                display: 'grid',
                gridTemplateRows: travelOpen ? '1fr' : '0fr',
              }}
            >
              <div className="overflow-hidden">
                <ul className="flex flex-col gap-2.5 px-6 pt-4 pb-2">
                  {venue.travelStay.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 font-body text-sm text-muted sm:text-base"
                    >
                      <span
                        className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent/50"
                        aria-hidden
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
