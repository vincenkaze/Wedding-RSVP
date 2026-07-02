# Olivia & James — Wedding Invitation

A premium one-page wedding invitation website built with React, Tailwind CSS, and Framer Motion. Designed to deliver an emotional, cinematic experience optimized for sharing via WhatsApp, Instagram, and direct links.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun |
| Build | Vite 8 |
| UI | React 19 + TypeScript 6 |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion 12 |
| Smooth Scroll | Lenis |
| Icons | Lucide React |

## Getting Started

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Project Structure

```
src/
├── components/
│   ├── primitives/      # Preloader, EnvelopeIntro, MusicControl, CustomCursor, Section
│   └── sections/        # Hero, Countdown, Verse, Story, Events, Family, Venue, Gallery, RSVP, Footer
├── content/
│   └── content.ts       # All copy, dates, venue info — single source of truth
├── hooks/
│   └── useSmoothScroll  # Lenis initialization with reduced-motion support
├── lib/
│   ├── ics.ts           # Calendar file generation
│   └── wa.ts            # WhatsApp deep link helpers
├── styles/
│   ├── tokens.css       # Design tokens (colors, spacing, typography)
│   └── base.css         # Global styles, animations, reduced-motion rules
├── App.tsx
└── main.tsx
```

## Customization

All content lives in `src/content/content.ts`. Edit this single file to change:

- **Couple names** — `couple.firstName`, `couple.secondName`, `couple.displayName`
- **Wedding date** — `wedding.date`, `wedding.iso`, `wedding.displayDate`
- **Events** — `events[]` array (title, date, time, location, maps query)
- **Venue** — `venue.name`, `venue.address`, `venue.mapsEmbedUrl`
- **Story timeline** — `storyTimeline[]` array
- **Gallery** — `gallery[]` array (image paths, alt text, captions)
- **RSVP** — `rsvp.deadline`, `rsvp.contactNumber`, `rsvp.web3FormsEndpoint`
- **Family** — `family.bride`, `family.groom`

No copy lives in component files. Ever.

## Adding Images

Place images in `public/` and reference them in `content.ts`:

```
public/
├── hero/
│   ├── couple.jpg
│   ├── couple.webp
│   └── couple.avif
├── story/
│   ├── bookshop.jpg
│   └── proposal.jpg
├── gallery/
│   ├── first-moment.jpg
│   └── ...
└── og-image.jpg          # 1200×630px, <300KB — for WhatsApp/social previews
```

Images should be optimized to WebP with AVIF where supported. Provide multiple formats via `srcWebp` / `srcAvif` fields in the gallery content.

## Adding Audio

Place an ambient audio file at `public/audio/ambient.mp3`. The music control will gracefully disable itself if the file is missing.

## Development

```bash
# Force envelope intro on refresh (bypasses localStorage)
open "http://localhost:5173/?intro=1"

# Clear preloader/invite state manually
localStorage.removeItem('wedding-preloader-seen')
localStorage.removeItem('wedding-envelope-seen')
```

## Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse Mobile | ≥ 95 |
| LCP | < 2.5s on 4G |
| Bundle (JS gzip) | < 130 KB |
| Bundle (CSS gzip) | < 10 KB |
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
- Lenis handles all smooth scrolling (no `scroll-behavior: smooth`)
- Custom cursor hidden on touch devices

## Accessibility

- Single `<h1>` in Hero, `<h2>` per section, `<h3>` for sub-items
- Skip-to-content link as first focusable element
- All form fields labeled with `htmlFor`/`id`
- Lightbox uses `role="dialog"` with focus management
- All images carry meaningful `alt` text
- Decorative SVGs carry `aria-hidden`
- All animations respect `prefers-reduced-motion`
- Color contrast AA minimum (14:1 for body text)

## Deploy

```bash
bun run build
```

Upload the `dist/` directory to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages). The site is a single-page app with no server-side requirements.

## License

Private — for Olivia & James's wedding celebration.
