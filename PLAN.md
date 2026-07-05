# Wedding Invitation Project — Plan

## Mission

Build a premium one-page wedding invitation website that feels emotional, elegant, and cinematic. Optimized for sharing via WhatsApp, Instagram, and direct link. Single-page React app, deployed as a static site, loads fast on mid-range Android over 4G.

## Working Rules

These are the rules for this project. Follow them every milestone. If a rule needs to change, update this file — don't silently ignore it.

- All copy lives in `content.ts`. No copy in JSX, components, or anywhere else. This is the only file non-developers should edit.
- Tokenize before styling. Use the design tokens in `tokens.css` (`--color-accent`, `--font-display`, `--ease-entrance`, etc.). No hardcoded colors, fonts, or magic numbers in components.
- No new dependencies without an explicit reason written in the milestone. If unsure, ask.
- No speculative code. Don't add props, state, or abstractions "just in case." Build what's needed now.
- Animations must respect `prefers-reduced-motion`. Every Framer Motion entrance and every CSS animation needs a reduced-motion fallback.
- Mobile-first. Test at 360px, 768px, 1440px before claiming a milestone is done.
- All images need alt text. Hero image needs `fetchpriority="high"` and AVIF/WebP sources.
- WhatsApp in-app browser is the real test environment. If it doesn't work there, the milestone isn't done.
- Definition of Done: every success criterion in the milestone is met, no console errors, no `any`, no commented-out code, Lighthouse mobile ≥ 90, reviewed with the user.
- One milestone at a time. Don't start M2 until M1 is signed off.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Build | Vite 8 | Zero-config React + TS |
| UI Framework | React 19 + TypeScript 6 | strict mode, no any |
| Styling | Tailwind CSS 4 | `@tailwindcss/vite` plugin, design tokens in `@theme` |
| Animation | Framer Motion 12 | entrance, stagger, scroll-reveal only |
| Smooth Scroll | Lenis | tuned `touchMultiplier` for WhatsApp in-app |
| Icons | lucide-react | tree-shaken |
| Gestures | @use-gesture/react | gallery drag/pinch/rotate |
| Calendar | Custom `ics.ts` | generates valid RFC 5545 VCALENDAR |
| Form Delivery | WhatsApp deep link + Web3Forms (optional) | WhatsApp is the primary path |

No new dependencies without a written reason.

---

## Design Direction

- **Theme:** Black-and-white with single accent color. Monochrome for timelessness, accent for emotional highlights.
- **Hero:** Couple photo with b&w treatment. Couple names in elegant display serif. Date and venue in tracked-out caps.
- **Aesthetic:** Kerala traditional invitation influence — Ganesha icon ornament, ornate dividers, serif typography. Modern, not nostalgic.
- **Photography:** All photos in monochrome (`filter: grayscale(100%)`) to match the black-and-white invitation print.
- **Mood:** Sacred, elegant, intimate. Not festive. Not a SaaS landing page.

---

## Content

All copy is locked in `content.ts`. Update there, not in components.

### Couple

```ts
couple = {
  bride: { firstName: 'Anjana', displayName: 'Anjana', fullName: 'Anjana Sivanandan' },
  groom: { firstName: 'Krishnaprasad', displayName: 'Krishnaprasad', fullName: 'Krishnaprasad Thulasidas' },
  displayName: 'Anjana & Krishnaprasad',
  monogram: 'A & K',
}
```

### Wedding

```ts
wedding = {
  date: 'Sunday, September 13, 2026',
  time: '10:00 AM – 10:30 AM (Muhurtham)',
  timezone: 'IST (UTC+5:30)',
  iso: '2026-09-13T10:00:00+05:30',
  malayalamDate: '1202 Chingam 28',
  location: 'Cherthala, Alappuzha, Kerala',
}
```

---

## Information Architecture (Final)

Single-page vertical scroll, in order:

1. **Hero** — full-bleed b&w photo, Ganesha ornament, couple names, date-reveal (tap to un-mirror), RSVP CTA, scroll indicator
2. **Countdown** — days/hours/minutes/seconds
3. **Verse** — blockquote with ornamental rules
4. **Story** — YouTube live stream embed (pre/live/post states)
5. **Events** — timeline with two EventCards (Wedding Ceremony + Reception)
6. **Family** — bride's family + groom's family, side-by-side with ornate divider
7. **Venue** — Akhilanjali Convention Centre, embedded Google Map, address, directions, add to calendar
8. **Gallery** — 3D cylinder carousel with lightbox
9. **RSVP** — name, guest count, dietary, message → WhatsApp + Web3Forms
10. **Footer** — couple names, date, location, small credit

