# Problems to Fix

Living list of design/UX/behavior issues for the wedding site.

Status legend: 🔴 Open  🟡 In Progress  🟢 Resolved

---

## 🟢 P-001 — Story → Events gap feels empty

**Resolution:** Story section replaced with YouTube live stream embed. Gap no longer exists.

---

## 🟢 P-002 — Gallery needs a kinetic canvas, not a static grid

**Resolution:** M5A grid stays as fallback. M5B Gallery Engine is the primary experience.

---

## 🟢 P-003 — Gallery: true interactivity (drag, rotate, scale)

**Resolution:** M5B engine implements drag, inertia, and pinch via unified Pointer Events.

---

## 🟢 P-006 — Gallery canvas sizing and photo transforms

**Resolution:** Gallery rewritten as 3D sphere billboard engine in `src/engine/`.

---

## 🔴 P-007 — Story section → YouTube live stream (pending configuration)

**Location:** `src/components/sections/Story.tsx`

**Status:** Component implemented with pre/live/post states. Live stream is not yet configured.

**What's missing:**
- `liveStream.youtubeVideoId` in `content.ts` is empty
- `liveStream.channelName` / `liveStream.channelUrl` are empty
- `liveStream.liveStartIso` not set

**Action needed from user:**
1. Provide YouTube video ID for the live stream
2. Confirm channel name and URL
3. Confirm live start time (default to wedding ISO)

---

## 🟡 P-008 — Hero images not uploaded

**Location:** `public/hero/`

**Symptom:** Hero references `/hero/couple.{avif,webp,jpg}` but files are missing. Hero renders with gradient fallback.

**Action:** Upload hero couple photos in AVIF, WebP, and JPEG.

---

## 🟡 P-009 — Missing `wa.ts` helper file

**Symptom:** WhatsApp URL building is inline in components. Not centralized as planned.

**Impact:** Low. Functionality works.

---

## 🟡 P-010 — `assets/` directory is empty

**Symptom:** `src/assets/` exists but contains no files.

**Impact:** Cosmetic.

---

## 🟡 P-011 — Color token inconsistency

**Symptom:** Some components reference `text-muted` / `text-text-muted`; tokens define `--color-text-muted`.

**Impact:** Low.

---

## 🔴 P-012 — Gallery: Phase 4 UX gaps (interaction model)

**Symptom:** 17 photos render on a 3D sphere, but the UX reads as a floating cluster:
- No stable focal image / center frame
- No visible interaction hint
- No obvious control for opening a photo
- All images compete for attention

**Current code issues:**
- `console.log` statements remain in `src/engine/Engine.ts`
- Lightbox not wired to engine pause/resume (`setLightboxOpen` never called from React)
- Pinch zoom moves camera instead of globe scale
- Canvas uses `touchAction: 'none'`, which can block page scroll on mobile
- Engine emits `onSelect(photoId)` but Lightbox expects index — no adapter exists
- Smoothing constants are frame-rate dependent
- `meshes.find()` inside render loop is O(N²)
- Long-press state doesn't affect visuals (no center frame yet)

**Remediation direction (approved):**
1. Fix center frame + active selection in React overlay
2. Add depth layers (center / front orbit / back orbit)
3. Snap-to-nearest on release
4. Depth styling: opacity, scale, grayscale, subtle blur
5. Temporary interaction guide + chevrons
6. Fix lightbox-engine wiring
7. Fix pinch/touch scroll safety
8. Remove console.log

---

## 🟡 P-013 — Admin auth architecture drift

**Symptom:** Local admin code expects random token auth. Deployed Supabase edge function expects JWT auth. Mismatch blocks `/admin` in deployed builds.

**See:** `fix-db.md` and `DB.md` for diagnosis and options.
