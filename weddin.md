# Problems to Fix

> Living list of design/UX/behavior issues for the wedding site.
> Status legend: 🔴 Open  🟡 In Progress  🟢 Resolved

---

## 🟢 P-001 — Story → Events gap feels empty

**Location:** `src/components/sections/Story.tsx` and `StoryBridge.tsx`

**Symptom:** `storyTimeline: StoryMilestone[] = []` (content.ts line 205) — the Story section ends abruptly after the prologue, leaving a visible whitespace void before Events begins.

**Status:** Resolved. `StoryBridge` component is in place and rendering between Story and Events (`App.tsx` line 30).

---

## 🟡 P-002 — Gallery needs a kinetic canvas, not a static grid

**Status:** P-002 was the original "mouse-reactive floating" pattern proposal. Superseded by P-003/P-006.

---

## 🟢 P-003 — Gallery: true interactivity, not just float animation

**Status:** Implemented. `FloatingPhoto.tsx` and `FloatingGallery.tsx` exist with drag + pinch + rotate handle + scatter positions. `@use-gesture/react` is installed.

**But the implementation has bugs** — see P-006, P-007.

---

## 🔴 P-006 — Gallery canvas is too small AND photo transforms don't move them off the stack

**Problem confirmed by DOM inspection (just ran the dev server at 1280×720):**

The canvas div is `h-[400px] sm:h-[450px] md:h-[550px]` wide enough, BUT:

1. **Photo transforms are not moving photos off the origin.** Each photo receives a `transform: translateX(...) scale(...) rotate(...)` from the `useSpring` motion values, but the **sc