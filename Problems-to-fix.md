Problems to Fix

Living list of design/UX issues for the wedding site.
Status legend: 🔴 Open  🟡 In Progress  🟢 Resolved

🟡 P-001 — Story → Events gap feels empty

Location: Between "Our Story / How It Began / [prologue]" and "Join Us / The Celebration"

Symptom: The storyTimeline array is currently empty, so the Story section ends abruptly after the prologue. There's a visible whitespace void before Events begins. It reads as a content gap, not a deliberate pause.

Root cause:  line 205:

export const storyTimeline: StoryMilestone[] = []

The Story component still renders a vertical timeline with no milestones.

Fix options — ranked by impact vs. effort:

Option A (Recommended) — Animated bridge component

Add a dedicated visual bridge between Story and Events. A new component  that:

Sits between the two sections (rendered in App.tsx)

Contains a centered ornament: a thin gold line that draws from top to bottom on scroll-into-view

A heartbeat-pulsing dot in the center

Subtle parallax: the dot floats up/down 8px on a slow loop

Two Malayalam/Sanskrit wedding glyphs fade in from left and right (e.g., ശുഭ / शुभ meaning "auspicious")

Why this over B/C: it adds new emotional content rather than decorating the gap, and it's cheap (one small component, no external deps).

Cost: ~40 lines, 1 new file, no new deps.

Option B — Quote band

A wide horizontal quote between sections, e.g.:

"Two hearts. One journey. A lifetime of memories."

Centered, large display type, with a thin gold rule above and below. Fades in on scroll.

Cost: ~30 lines, no new deps.

Option C — Ornamental divider

A single full-width SVG ornament (floral/lotus/mandala) that scale-fades in on scroll. Lightest option, lowest impact.

Cost: ~20 lines, 1 SVG file.

Decision needed from user before implementation.

🟡 P-002 — Gallery needs a kinetic canvas, not a static grid

Location:  — currently a plain 2-col mobile / 3-col desktop grid with lightbox.

Symptom: The gallery is the most "content" section of the site and currently the most boring. It feels disconnected from the rest of the premium, animated experience. A static grid is a missed opportunity for emotional engagement.

User request: "Mouse-Reactive Floating Image Gallery, an Interactive Drifting Grid, or a Kinetic Canvas"

All three are real, distinct patterns. Here's the difference and my recommendation:

Option A — Mouse-Reactive Floating Gallery (RECOMMENDED)

What it is: Images float with slight random drift. As the cursor moves over the section, nearby images gently push away from the cursor (like a magnetic repulsion). Click opens lightbox.

Visual: Premium, alive, doesn't feel like a grid. Each image has its own subtle idle animation (slow rotation, gentle Y-axis float).

Stack:

framer-motion for entrance + idle float

Plain mousemove listener with requestAnimationFrame for performance

No new deps (already have framer-motion)

Tradeoffs:

✅ Stays readable — images don't fly around

✅ Works on touch (idle animation only, no mouse effect)

✅ Respects prefers-reduced-motion cleanly

❌ Requires careful tuning so it doesn't feel gimmicky

Effort: ~150 lines. Replace GalleryImage with a FloatingImage component. Keep Lightbox untouched.

Option B — Interactive Drifting Grid

What it is: A 3-column grid where each image has a slow constant velocity in a random direction. When you hover, the image pauses. On click, lightbox.

Visual: Mesmerizing but slightly chaotic. Closer to "art installation" than "wedding invitation."

Tradeoffs:

✅ Visually impressive when done well

❌ Hard to read — eyes don't know where to land

❌ Performance-heavy (many simultaneous transforms)

❌ Can feel inappropriate for a wedding (too "tech demo")

Verdict: Not recommended. Wrong tone for a wedding.

Option C — Kinetic Canvas

What it is: Images are placed in 3D space (z-depth), drift slowly forward. Cursor controls parallax. Background is a slow-flowing gradient or particle field.

Visual: Most cinematic option. Looks like a scene from a film.

Tradeoffs:

✅ Most "premium" of the three

❌ Heavy — needs  or a heavy CSS 3D layer

❌ Battery drain on mobile

❌ Hard to make accessible

❌ New dependency (three.js: ~600KB)

Verdict: Not recommended. Too heavy for the use case. The hero already gives the cinematic moment; gallery should be intimate, not theatrical.

Recommendation: Option A — Mouse-Reactive Floating Gallery

It matches the existing tone (premium but not flashy), stays performant, and gives the gallery a reason to be touched/explored. The mouse-reactive layer is the same pattern used by Awwwards SOTD sites.