**Removed (per user):** Our Story section — the couple story/prose is replaced by the YouTube live stream embed.

---

## Animation System

### Motion split (non-negotiable)

- **Framer Motion for:** entrance, scroll-reveal, stagger, layout transitions
- **CSS for:** hover, focus, micro-interactions, loading shimmer, photo grayscale, button fills

Animating hovers in JS causes re-render thrash. Keep motion in CSS unless it needs orchestration.

### Preferred motion types

- fade-in
- blur-to-clear
- scale (0.96 → 1)
- clip-path reveal
- underline draw
- stagger (60–100ms siblings, 150–250ms sections)

### Avoid

- bouncing
- spinning
- particle effects
- anything that competes with the photo

### Easing

- Default entrance: `[0.22, 1, 0.36, 1]` (ease-out-quart)
- State changes: `[0.4, 0, 0.2, 1]` (ease-in-out)
- Never linear for UI motion

### Duration

- Micro: 150–200ms
- Standard: 300–500ms
- Cinematic: 600–1200ms
- Anything over 400ms must respect `prefers-reduced-motion`

---

## Performance Budget

- Lighthouse mobile: ≥ 90 (all four categories)
- LCP: < 2.5s on 4G throttled
- CLS: < 0.1
- INP: < 200ms
- 60fps on mid-range Android (Moto G Power class)
- No animation longer than 1.2s
- All animations gated by `prefers-reduced-motion`
- `<picture>` with AVIF → WebP → JPEG fallback for all photos
- Hero image: AVIF, preloaded, 1600px max
- Gallery: JPEG (currently), lazy-loaded

---

## File Structure

```
src/
  components/
    primitives/
      Section.tsx          # scroll-triggered section wrapper
      reveal.ts            # shared animation constants & variants
      Preloader.tsx        # initial "A & K" splash
      EnvelopeIntro.tsx    # wax-seal envelope animation
      MusicControl.tsx     # floating audio toggle
      CustomCursor.tsx     # desktop-only, disabled on touch
    sections/
      Hero.tsx
      Countdown.tsx
      Verse.tsx
      Story.tsx            # YouTube live stream embed
      Events.tsx
      EventCard.tsx
      Family.tsx
      FamilyGroup.tsx
      Venue.tsx
      FloatingGallery.tsx
      CylinderCarousel.tsx
      Lightbox.tsx
      RSVP.tsx
      RSVPForm.tsx
      Footer.tsx
  hooks/
    useSmoothScroll.tsx
    smooth-scroll-context.ts
  lib/
    ics.ts
    maps.ts
  content/
    content.ts
  styles/
    tokens.css
    base.css
  App.tsx
  main.tsx
```

---

## Milestones

Each milestone ships when all success criteria are met AND you've reviewed the demo. Don't move on until you have.

### M0 — Project setup ✅ DONE

Goal: A Vite app that builds, lints, and runs.

- [x] `npm install && npm run dev` boots in < 1s
- [x] `npm run build` passes
- [x] TypeScript strict, no any
- [x] Tailwind tokens + base CSS work
- [x] Lenis smooth scroll active
- [x] Dev server reachable from mobile on same network

### M1 — Content layer + tokens ✅ DONE

Goal: All copy and design tokens locked in code.

- [x] `content.ts` exports typed content matching the Content section above
- [x] `tokens.css` has full theme palette + animation tokens
- [x] `base.css` has reset, body, .photo-bw utility
- [x] App renders all sections as empty placeholders with correct vertical order
- [x] Hero shows "Anjana & Krishnaprasad" with Sept 13, 2026 + Cherthala
- [x] Countdown shows live ticker to Sept 13, 2026 10:00 IST

### M2 — Hero, Countdown, Footer ✅ DONE

Goal: Top of page feels complete and cinematic.

- [x] Hero: pre-title, names (clip-path reveal), date (tap-to-reveal), RSVP CTA, ken-burns background, scroll indicator
- [x] Countdown: four cards (days/hours/minutes/seconds), tabular-nums, updates every 1s
- [x] Footer: names, date, copyright
- [x] All entrance animations respect prefers-reduced-motion
- [x] Mobile (360px), tablet (768px), desktop (1440px) all look correct

### M3 — Family + Events ✅ DONE

Goal: Family and event timeline are visually balanced with the rest.

- [x] Family: bride side and groom side, gold flourish divider between
- [x] Events: timeline with dots, two EventCards (Wedding + Reception)
- [x] All cards have map links and event descriptions
- [x] Stagger animations between cards
- [x] Tested at 360 / 768 / 1440px

### M4 — Venue + Maps ✅ DONE

