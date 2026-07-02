🐛 Real bugs I found in your code
🔴 Critical (broken / won't render right)
1. Preloader.tsx line 41 — wrong color class

className="mt-6 font-display text-3xl tracking-tight text-ink sm:text-4xl"
Your tokens define --color-ink? No — you have --color-text. text-ink doesn't exist — so the initials inherit whatever the parent's color is. Fix: text-text (or rename your token to ink, but right now nothing's bound).

2. Venue.tsx — Venue name heading is broken

{venue.name.split(' ').map((word, i) => (
  <span key={i}>
    {word}
    {i === 0 && <br />}
  </span>
))}
This wraps each word in a span and inserts <br> after the first one — so "Domaine Carneros" renders as "Domaine\nCarneros" inside a single inline span stack. Should be on separate lines with the heading visually centered but each line is a block. Also i === 0 puts the break after "Domaine" — which is what you want, but the <span>s are inline. Fix: change spans to block class, or use a flex-col with the first word as one line and rest as the second.

3. App.tsx — Lenis + Preloader + EnvelopeIntro are fighting each other This is the biggest UX bug. Lenis hijacks window.scroll and scroll-behavior: smooth (in your base.css line 7) is also trying to handle scroll. Two scroll systems + a 2-second preloader + a manual envelope = users get stuck on a blank intro with no way to know what's happening. Your EnvelopeIntro auto-completes only after 1.2s flap animation + skip-click. There's no fallback for if Lenis takes over scroll before envelope exits.

4. CustomCursor.tsx line 76 — non-null assertion on a possibly-null ref

dot!.style.transform = ...
In strict TS this works, but you're using dot! in a requestAnimationFrame callback after you've checked it once. The cleanup is correct, but if React ever unmounts between the check and the RAF firing, this throws. Low priority, but real.

5. Lightbox.tsx line 213 — style={{ scale, x, y }} typo bug

style={{ scale, x, y }}
You defined x and y as useMotionValue(0). But motion values can't be passed as style like this — they need to be wrapped: style={{ scale, x: motionX, y: motionY }} only works if you ALSO have the motion parent bind. This is just a regular <motion.div>, so x and y are being set as the literal number 0 and never update when the user pans. Pinch-zoom translation will not work.

6. Lightbox.tsx — swipe-to-dismiss not implemented dragOffset is tracked but never applied to a transform. You can swipe but the image doesn't move. Same fix as #5.

7. EventCard.tsx line 32 — cardVariants is declared but never propagated The card is wrapped in a parent <motion.div> that animates in. But the card itself uses variants={cardVariants} — these variants exist but the parent uses a whileInView with transition.delay: i * STAGGER_SIBLING, not staggerChildren. So the inner cardVariants is dead code — the parent controls animation, and the card re-animates with its own variant. Double animation = jitter on every EventCard mount.

8. Family.tsx + FamilyGroup.tsx — same double-animation pattern Same issue. The outer Family.tsx doesn't pass variants to FamilyGroup, so the inner whileInView re-fires the entrance animation. With staggerChildren 200ms apart across 2 groups, this is fine in practice — but if you ever pass staggerChildren to a parent, this breaks.

9. Story.tsx line 73 — both desktop AND mobile timeline lines are rendered as the same DOM, conflicting classes

<div className="absolute left-0 top-0 bottom-0 hidden w-px bg-gold/30 md:left-1/2 ..." />  // desktop
<div className="absolute left-0 top-0 bottom-0 w-px bg-gold/30 md:hidden" />  // mobile
Tailwind v4 bg-gold/30 — is --color-gold defined? No. Your tokens define --color-accent, --color-accent-light, etc. bg-gold is undefined. Tailwind v4 will just not generate that class. So your timeline line is invisible. The whole Story section has no vertical line.

Also md:hidden on the second div plus hidden md:block on the first means both render at the same time on tablet (md width). The md:left-1/2 only applies at md+; the first div has hidden so it's gone — so tablet shows only the mobile line, not centered. That's actually fine, but it means your "centered desktop timeline" never renders centered. Same bug in Events.tsx.

10. Countdown.tsx line 53 — wrong label binding

{sections.story.label}  // "Our Story"
This is the Countdown section, but the eyebrow text says "Our Story" — copied from Story.tsx. Same in Hero.tsx's letter-expand class. Visible typo, user-facing.

11. Venue.tsx line 60 — name split puts a <br> after the first word even if the name is one word "Château".split(' ').map(...) returns ["Château"] — fine. But "The Grand Château".split(' ') returns 3 words, and your i === 0 check inserts a <br> after the first word only, so it renders as "The\nGrand Château" — which is fine, but you should consider whether you want this for all venue names or only multi-word ones.

12. useSmoothScroll.tsx — initialized.current prevents re-init, but never resets on resize Lenis needs re-init on orientation change for mobile. Not catastrophic, but prefers-reduced-motion is checked once on mount — if a user toggles the OS setting while the page is open, it doesn't update.

🟡 Padding / spacing issues you mentioned
13. EventCard.tsx — internal padding inconsistent p-6 sm:p-8 is fine, but the <a> "Open in Maps" button has mt-2 (very small) and no consistent rhythm with the description above.

14. RSVP.tsx form card padding p-6 sm:p-8 md:p-10 is fine on its own, but the section is px-6 py-20 sm:py-28 md:py-32. On a 390px-wide mobile, that means 24px outer + 24px inner = 48px of total padding, plus the form's own gap-7 between fields = cramped on small phones. Try px-4 on mobile.

15. Hero.tsx — content max-w-2xl mx-auto with gap-6 sm:gap-8 md:gap-10 On a very short hero (less than 600px tall — landscape phones, split-screen), the CTA + scroll indicator can collide.

16. Gallery.tsx — 3-column grid with gap-4 sm:gap-6 On a 390px screen, grid-cols-2 is correct, but you have md:grid-cols-3. At 768px, 3 columns means ~240px per image with 24px gaps — fine. But the aspect-[3/4] and aspect-[4/5] and aspect-square mixed together cause uneven row heights because the rows don't align to a consistent height. Looks messy. Use grid-auto-rows or fix one aspect.

17. base.css line 7 — scroll-behavior: smooth + Lenis = conflict Pick one. Lenis is better (smoother, customizable) — remove scroll-behavior: smooth from html.

18. Venue.tsx — Maps embed loads even if user is on slow connection The iframe has no fetchPriority or loading control beyond the basic loading="lazy". But the useInView triggers it on amount: 0.3, so it should be fine — but on a slow connection the map div will show empty for 1-2 seconds with the placeholder icon. The placeholder is bg-cream — --color-cream isn't defined. Tailwind v4 will just not generate it. The placeholder is transparent.

🟢 Minor (works but ugly / could be better)
19. tokens.css — animation tokens defined but only used via JS CSS variables --ease-entrance, --duration-cinematic etc. exist but never referenced in any CSS file — Framer Motion uses its own copies. Dead code, or intentional parity for future CSS animations? Either way, the CSS files should use them too (e.g. the ken-burns animation hardcodes 20s ease-in-out, ignoring your token).

20. Preloader.tsx — 2-second wait is too long for a returning visitor You have an envelope-seen localStorage flag, but the preloader has no such flag. Every page load = 2s preloader, even for users who already RSVPed. Add a preloader-seen flag.

21. Hero.tsx — loading="eager" on the hero image, but the image is broken (no /hero/couple.jpg) All your gallery/story images are referenced but don't exist in public/ — that's why I see "Image unavailable" placeholders in the snapshot. The user can fix this by adding real images, but you should also have a clean visual fallback (not just text "Image unavailable"). I'll add a styled placeholder.

My plan to fix
Fix all 18 critical bugs above
Define missing colors (ink, gold, cream — or replace usages with text, accent, surface)
Fix the Lenis / scroll-behavior: smooth conflict
Fix Lightbox pan/swipe (apply motion values correctly)
Fix the double-animation pattern in EventCard and FamilyGroup
Add missing Section import to Events.tsx (you use Section pattern elsewhere but Events.tsx rolls its own — inconsistent, not a bug, but worth aligning)
Add a preloader-seen localStorage flag
Make the missing-image fallback actually pretty