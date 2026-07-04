# Unreveal — Hiding the Date at Entrance

## Problem

The Hero originally revealed "September 13, 2026" + "Cherthala, Kerala" immediately on load, giving away the date before the guest has done anything. The invite loses its sense of unfolding.

## Goal

Don't reveal the date in the first view. Make guests discover it through interaction.

## Implemented Solution — Mirrored Bounce Reveal

The date text renders mirrored (backwards) with a looping bounce animation. The entire hero section shakes on each impact, drawing attention and creating a playful, tactile hint. On tap, the text spins 2.5 rotations and lands in its normal readable view with a gold underline draw.

### Visual Behavior

```
┌─────────────────────────────────────┐
│         [Anjana & Krishnaprasad]     │  ← visible, normal
│                                     │
│         ┌─────────────────┐         │
│         │  6202 ,31 rebmeS │        │  ← mirrored, bouncing
│         │  alarahK ,alahlerC │      │
│         └─────────────────┘         │
│                                     │
│         [ RSVP NOW ]                │  ← visible, normal
│                                     │
│              ↓ scroll               │
└─────────────────────────────────────┘
```

### Animation Timeline

| Time | Event |
|------|-------|
| 0.0s | Date text visible but mirrored (`rotateY: 180deg`) |
| 0.0s | Bounce loop starts: `translateY: 0 → -18px → 0` on 1.4s cycle |
| 0.0s | Hero section shake synced to bounce impact (`±3px` horizontal) |
| tap  | Text spins: `rotateY: 180 → 1080deg` (2.5 rotations) over 1.6s |
| tap  | Shake stops, bounce stops |
| 1.6s | Text lands at normal orientation, gold underline draws |

### Implementation Details

**Files changed:**
- `src/components/sections/Hero.tsx` — `DateReveal` local component, `dateRevealed` state
- `src/styles/base.css` — `hero-shake` keyframe animation

**How it works:**

1. `DateReveal` renders the date/location text inside a `motion.div` with `rotateY: 180` (mirrored)
2. A bounce animation loops: `translateY: [0, -18, 0]` with `times: [0, 0.4, 1]` so impact happens at 40% of the 1.4s cycle
3. The hero `<section>` gets class `hero-shake` which applies a matching shake keyframe — `translateX` oscillation timed to the bounce impact
4. On tap, `setRevealed(true)` triggers `rotateY: 1080` (2.5 spins from 180, landing at 0/normal)
5. `hero-shake` class is removed once revealed

**Reduced motion:** If `prefers-reduced-motion: reduce`, date renders normally without bounce/shake/interaction.

**Accessibility:**
- `aria-label` updates from "Tap to reveal the wedding date" to the actual date on reveal
- `cursor-pointer` + focus-visible outline for keyboard users

### What We Considered but Reverted

| Option | Why Reverted |
|--------|-------------|
| Curtain split reveal | Too complex for a 1.2s effect |
| "Save the Date" flip card | Extra visual design, user preferred simpler text-only approach |
| Gold foil scratch reveal | Overkill for the interaction model |
| Water splash particles | Didn't match the premium tone |
| Jelly/bounce easing | Too aggressive, user preferred the impact shake |
| Fluid breeze sway | Too subtle, not enough attention grab |
