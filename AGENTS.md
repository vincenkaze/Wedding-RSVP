AGENTS.md

Purpose

This repository contains a premium one-page wedding invitation website.

The objective is to create an emotional, elegant, cinematic experience rather than simply displaying information.

Every design decision should contribute to beauty, clarity, and performance.



Tech Stack





Bun (runtime + package manager)



Vite (build)



React 18



TypeScript (strict)



Tailwind CSS 4



Framer Motion (entrance, scroll, stagger)



Lenis (smooth scroll)



lucide-react (icons)



shadcn/ui (selectively, only what we need)

No new dependencies without a written reason. If a new package is needed, add it in Milestone 0 or with explicit justification.



Design Principles





Elegant over flashy



Motion should guide attention, never distract



Mobile-first



Fast loading



High accessibility



Luxury aesthetic



Avoid generic templates

Every component should feel like it belongs on a wedding invitation, not a SaaS landing page.



Coding Standards





Create reusable components, but only after the second use case appears



Prefer composition over duplication



Keep files focused — one component per file



Use semantic HTML (<section>, <article>, <time>, <address>)



Keep dependencies minimal



Remove dead code immediately



Do not write speculative code — no "just in case" props, state, or abstractions

TypeScript





strict: true, no any



Prefer interface for props, type for unions



Export prop types only when consumed externally

State





Local state for local UI (form fields, lightbox open/closed)



URL state for shareable things (gallery image index, RSVP prefill)



No global store. If a milestone needs one, justify it first

File structure

src/
  components/
    ui/           # shadcn primitives
    sections/     # Hero, Story, Events, etc.
    primitives/   # Section, Reveal, FadeUp
  lib/
    ics.ts        # calendar file generation
    wa.ts         # WhatsApp deep link helpers
  hooks/
  content/
    content.ts    # all copy lives here, single source of truth
  styles/
  App.tsx
  main.tsx



Animation Guidelines

Animations should feel calm and premium.

Motion split





Framer Motion for: entrance, scroll-triggered reveals, stagger, layout transitions



CSS for: hover, focus, micro-interactions, loading shimmer



This split is non-negotiable. Animating hovers in JS causes re-render thrash

Preferred





fade



blur



scale



parallax



stagger



clip-path reveal



underline draw

Avoid





bouncing



spinning



excessive particle effects



anything that competes with the content

Easing





Default: [0.22, 1, 0.36, 1] (ease-out-quart) for entrance



Default: [0.4, 0, 0.2, 1] (ease-in-out) for state changes



Never linear for UI motion

Duration





Micro: 150–200ms



Standard: 300–500ms



Cinematic: 600–1200ms



Anything over 400ms must respect prefers-reduced-motion

Stagger





60–100ms between siblings



150–250ms between sections



Images





Always optimize to WebP (AVIF where supported)



Provide multiple sizes, use srcset



Lazy load everything below the fold



Hero image must be preloaded



Use <picture> for format fallback



All images need alt text — non-negotiable for accessibility



Performance





Target Lighthouse score above 90 on mobile



LCP under 2.5s on 4G



60fps on mid-range Android (Moto G Power class)



No animation longer than 1.2s



Avoid unnecessary re-renders



Use will-change sparingly and only during animation, not statically



Prefer CSS transforms over layout properties



The WhatsApp Test

Most guests will open this site from inside WhatsApp's in-app browser.

This is the real test environment. Before considering any milestone done:





Test in WhatsApp in-app browser on iOS and Android



Test in Instagram in-app browser (similar engine)



Test in Safari iOS



Test in Chrome Android

Common things that break in these browsers:





100vh (use 100svh or 100dvh)



Custom cursors



Some CSS gradients and filters



Audio autoplay



Smooth scroll libraries (Lenis needs touchMultiplier tuned)

If it doesn't work in WhatsApp, it doesn't work.



Accessibility





Color contrast AA minimum (AAA for body text on cream)



All interactive elements have a visible focus state



All images have meaningful alt text



All animations respect prefers-reduced-motion



All form fields have associated labels



The RSVP form works with keyboard only



Test with a screen reader at least once per section



Content

All copy lives in  as a single typed object. This is the only file non-developers should need to edit.





couple — names, display names



wedding — date, time, timezone, ISO string for countdown



events — array of event objects



venue — name, address, maps query, maps link



story — paragraphs, milestones



verse — text, reference



family — bride, groom, parents



gallery — image paths + captions



rsvp — deadline, contact number, contact email



extras — registry, dress code, faq

No copy in JSX. No copy in component files. Ever.



Definition of Done (per milestone)

A milestone is not done when the code is written. It's done when:





All success criteria in  are met



Tested on iPhone Safari, Android Chrome, and WhatsApp in-app browser



Lighthouse mobile score ≥ 90



No console errors or warnings



No any, no console.log, no commented-out code



Animations respect prefers-reduced-motion



Review pass completed: responsiveness, accessibility, animation smoothness, code readability, performance



Reviewed with the user before moving to the next milestone



Before completing any task

Review:





responsiveness (360px, 768px, 1440px)



accessibility



animation smoothness



code readability



performance



WhatsApp in-app browser behavior

