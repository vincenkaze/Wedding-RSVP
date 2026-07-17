# Anjana & Krishnaprasad — Wedding Invitation

A premium one-page wedding invitation website built with React, Tailwind CSS, Framer Motion, and a custom WebGL2 gallery engine.

Designed to deliver an emotional, cinematic experience optimized for sharing via WhatsApp, Instagram, and direct links.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node / npm (Bun supported) |
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
│   ├── primitives/      # Preloader, EnvelopeIntro, MusicControl, CustomCursor, ScrollProgress, ParticleCanvas, Section, Reveal
│   └── sections/        # Hero, Countdown, Verse, Story, Events, Family, Venue, Gallery, Lightbox, RSVP, Footer
├── engine/              # M5B Gallery Engine
│   ├── core/            # Engine entry, Scheduler, contract, RendererFactory, capabilities
│   ├── renderers/       # interface + webgl2 + webgpu stub
│   ├── scene/           # Scene graph, Camera
│   ├── objects/         # Globe, PhotoMesh
│   ├── physics/         # Angular velocity, spring snap
│   ├── interaction/     # Unified Pointer Events
│   ├── textures/        # TextureManager
│   ├── materials/       # Material spec
│   ├── math/            # mat4 utilities
│   └── debug/           # Profiler, archive
├── gallery/
│   └── ui/              # GallerySection (engine mount)
├── hooks/               # Lenis smooth scroll
├── lib/                 # ics, maps, supabase, rsvp, admin
├── content/
│   └── content.ts       # ALL copy — single source of truth
├── styles/
│   ├── tokens.css       # @theme + design tokens
│   └── base.css         # Global styles, .photo-bw, reduced-motion
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
- **Gallery** — `gallery[]` array (image paths, alt text, captions)
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
│   ├── 1.avif / 1.webp / 1.jpg
│   └── ...
├── audio/
│   └── ambient.mp3
└── og-image.jpg
```

Images should be optimized to WebP with AVIF where supported.

## Adding Audio

Place an ambient audio file at `public/audio/ambient.mp3`. The music control will gracefully disable itself if the file is missing.

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

## Gallery Notes

The public gallery uses a custom 3D sphere engine (`src/engine/`) built on raw WebGL2. It renders 17 wedding photographs as camera-facing billboards arranged on a Fibonacci sphere. Interaction uses unified Pointer Events. The legacy CSS grid remains available as a reduced-motion fallback.

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
