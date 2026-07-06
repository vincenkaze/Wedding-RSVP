# Hero Unreveal / Date Reveal Transition

Current implementation in `src/components/sections/Hero.tsx`.

## Decision

The hero entrance uses a **fade-up entrance** for the pre-title and names, followed by an **interactive 3D-card tap-to-flip** for the date line. There is no curtain/split overlay on the background image.

## Overall sequence

| Time | Event |
|---|---|
| 0.00s | Pre-title fades up (`lineVariants`, delay 0) |
| ~0.08s | Names slide in via clip-path reveal (`nameReveal`, delay `STAGGER`) |
| ~0.16s | Date line container fades up (`lineVariants`, delay `STAGGER × 2`) |
| ~0.24s | RSVP CTA fades up (`lineVariants`, delay `STAGGER × 3`) |
| Continuous | Date line shows a bouncing “tap” cue until the guest interacts |

## Name reveal

- `nameReveal` variant on the `<h1>`.
- Hidden state: `opacity: 0, y: 24, filter: 'blur(4px)', clipPath: 'inset(0 100% 0 0)'`.
- Visible state: custom delay, duration `1.2s`, ease `[0.22, 1, 0.36, 1]`, clipPath resolves to `inset(0 0% 0 0)`.

## Date reveal component (`DateReveal`)

| State | Animation | Duration / Loop | Notes |
|---|---|---|---|
| Initial | Bouncing Y motion | Loop `1.4s` | `translateY: [0, -18, 0]`, ease `[0.45, 0, 0.55, 1]` |
| Initial | Rotate Y on text | Static `180deg` | `transformStyle: 'preserve-3d'`, perspective `800px` |
| On tap | Rotate Y to `1080deg` | `1.6s` | Three full rotations, ease `[0.22, 1, 0.36, 1]` |
| On tap | Bounce stops | — | Both lines settle upright |
| On tap | `underline-draw` class applied | CSS animation | Gold underline draws in from the left |

- `DateReveal` is a native `<button type="button">`.
- `aria-label` reads “Tap to reveal the wedding date” before reveal; after reveal it becomes `${displayDate}, ${location}`.
- `onReveal` prop is wired from `Hero` (currently `() => {}`).

### 3D flip internals

- A wrapping `<motion.div>` applies `perspective: 800px` inline.
- Each `<motion.p>` inside sets `transformStyle: 'preserve-3d'`.
- Both lines rotate together; the location line has a `+0.05s` delay within the flip.

## Reduced motion

- `prefersReducedMotion` is checked once per render in `Hero.tsx`.
- When reduced motion is active, `DateReveal` renders static text (`displayDate` + `location`) with no button, no bounce, and no flip.
- Entrance variants skip their hidden state so hero content appears immediately.

## Accessibility

- Date reveal uses a native button with a visible focus ring (`focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white`).
- No focusable elements inside the animated text (there is no curtain layer).
- Background image is decorative (`alt=""`).

## Files involved

| File | Role |
|---|---|
| `src/components/sections/Hero.tsx` | Hero layout, variants, and `DateReveal` component |
| `src/content/content.ts` | `wedding.displayDate`, `wedding.location`, `couple.displayName`, hero copy |
| `src/styles/base.css` | `.underline-draw` keyframes, `.ken-burns`, `.scroll-indicator`, reduced-motion resets |

## What this does NOT include

- There is **no curtain overlay** on the `<picture>`.
- There is **no gold gradient / glow pulse** on the date line.
- There is **no SVG mask** or teardown `AnimatePresence` cleanup.
