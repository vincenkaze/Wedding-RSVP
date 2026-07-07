Gallery — 3D Spherical Photo Globe



Reality check first. A 3D sphere needs a lot of points. With 9 images there is no mathematically even layout on a sphere — the result is always a sparse polyhedron. The options are:





9 images on an icosahedron's 12 vertices → 3 vertices stay empty. Visually OK.



3×3 grid bent into a cylinder / dome → looks like a curved photo strip, not a globe.



3 rings of 3 (top/middle/bottom) → most "globe-like" of the cheap options.

Pick option C (3 rings of 3). It is the only one that reads as a 3D object you can spin.



1. Folder layout

your-wedding-site/
├── index.html
├── css/
│   └── gallery.css
├── js/
│   └── gallery.js
├── assets/
│   ├── photos/        ← 9 AVIF files: p1.avif ... p9.avif
│   └── sounds/
│       └── flick.mp3  ← short click (<200ms), mono, ~10–20kb
└── ...



2. HTML ( — add inside <body>)

<!-- Gallery section -->
<section id="gallery" class="gallery">
  <h2>Our Moments</h2>

  <!-- Stage: 9 photos in 3 rings of 3 -->
  <div class="globe" id="globe">
    <!-- Ring 1: top (tilted up) -->
    <div class="ring ring-top">
      <img class="photo" src="assets/photos/p1.avif" alt="" loading="lazy" decoding="async" draggable="false" />
      <img class="photo" src="assets/photos/p2.avif" alt="" loading="lazy" decoding="async" draggable="false" />
      <img class="photo" src="assets/photos/p3.avif" alt="" loading="lazy" decoding="async" draggable="false" />
    </div>
    <!-- Ring 2: middle (equator) -->
    <div class="ring ring-mid">
      <img class="photo" src="assets/photos/p4.avif" alt="" loading="lazy" decoding="async" draggable="false" />
      <img class="photo" src="assets/photos/p5.avif" alt="" loading="lazy" decoding="async" draggable="false" />
      <img class="photo" src="assets/photos/p6.avif" alt="" loading="lazy" decoding="async" draggable="false" />
    </div>
    <!-- Ring 3: bottom (tilted down) -->
    <div class="ring ring-bot">
      <img class="photo" src="assets/photos/p7.avif" alt="" loading="lazy" decoding="async" draggable="false" />
      <img class="photo" src="assets/photos/p8.avif" alt="" loading="lazy" decoding="async" draggable="false" />
      <img class="photo" src="assets/photos/p9.avif" alt="" loading="lazy" decoding="async" draggable="false" />
    </div>
  </div>

  <!-- Preload the click sound. Required for iOS autoplay rules. -->
  <audio id="flick-sound" src="assets/sounds/flick.mp3" preload="auto"></audio>
</section>



3. CSS ()

/* ---------- Gallery stage ---------- */
.gallery {
  text-align: center;
  padding: 2rem 1rem;
}

.globe {
  position: relative;
  width: 280px;
  height: 280px;
  margin: 2rem auto;
  perspective: 900px;          /* smaller = more dramatic 3D */
  perspective-origin: 50% 50%;
  touch-action: none;         /* let JS own the gestures */
  user-select: none;
  -webkit-user-select: none;
}

/* The whole globe rotates as one object */
.globe .sphere {
  /* not used as a class — kept here as a reminder
     that the .globe itself is what we transform */
}

/* ---------- Rings (3 rings, each is its own 3D scene) ---------- */
.ring {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  /* JS sets transform: rotateX(..) rotateY(..) rotateZ(..) on this */
  will-change: transform;
}

/* Tilt the top and bottom rings so the rings stack into a sphere shape */
.ring-top { transform: rotateX( 35deg); }
.ring-mid { transform: rotateX(  0deg); }
.ring-bot { transform: rotateX(-35deg); }