Implementation order (proposed)

Once you pick the options above, the work order is:

P-001 (Story → Events bridge) — fastest, biggest emotional return. ~40 lines, single component.

P-002 (Floating Gallery) — bigger change, but isolated to one section. ~150 lines. No risk to other sections.

Verify responsive at 360px / 768px / 1440px after each.

Verify prefers-reduced-motion — both new components must gracefully disable animations.

Both options can ship in a single PR. Neither touches , , or the motion system tokens.

Files that will be created or changed

P-001 (if Option A picked)

New:

Changed:  — render the bridge between Story and Events

P-002 (if Option A picked)

New:  (replaces Gallery)

New:

Changed:  — swap Gallery → FloatingGallery

Unchanged: ,  (kept as fallback if you change your mind)

🟡 P-003 — Floating Gallery: true interactivity, not just float animation

Location:  (replaced by new )

Context: P-002 proposed a "mouse-reactive floating" pattern. On reflection that is animation-only — the images move, but the user cannot do anything with them except open the lightbox. The user wants the photos to feel like a physical scattered arrangement the user can grab, move, rotate, and inspect — closer to how someone handles printed photographs spread on a table.

The real ask: A Drifting Grid that is truly interactable:





Photos are scattered with random positions, rotations, and sizes (organic, not aligned to a grid)



Each photo drifts gently on its own (idle animation)



User can drag any photo to reposition it



User can rotate any photo (two-finger gesture on touch, or a corner handle on desktop)



User can scale (zoom in) by double-tap/double-click or pinch



Click on a photo opens the lightbox (existing Lightbox component is reused)



Photos have realistic depth: z-index based on most-recently-touched, soft shadow that follows rotation



Photos gently return toward a "rest" position when released (like a magnet pulling them back to a loose grid), so the gallery never becomes a chaotic mess



The whole thing is a calm canvas, not a fidget toy

Why this is the right scope: It matches the emotional tone (intimate, tactile, like handling a photo album) and it gives guests a reason to engage with the photos. The existing lightbox is preserved as the detail view. Mouse-only and touch-only must both work.

Stack (one new dep):





@use-gesture/react for unified pointer/touch gesture handling (drag, pinch, rotate) — ~3KB gzipped, replaces custom pointer math



framer-motion for entrance + idle drift animation (already installed)



CSS transform: translate3d() rotate() scale() for the actual transform — composited, GPU-accelerated



z-index ordered by most recent interaction



Soft shadow via CSS filter: drop-shadow() — follows rotation naturally

Component shape:

<FloatingGallery>
  {gallery.map((item, i) => (
    <FloatingPhoto
      key={item.src}
      item={item}
      initialPosition={scatterPositions[i]}  // pre-computed random {x, y, rotation}
      onActivate={() => setLightboxIndex(i)}  // click → open lightbox
    />
  ))}
</FloatingGallery>

FloatingPhoto internals (rough):





Idle: framer-motion animate loops a tiny x ± 4px and rotation ± 1.5° over 6–10s, randomised per photo, paused on hover/drag



Drag: @use-gesture/react useDrag updates x, y, rotation via useMotionValue; commits to state on release so position persists across re-renders



Rotate (touch): useGesture two-finger rotate gesture updates rotation directly



Rotate (desktop): a small corner handle on hover; mousedown+drag rotates



Scale: double-tap toggles scale: 1 → 2.2 with smooth spring; pinch-zoom via usePinch for touch



"Return home" magnet: on release, photo springs back toward its scatter position with a 1.2s delay so the user sees where it lands; the new position is also written to state so the layout evolves organically with use



Keyboard: each photo is a button with aria-label describing the photo; Tab moves between photos, Enter opens lightbox, Esc closes



Reduced motion: idle animation disabled, drag still works, no return-home spring (snaps instantly)

Performance:





All transforms are GPU-composited (translate3d, rotate, scale)



Idle animations are off the main thread (framer-motion uses requestAnimationFrame)



Drag handlers use passive: true listeners



No layout thrash — only transform and opacity change



