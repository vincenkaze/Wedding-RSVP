Wedding Invitation Project — Plan

Mission

Build a premium one-page wedding invitation website that feels emotional, elegant, and cinematic. Optimized for sharing via WhatsApp, Instagram, and direct link. Single-page React app, deployed as a static site, loads fast on mid-range Android over 4G.

Working Rules

These are the rules for this project. Follow them every milestone. If a rule needs to change, update this file — don't silently ignore it.

All copy lives in . No copy in JSX, components, or anywhere else. This is the only file non-developers should edit.

Tokenize before styling. Use the design tokens in  (--color-accent, --font-display, --ease-entrance, etc.). No hardcoded colors, fonts, or magic numbers in components.

No new dependencies without an explicit reason written in the milestone. If unsure, ask.

No speculative code. Don't add props, state, or abstractions "just in case." Build what's needed now.

Animations must respect prefers-reduced-motion. Every Framer Motion entrance and every CSS animation needs a reduced-motion fallback.

Mobile-first. Test at 360px, 768px, 1440px before claiming a milestone is done.

All images need alt text. Hero image needs fetchpriority="high" and AVIF/WebP sources.

Gallery images live in  as the gallery array — never hardcode image paths in components. Alt text, caption, span class, and priority flag all come from the content contract (see ).

WhatsApp in-app browser is the real test environment. If it doesn't work there, the milestone isn't done.

Definition of Done: every success criterion in the milestone is met, no console errors, no any, no commented-out code, lighthouse mobile ≥ 90, reviewed with the user.

One milestone at a time. Don't start M2 until M1 is signed off.

Working Notes (per session)

M5 — Gallery (in progress)





Confirmed Gallery section belongs in Information Architecture (already listed). Detailed design + implementation is in  in this folder.



Data contract decision: add gallery array to  with { id, src, alt, caption, span, priority } — same shape as Hero but for grid. Span values: 'wide' | 'tall' | 'square' for masonry-ish grid.



Lightbox stack: framer-motion AnimatePresence + useReducedMotion (static fade for reduced motion), useEffect for keyboard handlers, focus trap via a ref + tabIndex cycle, swipe via onPanEnd from framer-motion drag. No new dependencies.



Build order: (1) extend  with gallery data, (2) add 5–6 placeholder images to public/gallery/ with AVIF + WebP + JPEG, (3) implement  grid + , (4) wire into , (5) test 360/768/1440 + reduced motion.

Use a ## Working Notes section at the bottom of this file to capture decisions, blockers, and lessons learned during the current milestone. Once a milestone is done, move its notes into a "Lessons Learned" appendix at the bottom. Do not delete decisions — future milestones benefit from knowing why we did things.

Tech Stack

Layer

Technology

Notes

Runtime + Package Manager

Bun

faster than npm, drop-in

Build

Vite 8

zero-config React + TS

UI Framework

React 19 + TypeScript 6

strict mode, no any

Styling

Tailwind CSS 4

@tailwindcss/vite plugin, design tokens in @theme

Animation

Framer Motion 12

entrance, stagger, scroll-reveal only

Smooth Scroll

Lenis

tuned touchMultiplier for WhatsApp in-app

Icons

lucide-react

tree-shaken

Calendar

Custom

generates valid RFC 5545 VCALENDAR

Form Delivery

WhatsApp deep link + Web3Forms

WhatsApp is the primary path, email is fallback

No new dependencies without a written reason. If a new package is needed, add it in the relevant milestone with explicit justification.

Design Direction

Theme: Black-and-white with single accent color. Monochrome for timelessness, accent for emotional highlights.

Hero: Couple photo with b&w treatment. Couples names in elegant display serif. Date and venue in tracked-out caps.

Aesthetic: Kerala traditional invitation influence — Ganesha icon ornament, ornate dividers, serif typography. Modern, not nostalgic.

Photography: All photos in monochrome (CSS filter: grayscale(100%)) to match the black-and-white invitation print.

Mood: Sacred, elegant, intimate. Not festive. Not a SaaS landing page.

Content

All copy is locked in . Update there, not in components. The values below are the final copy for this wedding.

