Gallery.md — Immersive Gyro-Responsive Gallery (Mobile-First)

Goal: A mobile-first kinetic gallery with a chrome flower as a floating anchor above the invitation text. Images float and drift on their own; the flower rotates with the phone's gyroscope. No touch interaction on images. No jank on a 3-year-old Android.

Reference: obys.agency (desktop gyroscope + tilt). We are stealing the idea, not the cost. Obys runs Canvas/WebGL and doesn't care about FPS; we run CSS transforms only.



1. The Mental Model — Why This Can Be Done Cheaply

The obys site looks heavy because it animates 3D meshes. We do not. Our whole effect is:





Backdrop layer: a full-bleed image with filter: blur(20px) and a slight scale(1.1).



Foreground: 6–8 photos drifting on a setInterval (already in ).



Anchor flower: one SVG/PNG of a chrome flower, position: absolute, centered.



Gyroscope input: a single CSS custom property --tiltX, --tiltY updated from deviceorientation.



Reverse parallax: backdrop reads --tiltX * -0.5, flower reads --tiltX * 1.

That is it. No canvas, no WebGL, no 3D library, no framer-motion on the gyroscope path. The phone renders 4 transformed layers and a blurred background. That fits in a single GPU compositor frame on a Snapdragon 6-series.

The single rule for "doesn't overwhelm mobile": the gyroscope writes to two CSS variables per frame. That's it. Never setState in the orientation handler. Never re-render React from sensor data.



2. File Changes

src/
  components/
    sections/
      FloatingGallery.tsx     (refactor: split into <Backdrop/>, <FloatingPhoto/>s, <ChromeFlower/>)
      FloatingPhoto.tsx       (remove drag/pinch on mobile, keep on desktop; remove idle setInterval)
      ChromeFlower.tsx        (NEW)
      GyroScope.tsx           (NEW: provider that writes --tiltX/--tiltY to :root)
  hooks/
    useDeviceTilt.ts          (NEW: raw sensor hook, returns motion values)
  styles/
    base.css                  (add .kinetic-canvas, .chrome-flower, gyro fallback)



3. The Gyroscope Hook — 

Use DeviceOrientationEvent directly. It is supported on iOS 13+ and Android Chrome. Do not use DeviceMotionEvent — deviceorientation gives you what you want (alpha/beta/gamma) without the acceleration noise.

import { useEffect } from 'react'

interface TiltOptions {
  maxDeg?: number   // clamp tilt to ±X degrees, default 15
  invertX?: boolean
  invertY?: boolean
}

export function useDeviceTilt({
  maxDeg = 15,
  invertX = false,
  invertY = false,
}: TiltOptions = {}) {
  useEffect(() => {
    const isCoarse = window.matchMedia('(pointer: coarse)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!isCoarse || reduce) return                       // desktop / reduced motion: no-op

    const handler = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return
      // beta: front-back tilt (-180..180), gamma: left-right (-90..90)
      const x = Math.max(-maxDeg, Math.min(maxDeg, e.gamma)) / maxDeg
      const y = Math.max(-maxDeg, Math.min(maxDeg, e.beta - 30)) / maxDeg
      // 30deg offset = "user holding phone naturally tilted back"
      const tx = (invertX ? -x : x).toFixed(3)
      const ty = (invertY ? -y : y).toFixed(3)
      // Write CSS variables directly. NO setState.
      document.documentElement.style.setProperty('--tiltX', tx)
      document.documentElement.style.setProperty('--tiltY', ty)
    }

    window.addEventListener('deviceorientation', handler, { passive: true })
    return () => {
      window.removeEventListener('deviceorientation', handler)
      document.documentElement.style.setProperty('--tiltX', '0')
      document.documentElement.style.setProperty('--tiltY', '0')
    }
  }, [maxDeg, invertX, invertY])
}

iOS permission: Safari blocks deviceorientation until you call DeviceOrientationEvent.requestPermission() from a user gesture. Add a one-time tap-to-enable prompt that disappears forever after first grant. Drop this in the EnvelopeIntro so permission is requested at envelope-open.

// Inside EnvelopeIntro's open handler:
if (
  typeof DeviceOrientationEvent !== 'undefined' &&
  'requestPermission' in DeviceOrientationEvent &&
  (DeviceOrientationEvent as any).requestPermission
) {
  await (DeviceOrientationEvent as any).requestPermission()
}

Android Chrome: no prompt. Works immediately.



4. CSS — The Whole Effect in 30 Lines

Add to :

