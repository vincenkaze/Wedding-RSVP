# Problems to Fix

Living list of design/UX/behavior issues for the wedding site.
Status legend: 🔴 Open  🟡 In Progress  🟢 Resolved

---

## 🟢 P-001 — Story → Events gap feels empty

**Location:** `src/components/sections/Story.tsx`

**Symptom:** `storyTimeline` was empty, causing a visible whitespace void between Story and Events.

**Resolution:** Story section was replaced entirely with a YouTube live stream embed (per user decision). The gap issue no longer exists — the live stream fills the visual space.

**Status:** Resolved — section replaced.

---

## 🟢 P-002 — Gallery needs a kinetic canvas, not a static grid

**Status:** Superseded by P-003/P-006. The gallery now uses a 3D cylinder carousel instead of a static grid.

---

## 🟢 P-003 — Gallery: true interactivity (drag, rotate, scale)

**Status:** Implemented. `FloatingGallery.tsx` wraps a `CylinderCarousel` with `Lightbox`. The original floating/scatter implementation was replaced by the cylinder carousel approach. `@use-gesture/react` is installed and used for carousel drag physics.

---

## 🟢 P-006 — Gallery canvas sizing and photo transforms

**Status:** Resolved. The gallery was rewritten as a 3D CSS perspective cylinder carousel (`CylinderCarousel.tsx`), eliminating the original scatter-positioning bugs.

---

## 🔴 P-007 — Story section → YouTube live stream (pending configuration)

**Location:** `src/components/sections/Story.tsx`

**Status:** The Story component has been rewritten as a YouTube live stream embed with pre/live/post states. However, the **live stream is not yet configured**.

**What's implemented:**
- `Story.tsx` renders a YouTube iframe embed
- Pre-event state shows a countdown timer
- During-event state shows the live player
- Post-event state shows the recording (YouTube handles automatically)
- "LIVE" badge overlay when stream is active

**What's missing (blocks this from being 🟢):**
- `liveStream.youtubeVideoId` in `content.ts` is empty — user needs to provide the YouTube video ID
- `liveStream.channelName` and `liveStream.channelUrl` are empty
- `liveStream.liveStartIso` needs to be set (can default to `wedding.iso`)

**Action needed from user:**
1. Provide YouTube video ID (11-character string from the live stream URL)
2. Confirm channel name
3. Confirm live start time (or reuse wedding ISO)

---

## 🟡 P-008 — Hero images not uploaded

**Location:** `public/hero/`

**Symptom:** `content.ts` references `/hero/couple.jpg`, `/hero/couple.webp`, `/hero/couple.avif` but the `public/hero/` directory does not exist. The hero renders with a gradient fallback instead of the couple photo.

**Action needed from user:** Upload hero couple photos to `public/hero/` in multiple formats (AVIF, WebP, JPEG).

---

## 🟡 P-009 — Missing `wa.ts` helper file

**Location:** `lib/` directory

**Symptom:** `AGENTS.md` and `PLAN.md` reference `lib/wa.ts` for WhatsApp deep link helpers, but this file does not exist. WhatsApp URL building is done inline in `RSVPForm.tsx`.

**Impact:** Low — functionality works, but the helper isn't centralized as planned.

**Fix:** Either extract WhatsApp URL helpers to `lib/wa.ts` or update documentation to reflect current implementation.

---

## 🟡 P-010 — `assets/` directory is empty

**Location:** `src/assets/`

**Symptom:** The `src/assets/` directory exists but contains no files. If no local assets are needed, the directory can be removed.

**Impact:** Cosmetic only — no functional impact.

---

## 🟡 P-011 — Color token inconsistency

**Location:** Various components

**Symptom:** Tailwind classes reference `text-muted` and `text-text-muted`, but `tokens.css` defines `--color-text-muted`. The utility `text-muted` may not resolve correctly via Tailwind's `@theme`.

**Impact:** Low — visual styling may fall back to defaults.

**Fix:** Audit all `text-muted` / `text-text-muted` usage and ensure they match the token defined in `tokens.css`.