Couple

export const couple = {
bride: {
firstName: 'Anjana',
displayName: 'Anjana',
fullName: 'Anjana Sivanandan',
},
groom: {
firstName: 'Krishnaprasad',
displayName: 'Krishnaprasad',
fullName: 'Krishnaprasad Thulasidas',
},
displayName: 'Anjana & Krishnaprasad',
monogram: 'A & K', // for envelope intro
}

Wedding

export const wedding = {
date: 'Sunday, September 13, 2026',
dateShort: 'September 13, 2026',
time: '10:00 AM – 10:30 AM (Muhurtham)',
timeShort: '10:00 AM',
timezone: 'IST (UTC+5:30)',
iso: '2026-09-13T10:00:00+05:30', // used by Countdown
malayalamDate: '1202 Chingam 28',
weekday: 'Sunday',
day: 13,
month: 'September',
year: 2026,
location: 'Cherthala, Alappuzha, Kerala',
}

Venue

export const venue = {
name: 'Akhilanjali Convention Centre',
region: 'Cherthala, Alappuzha, Kerala',
address: 'Akhilanjali Convention Centre, Cherthala, Alappuzha, Kerala',
mapsQuery: 'Akhilanjali Convention Centre, Cherthala',
mapsEmbedUrl: '',
website: '',
}

Family

export const family = {
bride: {
label: "The Bride's Family",
parents: ['Mr. Sivannandan K.K', 'Mrs. Usha Sivanandan'],
address: 'Kaniyamparambil House, Pallippuram P.O, Cherthala, Alappuzha',
phone: ['+91 96567 48405', '+91 88480 38744'],
},
groom: {
label: "The Groom's Family",
parents: ['Late Mr. Thulasidas', 'Mrs. Ushakumari'],
address: 'Villadath House, Chelakkara (PO), Kolathur, Thrissur',
},
}

RSVP

export const rsvp = {
deadline: 'August 30, 2026',
contactNumber: '+919876543210', // TBD — confirm with user
contactEmail: '',               // TBD
successMessage: 'Thank you, {name}! We look forward to celebrating with you.',
events: ['Wedding Ceremony — Sept 13'],
dietaryOptions: [
'No dietary restrictions',
'Vegetarian',
'Vegan',
'Other (please specify in message)',
],
}

Verse (optional)

TBD with user. Common options: Sanskrit shloka, Bhagavad Gita verse, Bible verse, or a family quote. If user provides, use it. Otherwise omit the section.

Information Architecture (Final)

Single-page vertical scroll, in order. The "Our Story" section has been removed at user's request — wedding site jumps from Countdown to Events.

Hero — full-bleed b&w photo, Ganesha ornament, couple names, date, RSVP CTA, scroll indicator

Countdown — days/hours/minutes/seconds

Family — bride's family + groom's family, side-by-side with ornate divider (no Our Story)

Events — single Wedding Ceremony card (Muhurtham 10:00–10:30 AM, Sept 13)

Venue — Akhilanjali Convention Centre, embedded Google Map, address, directions, add to calendar

Gallery — b&w photos with lightbox

RSVP — name, guest count, dietary, message → WhatsApp + Web3Forms

Footer — couple names, date, location, small credit

Removed (per user): Our Story section. The timeline and prose about how they met is dropped.

Gallery section reference: see  in this folder for the full data contract (gallery field in ), component design (masonry-ish grid, <picture> AVIF/WebP/JPEG, grayscale), lightbox implementation (framer-motion + useReducedMotion, keyboard nav, focus trap, swipe gestures, portal), and a build checklist against M5 success criteria.

Animation System

Motion split (non-negotiable)

Framer Motion for: entrance, scroll-reveal, stagger, layout transitions

CSS for: hover, focus, micro-interactions, loading shimmer, photo grayscale, button fills

Animating hovers in JS causes re-render thrash. Keep motion in CSS unless it needs orchestration.

Photo treatment

All gallery and hero photos apply filter: grayscale(100%) contrast(1.05) brightness(0.98) in CSS. On hover/focus, the grayscale reduces slightly (grayscale(80%)) for a subtle color reveal — optional, can be omitted.

