# Hero Reveal — Implementation Status

## Decision

The hero uses a fade-up entrance for the pre-title and names, followed by an interactive 3D-card date reveal.

## Sequence

- Pre-title fades up
- Names reveal via clip-path + blur
- Date line fades up
- RSVP CTA fades up
- Date line shows bounce cue until tapped

## Date Reveal

- Native `<button>` with `aria-label`
- On tap: 3D rotate Y (3 full spins), underline draw
- Reduced motion: static text, no button, no bounce

## Files

- `src/components/sections/Hero.tsx`
- `src/content/content.ts`
- `src/styles/base.css`

## Not Included

- No curtain overlay
- No glow pulse
- No SVG mask
