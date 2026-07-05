Unreveal Animation



Spec for the unreveal (the way the hero image appears, "un-revealing" itself) in .

✅ Decision: Option A — "Curtain from middle" (curtain-from-middle split)





Two halves slide apart horizontally from the center seam, revealing the hero image and couple's names underneath.



Clean, symmetric, suits the "envelope → letter" metaphor that the rest of the site already uses.

Animation timeline







Time



Event





0.00s



Both halves fully closed (no gap)





0.30s



Halves start sliding outward (left half ←, right half →)





1.20s



Halves fully open; hero image and names are now visible





1.50s



Names start fading in (handled by existing nameReveal variant)





1.80s



Date underline draws (underline-draw class — already present)





2.10s



RSVP button fades in

Total: ~2.1 seconds, matching the existing envelope-intro pacing.

How it works





Add two <motion.div> overlays on top of the hero <picture>, one positioned left: 0; right: 50% and the other left: 50%; right: 0.



Each animates scaleX from 1 → 0 (using transform-origin set to the inner edge — left half uses right, right half uses left) over 1.2s, easing [0.22, 1, 0.36, 1].



Background color of the overlays matches the hero backdrop (bg-accent or bg-bg) so it looks like a single curtain that splits.



After 1.2s, both overlays have scaleX: 0, effectively gone; remove them from the DOM via AnimatePresence once exit completes (or just leave them at pointer-events-none — they won't intercept anything because they're at pointer-events: none).



Names/date/CTA use the existing variants (nameReveal, lineVariants) with STAGGER delays as before.

Reduced motion





If useReducedMotion() returns true, skip the curtain entirely. Halves render with opacity: 0 and never animate. The hero content fades in via the existing variants but with no sliding effect.

Accessibility





The two halves are aria-hidden.



The hero <section> keeps its existing aria-label.



No focusable elements inside the curtain; no keyboard interaction needed.

Files to change







File



Change









Add two <motion.div> curtain overlays + one useEffect or animation prop to trigger after a 300ms delay. Existing variants stay untouched.





 (optional)



Add a .curtain-half utility class if we want to keep JSX clean. Not required — inline style works.

Date + location highlight (the "clue" for skimmers)

Most guests skim. The date and place line is the real eye-magnet — give it a specific treatment so it reads as the anchor without breaking the premium feel.

Color: warm gold #d4a85a (with a #c8993e mid-stop for the gradient). Already in the existing palette, so it reads as intentional, not added. Avoid red, blue, or white-glow — all break the premium tone.

Treatment — three layers, in order of visual weight:





Gold gradient text on the date + location line only






bg-gradient-to-r from-[#d4a85a] via-[#c8993e] to-[#d4a85a]



bg-clip-text text-transparent



Slight weight bump: font-medium (or font-semibold if it still feels soft on mobile)



Underline color shift — the existing underline-draw animation stays, but its stroke uses var(--accent) (the gold token) instead of the default text color, on this line only



Soft glow pulse — very low opacity, 2s loop






box-shadow: 0 0 24px rgba(212, 168, 90, 0.15) keyframed between 0.15 → 0.25 → 0.15



Wrap the line in a <span> that holds the pulse so the gradient text is not affected



Reduced-motion: pulse becomes a static 0.15 glow, no loop

Why this works: gold is the "important moment" color in your palette. The gradient gives it dimension (not flat), the underline keeps the existing rhythm, the pulse is the eye-catch without being loud. Skimmers see gold → read date. Slow readers see it as part of the same ivory/brown language.

What to AVOID on this line:





❌ Red, blue, green — breaks palette



❌ White text or white glow on dark — looks cheap on wedding sites



❌ Bouncing or scaling animation — distracts from the names above



❌ Background highlight box (like a yellow marker) — too "sticky note"

Why NOT the other options





B (Letter fold) — visually clever, but folds are hard to time without a real SVG mask and break on the title text overlay.



C (Fade + blur) — too soft for a wedding site; the existing envelope intro already establishes the "lift" feeling. A curtain split gives a clearer "reveal" beat.



D (Vellum tear) — gorgeous but needs an SVG mask + a tear texture asset, which is overkill for a 1.2-second effect.

Implementation order





Add the two curtain <motion.div>s inside <section> (above the <picture> but below the gradient overlay).



Wire their initial / animate to use scaleX: 0 with a 0.3s delay.



Test at 360px / 768px / 1440px.



Test prefers-reduced-motion: reduce — halves should be opacity: 0, no animation.



Test on iPhone Safari + Android Chrome + WhatsApp in-app browser.

Ready to implement as soon as you push this file to GitHub.