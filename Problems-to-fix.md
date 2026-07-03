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