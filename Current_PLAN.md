Wedding Invitation Project — Plan

Mission

Build a premium one-page wedding invitation website that feels emotional, elegant, and cinematic. Optimized for sharing via WhatsApp, Instagram, and direct link. Single-page React app, deployed as a static site, loads fast on mid-range Android over 4G.

Working Notes





Source of truth for the Gallery:






 — architecture and philosophy of the Gallery Engine (renderer, scheduler, globe, materials, physics, interaction, debug, post-processing). Read first to understand the why.



 — concrete implementation, systems, modules, rendering behaviour, interactions. Read for the how.



The Gallery Engine is developed as if it were an independent graphics engine. The wedding gallery is simply the first application built on top of it.



The Gallery Engine is a graphics engine, not a WebGL engine, not a WebGPU engine, not a React component. Rendering API (WebGL2 / WebGPU) is an implementation detail chosen at runtime.



Engine selects the best available backend automatically. WebGPU when available, WebGL2 fallback. The user never knows which renderer was chosen.



The engine is the default Gallery. The static grid from M5A is a reduced-motion / fallback / kill-switch alternative — not a competing feature.



The renderer should be invisible. The technology should disappear. Only the photographs and the interaction should remain.

Stack







Layer



Choice



Why





Build



Vite 8



zero-config React + TS





UI Framework



React 19 + TypeScript 6



strict mode, no any





Styling



Tailwind CSS 4



@tailwindcss/vite plugin, design tokens in @theme





Animation



Framer Motion 12



entrance, stagger, scroll-reveal only





Smooth Scroll



Lenis



tuned touchMultiplier for WhatsApp in-app

File Structure (target)

src/
  content/                  # typed content
  styles/
    tokens.css              # @theme + animation tokens
    base.css                # reset + body + .photo-bw
  components/
    primitives/             # EnvelopeIntro, Preloader, Section, MusicControl, CustomCursor
    sections/               # Hero, Countdown, Family, Events, Venue, Gallery, RSVP, Footer
  engine/                   # Gallery Engine (M5B) — renderer-independent
    core/                   # engine entry, Scheduler, contract types, lifecycle
    renderers/              # one folder per backend: webgpu/, webgl2/
    scene/                  # Scene graph, Camera, traversal
    objects/                # Globe, PhotoMesh, ParticleSystem, Light
    physics/                # integration, springs, collisions
    materials/              # material specs consumed by renderers
    textures/               # decoded bitmap cache, GPU texture handles
    math/                   # vec/mat/quat, frustum culling
    debug/                  # profilers, frame stats, overlays
  App.tsx                   # composition
  main.tsx                  # root + providers

Milestones

Each milestone ships when all success criteria are met AND you've reviewed the demo. Don't move on until you have.

M0 — Project setup

Goal: A Vite app that builds, lints, and runs.

Success criteria:





bun install && bun run dev boots in < 1s



bun run build passes



TypeScript strict, no any



Tailwind tokens + base CSS work



Lenis smooth scroll active



Dev server reachable from mobile on same network

M1 — Content layer + tokens

Goal: All copy and design tokens locked in code.

Success criteria:





exports typed content matching the Content section above



has full theme palette + animation tokens



has reset, body, .photo-bw utility



App renders all sections as empty placeholders with correct vertical order



Hero shows "Anjana weds Krishnaprasad" with Sept 13, 2026 + Cherthala



Countdown shows live ticker to Sept 13, 2026 10:00 IST

M2 — Hero, Countdown, Footer

Goal: Top of page feels complete and cinematic.

Success criteria:





Hero: pre-title, names (clip-path reveal), date, RSVP CTA, ken-burns background, scroll indicator



Countdown: four cards (days/hours/minutes/seconds), tabular-nums, updates every 1s



Footer: names, date, copyright



All entrance animations respect prefers-reduced-motion



Mobile (360px), tablet (768px), desktop (1440px) all look correct



Lighthouse: Performance ≥ 90, Accessibility ≥ 90

M3 — Family + Events

Goal: Family and event timeline are visually balanced with the rest.

