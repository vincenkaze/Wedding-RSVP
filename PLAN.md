# Wedding Invitation Project — Plan

## Mission

Build a premium one-page wedding invitation website that feels emotional, elegant, and cinematic. Optimized for sharing via WhatsApp, Instagram, and direct link. Single-page React app, deployed as a static site, loads fast on mid-range Android over 4G.

## Working Rules

These are the rules for this project. Follow them every milestone. If a rule needs to change, update this file — don't silently ignore it.

- All copy lives in `src/content/content.ts`. No copy in JSX, components, or anywhere else. This is the only file non-developers should edit.
- Tokenize before styling. Use the design tokens in `src/styles/tokens.css` (`--color-accent`, `--font-display`, `--ease-entrance`, etc.). No hardcoded colors, fonts, or magic numbers in components.
- No new dependencies without an explicit reason written in the milestone. If unsure, ask.
- No speculative code. Don't add props, state, or abstractions "just in case." Build what's needed now.
- Animations must respect prefers-reduced-motion. Every Framer Motion entrance and every CSS animation needs a reduced-motion fallback.
- Mobile-first. Test at 360px, 768px, 1440px before claiming a milestone is done.
- All images need alt text. Hero image needs preload and AVIF/WebP sources. Gallery images lazy-loaded.
- WhatsApp in-app browser is the real test environment. If it doesn't work there, the milestone isn't done.
- Definition of Done: every success criterion is met, no console errors, no `any`, no commented-out code, Lighthouse mobile ≥ 90, reviewed with the user.
- One milestone at a time. Don't start the next until current is signed off.

---

# Working Notes (per session)

## Gallery

The Gallery is a responsive flex-column masonry — 2 columns mobile (≤1023px), 3 columns desktop (≥1024px). Uses the same shortest-column algorithm at all breakpoints.

The M5B 3D sphere WebGL2 engine was fully developed and tested but ultimately archived. The masonry gallery (M5A) became the primary (and only) gallery experience due to its reliability, performance, and simpler codebase.

The engine code (`src/engine/`, `src/gallery/`) has been completely removed from the repository.

---

# Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Runtime / Package Manager | npm | |
| Build | Vite | zero-config React + TS |
| UI Framework | React 19 + TypeScript 6 | strict mode, no any |
| Styling | Tailwind CSS 4 | `@tailwindcss/vite` plugin, design tokens in `@theme` |
| Animation | Framer Motion 12 | entrance, scroll-reveal, stagger |
| Smooth Scroll | Lenis | tuned touchMultiplier for WhatsApp in-app |
| Icons | lucide-react | tree-shaken |
| Gestures | @use-gesture/react + native Pointer Events | lightbox uses native events |
| Admin / Backend | Supabase | Postgres + Edge Function for RSVP + admin |

No new dependencies without a written reason.

---

# Design Direction

Theme: Warm monochrome with muted copper accent. Monochrome for timelessness, copper for emotional highlights.

Hero: Couple photo with warm B&W treatment. Couples names in elegant display serif. Date and venue in tracked-out caps.

Aesthetic: Kerala traditional invitation influence — Ganesha ornament, ornate dividers, serif typography. Modern, not nostalgic.

Photography: Gallery photos in a clean masonry layout. No canvas, no 3D.

Mood: Sacred, elegant, intimate. Not festive. Not a SaaS landing page.

---

# Content

All copy is locked in `src/content/content.ts`. Update there, not in components. The values below are the final copy for this wedding.

### Couple
- Bride: Anjana Sivanandan
- Groom: Krishnaprasad Thulasidas
- Display: Anjana & Krishnaprasad

### Wedding
- Date: Sunday, September 13, 2026
- Time: 10:00 AM – 10:30 AM (Muhurtham)
- Timezone: IST (UTC+5:30)
- Location: Cherthala, Alappuzha, Kerala

### Venue
- Name: Akhilanjali Convention Centre
- Address: Akhilanjali Convention Centre, Varanad Rd, near Sastham kavala, Cherthala, Nedumprakkad, Kerala 688539

### Family
- Bride's parents: Mr. Sivannandan K.K, Mrs. Usha Sivanandan
- Groom's parents: Late Mr. Thulasidas, Mrs. Ushakumari

### RSVP
- Deadline: August 30, 2026
- Contact: +918XXXX8744

---

# Information Architecture

Single-page vertical scroll.

Hero — full-bleed photo, Ganesha ornament, couple names, date, RSVP CTA
Countdown — days/hours/minutes/seconds
Verse — quote blockquote
Story — YouTube live stream embed
Events — ceremony + reception cards
Family — bride + groom family side-by-side
Venue — map embed, directions, calendar
Gallery — masonry photo grid + lightbox
RSVP — form with WhatsApp + Supabase persistence
Footer — couple names, date, location

