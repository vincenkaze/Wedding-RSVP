# Anjana & Krishnaprasad — Wedding Invitation

A premium one-page wedding invitation website built with React, Tailwind CSS, Framer Motion, and Lenis.

Designed to deliver an emotional, elegant, cinematic experience optimized for sharing via WhatsApp, Instagram, and direct links.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node / npm |
| Build | Vite |
| UI | React 19 + TypeScript 6 (strict) |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion 12 + CSS |
| Smooth Scroll | Lenis |
| Icons | lucide-react |
| Gestures | @use-gesture/react, native Pointer Events |
| Backend | Supabase (RSVP storage + admin) |

## Getting Started

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── admin/           # /admin login + dashboard
│   ├── primitives/      # Preloader, EnvelopeIntro, StickyActionBar, CustomCursor, ScrollProgress, Section, Reveal
│   └── sections/        # Hero, Countdown, Verse, Story, Events, Family, Venue, Gallery, Lightbox, RSVP, Footer
├── hooks/               # Lenis smooth scroll, useMediaQuery
├── lib/                 # ics, maps, supabase, rsvp, admin, gallery-assets
├── content/
│   └── content.ts       # ALL copy — single source of truth
├── styles/
│   ├── tokens.css       # @theme + design tokens
│   └── base.css         # Global styles, gallery masonry, reduced-motion
├── App.tsx
└── main.tsx
```

## Customization

All content lives in `src/content/content.ts`. Edit this single file to change:

- **Couple names** — `couple.firstName`, `couple.secondName`, `couple.displayName`
- **Wedding date** — `wedding.date`, `wedding.iso`, `wedding.time`
- **Events** — `events[]` array (title, date, time, location)
- **Venue** — `venue.name`, `venue.address`, `venue.mapsEmbedUrl`
- **Family** — `family.bride`, `family.groom` (parents, siblings)
- **Gallery** — `gallery[]` array (image paths, alt text, span)
- **Live stream** — `liveStream` (YouTube video ID, channel info)
- **RSVP** — `rsvp.deadline`, `rsvp.contactNumber`, `rsvp.events`

No copy lives in component files. Ever.

## Adding Images

Place images in `public/` and reference them in `content.ts`:

```
public/
├── hero/
│   ├── couple.avif
│   ├── couple.webp
│   └── couple.jpg
├── gallery/
│   ├── sizes/
│   │   ├── 512/   # thumbnails
│   │   ├── 1024/  # mid-size
│   │   └── ...
│   ├── 1.avif / 1.webp
│   └── ...
├── audio/
│   └── ambient.mp3
├── favicon.ico
├── favicon.svg
├── favicon-{16,32,48}x48.png
├── og-image.png
└── og-image.jpg
```

Images should be optimized to WebP with AVIF where supported.

## Adding Audio

Place an ambient audio file at `public/audio/ambient.mp3`. The sticky action bar will gracefully disable itself if the file is missing.

## Development

```bash
# Force envelope intro on refresh (bypasses sessionStorage)
npm run dev -- -- ?intro=1

# Clear preloader/envelope state manually
localStorage.removeItem('wedding-preloader-seen')
sessionStorage.removeItem('wedding-envelope-seen')
```

## Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse Mobile | ≥ 90 |
| LCP | < 2.5s on 4G |
| Max animation duration | 1.2s |

## Browser Support

Tested in:
- iPhone Safari
- Android Chrome
- WhatsApp in-app browser
- Instagram in-app browser

Key in-app browser considerations:
- Uses `min-h-dvh` instead of `100vh`
- RSVP inputs sized at 16px to prevent iOS auto-zoom
- Lenis handles all smooth scrolling
- Custom cursor hidden on touch devices

## Gallery

The gallery uses a responsive flex-column masonry layout — 2 columns on mobile (≤1023px), 3 columns on desktop (≥1024px). Photos are placed via a shortest-column algorithm for a natural editorial feel. Tapping any image opens the lightbox with swipe, pinch-zoom, and keyboard navigation.

## Accessibility

- Single `<h1>` in Hero, `<h2>` per section, `<h3>` for sub-items
- Skip-to-content link as first focusable element
- All form fields labeled with `htmlFor`/`id`
- Lightbox uses `role="dialog"` with focus management
- All images carry meaningful `alt` text
- Decorative SVGs carry `aria-hidden`
- All animations respect `prefers-reduced-motion`
- Color contrast AA minimum

## Deploy

```bash
npm run build
```

Upload the `dist/` directory to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages).

## License

Private — for Anjana & Krishnaprasad's wedding celebration.
