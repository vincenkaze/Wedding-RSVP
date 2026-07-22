# Wedding Invitation Project — Current Plan

Last updated: 2026-07-22

---

# Mission

Build a premium one-page wedding invitation website for Anjana & Krishnaprasad.
Emotional, elegant, cinematic. Optimized for WhatsApp, Instagram, and direct links.
Single-page React app, static deploy.

---

# Active Milestone: M9 — Pre-flight & deploy

## Gallery

The gallery is a responsive flex-column masonry — 2 columns on mobile (≤1023px), 3 columns on desktop (≥1024px). Uses the same shortest-column algorithm at all breakpoints. No 3D engine, no camera/parallax canvas, no WebGL2 renderer.

### What's done:
- Masonry layout: 2-col mobile, 3-col desktop via `window.matchMedia`
- `EditorialGalleryCard` renders each item with lazy-loaded AVIF/WebP
- Lightbox with swipe navigation, pinch-zoom, double-tap zoom, keyboard nav
- No per-image captions — removed from interface, data, and UI

### Not yet tested:
- Visual review at 1024px, 1440px, 1920px
- WhatsApp in-app browser gallery rendering

## Remaining Pre-flight Items

1. **Gallery visual QA** — Review masonry at 1024/1440/1920px. Check spacing, image alignment, lightbox on all breakpoints.
2. **Hero invitation line** — `DateReveal` tap-to-flip interaction conflicts with "readable at a glance" goal. Pending user approval to show date/location inline.
3. **Rewrite all .md files** — Sync docs to current implementations (in progress).
4. **Hero images** — Upload couple photos to `public/hero/`.
5. **Live stream config** — Get YouTube video ID from user.
6. **Admin auth** — Resolve JWT/random-token drift (P-013).

## Milestone History

| Milestone | Status |
|-----------|--------|
| M0 — Project setup | ✅ Complete |
| M1 — Content layer + tokens | ✅ Complete |
| M2 — Hero, Countdown, Footer | ✅ Complete |
| M3 — Family + Events | ✅ Complete |
| M4 — Venue + Maps | ✅ Complete |
| M5A — Gallery Grid + Lightbox | ✅ Complete (active gallery) |
| M5B — Gallery Engine (3D sphere) | 🗄️ Archived — replaced by M5A masonry |
| M6 — RSVP | ✅ Complete |
| M7 — Admin Dashboard | ✅ Complete (local) |
| M8 — Polish | ✅ Complete |
| M9 — Pre-flight & deploy | 🔄 In progress |

---

# Phase Gate — M9

M9 is complete when:

- Gallery visually reviewed at 360px, 768px, 1024px, 1440px, 1920px
- Hero shows date/location at a glance (DateReveal removed)
- All .md files reflect current implementations
- Hero images uploaded
- Live stream configured (or gracefully disabled)
- Admin auth aligned (JWT model)
- iPhone Safari, Android Chrome, WhatsApp/Instagram in-app tested
- Lighthouse mobile ≥ 90
- Bundle size < 200KB gzipped for guest site
- All images optimized
- No console errors or warnings
- No `any`, no `console.log`, no commented-out code
- Animations respect prefers-reduced-motion

---

# Reference Documents

- `AGENTS.md` — coding standards and file structure
- `Problems-to-fix.md` — open issues

---

# Legend

- ✅ Complete
- 🗄️ Archived (replaced or superseded)
- ⏳ Pending
- 🔄 In progress
