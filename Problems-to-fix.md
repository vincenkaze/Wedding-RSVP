Problems to Fix



Living list of design/UX issues for the wedding site.
Status legend: 🔴 Open  🟡 In Progress  🟢 Resolved



🟡 P-001 — Story → Events gap feels empty

Location: Between "Our Story / How It Began / [prologue]" and "Join Us / The Celebration"

Symptom: The storyTimeline array is currently empty, so the Story section ends abruptly after the prologue. There is a visible whitespace void before Events begins. It reads as a content gap, not a deliberate pause.

Root cause:  line 205:

export const storyTimeline: StoryMilestone[] = []

The Story component still renders a vertical timeline with no milestones.

Fix options — ranked by impact vs. effort:

Option A (Recommended) — Animated bridge component

Add a dedicated visual bridge between Story and Events. A new component StoryBridge that:





Sits between the two sections (rendered in App.tsx)



Contains a centered ornament: a thin gold line that draws from top to bottom on scroll-into-view



A heartbeat-pulsing dot in the center



Subtle parallax: the dot floats up/down 8px on a slow loop



Two Malayalam/Sanskrit wedding glyphs fade in from left and right (e.g. ശുഭ / शुभ meaning "auspicious")

Why this over B/C: it adds new emotional content rather than decorating the gap, and it is cheap (one small component, no external deps).

Cost: ~40 lines, 1 new file, no new deps.

Decision needed from user before implementation.



🟡 P-002 — Gallery needs a kinetic canvas, not a static grid

Location:  — currently a plain 2-col mobile / 3-col desktop grid with lightbox.

Symptom: The gallery is the most content-heavy section of the site and currently the most boring. It feels disconnected from the rest of the premium, animated experience. A static grid is a missed opportunity for emotional engagement.

User request: "Mouse-Reactive Floating Image Gallery, an Interactive Drifting Grid, or a Kinetic Canvas"

All three are real, distinct patterns. Here is the difference and my recommendation:

Option A — Mouse-Reactive Floating Gallery (RECOMMENDED)

What it is: Images float with slight random drift. As the cursor moves over the section, nearby images gently push away from the cursor (like a magnetic repulsion). Click opens lightbox.

Visual: Premium, alive, does not feel like a grid. Each image has its own subtle idle animation (slow rotation, gentle Y-axis float).

Stack: framer-motion for entrance + idle float; plain mousemove listener with requestAnimationFrame for performance; no new deps.

Option B — Interactive Drifting Grid

A 3-column grid where each image has a slow constant velocity in a random direction. When you hover, the image pauses. On click, lightbox.

Verdict: Not recommended. Wrong tone for a wedding.

Option C — Kinetic Canvas

Images in 3D space (z-depth), drift slowly forward. Cursor controls parallax.

Verdict: Not recommended. Too heavy for the use case.

Recommendation: Option A — Mouse-Reactive Floating Gallery.



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



Photos gently return toward a "rest" position when released (like a magnet pulling them back to a loose grid)

Stack (one new dep): @use-gesture/react for unified pointer/touch gesture handling (~3KB gzipped), framer-motion (already installed), CSS transform: translate3d() rotate() scale().

Effort: ~280 lines. Replaces  and .  unchanged.

Why this over the simpler Option A from P-002: The user explicitly said interactable — animation-only would be a half-measure.

Decision needed: Confirm full interactive version (drag + rotate + scale + click for lightbox).



🟡 P-006 — FloatingGallery currently renders as a 6x vertical stack, not a scattered canvas

Problem confirmed by DOM inspection (dev server, 1280px viewport):





All 6 photos are positioned at left: 0–2px, top: 0–51px — they are stacked in a single column on the left edge of the canvas



Transforms are correctly applied: translateX(3.4px) translateY(10.7px) rotate(0.17deg) etc. (scatter positions work)



But transforms are relative to the figure's natural position (0,0), so they only nudge the photos by a few pixels from a vertical stack



Photos have position: absolute (good) but no top / left set in the parent (bug)



The parent canvas has no scatter positions — each photo inherits position: absolute, top: 0, left: 0 and they all collide at origin



Visually: 6 photos overlap at the top-left of a 400–550px tall canvas, looking like a single stack

Root cause:  does not pass the scatter position to the child as top / left props. The child FloatingPhoto only uses the scatter position for transforms, not for the absolute positioning offset.

Fix:





In , each <FloatingPhoto> needs style={{ top: '...%', left: '...%' }} (or px values) derived from the scatter position



