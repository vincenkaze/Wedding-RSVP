Wedding Invitation Project

Mission

Build a premium one-page wedding invitation website that feels luxurious, emotional, and memorable.

The website should tell a story rather than simply present information.

The final experience should work beautifully on phones because most guests will open it from WhatsApp.



Working Rules

Complete only one milestone at a time.

Do not begin the next milestone until the current one has been reviewed.

After every milestone:





review the code



improve the design



improve performance



identify possible problems

Do not use placeholder Lorem Ipsum. Every section must show the real structure, even when content is still pending. Use clearly-marked empty states ("Names will appear here") rather than fake text.

Animations are not decoration. Every animation must serve the story:





entrance: reveal what matters



scroll: pace the reader



interaction: reward a tap

Performance budget per milestone:





60fps on a mid-range Android (Moto G Power class)



LCP < 2.5s on 4G



No animation over 400ms without prefers-reduced-motion respect

Stack:





Zo Site (Vite + Bun + TypeScript + React + Tailwind + shadcn)



Framer Motion for choreography



Lenis for smooth scroll



Deployed as published Zo Site, custom domain optional



Milestone 0 — Foundation

Goals





Create Zo Site project



Install dependencies (framer-motion, lenis, lucide-react)



Establish design tokens: typography, color, spacing, radii, shadows



Establish animation tokens: easings, durations, stagger rules



Set up base layout: full-height sections, smooth scroll provider, noise/grain texture



Wire up a <Section> primitive that handles reveal-on-scroll consistently

Success Criteria





Site builds and runs



Empty home page with the design system applied (cream + ink + gold + serif)



Smooth scroll active



Reduced-motion preference respected



No layout shift on load



Milestone 1 — Hero

Goals





Full-bleed hero with the couple's photo



Soft Ken Burns zoom on the image (very slow, ~20s loop)



Staggered entrance: "Save the Date" → names → date → location → RSVP button



Each line fades up with 80ms stagger, 600ms ease-out



"Save the Date" uses a 0.4s letter-spacing expand



Names use a serif display with a subtle mask reveal (clip-path wipe left → right, 1.2s)



Date appears with a thin gold underline that draws itself (1s)



Floating "scroll" indicator with a 2s bobbing loop



Subtle film grain overlay (2% opacity SVG noise)

Success Criteria





Looks excellent on desktop and mobile



Entrance plays once on first scroll into view, never again (no jank on revisit)



Lighthouse performance score ≥ 90 on mobile



All animation respects prefers-reduced-motion



Milestone 2 — Countdown & Verse

Goals





Live countdown to wedding date, updates every second



Numbers animate on digit change (flip-up, 200ms, spring)



Background: very subtle paper texture, cream



Verse section: italic serif, centered, with a thin gold rule that draws in on scroll



Verse fades in line-by-line (3 lines, 150ms stagger)



A small ornamental flourish above and below the verse (CSS / SVG, fades in)

Success Criteria





Countdown is accurate to the second



No layout jump as numbers change



Verse feels like a held breath, not a heading



Milestone 3 — Our Story

Goals





Section opens with a small caption ("How it began") that fades in



Story body: 2–3 short paragraphs, max-width prose, fade in as a single block



Timeline: 4 milestone dots down a vertical gold line



Each milestone: dot pulses once on scroll into view, year slides in from left, title fades in, paragraph fades in from right



Stagger: 200ms between milestones



Milestone photo (when present) reveals with a soft scale (0.95 → 1) and a 3° rotate reset, 800ms

Success Criteria





Timeline reads like a journey, not a list



Works with 2 milestones, 4 milestones, or 6 milestones (no hardcoded count)



Mobile timeline switches to a slightly tighter rhythm



Milestone 4 — Events

Goals





Section title fades up



4 event cards (Haldi, Mehendi, Wedding, Reception) enter with a stagger



Each card: slides up 24px, fades in, 500ms ease-out, 120ms stagger



Card has a soft inner glow on hover (desktop) / on tap highlight (mobile)