Goal: Venue section is functional and informative.

- [x] Map embed loads only when in view (lazy iframe)
- [x] "Open in Maps" + "Directions" + "Add to Calendar" buttons work
- [x] `.ics` file generates and downloads on "Add to Calendar" click
- [x] Travel & Stay section collapsible
- [x] No layout shift when map loads

### M5 — Gallery ✅ DONE

Goal: Photo grid with carousel and lightbox.

- [x] 3D cylinder carousel with pointer-drag physics
- [x] All photos grayscale by default
- [x] Lightbox: keyboard nav (arrow keys, Escape), focus trap, swipe on mobile, pinch-to-zoom
- [x] Dot indicators for carousel navigation
- [x] Responsive at 360 / 768 / 1440px

### M6 — RSVP ✅ DONE

Goal: RSVP form works end-to-end.

- [x] Form fields: name, guest count, event checkboxes, dietary select, message textarea
- [x] Validation: name required, guests 1–10
- [x] Submit opens WhatsApp deep link (pre-filled) AND posts to webhook (if configured)
- [x] Success state with checkmark animation
- [x] Works with keyboard only

### M7 — Interactions & polish ✅ DONE

Goal: Every interaction feels premium.

- [x] All buttons have hover fill, focus ring, active state
- [x] Smooth scroll from RSVP CTA → RSVP section works
- [x] Music control persists, volume is 30%, has play/pause with correct icon
- [x] Custom cursor on desktop, disabled on touch (`hover: none`)
- [x] Reduced-motion users get static layout, no auto-playing audio
- [x] Preloader (2s) + EnvelopeIntro (tap-to-open) flow
- [x] Date reveal (mirror → spin → land) in Hero

### M8 — Pre-flight & deploy 🔴 IN PROGRESS

Goal: Production-ready.

- [ ] Test on iPhone Safari, Android Chrome, WhatsApp in-app browser, Instagram in-app browser
- [ ] Lighthouse mobile ≥ 90 on all four categories
- [ ] No console errors or warnings
- [ ] All images optimized to AVIF (with WebP + JPEG fallbacks)
- [ ] Hero images uploaded to `public/hero/` (currently missing)
- [ ] Live stream YouTube video ID configured (currently placeholder)
- [ ] Deployed to Vercel/Netlify, custom domain pointed
- [ ] Open Graph image renders correctly when shared to WhatsApp/Instagram

---

## Definition of Done (every milestone)

A milestone is not done when the code is written. It's done when:

- All success criteria in the milestone are met
- Tested on iPhone Safari, Android Chrome, WhatsApp in-app browser
- Lighthouse mobile score ≥ 90
- No console errors or warnings
- No `any`, no `console.log`, no commented-out code
- Animations respect `prefers-reduced-motion`
- Review pass: responsiveness (360 / 768 / 1440), accessibility, animation smoothness, code readability, performance
- User has reviewed the demo before moving on

---

## The WhatsApp Test

Most guests will open this site from inside WhatsApp's in-app browser. This is the real test environment.

Before considering any milestone done:

- Test in WhatsApp in-app browser on iOS
- Test in WhatsApp in-app browser on Android
- Test in Instagram in-app browser
- Test in Safari iOS
- Test in Chrome Android

Common things that break in these browsers:

- `100vh` (use `100svh` or `100dvh`)
- Custom cursors (disable on `(hover: none)`)
- CSS gradients and some filters
- Audio autoplay (always require user interaction)
- Smooth scroll libraries (Lenis needs `touchMultiplier` tuned)
- Fixed positioning with dynamic keyboards

If it doesn't work in WhatsApp, it doesn't work.

---

## Risks & Open Questions

| Risk | Mitigation |
|------|-----------|
| Hero images not uploaded yet | `public/hero/` directory missing — user needs to provide `couple.jpg`/`.webp`/`.avif` |
| Live stream not configured | `liveStream.youtubeVideoId` is empty — user needs to provide YouTube video ID |
| RSVP Web3Forms not configured | Optional — WhatsApp is primary path, webhook is fallback |
| Photos not in B&W source | The `.photo-bw` CSS filter applies regardless of source. Originals should still be color |
| WhatsApp blocks autoplay audio | Music control requires user tap to start, no autoplay |
| Custom fonts fail to load in low-bandwidth | `font-display: swap` on all Google Fonts. System fallbacks provided |
| Date math errors in countdown | Use ISO string in `content.ts`, `new Date(wedding.iso).getTime()` for target |

---

## Working Notes

Capture decisions, blockers, and lessons learned here during each milestone. Move completed milestone notes to a "Lessons Learned" appendix.

*(No active working notes at this time.)*