---

# Animation System

## Motion split (non-negotiable)
Framer Motion for: entrance, scroll-reveal, stagger, layout transitions
CSS for: hover, focus, micro-interactions, loading shimmer, photo grayscale, button fills

Animating hovers in JS causes re-render thrash. Keep motion in CSS unless it needs orchestration.

## Preferred motion types
fade, blur, scale (0.96 → 1), parallax, stagger, clip-path reveal, underline draw

## Avoid
bouncing, spinning, particle effects, anything that competes with the photo

## Easing
Default entrance: `[0.22, 1, 0.36, 1]` (ease-out-quart)
State changes: `[0.4, 0, 0.2, 1]` (ease-in-out)
Never linear for UI motion

## Duration
Micro: 150–200ms
Standard: 300–500ms
Cinematic: 600–1200ms
Anything over 400ms must respect prefers-reduced-motion

## Stagger
60–100ms between siblings
150–250ms between sections

---

# Performance Budget

- Lighthouse mobile: ≥ 90
- LCP: < 2.5s on 4G throttled
- CLS: < 0.1
- INP: < 200ms
- 60fps on mid-range Android (Moto G Power class)
- No animation longer than 1.2s
- All animations gated by prefers-reduced-motion

### Image specs

| Slot | Size | Format | Notes |
|---|---|---|---|
| Hero | 1600×1067 | AVIF + WebP + JPEG | preloaded |
| Gallery | 1200×1500 | AVIF + WebP + JPEG | lazy-loaded |
| Favicon | 32×32 | SVG + PNG | Ganesha glyph |
| OG image | 1200×630 | PNG | < 300KB, social sharing |

---

# File Structure (current)

```
src/
  components/
    admin/           # /admin login/dashboard
    sections/        # Hero, Countdown, Verse, Story, Events, Family, Venue, Gallery, Lightbox, RSVP, Footer
    primitives/      # Section, Reveal, Preloader, EnvelopeIntro, StickyActionBar, CustomCursor, ScrollProgress
  hooks/             # Lenis smooth scroll, useMediaQuery
  lib/               # ics, maps, supabase, rsvp, admin, gallery-assets
  content/
    content.ts       # ALL copy — single source of truth
  styles/
    tokens.css       # @theme + animation tokens
    base.css         # Global styles, gallery masonry, reduced-motion
  App.tsx            # Composition (admin route + wedding site)
  main.tsx           # Root + providers
```

---

# Milestones

Each milestone ships when all success criteria are met AND you've reviewed the demo. Don't move on until you have.

## M0 — Project setup
- Vite app builds, lints, and runs
- TypeScript strict, no any
- Tailwind tokens + base CSS work
- Lenis smooth scroll active

## M1 — Content layer + tokens
- Typed `content.ts` exports
- Full theme palette + animation tokens
- Reset, body utility
- App renders all sections as empty placeholders

## M2 — Hero, Countdown, Footer
- Hero: pre-title, names reveal, date reveal, RSVP CTA
- Countdown: live ticker
- Footer: names, date, copyright

## M3 — Family + Events
- Bride/groom family side-by-side
- Events timeline with cards
- Map links and descriptions

## M4 — Venue + Maps
- Lazy map embed
- Directions, calendar, travel info

## M5A — Gallery Masonry + Lightbox
- Responsive flex-column masonry (2-col mobile, 3-col desktop)
- Shortest-column algorithm for natural editorial feel
- AVIF + WebP with srcset
- Lightbox with swipe, pinch-zoom, double-tap, keyboard nav
- All images carry meaningful alt text

## M5B — Gallery Engine (Archived)
- Previous milestone: 3D sphere WebGL2 engine in `src/engine/`.
- Fully developed (Phases 1-4 reached interactive state with picking, physics, auto-rotation).
- Archived in favor of M5A masonry for reliability, performance, and simplicity.

## M6 — RSVP
- Form fields, validation, success state
- WhatsApp deep link + Supabase persistence

## M7 — Admin Dashboard
- `/admin` route, password gate
- Table, stats, CSV export

## M8 — Polish
- Hover, focus, active states
- Sticky action bar (music, directions, RSVP)
- Custom cursor desktop-only
- Reduced-motion static layout

## M9 — Pre-flight & deploy
- iPhone Safari, Android Chrome, WhatsApp/Instagram in-app tested
- Lighthouse mobile ≥ 90
- Bundle size < 200KB gzipped for guest site
- All images optimized
- No console errors
- Gallery visual QA at all breakpoints
- SEO metadata audited
- Favicon assets complete
- All .md files synced to current state
