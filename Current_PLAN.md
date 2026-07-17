# Wedding Invitation Project — Current Plan

Last updated: 2026-07-17

---

# Mission

Build a premium one-page wedding invitation website for Anjana & Krishnaprasad.
Emotional, elegant, cinematic. Optimized for WhatsApp, Instagram, and direct links.
Single-page React app, static deploy.

---

# Active Milestone: M5B — Gallery Engine

## Current Phase: Phase 4 — Premium Sphere Interaction

## Phase Status

### Phase 1 — Engine Boot ✅ Complete
- GalleryEngine boots and selects WebGL2
- Async texture load with `await Promise.allSettled()`
- Scene populated before first frame
- Scheduler stays active after load
- 17/17 draw calls confirmed
- First frame renders without any touch/pointer input
- Billboard shader clip-space bug fixed
- Initial globe rotation faces front hemisphere automatically

### Phase 2 — Scene Graph ✅ Complete
- `Scene` owns nodes
- `getVisibleNodes()` drives render traversal
- Visibility toggle works
- `scene.clear()` empties canvas
- Resize preserves camera aspect
- Non-PhotoMesh nodes can coexist

### Phase 3 — Static Globe ✅ Complete
- Fibonacci sphere with ~120 candidates
- Max-min angular selection for 17 well-separated anchors
- Minimum angular separation: 35.8°
- Stable world-space sphere geometry (radius 1.2)
- Camera-facing upright billboards via shader tangent/bitangent blend
- Frontness calculation with smooth fade/alpha
- Depth scale applied by `globeScale`
- Responsive camera distance + fixed card scale (DPR capped at 2)
- Static sphere reads as invisible 3D object on phone and desktop
- Auto-rotation present for idle state

### Phase 4 — Premium Sphere Interaction 🔄 In Progress
**Target:** Orbital gallery with fixed center frame, depth layers, snap selection, and clear interaction hints.

**Completed:**
- Interaction state machine scaffold: `idle` → `engaged` → `photoActive` → `photoOpen`
- Globe interaction scale (`targetGlobeScale`) added — camera unchanged
- Grayscale-to-color shader uniform (`uColorAmount`) added
- Unified Pointer Events picking against transformed quad AABB
- Long-press detection (~500ms) with drag cancellation (> 10px)
- Gesture arbitration in `interaction/`: mobile horizontal = globe, vertical = scroll

**Remaining (in order):**
1. Remove `console.log` from engine code
2. Wire `engine.setLightboxOpen(open)` from React so engine pauses/resumes with lightbox
3. Replace pinch `updateCameraZoom()` with `targetGlobeScale` adjustment
4. Change canvas `touchAction: 'none'` to `touchAction: pan-y` or use gesture-intent-dependent behavior
5. Add engine→React→Lightbox adapter mapping `photoId → index`
6. Implement fixed center frame in React overlay
7. Define active image + selected index state
8. Add depth-based styling (front/middle/back layers)
9. Implement snap-to-nearest on release
10. Add temporary interaction hint text + chevrons
11. Add keyboard and reduced-motion behavior

---

# Phase Gate

Phase 4 is complete when:

- Center frame is visually obvious (240–280px mobile, 320–380px desktop)
- One image is selected and snapped into center after release
- Three depth layers communicate 3D space clearly
- Interaction hint appears briefly then fades
- Lightbox opens from center frame and engine pauses
- Vertical scroll works on mobile without rotating globe
- No console errors or warnings
- Tested at 360px, 768px, and 1440px

---

# Reference Documents

- `Gallery_design.md` — architecture and philosophy
- `Gallery.md` — implementation spec and module status
- `Problems-to-fix.md` — open issues

---

# Milestone History

| Milestone | Status |
|-----------|--------|
| M0 — Project setup | ✅ Complete |
| M1 — Content layer + tokens | ✅ Complete |
| M2 — Hero, Countdown, Footer | ✅ Complete |
| M3 — Family + Events | ✅ Complete |
| M4 — Venue + Maps | ✅ Complete |
| M5A — Gallery Grid + Lightbox | ✅ Complete (fallback path) |
| M5B — Gallery Engine | 🔄 Phase 4 in progress |
| M6 — RSVP | ✅ Complete |
| M7 — Admin Dashboard | ✅ Complete (local) |
| M8 — Polish | 🔄 Partial |
| M9 — Pre-flight & deploy | ⏳ Pending M5B Phase 4 completion |
