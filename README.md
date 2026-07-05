# Anjana & Krishnaprasad — Wedding Invitation

A premium one-page wedding invitation website built with React, Tailwind CSS, and Framer Motion. Designed to deliver an emotional, cinematic experience optimized for sharing via WhatsApp, Instagram, and direct links.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | npm (or Bun) |
| Build | Vite 8 |
| UI | React 19 + TypeScript 6 (strict) |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion 12 |
| Smooth Scroll | Lenis |
| Icons | Lucide React |
| Gestures | @use-gesture/react |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── primitives/
│   │   ├── Section.tsx          # Scroll-triggered section wrapper
│   │   ├── reveal.ts            # Shared animation constants & variants
│   │   ├── Preloader.tsx        # Initial "A & K" splash (2s, localStorage-cached)
│   │   ├── EnvelopeIntro.tsx    # Wax-seal envelope animation (sessionStorage-cached)
│   │   ├── MusicControl.tsx     # Floating audio toggle
│   │   └── CustomCursor.tsx     # Desktop-only dot cursor
│   └── sections/
│       ├── Hero.tsx             # Full-viewport hero with Ken Burns, date-reveal
│       ├── Countdown.tsx        # Live countdown to Sept 13, 2026
│       ├── Verse.tsx            # Quote blockquote
│       ├── Story.tsx            # YouTube live stream embed (pre/live/post states)
│       ├── Events.tsx           # Timeline with EventCard components
│       ├── EventCard.tsx        # Individual event card
│       ├── Family.tsx           # Bride + groom family side-by-side
│       ├── FamilyGroup.tsx      # Single family group renderer
│       ├── Venue.tsx            # Maps embed, directions, ICS download
│       ├── FloatingGallery.tsx  # Gallery wrapper (carousel + lightbox)
│       ├── CylinderCarousel.tsx # 3D CSS perspective carousel
│       ├── Lightbox.tsx         # Full-screen image viewer
│       ├── RSVP.tsx             # RSVP section wrapper
│       ├── RSVPForm.tsx         # Form with WhatsApp + Web3Forms submission
│       └── Footer.tsx           # Minimal footer
├── content/
│   └── content.ts               # ALL copy — single source of truth
├── hooks/
│   ├── useSmoothScroll.tsx      # Lenis initialization
│   └── smooth-scroll-context.ts # Lenis React context
├── lib/
│   ├── ics.ts                   # ICS calendar file generation
│   └── maps.ts                  # Google Maps URL builders
├── styles/
│   ├── tokens.css               # Design tokens (@theme block)
│   └── base.css                 # Global styles, animations, reduced-motion
├── App.tsx                      # Main composition
└── main.tsx                     # Root render
```

## Customization

All content lives in `src/content/content.ts`. Edit this single file to change:

- **Couple names** — `couple.bride.firstName`, `couple.groom.firstName`, `couple.displayName`
- **Wedding date** — `wedding.date`, `wedding.iso`, `wedding.time`
- **Events** — `events[]` array (title, date, time, location, maps query)
- **Venue** — `venue.name`, `venue.address`, `venue.mapsEmbedUrl`
- **Family** — `family.bride`, `family.groom` (parents, siblings)
- **Gallery** — `gallery[]` array (image paths, alt text, captions)
- **Live stream** — `liveStream` (YouTube video ID, channel info)
- **RSVP** — `rsvp.deadline`, `rsvp.contactNumber`, `rsvp.events`
- **Verse** — `verse.text`, `verse.reference`

No copy lives in component files. Ever.

## Adding Images

Place images in `public/` and reference them in `content.ts`:

```
public/
├── hero/
│   ├── couple.jpg
│   ├── couple.webp
│   └── couple.avif
├── gallery/
│   ├── 1.jpeg through 10.jpeg
└── og-image.jpg          # 1200×630px, <300KB — for WhatsApp/social previews
```

Images should be optimized to WebP with AVIF where supported.

## Adding Audio

Place an ambient audio file at `public/audio/ambient.mp3`. The music control will gracefully disable itself if the file is missing.

## Development

```bash
# Force envelope intro on refresh (bypasses sessionStorage)
open "http://localhost:5173/?intro=1"

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
- Color contrast AA minimum

## Deploy

```bash
npm run build
```

Upload the `dist/` directory to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages).

## License

Private — for Anjana & Krishnaprasad's wedding celebration.
