# Gallery — Implementation

Status: Complete

---

# Overview

The gallery uses a responsive flex-column masonry layout. Photos are placed using a shortest-column algorithm for a natural editorial feel. No canvas, no WebGL, no 3D engine.

---

# Layout

- **Mobile** (≤1023px): 2 columns
- **Desktop** (≥1024px): 3 columns
- Breakpoint change is live — no page reload needed
- Each photo has a `span` property (`tall`, `wide`, `square`) that influences its proportional height in the column

The `EditorialGallery` component:
1. Reads column count via `window.matchMedia('(min-width: 1024px)')`.
2. Distributes items into columns using a shortest-column algorithm.
3. Each column is a flexbox column.

---

# Photo Cards

`EditorialGalleryCard` renders each photo:
- `<picture>` element with AVIF + WebP sources
- `loading="lazy"` (with `priority` flag for the first image)
- `sizes` attribute computed dynamically
- Alt text from `content.ts`
- Click/tap opens the Lightbox

---

# Lightbox

`Lightbox.tsx` (in `src/components/sections/`):
- Opens when an image is selected — shows full image with backdrop
- Swipe left/right to navigate between photos
- Pinch-to-zoom on multi-touch devices
- Double-tap to zoom to 2.5×
- Keyboard navigation: arrow keys, Escape to close
- Focus trap inside the dialog
- `aria-label` for screen readers: "Photo N of M"
- Photo counter bottom-right corner
- No caption overlay (caption field removed from data model)

---

# Previous Architecture (Archived)

The gallery previously used a custom 3D sphere engine (`src/engine/`) built on raw WebGL2. This was archived in favor of the simpler masonry layout for reliability, performance, and a more direct browsing experience. The engine was removed entirely (no files remain in `src/engine/`).