Card content: date, time, event name, venue, "Open in Maps" button



"Open in Maps" button: subtle gold border that fills from left on hover (200ms)



A connecting line runs down the left of the cards (desktop), visible on mobile as a top border between cards

Success Criteria





All 4 events fit on a phone screen without scrolling between them feeling cramped



Card layout reads cleanly at 360px width



Maps links open in the user's maps app, not in a browser tab (where possible)



Milestone 5 — Family

Goals





Two-column layout on desktop, stacked on mobile



Each family section: a small caption ("The Bride's Family"), names with a serif treatment, parents' names



Section enters with a centered fade-up



A delicate SVG flourish sits between the two columns on desktop (fades in last)



Hovering a name shows a soft gold underline (desktop only, 150ms)

Success Criteria





Feels reverent, not data-heavy



Mobile stacks gracefully with a thin gold divider between



Milestone 6 — Venue

Goals





Venue name fades up, address fades in 200ms later



Embedded Google Map: a mask reveal (clip-path inset) that opens from center outward over 1.2s when scrolled into view



"Open in Google Maps" button: outlined → filled on hover/tap



"Add to Calendar" button below the map: generates an .ics file client-side, no backend



Optional: a small "Travel & Stay" mini-section below (collapsible)

Success Criteria





Map loads lazily (only when in viewport)



No CLS when map loads



.ics file opens in Apple Calendar / Google Calendar correctly



Milestone 7 — Gallery

Goals





Responsive 2-col mobile, 3-col desktop grid



Images reveal with a stagger as the section enters view



Each image has a soft Ken Burns on hover (desktop) / gentle scale on tap (mobile)



Tap an image → full-screen lightbox with swipe between photos, ESC to close, pinch-zoom



Lightbox: dark backdrop with a 200ms fade, image fades + scales from 0.96



Captions appear under the lightbox image with a 300ms delay

Success Criteria





20 images load without jank



Uses loading="lazy" and decoding="async"



WebP / AVIF served where supported



Total gallery payload < 2MB



Milestone 8 — RSVP

Goals





"Will You Join Us?" heading fades up



Form fields stagger in (name → guests → event checkboxes → dietary → submit), 100ms each



Inputs: thin underline style, label floats up on focus (300ms ease)



Submit button: gold fill on hover, ink color swap



On submit: form fades out (200ms), a checkmark draws in (SVG path animation, 600ms), "Thank you" text fades in



Two RSVP paths:






WhatsApp deep link (primary — pre-fills a message to a chosen number)



Form submit to a Web3Forms endpoint (fallback for guests who don't use WhatsApp)



Optional: deadline countdown ("RSVP by 31 January")

Success Criteria





Form never blocks the UI



Submit is optimistic — success state shows immediately



If WhatsApp is the chosen path, the link is pre-filled with the guest's name + event selection



Milestone 9 — Polish

Goals





Smooth scroll tuning (Lenis easing curve)



Preloader: thin gold line draws across the top, couple's initials fade in over 1.2s, then page enters



Envelope-open animation on first visit (svg of an envelope, flap rotates open, page enters) — only on first load, stored in localStorage



Background music: floating bottom-right button, fades in after 3s, mute toggle



Noise/grain overlay across the whole page at 2% opacity



Custom cursor on desktop: small gold dot that grows on hover over interactive elements



Footer: names + date in a serif, tiny "Made with love" line

Success Criteria





All animation timings are consistent with the design tokens



No animation longer than 1.2s



No content shift anywhere



Lighthouse score ≥ 95 on mobile



All animations respect prefers-reduced-motion



Final Review

Before deployment:





mobile testing (iPhone Safari, Android Chrome, WhatsApp in-app browser)



tablet testing



desktop testing (1440, 1920)



accessibility review (contrast, focus states, ARIA on interactive elements, alt text on all images)



performance review (Lighthouse, bundle size, image weight)



animation review (no jank, no overlap, no premature triggers)



WhatsApp share preview check (OG image, title, description)

Only deploy when all checks pass.