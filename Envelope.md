# Envelope Intro — Implementation Status

## What it does

A tap-to-open wax-seal envelope animation that plays once per visitor session.

## Current Implementation

**Files:**
- `src/components/primitives/EnvelopeIntro.tsx`

**Behavior:**
1. Renders on first visit (skipped if `sessionStorage` has `wedding-envelope-seen`)
2. SVG envelope with wax seal — user taps seal to open
3. Haptic feedback via `navigator.vibrate`
4. Monogram (`{couple.bride.firstName[0]} & {couple.groom.firstName[0]}`) fades in
5. Couple name (`{couple.displayName}`) fades in
6. On complete: writes `sessionStorage`, unmounts, parent triggers music autoplay attempt
7. Skip button available for accessibility
8. `?intro=1` URL param forces replay

**Reduced motion:** Skips directly to main site.

## Storage

| Key | Value | Storage |
|-----|-------|---------|
| `wedding-envelope-seen` | `'true'` | sessionStorage |

Override: `?intro=1` in URL.

## Current Issues

- None critical — envelope works as designed on revisit via sessionStorage
- Music autoplay attempts on envelope complete but may be blocked by browser policy (expected behavior)