/* ---------- Photos: 3 per ring, evenly spaced on a circle ---------- */
.photo {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 90px;
  height: 90px;
  margin: -45px 0 0 -45px;   /* center on its own anchor */
  border-radius: 12px;
  object-fit: cover;
  backface-visibility: visible; /* show back faces faintly — adds depth */
  -webkit-backface-visibility: visible;
  /* JS sets transform: rotateY(N deg) translateZ(R px) on each */
  will-change: transform;
  pointer-events: none;        /* JS handles the drags */
}

Sizing rule (this is the only math you need):





Ring radius R ≈ 110px (so 90px photos with 12px gap clear the center).



3 photos per ring → angles 0deg, 120deg, 240deg.



Ring tilts: +35deg (top), 0deg (mid), -35deg (bottom). Adjust 35 if the globe looks too flat or too pointy.

JS builds these transforms on load — see next file.



4. JavaScript ()

(() => {
  const globe = document.getElementById('globe');
  const rings = globe.querySelectorAll('.ring');
  const sound = document.getElementById('flick-sound');

  // --- Geometry ---
  const RADIUS = 110;        // matches the CSS value above
  const PHOTOS_PER_RING = 3;

  // Place each photo around its ring
  rings.forEach(ring => {
    const photos = ring.querySelectorAll('.photo');
    photos.forEach((img, i) => {
      const angle = (360 / PHOTOS_PER_RING) * i;
      img.style.transform =
        `rotateY(${angle}deg) translateZ(${RADIUS}px)`;
    });
  });

  // --- Spherical state ---
  // The whole .globe rotates; rings inherit that rotation.
  let rotX = 0;
  let rotY = 0;
  const FLICK_VELOCITY = 600;   // deg/s — anything faster = "flick"
  const FLICK_COOLDOWN_MS = 120;

  function render() {
    globe.style.transform =
      `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  }
  render();

  // --- Pointer drag (works for mouse + touch) ---
  let dragging = false;
  let lastX = 0, lastY = 0;
  let lastT = 0;
  let velX = 0, velY = 0;          // deg per second
  let lastFlickAt = 0;

  function onDown(x, y) {
    dragging = true;
    lastX = x; lastY = y;
    lastT = performance.now();
    velX = velY = 0;
  }
  function onMove(x, y) {
    if (!dragging) return;
    const now = performance.now();
    const dt = Math.max(now - lastT, 1) / 1000; // seconds
    const dx = x - lastX;
    const dy = y - lastY;

    // Map pixels to degrees. 1px ≈ 0.4deg feels good on phones.
    rotY += dx * 0.4;
    rotX -= dy * 0.4;
    // Clamp X so it doesn't flip past poles
    rotX = Math.max(-80, Math.min(80, rotX));

    velX = (-dy * 0.4) / dt;
    velY = ( dx * 0.4) / dt;

    render();
    lastX = x; lastY = y; lastT = now;
  }
  function onUp() {
    if (!dragging) return;
    dragging = false;

    // Flick = high angular velocity
    const speed = Math.hypot(velX, velY);
    const now = performance.now();
    if (speed > FLICK_VELOCITY && now - lastFlickAt > FLICK_COOLDOWN_MS) {
      playClick();
      lastFlickAt = now;
    }

    // Momentum: keep rotating, decay over ~600ms
    momentumStart();
  }

  // --- Momentum ---
  let raf = null;
  function momentumStart() {
    cancelAnimationFrame(raf);
    const friction = 0.92;
    const stop = 4; // deg/s
    function step() {
      rotY += velY * (1 / 60);
      rotX += velX * (1 / 60);
      rotX = Math.max(-80, Math.min(80, rotX));
      render();
      velX *= friction; velY *= friction;
      if (Math.hypot(velX, velY) < stop) {
        cancelAnimationFrame(raf); raf = null; return;
      }
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
  }

  // --- Events: unify mouse + touch ---
  globe.addEventListener('mousedown',  e => onDown(e.clientX, e.clientY));
  window.addEventListener('mousemove',  e => onMove(e.clientX, e.clientY));
  window.addEventListener('mouseup',    () => onUp());
  window.addEventListener('mouseleave', () => onUp());

  globe.addEventListener('touchstart', e => {
    const t = e.touches[0]; onDown(t.clientX, t.clientY);
  }, { passive: true });
  globe.addEventListener('touchmove', e => {
    const t = e.touches[0]; onMove(t.clientX, t.clientY);
  }, { passive: true });
  globe.addEventListener('touchend',    () => onUp());
  globe.addEventListener('touchcancel', () => onUp());

  // --- Click sound (bypasses iOS autoplay restrictions) ---
  function playClick() {
    if (!sound) return;
    try {
      sound.currentTime = 0;   // rewind so rapid flicks still click
      const p = sound.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch (_) {}
  }

  // iOS Safari: audio must be unlocked by a user gesture.
  // First tap anywhere plays once silently to unlock future plays.
  function unlockAudio() {
    if (!sound) return;
    sound.volume = 0;
    const p = sound.play();
    if (p && typeof p.then === 'function') {
      p.then(() => {
        sound.pause();
        sound.currentTime = 0;
        sound.volume = 1;
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('mousedown',  unlockAudio);
      }).catch(() => {});
    }
  }
  window.addEventListener('touchstart', unlockAudio, { once: true });
  window.addEventListener('mousedown',  unlockAudio, { once: true });
})();



5. The  sound

Generate it yourself — don't ship a random "click" from the internet:

# macOS (no install needed):
say -v "Bells" "tk" -o /tmp/tk.aiff
# or use a free SFX site like freesound.org, then convert:
ffmpeg -i input.wav -c:a libmp3lame -b:a 64k -ac 1 assets/sounds/flick.mp3

Hard requirements for the file:





Format: MP3 (universal mobile support).



Length: 80–200 ms.



Channels: mono.



Bitrate: 48–64 kbps.



Size: < 20 KB.

Why each rule:





Mono + low bitrate keeps it tiny — guests are on mobile data.



< 200 ms is critical: anything longer feels laggy when fired on every flick.



The audio.play() call is wrapped in .catch(() => {}) so a failed autoplay never throws or logs.



6. Why the iOS "bypass" actually works

iOS Safari will refuse to play audio that was not triggered by a user gesture. The trick:





A <audio preload="auto"> element with the MP3 set in src starts preloading as soon as the page loads.



The first touchstart or mousedown on window runs unlockAudio(): it plays the sound silently, then resets currentTime and volume. This is a real user gesture, so iOS marks the element as "unlocked."



After that, any future sound.play() (including ones fired from inside a requestAnimationFrame loop, which is what momentum does) is allowed.

currentTime = 0 before each play() lets rapid successive flicks all produce a click.



7. Performance notes for mobile





Will-change is set on .ring and .photo so the browser promotes them to their own layers — smooth 60fps drags.



touch-action: none on .globe stops the browser from trying to scroll/zoom the page while the user drags the sphere.



decoding="async" on the <img> tags decodes off the main thread.



AVIF is good — but if an old Android phone chokes, fall back to WebP via <picture>.



pointer-events: none on .photo means only the globe's drag surface gets events. Saves you from accidental drag-start on a photo.



8. Known limitations (be honest with the couple)





9 photos is sparse. A real globe needs dozens. The "sphere" will read as 9 tiles on a wireframe.



Pure CSS 3D = no real depth. Faces behind the center will look flipped/stretched. That's the price of skipping WebGL.



Back faces show. With backface-visibility: visible (intentional, for the "wireframe globe" look) photos on the far side are visible mirrored. If you want them hidden, set it to hidden — but then half the globe is invisible at any tilt.



Audio on Android Chrome in silent mode still respects the ringer. There's no web-API workaround. Test on the actual device.

If you want a real globe that actually looks like a globe with 9 photos, the honest next step is a small Three.js scene (one <canvas>, ~30 KB gzipped) using Sprite or InstancedMesh. Say the word and I'll write that version too.