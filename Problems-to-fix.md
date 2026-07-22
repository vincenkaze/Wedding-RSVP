# Problems to Fix

Living list of design/UX/behavior issues for the wedding site.

Status legend: 🔴 Open  🟡 In Progress  🟢 Resolved  🗄️ Archived

---

## 🟢 P-001 — Story → Events gap feels empty

**Resolution:** Story section replaced with YouTube live stream embed. Gap no longer exists.

---

## 🟢 P-002 — Gallery needs a kinetic canvas, not a static grid

**Resolution:** M5B Gallery Engine (3D sphere) was built, tested, then archived. The masonry gallery is now the primary experience. No canvas, no WebGL.

---

## 🟢 P-003 — Gallery: true interactivity (drag, rotate, scale)

**Resolution:** The 3D sphere engine implemented drag, inertia, and pinch — but it was archived. The masonry gallery offers tap-to-open lightbox with swipe, pinch-zoom, and double-tap zoom.

---

## 🟢 P-006 — Gallery canvas sizing and photo transforms

**Resolution:** Gallery rewritten as responsive flex-column masonry. Canvas sizing bug is moot — no canvas exists.

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

## 🔴 P-008 — Hero images not uploaded

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

## 🗄️ P-012 — Gallery: Phase 4 UX gaps (interaction model)

**Status:** Archived. The M5B 3D sphere engine was removed in favor of the masonry gallery. All Phase 4 interaction gaps are moot.

**Resolution:** Masonry gallery has no interaction ambiguity — photos are simply tapped to open the lightbox.

---

## 🟡 P-013 — Admin auth architecture drift

**Symptom:** Local admin code expects random token auth. Deployed Supabase edge function expects JWT auth. Mismatch blocks `/admin` in deployed builds.

**See:** `fix-db.md` and `DB.md` for diagnosis and options.

---

## 🔴 P-014 — Hero date not readable at a glance

**Location:** `src/components/sections/Hero.tsx`

**Symptom:** The date/location is hidden behind a `DateReveal` tap-to-flip interaction. First-time visitors must tap to see the date, which conflicts with the "readable at a glance" requirement.

**Action:** Remove `DateReveal` component. Show date and location inline. Add an invitation line (or keep the current pre-title). Awaiting user approval of new hero copy.
