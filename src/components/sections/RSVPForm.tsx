import { useState, useCallback, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { rsvp } from '../../content/content'
import { persistRsvp } from '../../lib/rsvp'
import { EASE_ENTRANCE, DURATION_CINEMATIC } from '../primitives/reveal'

function openWhatsApp(data: FormData) {
  const number = rsvp.whatsappNumber?.replace(/[^0-9]/g, '')
  if (!number) return

  const parts = [
    `Hi, I'm ${data.name}.`,
    data.guests > 1 ? `I'll be attending with ${data.guests} guests.` : "I'll be attending.",
    data.events.length > 0 ? `Events: ${data.events.join(', ')}.` : '',
    data.dietary ? `Dietary: ${data.dietary}.` : '',
    data.message ? `Message: ${data.message}` : '',
  ].filter(Boolean)

  const text = encodeURIComponent(parts.join(' '))
  window.open(`https://wa.me/${number}?text=${text}`, '_blank', 'noopener')
}

interface FormData {
  name: string
  guests: number
  events: string[]
  dietary: string
  message: string
}

function getSuccessMessage(name: string): string {
  const template =
    rsvp.successMessage ||
    'Thank you, {name}! Your response has been received. We cannot wait to celebrate with you.'
  return template.replace('{name}', name)
}

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function getFirstName(fullName: string): string {
  return fullName.split(' ')[0] || fullName
}

const FIELD_STAGGER = 0.1

export default function RSVPForm() {
  const [data, setData] = useState<FormData>({
    name: '',
    guests: 1,
    events: [],
    dietary: '',
    message: '',
  })
  const [errors, setErrors] = useState<{ name?: string }>({})
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleEvent = useCallback((event: string) => {
    setData((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }))
  }, [])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!data.name.trim()) {
      setErrors({ name: 'Please enter your name' })
      return
    }
    setErrors({})
    setIsSubmitting(true)

    // Optimistic: show success immediately
    setSubmitted(true)

    // Fire-and-forget: persist to Supabase (don't block UI)
    void persistRsvp(data)

    // Open WhatsApp with pre-filled response
    openWhatsApp(data)

    setIsSubmitting(false)
  }

  const fieldGroup =
    'flex flex-col gap-1.5'

  const labelBase =
    'font-body text-xs font-medium uppercase tracking-wider text-muted'

  const inputBase =
    'w-full border-0 border-b border-border bg-transparent px-0 py-3 font-body text-base text-text placeholder:text-muted/40 transition-colors duration-300 focus:border-accent focus:outline-none focus:ring-0 sm:text-base'

  const checkboxBase =
    'h-4 w-4 rounded border-border text-accent accent-accent transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        <motion.div
          key="success"
          initial={
            prefersReducedMotion
              ? { opacity: 1 }
              : { opacity: 0, scale: 0.96 }
          }
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: EASE_ENTRANCE }}
          role="status"
          aria-live="polite"
          className="flex flex-col items-center gap-5 py-8 text-center"
        >
          {/* Checkmark */}
          <motion.svg
            viewBox="0 0 52 52"
            className="h-14 w-14"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <motion.circle
              cx="26"
              cy="26"
              r="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-accent"
              initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, ease: EASE_ENTRANCE, delay: 0.15 }}
            />
            <motion.path
              d="M16 27l7 7 13-13"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-accent"
              initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, ease: EASE_ENTRANCE, delay: 0.5 }}
            />
          </motion.svg>

          <motion.p
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="font-display text-2xl tracking-tight text-text sm:text-3xl"
          >
            Thank you
          </motion.p>
          <motion.p
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="max-w-sm font-body text-sm leading-relaxed text-muted sm:text-base"
          >
            {getSuccessMessage(getFirstName(data.name))}
          </motion.p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-7"
          noValidate
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 1 }}
          exit={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, y: -8 }
          }
          transition={{ duration: 0.2, ease: EASE_ENTRANCE }}
        >
          {/* Name */}
          <motion.div
            variants={fieldVariant(FIELD_STAGGER * 0)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={fieldGroup}
          >
            <label htmlFor="rsvp-name" className={labelBase}>
              Full Name <span className="text-accent">*</span>
            </label>
            <input
              id="rsvp-name"
              type="text"
              required
              value={data.name}
              onChange={(e) => {
                setData({ ...data, name: e.target.value })
                if (errors.name) setErrors({})
              }}
              placeholder="Your full name"
              className={inputBase}
            />
            {errors.name && (
              <p className="font-body text-xs text-red-600">{errors.name}</p>
            )}
          </motion.div>

          {/* Guest count */}
          <motion.div
            variants={fieldVariant(FIELD_STAGGER * 1)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={fieldGroup}
          >
            <label htmlFor="rsvp-guests" className={labelBase}>
              Number of Guests
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() =>
                  setData({ ...data, guests: Math.max(1, data.guests - 1) })
                }
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border font-body text-lg text-text transition-colors duration-200 hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                aria-label="Decrease guest count"
              >
                &minus;
              </button>
              <input
                id="rsvp-guests"
                type="number"
                min={1}
                max={10}
                value={data.guests}
                onChange={(e) =>
                  setData({
                    ...data,
                    guests: Math.max(1, Math.min(10, Number(e.target.value) || 1)),
                  })
                }
                className="w-16 border-0 border-b border-border bg-transparent py-3 text-center font-body text-base text-text focus:border-accent focus:outline-none focus:ring-0 sm:text-base"
              />
              <button
                type="button"
                onClick={() =>
                  setData({ ...data, guests: Math.min(10, data.guests + 1) })
                }
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border font-body text-lg text-text transition-colors duration-200 hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                aria-label="Increase guest count"
              >
                +
              </button>
            </div>
          </motion.div>

          {/* Event checkboxes */}
          {rsvp.events && rsvp.events.length > 0 && (
            <motion.div
              variants={fieldVariant(FIELD_STAGGER * 2)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className={fieldGroup}
            >
              <span className={labelBase}>Attending Events</span>
              <div className="flex flex-col gap-3">
                {rsvp.events.map((event) => (
                  <label
                    key={event}
                    className="flex cursor-pointer items-center gap-3 font-body text-sm text-text sm:text-base"
                  >
                    <input
                      type="checkbox"
                      checked={data.events.includes(event)}
                      onChange={() => toggleEvent(event)}
                      className={checkboxBase}
                    />
                    {event}
                  </label>
                ))}
              </div>
            </motion.div>
          )}

          {/* Dietary */}
          {rsvp.dietaryOptions && rsvp.dietaryOptions.length > 0 && (
            <motion.div
              variants={fieldVariant(FIELD_STAGGER * 3)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className={fieldGroup}
            >
              <label htmlFor="rsvp-dietary" className={labelBase}>
                Dietary Restrictions
              </label>
              <select
                id="rsvp-dietary"
                value={data.dietary}
                onChange={(e) =>
                  setData({ ...data, dietary: e.target.value })
                }
                className={`${inputBase} appearance-none`}
              >
                <option value="">Select if applicable</option>
                {rsvp.dietaryOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </motion.div>
          )}

          {/* Message */}
          <motion.div
            variants={fieldVariant(FIELD_STAGGER * 4)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={fieldGroup}
          >
            <label htmlFor="rsvp-message" className={labelBase}>
              Message to the Couple
            </label>
            <textarea
              id="rsvp-message"
              rows={3}
              value={data.message}
              onChange={(e) =>
                setData({ ...data, message: e.target.value })
              }
              placeholder="Share a note, a memory, or well wishes..."
              className={`${inputBase} resize-none`}
            />
          </motion.div>

          {/* Submit */}
          <motion.button
            variants={fieldVariant(FIELD_STAGGER * 5)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            type="submit"
            disabled={isSubmitting}
            className="rsvp-submit-btn w-full rounded-full border border-accent bg-transparent py-4 font-body text-sm font-medium uppercase tracking-[0.15em] text-accent transition-all duration-300 hover:bg-accent hover:text-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 sm:text-base"
          >
            {isSubmitting ? 'Sending...' : 'Send Response'}
          </motion.button>
        </motion.form>
      )}
    </AnimatePresence>
  )
}

// Field entrance variant helper
function fieldVariant(delay: number) {
  return {
    hidden: {
      opacity: 0,
      y: 16,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: DURATION_CINEMATIC,
        ease: EASE_ENTRANCE,
        delay,
      },
    },
  }
}

