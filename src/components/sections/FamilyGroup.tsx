import { motion, useReducedMotion } from 'framer-motion'
import type { FamilySide } from '../../content/content'
import { EASE_ENTRANCE, DURATION_CINEMATIC } from '../primitives/reveal'

interface FamilyGroupProps {
  side: FamilySide
}

export default function FamilyGroup({ side }: FamilyGroupProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={
        prefersReducedMotion
          ? undefined
          : { opacity: 0, y: 20, filter: 'blur(4px)' }
      }
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: DURATION_CINEMATIC, ease: EASE_ENTRANCE }}
      className="flex flex-col items-center gap-4 text-center"
    >
      <p className="font-body text-xs font-semibold uppercase tracking-[0.24em] text-accent sm:text-sm">
        {side.label}
      </p>

      <ul className="flex flex-col gap-2">
        {side.parents.map((name) => (
          <li key={name}>
            <span className="family-name font-display text-xl tracking-tight text-ink sm:text-2xl md:text-3xl">
              {name}
            </span>
          </li>
        ))}
      </ul>

      {side.members.length > 0 && (
        <ul className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1">
          {side.members.map((name) => (
            <li key={name}>
              <span className="family-name font-body text-sm text-muted sm:text-base">
                {name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  )
}
