import { couple, wedding } from '../../content/content'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-bg px-6 py-10 sm:py-14">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-display text-lg tracking-tight text-ink sm:text-xl">
          {couple.displayName}
        </p>
        <p className="mt-1 font-body text-sm text-muted">
          {wedding.displayDate} &middot; {wedding.location}
        </p>
        <div className="mx-auto mt-4 h-px w-12 bg-accent/30" aria-hidden />
        <p className="mt-4 font-body text-xs text-muted/60">
          &copy; {year} {couple.displayName}. Made with love.
        </p>
      </div>
    </footer>
  )
}