.photo-bw {
filter: grayscale(100%) contrast(1.05);
transition: filter 600ms cubic-bezier(0.22, 1, 0.36, 1);
}
.photo-bw:hover {
filter: grayscale(85%) contrast(1.05);
}

Preferred motion types

fade-in

blur-to-clear

scale (0.96 → 1)

clip-path reveal

underline draw

stagger (60–100ms siblings, 150–250ms sections)

Avoid

bouncing

spinning

particle effects

anything that competes with the photo

Easing

Default entrance: [0.22, 1, 0.36, 1] (ease-out-quart)

State changes: [0.4, 0, 0.2, 1] (ease-in-out)

Never linear for UI motion

Duration

Micro: 150–200ms

Standard: 300–500ms

Cinematic: 600–1200ms

Anything over 400ms must respect prefers-reduced-motion

Performance Budget

Lighthouse mobile: ≥ 90 (all four categories)

LCP: < 2.5s on 4G throttled

CLS: < 0.1

INP: < 200ms

60fps on mid-range Android (Moto G Power class)

No animation longer than 1.2s

All animations gated by prefers-reduced-motion

 with AVIF → WebP → JPEG fallback for all photos

Hero image: AVIF, preloaded, 1600px max

Gallery: AVIF, lazy-loaded, 1200px max

Total JS bundle target: < 200KB gzipped

Image specs

Slot

Size

Format

Notes

Hero

1600×1067

AVIF + WebP + JPEG

preloaded, ken-burns subtle

Gallery

1200×1500

AVIF + WebP + JPEG

grayscale, lazy

Favicon

32×32

SVG

Ganesha glyph

OG image

1200×630

AVIF + JPEG

social sharing

File Structure

src/
components/
primitives/
Section.tsx          # generic section wrapper, scroll-reveal
FadeUp.tsx           # child reveal variant
Preloader.tsx        # 2-second initial loader
EnvelopeIntro.tsx    # 1-time envelope animation
MusicControl.tsx     # bottom-right audio toggle
CustomCursor.tsx     # desktop-only, disabled on touch
sections/
Hero.tsx
Countdown.tsx
Family.tsx
Events.tsx
Venue.tsx
Gallery.tsx
RSVP.tsx
Footer.tsx
hooks/
useSmoothScroll.tsx    # Lenis context + provider
lib/
ics.ts                 # calendar file generation
wa.ts                  # WhatsApp deep link helpers
content/
content.ts             # ALL copy — single source of truth
styles/
tokens.css             # @theme + animation tokens
base.css               # reset + body + photo-bw
App.tsx                  # composition
main.tsx                 # root + providers

Milestones

Each milestone ships when all success criteria are met AND you've reviewed the demo. Don't move on until you have.

M0 — Project setup

Goal: A Vite app that builds, lints, and runs.

Success criteria:

bun install && bun run dev boots in < 1s

bun run build passes

TypeScript strict, no any

Tailwind tokens + base CSS work

Lenis smooth scroll active

Dev server reachable from mobile on same network

M1 — Content layer + tokens

Goal: All copy and design tokens locked in code.

Success criteria:

exports typed content matching the Content section above

has full theme palette + animation tokens

has reset, body, .photo-bw utility

App renders all sections as empty placeholders with correct vertical order

Hero shows "Anjana weds Krishnaprasad" with Sept 13, 2026 + Cherthala

Countdown shows live ticker to Sept 13, 2026 10:00 IST

M2 — Hero, Countdown, Footer

Goal: Top of page feels complete and cinematic.

Success criteria:

Hero: pre-title, names (clip-path reveal), date, RSVP CTA, ken-burns background, scroll indicator

Countdown: four cards (days/hours/minutes/seconds), tabular-nums, updates every 1s

Footer: names, date, copyright

All entrance animations respect prefers-reduced-motion

Mobile (360px), tablet (768px), desktop (1440px) all look correct

Lighthouse: Performance ≥ 90, Accessibility ≥ 90

M3 — Family + Events

Goal: Family and event timeline are visually balanced with the rest.

