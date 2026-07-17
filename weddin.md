# Problems Archive

This file preserves the original P-006/P-007 discussion for reference.
The current living issue tracker is `Problems-to-fix.md`.

---

## P-006 — Gallery canvas was too small and photo transforms didn't move them off the stack

**Resolution:** Gallery was rewritten as a 3D GPU-rendered sphere (`src/engine/`). The original CSS positioning stack bug is gone.

---

## P-007 — Story section → YouTube live stream

**Status:** Story component rewritten as YouTube live stream embed with pre/live/post states. Pending YouTube video ID configuration from user.

**See:** `Problems-to-fix.md` P-007 for current status and action items.
