import { useCallback } from 'react'
import { ArrowUp } from 'lucide-react'
import { couple, wedding } from '../../content/content'

export default function Footer() {
  const year = new Date().getFullYear()

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <footer id="footer" className="border-t border-border bg-bg px-6 py-10 sm:py-14">
      <div className="mx-auto max-w-2xl text-center">
        <button
          type="button"
          onClick={scrollToTop}
          className="group mx-auto mb-6 flex items-center gap-2 rounded-full border border-border px-4 py-2 font-body text-xs text-muted transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          aria-label="Back to top"
        >
          <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
          Back to top
        </button>
        <p className="font-display text-lg tracking-tight text-text sm:text-xl">
          {couple.displayName}
        </p>
        <p className="mt-1 font-body text-sm text-muted">
          {wedding.displayDate} &middot; {wedding.location}
        </p>
        <div className="mx-auto mt-4 h-px w-12 bg-accent/30" aria-hidden />
        <p className="mt-4 font-body text-xs text-muted/60">
          © {year} {couple.displayName}. Made with love.
        </p>
      </div>
    </footer>
  )
}
