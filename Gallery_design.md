# Gallery — Design & Architecture

---

# Philosophy

The gallery should feel like an intimate editorial spread — a curated collection of wedding memories presented with clarity and elegance. Photos should breathe, the layout should feel organic, and browsing should be effortless.

---

# Design Decisions

## Masonry over 3D sphere

The previous M5B gallery used a WebGL2 3D sphere engine. It was replaced with a flex-column masonry because:

- **Reliability:** No canvas sizing bugs, no GPU edge cases, no pointer-event arbitration
- **Performance:** Native CSS layout, no render loop, near-zero CPU/GPU cost
- **Simplicity:** Same code path for mobile and desktop
- **Usability:** Photos are immediately visible and scannable — no interaction hint needed
- **Accessibility:** Fully keyboard-navigable, works with screen readers, no canvas focus issues

## 2-column mobile, 3-column desktop

Mobile screens benefit from wider cards (fewer columns). Desktop can show more content at once without overwhelming the viewer.

## Shortest-column algorithm

Items are distributed column by column — each new item goes to the shortest column at that point. This produces a natural staggered look without manual positioning.

## No captions

Captions were removed because:
- The photos are self-explanatory (alt text covers accessibility)
- Extra text competes with the image in the lightbox
- Reduces visual clutter in the masonry tiles

## Lightbox as dialog

The lightbox uses `role="dialog"` with full keyboard support, focus management, and swipe/zoom gestures — matching the UX users expect from a photo gallery app.

---

# Image Pipeline

```
content.ts → GalleryItem (id, src, alt, span, width, height)
   ↓
EditorialGallery → columns (shortest-column)
   ↓
EditorialGalleryCard → <picture> with srcset
   ↓
Lightbox → full-screen viewer
```

Images are served as AVIF with WebP fallback. Multiple sizes (512, 1024, full) are available via `getSizes()` in `src/lib/gallery-assets.ts`.