:root {
  --tiltX: 0;
  --tiltY: 0;
  --flower-tilt: rotateX(0deg) rotateY(0deg) translateZ(0);
  --bg-tilt: translate3d(0, 0, 0);
}

.kinetic-canvas {
  position: relative;
  perspective: 800px;                  /* gives 3D space for the flower */
  transform-style: preserve-3d;
  isolation: isolate;                  /* backdrop-filter scope */
}

.kinetic-backdrop {
  position: absolute;
  inset: -10%;                          /* bleed for parallax */
  background-image: var(--backdrop-url);
  background-size: cover;
  background-position: center;
  filter: blur(28px) saturate(1.1) brightness(0.9);
  transform: translate3d(
    calc(var(--tiltX) * -16px),
    calc(var(--tiltY) * -16px),
    0
  ) scale(1.15);                        /* REVERSE parallax + scale to hide blur edges */
  transition: transform 120ms linear;   /* smooth sensor jitter */
  will-change: transform;
  z-index: 0;
}

.chrome-flower {
  position: absolute;
  left: 50%;
  top: 38%;                              /* sits above the invitation text */
  width: clamp(120px, 32vw, 220px);
  transform: translate(-50%, -50%)
    rotateX(calc(var(--tiltY) * 12deg))
    rotateY(calc(var(--tiltX) * -12deg))
    translateZ(40px);
  filter:
    drop-shadow(0 10px 24px rgba(0,0,0,0.35))
    drop-shadow(0 0 18px rgba(255,255,255,0.15))
    contrast(1.05);
  transition: transform 120ms linear;
  will-change: transform;
  z-index: 30;
  pointer-events: none;                  /* not interactive, ever */
}

/* Chromium needs this for the chrome look. Use mix-blend for shimmer if you have time. */
.chrome-flower svg path,
.chrome-flower svg circle {
  fill: url(#chromeGradient);            /* see SVG defs in ChromeFlower.tsx */
}

.floating-photo {
  /* photos now have NO drag/pinch on mobile. They drift on a CSS keyframe. */
  animation: drift 14s ease-in-out infinite;
  animation-delay: var(--drift-delay, 0s);
  will-change: transform;
  /* no JS motion values for the float itself anymore */
}

@keyframes drift {
  0%, 100% { transform: translate3d(0, 0, 0) rotate(var(--rot, 0deg)); }
  50%      { transform: translate3d(2px, -6px, 0) rotate(calc(var(--rot, 0deg) + 1.2deg)); }
}

@media (prefers-reduced-motion: reduce) {
  .kinetic-backdrop,
  .chrome-flower,
  .floating-photo {
    transition: none !important;
    animation: none !important;
    transform: none !important;
  }
}

@media (hover: hover) and (pointer: fine) {
  /* Desktop: keep current drag/pinch on photos. The gyro hook is a no-op here. */
  .floating-photo { animation: none; }
}

Why this is cheap on mobile:





3 transformed layers (backdrop, flower, photos) — GPU compositor, no layout/paint.



setInterval from  is gone — replaced by CSS keyframes. Removes one main-thread task per photo per 50ms.



Sensor handler writes 2 strings. Browsers batch style changes per frame.



perspective: 800px only affects the flower; photos are 2D.



5. 

Inline SVG with a <linearGradient> that fakes chrome. Save as a constant, render once.

export default function ChromeFlower() {
  return (
    <svg viewBox="0 0 200 200" className="chrome-flower" aria-hidden="true">
      <defs>
        <linearGradient id="chromeGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#f5f5f5" />
          <stop offset="35%" stopColor="#b8b8b8" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="65%" stopColor="#9a9a9a" />
          <stop offset="100%" stopColor="#3a3a3a" />
        </linearGradient>
      </defs>
      {/* 6-petal rosette. Keep paths simple. < 50 path commands total. */}
      <g>
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse
            key={a}
            cx="100" cy="50" rx="22" ry="48"
            transform={`rotate(${a} 100 100)`}
            fill="url(#chromeGradient)"
            stroke="rgba(0,0,0,0.15)"
            strokeWidth="0.5"
          />
        ))}
        <circle cx="100" cy="100" r="14" fill="url(#chromeGradient)" />
      </g>
    </svg>
  )
}