Target: 60fps on mid-range Android (per the plan's perf budget)

Responsive behaviour:





Mobile (≤640px): 2 photos visible at a time in a vertical drift area; drag with single finger; pinch-zoom with two fingers; two-finger rotate



Tablet (641–1024px): 3–4 photos visible in a wider area



Desktop (≥1025px): 5–6 photos visible, scattered across a wider area; cursor changes to grab on hover, grabbing during drag; rotation handle visible on hover



All scatter positions are pre-computed (deterministic from photo index using a seeded PRNG) so layout is stable across reloads and viewports — no flash of unstyled content

Accessibility:





Every photo is a focusable button with descriptive aria-label (e.g. "Photo 3 of 6: The proposal at sunset")



Visible focus ring (gold, matches accent)



Lightbox trap focus as today



Drag is additive to keyboard — keyboard users can still open the lightbox via Enter and navigate normally



prefers-reduced-motion: reduce disables idle drift, return-home spring, and entrance animation; drag and click still work



Cursor on desktop changes to grab / grabbing to signal interactivity

Effort: ~280 lines (1 new component , 1 new component , plus a scatter-position helper). Replaces  and  —  is unchanged. One new dep: @use-gesture/react.

Why this is the right choice over the simpler "mouse-reactive" pattern from P-002: The user explicitly said interactable — they expect to grab, move, and rotate the photos. Animation-only (Option A from P-002) would have been a half-measure and would have been the wrong thing to build. Better to build the right thing once.

Decision needed: Confirm you want the full interactive version (drag + rotate + scale + click for lightbox). If yes, I will implement P-001, P-002, and P-003 in a single PR.

What I need from you to proceed

P-001: pick A / B / C

P-002: confirm Option A (Floating Gallery), or push back if you want a different one

(Optional) any Malayalam/Sanskrit text you want in the bridge, or trust me to pick something tasteful

P-003: confirm you want the full interactive version (drag + rotate + scale + click for lightbox)

Once decided, I'll implement, then we test together on iPhone Safari, Android Chrome, and WhatsApp in-app browser before marking anything done.



P-006 — Convert FloatingGallery from grid to scattered canvas with drag/rotate/scale

Problem confirmed by DOM inspection (just ran the dev server):





#gallery .grid is display: grid with 3 equal columns of ~325px each



All 6 figures sit at position: relative with transform: none



They are aligned to the grid, not scattered



@use-gesture/react is NOT in  (grep confirms zero matches)



useRepulsion only translates by ±24px on mousemove — no drag persistence, no rotate, no scale, no return-home spring



Idle animation is just a ±6px Y bob on the inner button — figures themselves don't drift

What needs to change (concrete next steps):





Install @use-gesture/react (the one new dep P-003 promised, ~3KB gzipped)





npm i @use-gesture/react



Needed for drag + rotate + pinch in a single hook



Replace the grid container (div class="relative grid grid-cols-2 md:grid-cols-3") with:





div class="relative w-full" style={{ height: '<computed viewport-relative height>' }}



Fixed-aspect canvas (e.g. aspect-[4/5] on mobile, aspect-[16/10] on desktop) so layout is stable



Each child is position: absolute with top and left from a pre-computed scatter position



Add scatter position helper — a new file :





Seeded PRNG (mulberry32) keyed on photo index so layout is deterministic



Output: { x: number, y: number, rotation: number, scale: number } per photo



Pre-computed once at module load, not per-render



Rewrite  to use useGesture:





useDrag for repositioning (commit to state on release)



Two-finger rotate via useGesture({ onPinch, onMove })



Double-tap / pinch for scale



Idle drift: small x ± 4px + rotation ± 1.5° loop, paused on hover/drag



Return-home spring: 1.2s delay then animate back to scatter position



Soft shadow via filter: drop-shadow() that follows rotation



Cursor: cursor-grab / cursor-grabbing on desktop



Update :





Remove useRepulsion (replaced by per-photo drag state)



Each photo gets a state slot for current {x, y, rotation, scale}



z-index ordered by most recent interaction



Reuse existing Lightbox component unchanged



Responsive scatter:





Mobile (≤640px): 2 photos visible, larger rotation range (±15°)



Tablet (641–1024px): 3–4 photos, ±10° rotation



Desktop (≥1025px): 5–6 photos, ±8° rotation



Pre-computed for each breakpoint, swap on resize



Accessibility (don't lose it):





Each photo stays a <button> with descriptive aria-label



prefers-reduced-motion: reduce disables idle drift and return-home spring, drag still works



Keyboard: Tab + Enter to open lightbox, Esc to close



Verify on:





iPhone Safari (test in WhatsApp in-app browser specifically)



Android Chrome



Desktop Chrome + Firefox



All three viewports: 360px, 768px, 1440px

Effort: ~280 lines (matches P-003 estimate). No changes to , , or any other section.

Order of work:





npm i @use-gesture/react



Create 



Rewrite 



Rewrite  (remove grid + repulsion)



Test at 360/768/1440



Test in WhatsApp in-app browser



Commit + push

Ready to implement as soon as you give the go-ahead.