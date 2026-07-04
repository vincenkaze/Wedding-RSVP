Envelope Intro



State machine + behavior spec for 

What it does

A 3-second, 3-stage entry animation that plays once per visitor. Displays an envelope that opens to reveal the couple's monogram, then the couple's names, then transitions to the main site.

State machine

[Load]
  │
  ├─ prefers-reduced-motion? ──────────→ [Idle] (skip intro)
  │
  ├─ hasVisited() returns true? ──────→ [Idle] (skip intro)
  │
  └─ otherwise → [Envelope Closed] (0–0.3s)
                     │
                     ├─ t=0.3s: flap rotates open
                     │
                     ├─ t=0.8s: monogram fades in
                     │
                     ├─ t=1.2s: names fade in
                     │
                     └─ t=2.5s: onComplete() fires
                                    │
                                    ├─ localStorage[STORAGE_KEY] = 'true'
                                    │
                                    └─ [Envelope Open] → exit animation → unmount

Constants

const STORAGE_KEY = 'wedding-envelope-seen'
const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches

Storage contract





Key: wedding-envelope-seen



Value: 'true' after first visit



Override: ?intro=1 in URL forces replay (used for testing)

Current implementation (in )





useState(() => show ? true : false) decides if the intro should render



SVG envelope with motion.path for flap rotation (0.3s delay, 1s duration)



Monogram ({couple.firstName[0]}{couple.secondName[0]}) fades in at 0.8s



Couple name ({couple.displayName}) fades in at 1.2s



handleComplete writes localStorage, sets show=false, calls onComplete



Parent () calls handleEnvelopeComplete to gate the rest of the site

Known issues





No auto-dismiss: Intro only ends on onComplete (called by onComplete prop, but no current caller triggers it). The intro currently waits indefinitely. Needs a setTimeout(handleComplete, 2500) to auto-dismiss.



No skip state for reduced-motion users: They get the localStorage path but the intro still renders on first visit with no animation. Should fully bypass for prefersReduced.

Recommendations





Add auto-dismiss in a useEffect:

useEffect(() => {
  if (!show) return
  const t = setTimeout(handleComplete, 2500)
  return () => clearTimeout(t)
}, [show, handleComplete])



Make the envelope more realistic with a tear-away seal or wax stamp.



Add subtle haptic on mobile (navigator.vibrate) when the seal breaks.



Persist dismissal only on engagement: If the user scrolls or clicks during the intro, dismiss it. Don't force the full 2.5s.