`< 1KB JSX, 1 paint per tilt frame. The browser caches the gradient rasterization.



6.  — Refactored Skeleton

export default function FloatingGallery() {
  useDeviceTilt({ maxDeg: 15 })         // writes --tiltX/--tiltY to :root

  return (
    <section id="gallery" className="relative px-6 py-20">
      <div className="kinetic-canvas mx-auto">
        <div
          className="kinetic-backdrop"
          style={{ ['--backdrop-url' as any]: `url(${gallery[0].src})` }}
        />
        <ChromeFlower />

        {gallery.map((item, i) => (
          <FloatingPhoto
            key={item.src}
            {...item}
            index={i}
            // initialPosition: NO LONGER a JS motion value. Just CSS vars on the element.
            style={{
              ['--rot' as any]: `${item.rotation}deg`,
              ['--drift-delay' as any]: `${(i * 1.3) % 6}s`,
            }}
          />
        ))}
      </div>
      <Lightbox ... />
    </section>
  )
}



7.  — What to Delete on Mobile

Current cost per photo: 1 setInterval at 50ms = 20 setState-equivalent writes/sec/photo. With 6 photos that is 120 React render triggers per second. That is the actual reason mobile feels hot.

Changes:





Remove useDrag and usePinch from @use-gesture/react on mobile. Wrap their bind* calls in if (window.matchMedia('(hover: hover) and (pointer: fine)').matches).



Remove the entire idleAnimRef setInterval. Drift is now CSS.



Remove the float handle (the hover: rotate gizmo) — desktop only, gated by media query.



Remove the four useSpring calls. CSS handles everything now.



Keep onActivate for tap → open lightbox. Use a plain onClick, not a gesture.

Result per photo: zero JS timers, zero motion values, one CSS animation. Browser GPU does the work.

Keep the desktop behavior intact — desktop users still get drag/pinch/hover because the existing code is good there.



8. Performance Budget — What to Verify

After deploying, check on a mid-range Android (e.g. Pixel 6a, Galaxy A52) with Chrome DevTools remote debugging:







Metric



Target



How to check





Frame rate during scroll



60fps



DevTools → Performance, no jank bar





Frame rate during tilt



60fps



Hold phone, rotate slowly, no red bars





Main-thread blocks



<50ms



DevTools → Performance, long task warning





JS execution (idle on gallery)



~0ms/s



After CSS animations start, JS should idle





deviceorientation rate



~60Hz



iOS caps at 60Hz, Android varies





Battery delta over 5min gallery



<2%



Quick sanity check, do not ship if >5%





Total page weight



<400KB



npm run build then check dist/assets/

If you see jank, in this order:





Drop filter: blur(28px) to blur(16px). Biggest cost on low-end GPUs.



Remove the drop-shadow filter chain on the flower.



Reduce photo count from 6 to 4.



Replace perspective with a flat 2D tilt (just rotate on the flower).



9. Accessibility & Etiquette





Reduced motion: gated in CSS and in the hook. If a guest has it on, the gallery is static and the flower is centered. Do not skip the gallery — just freeze it.



Battery saver / low-power mode: on iOS, deviceorientation rate auto-throttles. Android Chrome does not. If you want belt-and-suspenders, listen for visibilitychange and stop the listener on hidden.



No permission denied UX disaster: if iOS permission is denied, the flower just sits still. Do not show a banner. Do not block scroll. The page should be 100% functional without gyro.



No tap on flower: pointer-events: none is set. Guests cannot accidentally tap it.



No tap-drag on photos on mobile: drag/pinch is removed via media query. The photo still opens the lightbox on tap.



10. What You Are NOT Building (Scope Cuts)





No WebGL flower. SVG with gradient is 99% of the look at 1% of the cost.



No requestAnimationFrame gyroscope loop. The browser already fires deviceorientation per frame; do not wrap it in rAF, you will double up.



No Three.js, no PixiJS, no Lenis on the flower. The flower is one element.



No shake/rumble on tap. Skip it.



No auto-rotating flower on desktop. Desktop gets the static flower + kinetic photo scatter.



11. Ship Checklist





Add 



Wire it into 



Add iOS permission request to EnvelopeIntro open handler



Add CSS in 



Build  (or replace with PNG if a designer gives you one)



Refactor : remove setInterval, gate drag/pinch to desktop



Test on a real mid-range Android, not the emulator



Verify prefers-reduced-motion path on iOS Settings → Accessibility



Run npm run build and check  < 250KB gzipped



Commit, push, deploy



TL;DR for the Implementation





Sensor → 2 CSS variables. No React state, no framer-motion in the hot path.



Photos drift via CSS @keyframes. Delete the setInterval in .



Flower is one SVG with one gradient. CSS transform: rotateX/Y reads the variables.



Backdrop mirrors the variables with -1 and a larger translate. filter: blur(28px) is the only "expensive" thing — drop to 16 if it hurts.



Gate everything behind prefers-reduced-motion and a coarse-pointer check.

