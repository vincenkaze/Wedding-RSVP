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



What I need from you to proceed





P-001: pick A / B / C



P-002: confirm Option A (Floating Gallery), or push back if you want a different one



(Optional) any Malayalam/Sanskrit text you want in the bridge, or trust me to pick something tasteful

Once decided, I'll implement, then we test together on iPhone Safari, Android Chrome, and WhatsApp in-app browser before marking anything done.