Success criteria:

Family: bride side and groom side, gold flourish divider between

Events: vertical timeline with dots, four event cards (or just two for the engagement+reception)

All cards have map links and event descriptions

Stagger animations between cards

Tested at 360 / 768 / 1440px

M4 — Venue + Maps

Goal: Venue section is functional and informative.

Success criteria:

Map embed loads only when in view (lazy iframe)

"Open in Maps" + "Directions" + "Add to Calendar" + "Visit Website" buttons work

.ics file generates and downloads on "Add to Calendar" click

Travel & Stay section collapsible

No layout shift when map loads

M5 — Gallery

Goal: Photo grid with lightbox.

Success criteria:

Masonry-ish or simple 2/3 column grid (responsive)

All photos grayscale by default

Lightbox: open on click, keyboard nav (arrow keys, Escape), focus trap, swipe on mobile

Each image:  with AVIF + WebP + JPEG, lazy-loaded

Hero + gallery all in .photo-bw class

M6 — RSVP

Goal: RSVP form works end-to-end.

Success criteria:

Form fields: name, guests (number), events (checkboxes), dietary, message

Validation: name required, guests 1–10

Submit opens WhatsApp deep link (pre-filled) AND posts to webhook (if configured)

Success state with checkmark animation

Webhook URL in  for future backend (currently optional)

Works with keyboard only

M7 — Interactions & polish

Goal: Every interaction feels premium.

Success criteria:

All buttons have hover fill, focus ring, active state

All links have underline-on-hover (gold, draw animation)

Smooth scroll from RSVP CTA → RSVP section works

Music control persists, volume is 30%, has play/pause with correct icon

Custom cursor on desktop, disabled on touch ((hover: none))

Reduced-motion users get static layout, no auto-playing audio, no parallax

M8 — Pre-flight & deploy

Goal: Production-ready.

Success criteria:

Test on iPhone Safari, Android Chrome, WhatsApp in-app browser, Instagram in-app browser

Lighthouse mobile ≥ 90 on all four categories

No console errors or warnings

Bundle size < 200KB gzipped

All images optimized to AVIF (with WebP + JPEG fallbacks)

.env keys for RSVP webhook set

Deployed to Vercel/Netlify, custom domain pointed

Open Graph image renders correctly when shared to WhatsApp/Instagram

Definition of Done (every milestone)

A milestone is not done when the code is written. It's done when:

All success criteria in the milestone are met

Tested on iPhone Safari, Android Chrome, WhatsApp in-app browser

Lighthouse mobile score ≥ 90

No console errors or warnings

No any, no console.log, no commented-out code

Animations respect prefers-reduced-motion

Review pass: responsiveness (360 / 768 / 1440), accessibility, animation smoothness, code readability, performance

User has reviewed the demo before moving on

The WhatsApp Test

Most guests will open this site from inside WhatsApp's in-app browser. This is the real test environment.

Before considering any milestone done:

Test in WhatsApp in-app browser on iOS

Test in WhatsApp in-app browser on Android

Test in Instagram in-app browser

Test in Safari iOS

Test in Chrome Android

Common things that break in these browsers:

100vh (use 100svh or 100dvh)

Custom cursors (disable on (hover: none))

CSS gradients and some filters

Audio autoplay (always require user interaction)

Smooth scroll libraries (Lenis needs touchMultiplier tuned)

Fixed positioning with dynamic keyboards

If it doesn't work in WhatsApp, it doesn't work.

Risks & Open Questions

Risk

Mitigation

The actual photos aren't in black & white in source

The .photo-bw CSS filter applies regardless of source. Originals should still be color (easier to repurpose), the filter creates the look on-site.

WhatsApp blocks autoplay audio

Music control requires user tap to start, no autoplay.

Custom fonts fail to load in low-bandwidth

font-display: swap on all Google Fonts. Body and display fonts have system fallbacks.

RSVP webhook not ready at launch

WhatsApp deep link is the primary submission path. Webhook is optional.

Date math errors in countdown

Use ISO string in , new Date(wedding.iso).getTime() for target. Test with mocked clock.