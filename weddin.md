# Problems to Fix (Archive)

> **This file is archived.** The current living issue tracker is `Problems-to-fix.md`.
> This file preserves the original P-006/P-007 discussion for reference.

---

## P-006 — Gallery canvas was too small and photo transforms didn't move them off the stack

**Original problem (now resolved):** The gallery rendered as a 6x vertical stack instead of a scattered canvas. All photos positioned at `left: 0, top: 0` with transforms that only nudged them a few pixels.

**Resolution:** Gallery was rewritten as a 3D CSS perspective cylinder carousel (`CylinderCarousel.tsx`), eliminating the scatter-positioning architecture entirely.

---

## P-007 — Story section → YouTube live stream

**Status:** Story component rewritten as YouTube live stream embed. Pending YouTube video ID configuration from user.

**See:** `Problems-to-fix.md` P-007 for current status and action items.
