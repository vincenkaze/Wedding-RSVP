Shows couple.displayName (Anjana & Krishnaprasad) — fine to reveal
Shows wedding.displayDate ("September 13, 2026") — revealed too
early
Shows wedding.location ("Cherthala, Kerala") — also revealed too
early
All three fade in with a stagger on page load, no interaction required
Shows the literal date by computing new Date(wedding.iso) and
rendering a DD:HH:MM:SS countdown. This is the strongest date leak in
the site — even if the Hero is hidden, the Countdown section exposes the
exact moment.
Shows wedding.displayDate + wedding.location again — minor
leak, but visible to anyone who scrolls to the bottom.
1. EnvelopeIntro — the 3s animation that plays once per visitor (already locks
content behind a tap, so guests have already "engaged" once they see the
Hero)
2. Hero section — the first scroll position after the intro fades
Unreveal — Hiding the Date at Entrance
The current Hero reveals "Anjana & Krishnaprasad" + "September 13, 2026" +
"Cherthala, Kerala" all at once, the moment the page loads. That gives the date
away before the user has done anything. The invite loses its sense of unfolding.
Goal: don't reveal the date in the first view. Make guests discover it as part of
the experience.
Current state (what's wrong)
src/components/sections/Hero.tsx (lines ~108-118):
src/components/sections/Countdown.tsx:
src/components/sections/Footer.tsx:
What "entrance" means here
Two definitions, both matter:
The user wants the Hero to not show the date. The intro can stay as is.
Three concrete options
Option A — "Save the Date" Card Tease (RECOMMENDED)

What it is: Replace the date text in the Hero with a small, tasteful "Save the Date"
card. The card is tappable (or hoverable on desktop) — it flips to reveal the actual
date.

[Anjana & Krishnaprasad] ← visible on load
┌──────────────┐
│ Save the │ ← visible on load, hand-written feel
│ Date │
│ (tap to │ ← subtle hint, fades in 0.5s later
│ reveal) │
└──────────────┘
[ RSVP NOW ] ← visible on load
On click/tap, the card flips 180° (CSS transform: rotateY(180deg) , perspective
1000px) to show the actual date. Once revealed, it stays revealed (state in
useState ).

Pros:
Keeps the date in the hero (no info architecture change)
Single component change, ~60 lines
Adds a micro-interaction that matches the existing premium tone
Still readable if user never taps (the "Save the Date" text is enough on its
own)
The flip is a single 3D transform — no new deps, works with prefersreduced-motion (just fades instead of flips)

Cons:
Some guests may not realize it's tappable. Fix with the "tap to reveal" hint
that fades in 0.5s after the card.
Screen readers see the date immediately (the hint text says "tap to reveal"
but the card is still announced as a button). Fix: aria-label="Save the
date. Tap to reveal the wedding date." and the revealed state
gets aria-live="polite" so the date is announced.

Effort: ~60 lines in Hero.tsx. New helper component SaveTheDateCard.tsx. No other
files touched.