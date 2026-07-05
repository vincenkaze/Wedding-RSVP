# Envelope Intro — Implementation Status

## What it does

A tap-to-open wax-seal envelope animation that plays once per visitor. Displays an envelope that opens to reveal the couple's monogram, then the couple's names, then transitions to the main site.

## Current Implementation

**Files:**
- `src/components/primitives/EnvelopeIntro.tsx`

**Behavior:**
1. Renders on first visit (skipped if `sessionStorage` has `wedding-envelope-seen`)
2. SVG envelope with wax seal — user taps seal to "open"
3. Seal breaks with haptic feedback (`navigator.vibrate`)
4. Monogram (`{couple.bride.firstName[0]} & {couple.groom.firstName[0]}`) fades in
5. Couple name (`{couple.displayName}`) fades in
6. On complete: writes `sessionStorage`, unmounts, parent triggers `MusicControl` autoplay attempt
7. Skip button available for accessibility
8. `?intro=1` URL param forces replay

**Reduced motion:** If `prefers-reduced-motion: reduce`, envelope skips directly to idle state.

## Storage

| Key | Value | Storage |
|-----|-------|---------|
| `wedding-envelope-seen` | `'true'` | sessionStorage |

**Override:** `?intro=1` in URL forces replay.

## Current Issues

- None critical — envelope works as designed on revisit via sessionStorage
- Music autoplay attempts on envelope complete but may be blocked by browser policy (expected behavior)

## Notes

- The envelope uses Framer Motion for the wax seal break animation
- The intro is gated by a `show` state in `App.tsx` — parent calls `handleEnvelopeComplete` to unmount and render main content
- `CustomCursor` and `MusicControl` persist outside the envelope gate
