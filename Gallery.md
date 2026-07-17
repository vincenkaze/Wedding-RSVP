# M5 — Gallery Engine Implementation

Status: In Progress (Phase 4)

---

# Purpose

This document defines the implementation of the M5B Gallery Engine.

`Gallery_design.md` describes the vision and architecture. This document defines functionality, systems, rendering behaviour, interaction, and performance targets.

---

# Experience Goal

The gallery should feel like a floating glass planet made of wedding memories.

Current state (Phase 3):
- 17 photographs on an invisible 3D sphere.
- Auto-rotation when idle.
- Drag to rotate, inertia on release.
- Backface-driven opacity and scale.
- Camera-facing upright billboards.

Current UX gaps (Phase 4 target):
- No stable focal image.
- No visible interaction hint.
- No obvious control for opening a photo.
- All images compete for attention.

Remediation direction:
- Fixed center frame.
- Three depth layers.
- Snap selection.
- Depth styling with care.
- Temporary interaction guide.
- Explicit open affordance.

---

# Rendering

Rendering is performed entirely inside a GPU canvas.

Image
↓
Texture
↓
Rounded Plane Mesh
↓
Renderer

Backends:
- WebGL2 Renderer (active default)
- WebGPU Renderer (stub; skipped at runtime)

---

# Scene

Scene owns objects and visibility.

Globe
↓
Photo Meshes
↓
Particle System (future)

Camera remains fixed. Globe rotates.

---

# Sphere Layout

Photo positions are generated mathematically.

1. Generate ~120 Fibonacci sphere candidates.
2. Select 17 occupied anchors via max-min angular separation.
3. Minimum angular separation target: ≥ 32°.
4. Each anchor stores: position, normal, tangent, bitangent.

Purpose:
- consistent spacing
- premium composition
- scalable layout

---

# Photo Objects

Each photograph is a PhotoMesh.

Geometry
- Shared unit quad (-1,-1) to (1,1)
- Rounded corners via SDF in fragment shader

Material
- Texture handle
- Opacity
- Roughness
- Metallic
- Fresnel
- Rounded corners with corner radius

Transform
- Position (world-space, scaled by globeScale)
- Tangent + bitangent (billboard basis)
- Scale (uniform, responsive to globeScale)

Runtime properties
- Normal (anchor normal)
- Alpha (backface-driven)
- Color amount (grayscale ↔ color transition)
- Visible (scene culling flag)

---

# Globe Behaviour

The globe is a single scene object.

- Only the globe rotates (rotX + rotY).
- Photos inherit position from globe.
- Photos remain camera-facing and upright.
- Globe does not inherit roll onto the photo basis.

Auto-rotation
- Idle yaw blended slowly.
- Damping on release.
- Velocity clamped.
- Spring snap on double-tap / snap-to-front (future).

---

# Camera

Perspective camera.

- Fixed eye, fixed target, fixed up.
- Never rotates.
- Never orbits.
- Responsive framing via `computeCameraDistance()` based on aspect ratio.
- DPR capped at 2.

Resize updates aspect and camera distance. World-space sphere radius stays constant.

---

# Interaction

Primary interaction: horizontal drag → rotate globe.
Vertical drag: native page scroll when on mobile and gesture intent is vertical.

Gesture detection:
- Threshold: 5px before intent declared.
- Mobile: if `abs(vertical) > abs(horizontal) * 1.2` and vertical > 12px, intent = scroll. Otherwise globe.
- Desktop: all drags = globe.

States:
- idle
- engaged (pointer down)
- photoActive (pointer over photo)
- photoOpen (long press)

Pick/hover:
- Engine projects transformed quad corners to NDC.
- Returns closest `photoId` under pointer or null.

Long press:
- ~500ms timer.
- Cancelled if pointer moves > 10px.
- Fires `onSelect(photoId)`.

---

# Physics

Interaction produces:
Angular Velocity
↓
Inertia
↓
Damping
↓
Spring Snap
↓
Final Rotation

The globe never stops instantly. Movement feels heavy but responsive.

---

# Selection

Front-most visible image becomes active selection.
Selection state exposed to React via `onSelect(photoId)`.

React controls:
- Lightbox
- Captions
- Metadata

The engine only determines which image is selected.

---

# Lightbox

Current flow:
- Engine `onSelect` → React callback.
- React opens Lightbox with matching index.

Current gap:
- Engine emits `photoId`.
- Lightbox expects an index.
- Adapter is missing.

Required adapter:
- Map `photoId → index` using manifest order.
- Call `engine.setLightboxOpen(true)` on open.
- Call `engine.setLightboxOpen(false)` on close.

---

# Materials

Current material spec supports:
- Texture
- Opacity
- Roughness
- Metallic
- Fresnel
- Rounded corners

Future:
- Glass material
- Metallic border
- Soft reflection

---

# Texture Management

Flow:
1. Load source → ImageBitmap
2. Renderer uploads to GPU
3. Handle returned
4. Cached in TextureManager and renderer

Never upload textures during dragging or interaction.

---

# Visibility

Backface culling driven by `computeBackfaceAlpha()`.

Front-facing photos: alpha ~1.
Side photos: alpha fades.
Back-facing photos: alpha → 0, hidden.

Frontness tracking:
- `frontnessTracker`: remembers highest alpha reached per photo.
- `rawFrontnessTracker`: remembers highest raw dot product.

Logged periodically for tuning. Logging should move to debug-only path.

---

# Performance

Target:
- 60 FPS minimum
- 120 Hz where supported
- Low CPU usage
- Minimal memory allocations
- Battery friendly
- Near-zero idle GPU usage

Current bottlenecks:
- `meshes.find()` inside render loop (O(N²)).
- Per-frame allocations in `buildModelMatrix()` and `pickPhoto()`.
- Frame-rate-dependent smoothing constants.

Texture memory + overdraw + post-processing are future concerns.

---

# Debug

- `window.__GALLERY_DEBUG__ = true` enables periodic stats logging.
- `?debug=engine` query param preserves legacy standalone renderers.
- Debug anchor dots renderer available when `setDebugAnchors` is called.

Target: zero `console.log` in engine code. Some remain during Phase 4 cleanup.

---

# File Structure (current)

```
src/
  engine/
    Engine.ts
    core/
      contract.ts
      Scheduler.ts
      RendererFactory.ts
      RendererCapabilities.ts
    scene/
      Scene.ts
      Camera.ts
    objects/
      Globe.ts
      PhotoMesh.ts
    physics/
      Physics.ts
    interaction/
      index.ts
    textures/
      TextureManager.ts
    materials/
      index.ts
    math/
      mat4.ts
    debug/
      Profiler.ts
      archive/
    renderers/
      interface.ts
      webgl2/
        WebGL2Renderer.ts
      webgpu/
        WebGPURenderer.ts
  gallery/
    ui/
      GallerySection.tsx
    render/
      GlobeRenderer.ts
      ...
  components/
    sections/
      Gallery.tsx
      Lightbox.tsx
      ...
```