Success criteria:





Family: bride side and groom side, gold flourish divider between



Events: vertical timeline with dots, four event cards (or just two for the engagement+reception)



All cards have map links and event descriptions



Stagger animations between cards



Tested at 360 / 768 / 1440px

M4 — Venue + Maps

Goal: Venue section is functional and informative.

Success criteria:





Map embed loads only when in view (lazy iframe)



"Open in Maps" + "Directions" + "Add to Calendar" + "Visit Website" buttons work



.ics file generates and downloads on "Add to Calendar" click



Travel & Stay section collapsible



No layout shift when map loads

M5B — Gallery Engine

Goal: The Gallery Engine renders the photo collection as an interactive 3D globe of memories. This is the centerpiece of the site. Replaces the static grid for the public site; the grid (M5A) stays as a reduced-motion / fallback / kill-switch alternative.

Depends on: M5A (lightbox selection contract is the boundary — the engine's selection event must match what the grid feeds into React).

Read first:





 for architecture and philosophy



 for concrete systems and module responsibilities

Success criteria:





Engine boots standalone (no React required) and renders the globe to a <canvas> at 60fps on mid-range Android



WebGPU backend used when available, WebGL2 fallback automatic and visually equivalent



Texture manager streams photo assets. The renderer uploads decoded GPU textures. Compression formats are implementation details.



Globe supports drag, pinch, momentum, and inertia



Selection state is exposed to React via the contract; React owns lightbox, captions, metadata



Reduced-motion users get the M5A grid, not the engine (handled by setMotionPolicy("reduced"))



Engine can be disabled via a single flag (setEnabled(false)) for A/B and debugging — falls back to M5A grid



No React state lives inside the engine loop; React re-renders never stall the renderer



Errors are surfaced via onError and never thrown into React's render

M5A — Gallery (Grid + Lightbox)

Goal: A static photo grid and lightbox. This is the React-side presentation layer and the fallback path when the engine is disabled or reduced-motion is preferred. Built first so the engine's selection contract has something concrete to align to.

Success criteria:





Masonry-ish or simple 2/3 column grid (responsive)



All photos grayscale by default (.photo-bw)



Lightbox: open on click, keyboard nav (arrow keys, Escape), focus trap, swipe on mobile



Each image: <picture> with AVIF + WebP + JPEG, lazy-loaded



Hero + gallery all in .photo-bw class



Lightbox selection contract (event shape, IDs) is the same contract the engine emits in M5B — so swapping engine ↔ grid is a one-flag change

M6 — RSVP

Goal: RSVP form works end-to-end.

Success criteria:





Form fields: name, guests (number), events (checkboxes), dietary, message



Validation: name required, guests 1–10



Submit opens WhatsApp deep link (pre-filled) AND posts to webhook (if configured)



Success state with checkmark animation



Webhook URL in .env for future backend (currently optional)



Works with keyboard only

M7 — Interactions & polish

Goal: Every interaction feels premium.

Success criteria:





All buttons have hover fill, focus ring, active state



All links have underline-on-hover (gold, draw animation)



Smooth scroll from RSVP CTA → RSVP section works



Music control persists, volume is 30%, has play/pause with correct icon



Custom cursor on desktop, disabled on touch ((hover: none))



Reduced-motion users get static layout, no auto-playing audio, no parallax

M8 — Pre-flight & deploy

Goal: Production-ready.

Success criteria:





Test on iPhone Safari, Android Chrome, WhatsApp in-app browser, Instagram in-app browser



Lighthouse mobile ≥ 90 on all four categories



No console errors or warnings



Bundle size < 200KB gzipped



All images optimized to AVIF (with WebP + JPEG fallbacks)



.env keys for RSVP webhook set



Deployed to Vercel/Netlify, custom domain pointed



Open Graph image renders correctly when shared to WhatsApp/Instagram

React ↔ Gallery Engine Boundary

The engine is not a React component. React and the engine communicate over a narrow, explicit contract. The same contract is the boundary between React and the M5A grid — so swapping between the two paths requires zero React-side fallback logic.

Engine owns:





The Scheduler (lifecycle: active / sleeping / initializing / disposed; runs requestAnimationFrame only when active)



Scene state (camera, globe, photo meshes, particles, materials)



GPU resource lifecycle (textures, buffers, shaders) via the Renderer interface



Input capture (pointer, touch, wheel, keyboard — intake only, not action)



Frame timing, profiling, debug overlays

React owns:





Page composition, scroll, section ordering



Lightbox, captions, metadata, RSVP, navigation



Audio, preloader, envelope intro



Accessibility (focus management, reduced-motion, ARIA)



Asset selection (which photos the engine is allowed to load)



The kill switch: when engine is disabled, React renders the M5A grid using the same selection contract

Contract surface (engine → React, events only):





onSelect(photoId) — user tapped/clicked a photo. The lightbox is the React-side reaction.



onHover(photoId | null) — for caption previews.



onFrame(stats) — optional, throttled to ~1Hz, for the perf/debug overlay.



onBackendChosen("webgpu" | "webgl2") — once at boot, so the React shell can show a "low-power device" badge if it wants to.



onError(error) — engine failures surface here, never thrown into React's render.

Contract surface (React → engine, commands only):





engine.loadPhotos(manifest) — declarative list of photo IDs the engine is allowed to stream.



engine.setActiveSelection(photoId | null) — React can drive selection (e.g. open from the lightbox, sync from URL hash).



engine.setMotionPolicy("full" | "reduced" | "static") — driven by prefers-reduced-motion and the engine toggle flag. "reduced" and "static" both route React to the M5A grid.



engine.setEnabled(boolean) — global kill switch for the engine. When false, React falls back to the M5A grid using the same contract.

M5A grid parity: the grid's click handler emits onSelect(photoId) with the same shape as the engine. The lightbox doesn't know or care whether the selection came from the engine or the grid. This is what makes the swap a one-flag change.

Engine Architecture

Gallery Engine is developed as if it were an independent graphics engine. The wedding gallery is simply the first application built on top of it. This framing drives every decision below.

Scene

Scene is the root object the engine renders. The engine is renderer-independent; the Scene graph is what both backends consume.

Scene
├── Camera                 # perspective camera, orbit input
├── Globe                  # rotating 3D sphere, photo tiles mapped on its surface
├── Photo Meshes           # one mesh per visible photo, instanced for perf
└── Particles              # background ambience (dust, bokeh)

Anything added to the visible world is a node in the Scene graph. Renderers walk the graph; they do not own it.

Scheduler (the lifecycle)

Scheduler is one of the most important modules. It owns when the engine does work — not how it renders.

States:





Active — requestAnimationFrame loop running, scene updating, GPU drawing.



Sleeping — loop paused, GPU resources retained, no CPU work. Wakes instantly on input or visibility change.



Initializing — backend selection, asset warmup. One-shot, not a steady state.



Disposed — GPU resources released. Terminal.

Triggers:





Page becomes visible (visibilitychange → active) or hidden (visibilitychange → sleeping).



Engine enters or leaves the viewport (IntersectionObserver) — sleeping when off-screen, active when on-screen.



Idle for N seconds with no input → sleeping.



Any user input (pointer, touch, wheel, keyboard) → active.

This is what keeps the engine from burning battery on a backgrounded tab. It is also why the engine can be safely mounted to a <canvas> that is below the fold — it sleeps until you scroll to it.

Renderer Interface

All rendering backends must implement this contract. The engine depends on the interface, not on WebGPU or WebGL2.

interface Renderer {
  initialize(canvas: HTMLCanvasElement): Promise<void>;
  beginFrame(): void;                              // start of frame
  endFrame(): void;                                // submit + present
  createMesh(spec: MeshSpec): MeshHandle;
  destroyMesh(handle: MeshHandle): void;
  uploadTexture(bitmap: ImageBitmap): TextureHandle;
  destroyTexture(handle: TextureHandle): void;
  drawMesh(handle: MeshHandle, material: Material, transform: Mat4): void;
  resize(width: number, height: number): void;
  dispose(): void;                                 // release all GPU resources
}

Two implementations live in engine/renderers/: one for WebGPU, one for WebGL2. The Scene graph and Scheduler don't know which one is active.

Boot flow

The engine never assumes WebGPU exists. The boot is a deterministic chain:

Boot
  └─ navigator.gpu ?
        ├─ YES → initialize WebGPU
        │           └─ success ?
        │                 ├─ YES → continue (onBackendChosen("webgpu"))
        │                 └─ NO  → fall through ↓
        └─ NO  / fallthrough → initialize WebGL2
                                  └─ success ?
                                        ├─ YES → continue (onBackendChosen("webgl2"))
                                        └─ NO  → engine.setEnabled(false)
                                                 → React renders the M5A grid

WebGPU is preferred when both available and stable on the device. WebGL2 is the production path. The static grid is the safety net. Three tiers, each one is the previous tier's fallback.

Performance Budget

The engine is real-time software. It has a frame budget and it does not exceed it.







Phase



Budget



Notes





Physics



< 1 ms



Integration, spring forces, collisions





Scene update



< 2 ms



Camera, animation, particle tick





Renderer



remaining



Whatever is left of the frame budget





Total @ 60 Hz



16.67 ms



Headroom for the OS





Total @ 120 Hz



8.33 ms



Adaptive on high-refresh devices

Profilers live in engine/debug/. The Scheduler throttles work when the budget is consistently missed — better to drop frame rate gracefully than to spike.

Rules of the boundary





React state never enters the engine loop. If React re-renders, the engine does not pause.



The engine never reads from the DOM. It mounts to a <canvas> and receives pointer events on that canvas only.



The engine never throws into React's render. Errors are surfaced via onError.



The engine is unit-testable headlessly (mount to an offscreen canvas, drive the contract, assert events).



Reduced-motion and disabled-engine paths both render the M5A grid, so the contract has zero fallback logic in React — it just doesn't call engine.*.

Definition of Done (every milestone)

A milestone is not done when the code is written. It's done when:





All success criteria in the milestone are met



Tested on iPhone Safari, Android Chrome, WhatsApp in-app browser



Lighthouse mobile score ≥ 90



No console errors or warnings



No any, no console.log, no commented-out code



Animations respect prefers-reduced-motion



Review pass: responsiveness (360 / 768 / 1440), accessibility, animation smoothness, code readability, performance



User has reviewed the demo before moving on

The WhatsApp Test

Most guests will open this site from inside WhatsApp's in-app browser. This is the real test environment.

Before considering any milestone done:





Test in WhatsApp in-app browser on iOS



Test in WhatsApp in-app browser on Android



Test in Instagram in-app browser



Test in Safari iOS



Test in Chrome Android

Common things that break in these browsers:





100vh (use 100svh or 100dvh)



Custom cursors (disable on (hover: none))



CSS gradients and some filters



Audio autoplay (always require user interaction)



Smooth scroll libraries (Lenis needs touchMultiplier tuned)



Fixed positioning with dynamic keyboards



WebGPU availability is patchy — engine must fall back to WebGL2 cleanly

If it doesn't work in WhatsApp, it doesn't work.

Risks & Open Questions







Risk



Mitigation





The actual photos aren't in black & white in source



The .photo-bw CSS filter applies regardless of source. Originals should still be color (easier to repurpose), the filter creates the look on-site.





WhatsApp blocks autoplay audio



Music control requires user tap to start, no autoplay.





Custom fonts fail to load in low-bandwidth



font-display: swap on all Google Fonts. Body and display fonts have system fallbacks.





RSVP webhook not ready at launch



WhatsApp deep link is the primary submission path. Webhook is optional.





Date math errors in countdown



Use ISO string in .env, new Date(wedding.iso).getTime() for target. Test with mocked clock.





Gallery Engine perf on mid-range Android



Profile early, ship WebGL2 path first if WebGPU is unstable on target devices, keep M5A grid as a one-flag fallback.





Engine/React contract drift



The contract is the boundary. Any change to the engine API requires a paired change to the React adapter and a test.