Scatter positions should be expressed as percentages of the canvas, not pixels, so they scale with the canvas



Then the framer-motion transforms (translateX/Y) on top of that base position create the "scattered + drift" effect



Add z-index: 0–6 baseline ordering so photos don't all render on top of each other at the same y position

Test result on local dev server: Gallery is currently unusable. Photos stack vertically at left edge. Will not ship as-is.

Effort: ~30 lines of changes. Single file fix in .



🟡 P-007 — Replace "Our Story / How It Began" section with YouTube Live Stream

Location:  and  (the whole story section, currently showing prose + Malayalam/Sanskrit glyphs)

User decision: The couple live-streams the wedding on YouTube. The "Our Story / How It Began / [prologue] / ശുഭം / शुभ" prose section should be replaced with a live stream embed. Guests who can't attend in person should be able to watch the ceremony live from the wedding site.

What needs to change:





Replace  content with a YouTube live stream embed



Section structure:





Header: "Watch Live" or "Join Us Live" (instead of "Our Story")



Subhead: event date, time, timezone



YouTube embed: <div data-iframe-wrapper="true"><iframe> with the live stream URL, responsive 16:9 aspect ratio



Below embed: a small note explaining the embed is live on the day, and will show the recording after the event



Optional: a "Get notified when we go live" button (mailto or future webhook)



Pre-event state (before the live stream starts):





Show the YouTube channel's channel page (or a placeholder card) with the channel name, avatar, and a countdown to the live stream



Or: show a "Stream starts in X days / Y hours" countdown using the existing wedding.iso field



During-event state (stream is live):





Embed the live player



Show a "LIVE" badge in the corner



Post-event state (stream ended):





Auto-replace the live player with the recorded video (YouTube handles this automatically when the live broadcast ends — the iframe URL doesn't need to change)



Remove or keep the bridge component (StoryBridge)?





The bridge was added as a visual fix for the empty gap between Story and Events. With Story replaced by a YouTube embed, the bridge is no longer needed (the embed fills the visual space). Recommendation: remove StoryBridge from .



Remove the prose content from :





Delete storyPrologue and storyTimeline fields if no longer used



Add new liveStream field with: { youtubeVideoId: string, channelName: string, channelUrl: string, liveStartIso: string }

Required from user (cannot proceed without these):





YouTube video ID or channel handle. The video ID is the 11-character string after ?v= in the YouTube URL (e.g. dQw4w9WgXcQ). For a live stream, this is the ID of the scheduled live broadcast. The live URL looks like https://www.youtube.com/embed/<VIDEO_ID> for the embed.



Live start time (ISO 8601, e.g. 2026-09-13T10:00:00+05:30). Can reuse the existing wedding.iso field, but having a separate field gives flexibility if the stream starts earlier/later than the ceremony.



Confirm the Story section should be fully replaced (no toggle, no "our story AND live stream"), or if both should coexist (story prose above, embed below — would need a different layout).



Confirm the bridge component should be removed.

Effort once details are provided:





Rewrite : ~120 lines (was ~115 lines for prose version)



Update : add liveStream object, remove storyPrologue and storyTimeline



Update : remove <StoryBridge /> (1 line change)



Test: verify embed loads on 360px / 768px / 1440px, verify LIVE badge appears when stream is active, verify YouTube player is keyboard-accessible

Why YouTube over a self-hosted stream:





Free, reliable, global CDN



Mobile-optimized player out of the box (handles autoplay restrictions, picture-in-picture, fullscreen)



Recording is automatic — no extra work for post-event



Chat / live reactions built in (guests can comment in real time)



Works inside WhatsApp in-app browser, Instagram, etc.



What I need from you to proceed





P-001: pick A / B / C



P-002: confirm Option A (Floating Gallery), or push back if you want a different one



P-003: confirm full interactive version (drag + rotate + scale + click for lightbox)



P-006: fix the scattered canvas (one of the items above)



P-007: provide YouTube video ID + confirm Story is fully replaced + confirm bridge is removed

Once decided, I'll implement, then we test together on iPhone Safari, Android Chrome, and WhatsApp in-app browser before marking anything done.



Implementation order (proposed)





P-006 (scattered canvas fix) — fastest, unblocks shipping the gallery



P-007 (YouTube live stream) — replaces the Story section, requires your inputs



P-001 (Story bridge) — may become moot if P-007 replaces the section



P-002 + P-003 (Floating Gallery) — bigger change, but isolated to one section

Ready to implement as soon as you confirm the above.